import React, { useState } from 'react';
import { extractTextFromJdFile } from '../../services/ocrService';
import { extractJobPositionFromJD, filterAndStructureJD, extractHardFiltersFromJD } from '../../services/geminiService';
import { googleDriveService } from '../../services/googleDriveService';
import type { HardFilters } from '../../types';

interface JDInputProps {
  jdText: string;
  setJdText: React.Dispatch<React.SetStateAction<string>>;
  jobPosition: string;
  setJobPosition: React.Dispatch<React.SetStateAction<string>>;
  hardFilters: HardFilters;
  setHardFilters: React.Dispatch<React.SetStateAction<HardFilters>>;
  onComplete: () => void;
}

const JDInput: React.FC<JDInputProps> = ({ jdText, setJdText, jobPosition, setJobPosition, hardFilters, setHardFilters, onComplete }) => {
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
        console.log('❌ AI Optimizer: No job position extracted'); // Debug log
      }

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

  return (
    <section id="module-jd" className="module-pane active w-full min-h-screen flex flex-col" aria-labelledby="jd-title">
      <div className="w-full px-0 md:px-4 lg:px-6 xl:px-8 py-6 flex flex-col flex-1 overflow-hidden">
        {/* Unified Container for all 3 sections */}
        <div className="flex flex-col flex-1 min-h-0 bg-slate-900/60 border-l-0 md:border-l border-t border-r border-b border-slate-800 md:rounded-xs rounded-none p-4 gap-4 md:rounded-xl">
          {/* Job Position Input */}
          <div className="flex-shrink-0 pb-6">
            <label htmlFor="job-position" className="flex items-center justify-between text-xs font-semibold tracking-wide text-slate-100">
              <span className="flex items-center gap-2 uppercase">
                Chức danh công việc <span className="text-red-300">*</span>
              </span>
              <span className="text-[11px] font-normal text-slate-400">Tối đa 100 ký tự</span>
            </label>
            <input
              type="text"
              id="job-position"
              value={jobPosition}
              onChange={(e) => setJobPosition(e.target.value)}
              className="mt-3 w-full text-base px-3 py-3 bg-slate-950/40 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400"
              placeholder="Ví dụ: Senior Frontend Developer, Product Manager…"
              maxLength={100}
            />
          </div>

          {/* Job Description Input */}
          <div className="flex-1 flex flex-col min-h-0">
            <label htmlFor="job-description" className="flex items-center justify-between text-xs font-semibold tracking-wide text-slate-100">
              <span className="flex items-center gap-2 uppercase">
                Job Description <span className="text-red-300">*</span>
              </span>

            </label>
            <div className="relative mt-3 flex-1 flex flex-col min-h-0 overflow-hidden">
              <textarea
                id="job-description"
                className="flex-1 px-3 py-3 bg-slate-950/40 border border-slate-700 rounded-lg text-sm text-white leading-relaxed placeholder-slate-500 resize-none focus:outline-none focus:ring-1 focus:ring-purple-400 focus:border-purple-400 whitespace-pre-wrap overflow-y-auto"
                placeholder="Dán JD vào đây hoặc tải file PDF/DOCX/PNG."
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
              ></textarea>

              {isSummarizing && (
                <div className="absolute top-2 right-2 flex items-center gap-2 text-purple-300 bg-slate-950/80 rounded-md px-2 py-1">
                  <i className="fa-solid fa-spinner fa-spin text-xs"></i>
                  <span className="text-[11px] font-medium">AI đang tối ưu</span>
                </div>
              )}

              <div className="absolute bottom-2 right-2 text-[11px] font-mono text-slate-500 bg-slate-950/70 px-2 py-0.5 rounded">
                {characterCount} ký tự
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">Nhập nội dung rõ ràng để AI bám sát JD gốc.</p>
            <p className="text-[11px] text-slate-500 mt-1">Khuyến nghị ưu tiên file PDF/DOCX khi OCR để trích xuất chính xác hơn.</p>
          </div>
          
          {/* Error Messages */}
          {(ocrError || summarizeError) && (
            <div className="flex-shrink-0 p-4 bg-red-900/20 border border-red-500/30 rounded-xl">
              <div className="flex items-center gap-2 text-red-400">
                <i className="fa-solid fa-triangle-exclamation"></i>
                <span className="font-medium">Lỗi xử lý</span>
              </div>
              <p className="text-red-300 text-sm mt-1">{ocrError || summarizeError}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-4 flex-shrink-0">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Upload Group */}
              <div className={`flex-1 flex gap-2 transition-all duration-300 ${showUploadOptions ? 'flex-row' : 'flex-col'}`}>
                {!showUploadOptions ? (
                  <button
                    onClick={() => setShowUploadOptions(true)}
                    disabled={isOcrLoading || isSummarizing}
                    className="w-full h-12 px-3 flex items-center justify-center gap-2 text-sm font-medium text-white bg-gradient-to-r from-slate-800 to-slate-700 rounded-lg border border-slate-600 hover:border-cyan-400 transition-colors"
                  >
                    <i className="fa-solid fa-cloud-arrow-up text-cyan-300"></i>
                    <span>Tải JD lên</span>
                  </button>
                ) : (
                  <>
                    {isOcrLoading ? (
                      <div className="flex-1 h-12 px-3 flex items-center justify-center text-[13px] font-medium text-white bg-slate-800 rounded-lg border border-slate-700">
                        <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                        <span className="truncate">{ocrMessage || 'Đang quét OCR...'}</span>
                      </div>
                    ) : (
                      <label
                        htmlFor="ocr-jd-input"
                        title="Nhận JD từ PDF/DOCX/PNG/JPG bằng OCR"
                        className="flex-1 cursor-pointer h-12 px-3 flex items-center justify-center gap-2 text-sm font-medium text-white bg-slate-800 rounded-lg border border-slate-600 hover:border-cyan-400 transition-colors animate-in fade-in zoom-in duration-200"
                      >
                        <i className="fa-solid fa-folder-open text-cyan-300"></i>
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
                      title="Chọn JD từ Google Drive"
                      className="flex-1 h-12 px-3 flex items-center justify-center gap-2 text-sm font-medium text-white bg-slate-800 rounded-lg border border-slate-600 hover:border-green-400 transition-colors animate-in fade-in zoom-in duration-200"
                    >
                      <i className="fa-brands fa-google-drive text-green-400"></i>
                      <span className="hidden sm:inline">Drive</span>
                    </button>
                    
                    <button
                        onClick={() => setShowUploadOptions(false)}
                        className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-white bg-slate-800 rounded-lg border border-slate-600 transition-colors"
                    >
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                  </>
                )}
              </div>

              <button
                onClick={handleSummarizeJD}
                disabled={isOcrLoading || isSummarizing || jdText.trim().length < 200}
                title="Dùng AI để tóm tắt và cấu trúc lại JD đã dán"
                aria-label="Rút gọn ý chính JD"
                className="flex-1 h-12 px-3 flex items-center justify-center gap-2 text-sm font-medium text-white bg-gradient-to-r from-purple-700 to-purple-500 rounded-lg border border-purple-500/60 hover:border-purple-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className="fa-solid fa-brain"></i>
                <span>AI Optimizer</span>
              </button>

              <button
                onClick={onComplete}
                disabled={!isCompleteEnabled}
                className="flex-1 h-12 px-3 flex items-center justify-center gap-2 text-sm font-semibold text-slate-900 bg-gradient-to-r from-cyan-300 to-emerald-300 rounded-lg border border-emerald-200 hover:from-cyan-200 hover:to-emerald-200 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <i className="fa-solid fa-check"></i>
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