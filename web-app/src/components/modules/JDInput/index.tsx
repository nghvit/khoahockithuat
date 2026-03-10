import React, { useState } from 'react';
import { extractTextFromJdFile } from '../../../services/data/ocrService';
import { extractJobPositionFromJD, filterAndStructureJD, extractHardFiltersFromJD, extractJDMetadata } from '../../../services/ai/geminiService';
import { googleDriveService } from '../../../services/storage/googleDriveService';
import type { HardFilters, WeightCriteria, JDTemplate } from '../../../types';
import TemplateSelector from '../../ui/TemplateSelector';
import HistorySelector from '../../ui/HistorySelector';
import { JDTemplateService } from '../../../services/storage/jdTemplateService';
import { JDHistoryService } from '../../../services/storage/jdHistoryService';

interface JDInputProps {
  jdText: string;
  setJdText: React.Dispatch<React.SetStateAction<string>>;
  jobPosition: string;
  setJobPosition: React.Dispatch<React.SetStateAction<string>>;
  hardFilters: HardFilters;
  setHardFilters: React.Dispatch<React.SetStateAction<HardFilters>>;
  onComplete: () => void;
  sidebarCollapsed?: boolean;
  requirementsSummary: string;
  setRequirementsSummary: React.Dispatch<React.SetStateAction<string>>;
  uid: string;
  setWeights: React.Dispatch<React.SetStateAction<WeightCriteria>>;
  companyName: string;
  setCompanyName: React.Dispatch<React.SetStateAction<string>>;
  salary: string;
  setSalary: React.Dispatch<React.SetStateAction<string>>;
}

const JDInput: React.FC<JDInputProps> = ({ 
  jdText, setJdText, 
  jobPosition, setJobPosition, 
  hardFilters, setHardFilters, 
  onComplete, 
  sidebarCollapsed = false, 
  companyName, setCompanyName, 
  salary, setSalary, 
  requirementsSummary, setRequirementsSummary,
  uid,
  setWeights
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const isCompleteEnabled = jdText.trim().length > 50 && jobPosition.trim().length > 3;
  const characterCount = jdText.length;

  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [ocrMessage, setOcrMessage] = useState('');
  const [ocrError, setOcrError] = useState('');

  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summarizeError, setSummarizeError] = useState('');
  const [showUploadOptions, setShowUploadOptions] = useState(false);

  const getFriendlyErrorMessage = (error: unknown, context: 'ocr' | 'summarize'): string => {
    console.error(`Lỗi trong quá trình ${context}:`, error);

    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      if (message.includes('không thể trích xuất đủ nội dung')) {
        return error.message;
      }
      if (message.includes('network') || message.includes('failed to fetch')) {
        return "Lỗi kết nối mạng. Vui lòng kiểm tra lại đường truyền và thử lại.";
      }
      if (message.includes('gemini') || message.includes('api')) {
        return "Dịch vụ AI đang gặp sự cố. Vui lòng thử lại sau ít phút.";
      }
    }
    return `Đã có lỗi không mong muốn xảy ra trong quá trình ${context === 'ocr' ? 'quét file' : 'tối ưu JD'}. Vui lòng thử lại.`;
  };

  const handleGoogleDriveSelect = async () => {
    try {
      const token = await googleDriveService.authenticate();
      const driveFiles = await googleDriveService.openPicker({
        mimeTypes: 'application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/png,image/jpeg',
        multiSelect: false
      });

      if (driveFiles.length > 0) {
        const dFile = driveFiles[0];
        setIsOcrLoading(true);
        setOcrError('');
        setSummarizeError('');
        setJdText('');
        setJobPosition('');
        setOcrMessage(`Đang tải ${dFile.name} từ Drive...`);

        try {
          const blob = await googleDriveService.downloadFile(dFile.id, token);
          const file = new File([blob], dFile.name, { type: dFile.mimeType });

          await processFile(file);

        } catch (err) {
          console.error(`Failed to download ${dFile.name}`, err);
          setOcrError('Không thể tải file từ Google Drive.');
          setIsOcrLoading(false);
        }
      }
    } catch (err: any) {
      console.error("Google Drive Error:", err);
      if (err.message && (err.message.includes('Client ID') || err.message.includes('API Key'))) {
        setOcrError('Chưa cấu hình Google Drive API.');
      } else {
        setOcrError('Lỗi khi kết nối Google Drive.');
      }
    }
  };

  const processFile = async (file: File) => {
    try {
      const rawText = await extractTextFromJdFile(file, (message) => {
        setOcrMessage(message);
      });

      if (!rawText || rawText.trim().length < 50) {
        throw new Error('Không thể trích xuất đủ nội dung từ file. Vui lòng thử file khác hoặc nhập thủ công.');
      }

      setOcrMessage('Đang cấu trúc JD...');
      const structuredJd = await filterAndStructureJD(rawText);
      setJdText(structuredJd);

      setOcrMessage('Đang trích xuất chức danh...');
      const extractedPosition = await extractJobPositionFromJD(structuredJd);
      let successMessage = '';

      if (extractedPosition) {
        setJobPosition(extractedPosition);
        successMessage = `✔ Đã phát hiện chức danh: ${extractedPosition}`;
      }

      setOcrMessage('Đang trích xuất thông tin công ty & lương...');
      const metadata = await extractJDMetadata(structuredJd);
      if (metadata.companyName) setCompanyName(metadata.companyName);
      if (metadata.salary) setSalary(metadata.salary);
      if (metadata.requirementsSummary) setRequirementsSummary(metadata.requirementsSummary);

      setOcrMessage('Đang phân tích tiêu chí lọc...');
      const extractedFilters = await extractHardFiltersFromJD(structuredJd);
      if (extractedFilters && Object.keys(extractedFilters).length > 0) {
        const mandatoryUpdates: any = {};
        if (extractedFilters.location) mandatoryUpdates.locationMandatory = true;
        if (extractedFilters.minExp) mandatoryUpdates.minExpMandatory = true;
        if (extractedFilters.seniority) mandatoryUpdates.seniorityMandatory = true;
        if (extractedFilters.education) mandatoryUpdates.educationMandatory = true;
        if (extractedFilters.language) mandatoryUpdates.languageMandatory = true;
        if (extractedFilters.certificates) mandatoryUpdates.certificatesMandatory = true;
        if (extractedFilters.workFormat) mandatoryUpdates.workFormatMandatory = true;
        if (extractedFilters.contractType) mandatoryUpdates.contractTypeMandatory = true;

        setHardFilters(prev => ({ ...prev, ...extractedFilters, ...mandatoryUpdates }));
        const extractedInfo = Object.entries(extractedFilters)
          .filter(([_, value]) => value && value !== '')
          .map(([key, value]) => {
            const fieldNames: any = {
              location: 'Địa điểm',
              minExp: 'Kinh nghiệm',
              seniority: 'Cấp bậc',
              education: 'Học vấn',
              language: 'Ngôn ngữ',
              languageLevel: 'Trình độ',
              certificates: 'Chứng chỉ',
              workFormat: 'Hình thức',
              contractType: 'Loại hợp đồng'
            };
            return `${fieldNames[key] || key}: ${value}`;
          }).join(', ');

        if (extractedInfo) {
          const tickedCount = Object.keys(mandatoryUpdates).length;
          successMessage += successMessage ? ` | 🎯 Đã điền & tick ✔ ${tickedCount} tiêu chí: ${extractedInfo}` : `✔ 🎯 Đã tự động điền & tick ✔ ${tickedCount} tiêu chí: ${extractedInfo}`;
        }
      }

      if (successMessage) {
        setOcrMessage(successMessage);
        setTimeout(() => setOcrMessage(''), 7000);
      } else {
        setOcrMessage('⚠ Vui lòng nhập chức danh và kiểm tra tiêu chí lọc thủ công');
        setTimeout(() => setOcrMessage(''), 3000);
      }

    } catch (error) {
      const friendlyMessage = getFriendlyErrorMessage(error, 'ocr');
      setOcrError(friendlyMessage);
      setJdText('');
    } finally {
      setIsOcrLoading(false);
      setOcrMessage('');
    }
  };

  const handleOcrFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsOcrLoading(true);
    setOcrError('');
    setSummarizeError('');
    setJdText('');
    setJobPosition('');
    setOcrMessage('Bắt đầu xử lý file...');

    await processFile(file);
  };

  const handleSummarizeJD = async () => {
    if (jdText.trim().length < 200) {
      setSummarizeError("Nội dung JD quá ngắn để tóm tắt.");
      return;
    }

    setIsSummarizing(true);
    setSummarizeError('');
    setOcrError('');

    try {
      const structuredJd = await filterAndStructureJD(jdText);
      setJdText(structuredJd);

      const extractedPosition = await extractJobPositionFromJD(structuredJd);
      console.log('🔍 AI Optimizer extracted position:', extractedPosition);

      if (extractedPosition) {
        setJobPosition(extractedPosition);
        console.log('✔ AI đã trích xuất chức danh:', extractedPosition);
      } else {
        console.log('❌ AI Optimizer: No job position extracted');
      }

      const metadata = await extractJDMetadata(structuredJd);
      if (metadata.companyName) setCompanyName(metadata.companyName);
      if (metadata.salary) setSalary(metadata.salary);
      if (metadata.requirementsSummary) setRequirementsSummary(metadata.requirementsSummary);

      const extractedFilters = await extractHardFiltersFromJD(structuredJd);
      if (extractedFilters && Object.keys(extractedFilters).length > 0) {
        const mandatoryUpdates: any = {};
        if (extractedFilters.location) mandatoryUpdates.locationMandatory = true;
        if (extractedFilters.minExp) mandatoryUpdates.minExpMandatory = true;
        if (extractedFilters.seniority) mandatoryUpdates.seniorityMandatory = true;
        if (extractedFilters.education) mandatoryUpdates.educationMandatory = true;
        if (extractedFilters.language) mandatoryUpdates.languageMandatory = true;
        if (extractedFilters.certificates) mandatoryUpdates.certificatesMandatory = true;
        if (extractedFilters.workFormat) mandatoryUpdates.workFormatMandatory = true;
        if (extractedFilters.contractType) mandatoryUpdates.contractTypeMandatory = true;

        setHardFilters(prev => ({ ...prev, ...extractedFilters, ...mandatoryUpdates }));
        console.log('✔ AI đã tự động điền & tick tiêu chí lọc:', extractedFilters, 'Mandatory:', mandatoryUpdates);
      }

    } catch (error) {
      const friendlyMessage = getFriendlyErrorMessage(error, 'summarize');
      setSummarizeError(friendlyMessage);
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleSelectTemplate = (template: JDTemplate) => {
    setJdText(template.jdText);
    setJobPosition(template.jobPosition);
    if (template.hardFilters) setHardFilters(template.hardFilters);
    if (template.weights) setWeights(template.weights);
    setOcrMessage(`✔ Đã tải mẫu: ${template.name}`);
    setTimeout(() => setOcrMessage(''), 3000);
  };

  const handleSaveTemplate = async () => {
    if (!uid) {
      setOcrError('Bạn cần đăng nhập để lưu mẫu.');
      return;
    }
    if (jdText.length < 50 || jobPosition.length < 3) {
      setOcrError('Vui lòng nhập đầy đủ JD và chức danh trước khi lưu.');
      return;
    }

    const templateName = prompt('Nhập tên cho mẫu này:', `Mẫu ${jobPosition}`);
    if (!templateName) return;

    setIsSaving(true);
    setSaveMessage('Đang lưu mẫu...');
    try {
      await JDTemplateService.saveTemplate({
        uid,
        name: templateName,
        jdText,
        jobPosition,
        hardFilters,
      });
      setSaveMessage('✔ Đã lưu mẫu thành công!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Failed to save template:', error);
      setOcrError('Lỗi khi lưu mẫu. Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleComplete = async () => {
    // Tự động lưu vào lịch sử khi nhấn hoàn thành
    if (uid && jdText.length >= 50 && jobPosition.length >= 3) {
      try {
        await JDHistoryService.saveHistory({
          uid,
          jobPosition,
          jdText,
          hardFilters,
        });
      } catch (error) {
        console.error('Failed to save history:', error);
      }
    }
    onComplete();
  };

  return (
    <section id="module-jd" className="module-pane active w-full h-screen bg-[#0b1220] overflow-hidden flex flex-col" aria-labelledby="jd-title">
      <div className="flex-1 flex flex-col min-h-0 w-full bg-[#0f172a] border-l border-white/5 p-4 md:p-5 relative overflow-hidden">
        {/* Decorative background glow - subtle */}
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-indigo-500/5 blur-[100px] rounded-full"></div>

        {/* ─── HEADER SECTION (Combined Job Title + Actions) ─── */}
        <div className="relative z-10 w-full flex-shrink-0 mb-3 bg-white/2 border border-white/5 rounded-none p-3 backdrop-blur-md">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            
            {/* LEFT: Shortened Job Title Input */}
            <div className="flex-1 space-y-1 min-w-0">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-0.5 block">
                Chức danh tuyển dụng
              </label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors duration-300 pointer-events-none">
                  <i className="fa-solid fa-briefcase text-base"></i>
                </div>
                <input
                  type="text"
                  id="job-position"
                  value={jobPosition}
                  onChange={(e) => setJobPosition(e.target.value)}
                  className="h-10 w-full bg-slate-900/60 border border-white/10 rounded-none pl-10 pr-4 text-sm font-bold text-white placeholder-slate-600 outline-none focus:border-indigo-500/40 transition-all"
                  placeholder="VD: Senior Frontend Developer"
                  maxLength={100}
                />
              </div>
            </div>

            {/* RIGHT: Action Group (History, Templates, Save) */}
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mr-0.5 block text-right">
                Tệp & Mẫu
              </label>
              <div className="flex items-center gap-2">
                {saveMessage && (
                  <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest animate-in fade-in slide-in-from-right-2 mr-1">
                    {saveMessage}
                  </span>
                )}
                <div className="flex items-center gap-2">
                  <HistorySelector uid={uid} onSelect={handleSelectTemplate} className="rounded-none child:rounded-none" />
                  <TemplateSelector uid={uid} onSelect={handleSelectTemplate} className="rounded-none child:rounded-none" />
                  <button
                    onClick={handleSaveTemplate}
                    disabled={isSaving || jdText.length < 50}
                    className="group flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-none text-[9px] font-black text-indigo-300 hover:bg-indigo-500/20 hover:text-white hover:border-indigo-500/40 transition-all uppercase tracking-widest disabled:opacity-30"
                  >
                    <i className={`fa-solid ${isSaving ? 'fa-spinner fa-spin' : 'fa-floppy-disk'} text-[10px]`}></i>
                    <span>Lưu mẫu</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── INFO SECTION (Company, Salary, etc.) ─── */}
        <div className="relative z-10 w-full flex-shrink-0 mb-4">
          <div className="bg-slate-900/40 border border-white/5 rounded-none p-3 relative overflow-hidden group/panel">
              <div className="flex items-center justify-between mb-2 relative z-10">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <i className="fa-solid fa-circle-info text-[9px] text-indigo-400"></i>
                  Thông tin sơ lược
                </h4>
                {jobPosition.trim().length > 3 && !isSummarizing && (
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-none bg-emerald-500/10 border border-emerald-500/20 text-[8px] text-emerald-400 font-black uppercase tracking-widest">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Ready
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 relative z-10">
                <div className="flex items-center gap-2 h-9 bg-white/3 border border-white/5 rounded-none px-3 focus-within:border-indigo-500/30 transition-all">
                  <i className="fa-solid fa-building text-[10px] text-slate-500"></i>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Tên công ty"
                    className="flex-1 bg-transparent border-none text-[11px] text-slate-200 placeholder-slate-600 focus:outline-none font-medium truncate"
                  />
                </div>
                <div className="flex items-center gap-2 h-9 bg-white/3 border border-white/5 rounded-none px-3 focus-within:border-indigo-500/30 transition-all">
                  <i className="fa-solid fa-money-bill-wave text-[10px] text-slate-500"></i>
                  <input
                    type="text"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    placeholder="Mức lương"
                    className="flex-1 bg-transparent border-none text-[11px] text-slate-200 placeholder-slate-600 focus:outline-none font-medium truncate"
                  />
                </div>
                <div className="flex items-center gap-2 h-9 bg-white/3 border border-white/5 rounded-none px-3 focus-within:border-indigo-500/30 transition-all">
                  <i className="fa-solid fa-clipboard-list text-[10px] text-slate-500"></i>
                  <input
                    type="text"
                    value={requirementsSummary}
                    onChange={(e) => setRequirementsSummary(e.target.value)}
                    placeholder="Yêu cầu chính"
                    className="flex-1 bg-transparent border-none text-[11px] text-slate-200 placeholder-slate-600 focus:outline-none font-medium truncate"
                  />
                </div>
              </div>
            </div>
        </div>

        {/* ─── JD EDITOR SECTION (Flexible Height - Expands) ─── */}
        <div className="relative z-10 space-y-1.5 pt-3 border-t border-white/5 w-full flex-1 flex flex-col min-h-0">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-0.5 block flex-shrink-0">
            Mô tả công việc (JD)
          </label>
          <div className="relative group w-full flex-1 min-h-0">
            <textarea
              id="job-description"
              className="w-full h-full p-4 bg-slate-900/40 border border-white/10 rounded-none text-[14px] text-slate-300 leading-[1.6] placeholder-slate-700 outline-none focus:border-indigo-500/30 transition-all resize-none custom-scrollbar"
              placeholder="Dán nội dung Job Description tại đây hoặc tải file JD (PDF/DOCX) để AI phân tích..."
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
            />
            {/* Character count */}
            <div className="absolute bottom-3 right-4 text-[9px] font-bold text-slate-600 uppercase tracking-widest pointer-events-none">
              {characterCount} chars
            </div>
          </div>
        </div>

        {/* Error Banner */}
        {(ocrError || summarizeError) && (
          <div className="relative z-10 px-3 py-2 mt-3 bg-red-900/20 border border-red-500/20 rounded-none flex items-start gap-3 animate-in fade-in slide-in-from-top-2 flex-shrink-0">
            <i className="fa-solid fa-triangle-exclamation text-red-400 mt-0.5 text-xs"></i>
            <p className="text-red-300 text-[11px] font-medium leading-relaxed">{ocrError || summarizeError}</p>
          </div>
        )}

        {/* ─── ACTION BAR ─── */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-2 pt-3 mt-auto flex-shrink-0">
          
          {/* Upload Group */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {!showUploadOptions ? (
              <button
                onClick={() => setShowUploadOptions(true)}
                disabled={isOcrLoading || isSummarizing}
                className="h-9 px-4 flex items-center justify-center gap-2.5 text-[12px] font-bold text-white bg-white/5 border border-white/10 rounded-none hover:bg-white/10 transition-all disabled:opacity-50"
              >
                <i className="fa-solid fa-cloud-arrow-up text-indigo-400"></i>
                Tải JD lên
              </button>
            ) : (
              <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-4">
                {isOcrLoading ? (
                  <div className="h-9 px-3 flex items-center gap-2.5 bg-slate-900 border border-white/10 rounded-none text-[10px] font-bold text-white">
                    <i className="fa-solid fa-spinner fa-spin text-indigo-400"></i>
                    {ocrMessage || 'Parsing...'}
                  </div>
                ) : (
                  <>
                    <label className="h-9 w-9 flex items-center justify-center bg-white/5 border border-white/10 rounded-none cursor-pointer hover:bg-indigo-500/20 transition-all text-slate-400 hover:text-indigo-400">
                      <i className="fa-solid fa-folder-open text-sm"></i>
                      <input type="file" className="hidden" accept=".pdf,.docx,.png,.jpg,.jpeg" onChange={handleOcrFileChange} />
                    </label>
                    <button onClick={handleGoogleDriveSelect} className="h-9 w-9 flex items-center justify-center bg-white/5 border border-white/10 rounded-none hover:bg-emerald-500/20 transition-all text-slate-400 hover:text-emerald-400">
                      <i className="fa-brands fa-google-drive text-sm"></i>
                    </button>
                    <button onClick={() => setShowUploadOptions(false)} className="h-9 w-9 flex items-center justify-center text-slate-500 hover:text-white">
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:flex-1">
             {/* AI Optimizer */}
            <button
              onClick={handleSummarizeJD}
              disabled={isOcrLoading || isSummarizing || jdText.trim().length < 200}
              className="flex-1 h-9 px-4 flex items-center justify-center gap-2.5 text-[12px] font-bold text-purple-200 bg-purple-600/20 border border-purple-500/30 rounded-none hover:bg-purple-600/30 transition-all disabled:opacity-40"
            >
              <i className="fa-solid fa-wand-magic-sparkles"></i>
              <span>{isSummarizing ? 'Đang tối ưu...' : 'AI Optimizer'}</span>
            </button>

            {/* Complete */}
            <button
              onClick={handleComplete}
              disabled={!isCompleteEnabled}
              className="flex-1 h-9 px-6 flex items-center justify-center gap-2.5 text-[12px] font-black text-slate-950 bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400 rounded-none hover:brightness-110 active:scale-[0.98] transition-all disabled:grayscale disabled:opacity-50"
            >
              <span>HOÀN THÀNH</span>
              <i className="fa-solid fa-chevron-right text-[9px]"></i>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default JDInput;
