import React, { useState } from 'react';
import { extractTextFromJdFile } from '../../../services/data/ocrService';
import { extractJobPositionFromJD, filterAndStructureJD, extractHardFiltersFromJD, extractJDMetadata } from '../../../services/ai/geminiService';
import { googleDriveService } from '../../../services/storage/googleDriveService';
import type { HardFilters } from '../../../types';

interface JDInputProps {
  jdText: string;
  setJdText: React.Dispatch<React.SetStateAction<string>>;
  jobPosition: string;
  setJobPosition: React.Dispatch<React.SetStateAction<string>>;
  hardFilters: HardFilters;
  setHardFilters: React.Dispatch<React.SetStateAction<HardFilters>>;
  onComplete: () => void;
  sidebarCollapsed?: boolean;
  // JD Metadata
  companyName: string;
  setCompanyName: React.Dispatch<React.SetStateAction<string>>;
  salary: string;
  setSalary: React.Dispatch<React.SetStateAction<string>>;
  requirementsSummary: string;
  setRequirementsSummary: React.Dispatch<React.SetStateAction<string>>;
}

const JDInput: React.FC<JDInputProps> = ({ jdText, setJdText, jobPosition, setJobPosition, hardFilters, setHardFilters, onComplete, sidebarCollapsed = false, companyName, setCompanyName, salary, setSalary, requirementsSummary, setRequirementsSummary }) => {
  const isCompleteEnabled = jdText.trim().length > 50 && jobPosition.trim().length > 3;
  const characterCount = jdText.length;

  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [ocrMessage, setOcrMessage] = useState('');
  const [ocrError, setOcrError] = useState('');

  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summarizeError, setSummarizeError] = useState('');
  const [showUploadOptions, setShowUploadOptions] = useState(false);

  const getFriendlyErrorMessage = (error: unknown, context: 'ocr' | 'summarize'): string => {
    console.error(`Lỗi trong quá trình ${context}:`, error); // Log the original error for debugging

    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      // This error is already user-friendly
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
        successMessage = `✓ Đã phát hiện chức danh: ${extractedPosition}`;
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
          successMessage += successMessage ? ` | 🎯 Đã điền & tick ✓ ${tickedCount} tiêu chí: ${extractedInfo}` : `✓ 🎯 Đã tự động điền & tick ✓ ${tickedCount} tiêu chí: ${extractedInfo}`;
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
    setOcrError(''); // Clear other errors

    try {
      const structuredJd = await filterAndStructureJD(jdText);
      setJdText(structuredJd);

      const extractedPosition = await extractJobPositionFromJD(structuredJd);
      console.log('🔍 AI Optimizer extracted position:', extractedPosition); // Debug log

      if (extractedPosition) {
        setJobPosition(extractedPosition);
        console.log('✓ AI đã trích xuất chức danh:', extractedPosition);
      } else {
        console.log('❌ AI Optimizer: No job position extracted');
      }

      // Extract JD metadata (company, salary, summary)
      const metadata = await extractJDMetadata(structuredJd);
      if (metadata.companyName) setCompanyName(metadata.companyName);
      if (metadata.salary) setSalary(metadata.salary);
      if (metadata.requirementsSummary) setRequirementsSummary(metadata.requirementsSummary);

      // Extract hard filters from optimized JD with smart conversion
      const extractedFilters = await extractHardFiltersFromJD(structuredJd);
      if (extractedFilters && Object.keys(extractedFilters).length > 0) {
        // Auto-tick mandatory checkboxes for any extracted field
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
        console.log('✓ AI đã tự động điền & tick tiêu chí lọc:', extractedFilters, 'Mandatory:', mandatoryUpdates);
      }

    } catch (error) {
      const friendlyMessage = getFriendlyErrorMessage(error, 'summarize');
      setSummarizeError(friendlyMessage);
    } finally {
      setIsSummarizing(false);
    }
  };

  // Tính toán vị trí left của fixed header bar dựa trên trạng thái sidebar
  const sidebarWidth = sidebarCollapsed ? 'md:left-[72px]' : 'md:left-64';

  return (
    <section id="module-jd" className="module-pane active w-full h-screen flex flex-col bg-[#0B1120]" aria-labelledby="jd-title">

      {/* ─── FIXED HEADER BAR: responsive 2-column (desktop) / 2-row (mobile) ─── */}
      <div className={`fixed top-14 md:top-0 left-0 right-0 z-30 ${sidebarWidth} transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]`}>
        {/* id for CSS responsive targeting */}
        <div id="jdinput-header" className="bg-slate-900 border-b border-slate-800 flex items-stretch md:flex-row flex-col">

          {/* CỘT TRÁI / ROW 1: Ô nhập chức danh công việc */}
          <div className="jd-col-left flex-1 flex items-center bg-slate-900/60 md:h-[101px] h-[52px]">
            <input
              type="text"
              id="job-position"
              value={jobPosition}
              onChange={(e) => setJobPosition(e.target.value)}
              className="w-full h-full text-base pl-4 md:pl-5 pr-3 bg-transparent border-0 border-b-2 border-indigo-500/40 text-violet-100 placeholder-slate-500 focus:outline-none focus:border-indigo-400 transition-colors font-medium tracking-wide"
              placeholder="Nhập chức danh… VD: Senior Frontend Developer"
              maxLength={100}
            />
          </div>

          {/* Divider (desktop only) */}
          {/* Divider removed */}

          {/* CỘT PHẢI / ROW 2: 3 info fields */}
          <div className="jd-col-right md:w-[320px] lg:w-[360px] flex-shrink-0 flex md:flex-col flex-row md:justify-center md:gap-2 md:px-4 md:py-2 md:bg-cyan-950/20 
                          px-3 gap-2 overflow-x-auto items-center bg-cyan-950/40 md:h-auto h-[38px] border-t border-slate-800/40 md:border-t-0">

            {/* Tên công ty — cyan */}
            <div className="jd-field flex items-center gap-1.5 flex-shrink-0 md:flex-shrink md:w-full border-b border-cyan-400/30 pb-1.5 mb-1">
              <i className="fa-solid fa-building text-[10px] text-cyan-400 flex-shrink-0"></i>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Tên công ty"
                className="min-w-[90px] md:min-w-0 md:flex-1 text-[11px] bg-transparent text-cyan-300 placeholder-slate-600 border-0 focus:outline-none truncate font-medium"
              />
              {companyName && (
                <button onClick={() => setCompanyName('')} className="jd-field-clear text-slate-600 hover:text-cyan-400 transition-colors flex-shrink-0">
                  <i className="fa-solid fa-xmark text-[9px]"></i>
                </button>
              )}
            </div>

            {/* Separator mobile */}
            <div className="md:hidden w-px h-3 bg-slate-700/60 flex-shrink-0"></div>

            {/* Mức lương — emerald */}
            <div className="jd-field flex items-center gap-1.5 flex-shrink-0 md:flex-shrink md:w-full">
              <i className="fa-solid fa-money-bill-wave text-[10px] text-emerald-400 flex-shrink-0"></i>
              <input
                type="text"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="Mức lương"
                className="min-w-[80px] md:min-w-0 md:flex-1 text-[11px] bg-transparent text-emerald-300 placeholder-slate-600 border-0 focus:outline-none truncate font-medium"
              />
              {salary && (
                <button onClick={() => setSalary('')} className="jd-field-clear text-slate-600 hover:text-emerald-400 transition-colors flex-shrink-0">
                  <i className="fa-solid fa-xmark text-[9px]"></i>
                </button>
              )}
            </div>

            {/* Separator mobile */}
            <div className="md:hidden w-px h-3 bg-slate-700/60 flex-shrink-0"></div>

            {/* Tóm tắt yêu cầu — amber */}
            <div className="jd-field flex items-center gap-1.5 flex-shrink-0 md:flex-shrink md:w-full">
              <i className="fa-solid fa-list-check text-[10px] text-amber-400 flex-shrink-0"></i>
              <input
                type="text"
                value={requirementsSummary}
                onChange={(e) => setRequirementsSummary(e.target.value)}
                placeholder="Yêu cầu chính"
                className="min-w-[90px] md:min-w-0 md:flex-1 text-[11px] bg-transparent text-amber-200 placeholder-slate-600 border-0 focus:outline-none truncate font-medium"
              />
              {requirementsSummary && (
                <button onClick={() => setRequirementsSummary('')} className="jd-field-clear text-slate-600 hover:text-amber-400 transition-colors flex-shrink-0">
                  <i className="fa-solid fa-xmark text-[9px]"></i>
                </button>
              )}
            </div>

          </div>

          {/* Status Badge — desktop only */}
          <div className="jd-col-counter hidden md:flex items-center justify-center px-8 flex-shrink-0 bg-cyan-950/20 transition-all duration-300">
            {jobPosition.trim().length > 3 && !isSummarizing && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] text-emerald-400 font-bold uppercase tracking-wider animate-in fade-in zoom-in duration-300">
                <i className="fa-solid fa-circle-check text-[9px]"></i>
                Sẵn sàng
              </div>
            )}
            {isSummarizing && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-[10px] text-purple-400 font-bold uppercase tracking-wider">
                <i className="fa-solid fa-spinner fa-spin text-[9px]"></i>
                Đang xử lý
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ─── MAIN CONTENT AREA ─── */}
      {/* mobile: 56px nav + 52px title + 38px AI row = 146px; desktop: 101px header */}
      <div className="jdinput-main-area flex-1 flex flex-col pt-[146px] md:pt-[101px] min-h-0">

        {/* Unified JD Card — textarea + footer hints + action buttons in one container */}
        <div className="flex-1 flex flex-col min-h-0 border-x border-b border-slate-700/80 bg-slate-900">

          {/* Textarea — grows to fill space */}
          <textarea
            id="job-description"
            className="flex-1 w-full px-5 py-4 bg-transparent text-sm text-slate-200 leading-relaxed placeholder-slate-700 resize-none focus:outline-none"
            placeholder="Dán nội dung Job Description vào đây, hoặc dùng nút &quot;Tải JD lên&quot; để quét từ file PDF/DOCX/PNG…"
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
          />

          {/* Hint footer */}
          <div className="px-5 py-2 border-t border-slate-800/60 flex-shrink-0">
            <p className="text-[11px] text-slate-600">
              Nhập nội dung rõ ràng để AI bám sát JD gốc.&nbsp; Khuyến nghị dùng file <span className="text-slate-500">PDF/DOCX</span> để OCR chính xác hơn.
            </p>
          </div>

          {/* Error banner */}
          {(ocrError || summarizeError) && (
            <div className="mx-5 mb-3 px-4 py-3 bg-red-900/20 border border-red-500/30 flex items-start gap-2 flex-shrink-0">
              <i className="fa-solid fa-triangle-exclamation text-red-400 mt-0.5 flex-shrink-0"></i>
              <p className="text-red-300 text-sm">{ocrError || summarizeError}</p>
            </div>
          )}

          {/* Action Buttons Row — pinned to bottom of card */}
          <div className="border-t border-slate-700/60 bg-slate-800/30 px-5 py-4 flex-shrink-0">
            <div className="flex flex-col sm:flex-row gap-3">

              {/* Upload Group */}
              <div className={`flex-1 flex gap-2 transition-all duration-300 ${showUploadOptions ? 'flex-row' : ''}`}>
                {!showUploadOptions ? (
                  <button
                    onClick={() => setShowUploadOptions(true)}
                    disabled={isOcrLoading || isSummarizing}
                    className="w-full h-11 px-4 flex items-center justify-center gap-2 text-sm font-medium text-white bg-slate-800 border border-slate-700 hover:border-cyan-500 hover:bg-slate-700/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <i className="fa-solid fa-cloud-arrow-up text-cyan-400"></i>
                    <span>Tải JD lên</span>
                  </button>
                ) : (
                  <>
                    {isOcrLoading ? (
                      <div className="flex-1 h-11 px-4 flex items-center justify-center text-[13px] text-white bg-slate-800 border border-slate-700">
                        <i className="fa-solid fa-spinner fa-spin mr-2 text-cyan-400"></i>
                        <span className="truncate">{ocrMessage || 'Đang quét OCR...'}</span>
                      </div>
                    ) : (
                      <label
                        htmlFor="ocr-jd-input"
                        title="Từ PDF/DOCX/PNG/JPG"
                        className="flex-1 cursor-pointer h-11 px-4 flex items-center justify-center gap-2 text-sm font-medium text-white bg-slate-800 border border-slate-700 hover:border-cyan-500 transition-all"
                      >
                        <i className="fa-solid fa-folder-open text-cyan-400"></i>
                        <span className="hidden sm:inline">Folder</span>
                        <input
                          id="ocr-jd-input"
                          type="file"
                          className="hidden"
                          accept=".pdf,.docx,.png,.jpg,.jpeg"
                          onChange={handleOcrFileChange}
                          onClick={(e) => { (e.target as HTMLInputElement).value = '' }}
                        />
                      </label>
                    )}

                    <button
                      onClick={handleGoogleDriveSelect}
                      disabled={isOcrLoading || isSummarizing}
                      title="Từ Google Drive"
                      className="flex-1 h-11 px-4 flex items-center justify-center gap-2 text-sm font-medium text-white bg-slate-800 border border-slate-700 hover:border-green-500 transition-all"
                    >
                      <i className="fa-brands fa-google-drive text-green-400"></i>
                      <span className="hidden sm:inline">Drive</span>
                    </button>

                    <button
                      onClick={() => setShowUploadOptions(false)}
                      className="w-11 h-11 flex items-center justify-center text-slate-500 hover:text-white bg-slate-800 border border-slate-700 hover:border-slate-500 transition-all"
                    >
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                  </>
                )}
              </div>

              {/* AI Optimizer */}
              <button
                onClick={handleSummarizeJD}
                disabled={isOcrLoading || isSummarizing || jdText.trim().length < 200}
                title="Dùng AI để tóm tắt và cấu trúc lại JD"
                className="flex-1 h-11 px-4 flex items-center justify-center gap-2 text-sm font-medium text-white bg-purple-900/50 border border-purple-700/60 hover:border-purple-500 hover:bg-purple-900/70 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <i className="fa-solid fa-brain text-purple-300"></i>
                <span>AI Optimizer</span>
              </button>

              {/* Complete */}
              <button
                onClick={onComplete}
                disabled={!isCompleteEnabled}
                className="flex-1 h-11 px-4 flex items-center justify-center gap-2 text-sm font-semibold text-slate-900 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className="fa-solid fa-arrow-right"></i>
                <span>Hoàn thành</span>
              </button>

            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default JDInput;
