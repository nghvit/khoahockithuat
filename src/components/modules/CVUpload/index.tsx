import React, { useState, useCallback, memo, useMemo } from 'react';
import type { Candidate, HardFilters, WeightCriteria, AppStep } from '../../../types';
import { analyzeCVs } from '../../../services/ai/geminiService';
import { googleDriveService } from '../../../services/storage/googleDriveService';

interface CVUploadProps {
  cvFiles: File[];
  setCvFiles: React.Dispatch<React.SetStateAction<File[]>>;
  jdText: string;
  weights: WeightCriteria;
  hardFilters: HardFilters;
  setAnalysisResults: React.Dispatch<React.SetStateAction<Candidate[]>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setLoadingMessage: React.Dispatch<React.SetStateAction<string>>;
  onAnalysisStart: () => void;
  completedSteps: AppStep[];
  sidebarCollapsed?: boolean;
}

const MAX_CV_PER_BATCH = 20;

const CVUpload: React.FC<CVUploadProps> = memo((props) => {
  const { cvFiles, setCvFiles, jdText, weights, hardFilters, setAnalysisResults, setIsLoading, isLoading, setLoadingMessage, onAnalysisStart, completedSteps, sidebarCollapsed = false } = props;
  const [error, setError] = useState('');
  const [showUploadOptions, setShowUploadOptions] = useState(false);

  const readyForAnalysis = useMemo(() => {
    const requiredSteps: AppStep[] = ['jd', 'weights'];
    return requiredSteps.every((step) => completedSteps.includes(step));
  }, [completedSteps]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);

      setCvFiles((prev: File[]) => {
        const existingMap = new Map(prev.map((f: File) => [`${f.name}-${f.size}`, true]));
        const uniqueNewFiles = newFiles.filter((f: File) => !existingMap.has(`${f.name}-${f.size}`));
        if (uniqueNewFiles.length === 0) return prev;
        const totalFiles = prev.length + uniqueNewFiles.length;

        if (totalFiles > MAX_CV_PER_BATCH) {
          setError(`Chỉ được phép tải lên tối đa ${MAX_CV_PER_BATCH} CV. Bạn đang có ${prev.length} và muốn thêm ${uniqueNewFiles.length}.`);
          return prev;
        }

        setError('');
        return [...prev, ...uniqueNewFiles];
      });
      e.target.value = '';
    }
  };

  const handleGoogleDriveSelect = async () => {
    try {
      const token = await googleDriveService.authenticate();
      const driveFiles = await googleDriveService.openPicker({
        mimeTypes: 'application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/png,image/jpeg',
        multiSelect: true
      });

      if (driveFiles.length > 0) {
        setIsLoading(true);
        setLoadingMessage(`Đang tải ${driveFiles.length} file từ Drive...`);

        const newFiles: File[] = [];
        for (const dFile of driveFiles) {
          try {
            const blob = await googleDriveService.downloadFile(dFile.id, token);
            const file = new File([blob], dFile.name, { type: dFile.mimeType });
            newFiles.push(file);
          } catch (err) {
            console.error(`Failed to download ${dFile.name}`, err);
          }
        }

        if (newFiles.length > 0) {
          setCvFiles((prev: File[]) => {
            const existingMap = new Map(prev.map(f => [`${f.name}-${f.size}`, true]));
            const uniqueNewFiles = newFiles.filter(f => !existingMap.has(`${f.name}-${f.size}`));
            if (uniqueNewFiles.length === 0) return prev;
            const totalFiles = prev.length + uniqueNewFiles.length;
            if (totalFiles > MAX_CV_PER_BATCH) {
              setError(`Chỉ được phép tải lên tối đa ${MAX_CV_PER_BATCH} CV.`);
              return prev;
            }
            setError('');
            return [...prev, ...uniqueNewFiles];
          });
        }
      }
    } catch (err: any) {
      console.error("Google Drive Error:", err);
      setError('Lỗi khi kết nối Google Drive.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const handleAnalyzeClick = async () => {
    if (cvFiles.length === 0) {
      setError('Vui lòng chọn ít nhất một tệp CV để phân tích.');
      return;
    }

    setError('');
    setIsLoading(true);
    onAnalysisStart();
    setAnalysisResults([]);

    try {
      const analysisGenerator = analyzeCVs(jdText, weights, hardFilters, cvFiles);
      for await (const result of analysisGenerator) {
        if (result.status === 'progress') {
          setLoadingMessage(result.message);
        } else {
          setAnalysisResults(prev => [...prev, result as Candidate]);
        }
      }
    } catch (err) {
      console.error("Lỗi phân tích CV:", err);
      const message = err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.';
      setError(message);
    } finally {
      setIsLoading(false);
      setLoadingMessage('Hoàn tất phân tích!');
    }
  };

  const handleRemoveFile = useCallback((index: number) => {
    setCvFiles((prev) => prev.filter((_, idx) => idx !== index));
  }, [setCvFiles]);

  const handleClearFiles = useCallback(() => {
    setCvFiles([]);
  }, [setCvFiles]);

  const sidebarWidth = sidebarCollapsed ? 'md:left-[72px]' : 'md:left-64';

  return (
    <section id="module-upload" className="module-pane active w-full h-screen flex flex-col bg-[#0B1120]">

      {/* ─── FIXED HEADER BAR ─── */}
      <div className={`fixed top-14 md:top-0 left-0 right-0 z-30 ${sidebarWidth} transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]`}>
        <div className="bg-slate-900 border-b border-slate-800 flex items-center h-[72px] md:h-[101px] px-6 gap-4">

          {/* Step badge + Title */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 flex-shrink-0">
              <span className="font-bold text-lg">3</span>
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-white leading-tight truncate">Tải lên CV</h2>
              <p className="text-xs text-slate-400 leading-tight truncate">Tải lên tối đa {MAX_CV_PER_BATCH} hồ sơ ứng viên</p>
            </div>
          </div>

          {/* Status Badges */}
          <div className="flex items-center gap-2 md:gap-3 flex-shrink-0 overflow-x-auto no-scrollbar py-1">
            <div className={`whitespace-nowrap px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${completedSteps.includes('jd') ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'}`}>
              JD: {completedSteps.includes('jd') ? 'Xong' : 'Chưa'}
            </div>
            <div className={`whitespace-nowrap px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${completedSteps.includes('weights') ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'}`}>
              Trọng số: {completedSteps.includes('weights') ? 'Xong' : 'Chưa'}
            </div>
            <div className="whitespace-nowrap px-3 py-1.5 rounded-full border border-slate-700 bg-slate-800 text-[10px] text-slate-300 font-bold uppercase tracking-wider">
              Đã chọn: <span className="text-white">{cvFiles.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── MAIN CONTENT AREA ─── */}
      <div className="flex-1 flex flex-col pt-[128px] md:pt-[101px] min-h-0">
        <div className="flex-1 flex flex-col min-h-0 border-x border-slate-700/80 bg-slate-900 overflow-y-auto custom-scrollbar">

          {/* Upload Block */}
          <div className="p-8 border-b border-slate-800/60 transition-all duration-500">
            <div className="max-w-4xl mx-auto w-full">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl opacity-10 group-hover:opacity-20 transition duration-500"></div>
                <div className="relative bg-slate-900/40 rounded-xl p-8 border border-slate-800 hover:border-slate-700 transition-colors text-center backdrop-blur-sm">
                  <div className="w-16 h-16 mx-auto rounded-full bg-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <i className="fa-solid fa-cloud-arrow-up text-3xl text-cyan-400"></i>
                  </div>
                  <h4 className="text-xl font-bold text-white mb-2">Bắt đầu tải lên hồ sơ ứng viên</h4>
                  <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
                    Kéo thả trực tiếp hoặc chọn file từ máy tính/Google Drive. Hỗ trợ định dạng PDF, DOCX, PNG, JPG.
                  </p>

                  <div className="flex justify-center">
                    {!showUploadOptions ? (
                      <button
                        onClick={() => setShowUploadOptions(true)}
                        className="px-10 py-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-all shadow-lg shadow-cyan-900/20"
                      >
                        Tải CV lên
                      </button>
                    ) : (
                      <div className="flex items-center gap-3 animate-in fade-in zoom-in duration-200">
                        <label className="cursor-pointer h-12 px-6 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-cyan-400 text-sm font-bold flex items-center gap-2 transition-all">
                          <i className="fa-solid fa-folder-open"></i> Folder
                          <input type="file" multiple accept=".pdf,.docx,.png,.jpg,.jpeg" className="hidden" onChange={handleFileChange} />
                        </label>
                        <button onClick={handleGoogleDriveSelect} className="h-12 px-6 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-green-400 text-sm font-bold flex items-center gap-2 transition-all">
                          <i className="fa-brands fa-google-drive"></i> Drive
                        </button>
                        <button onClick={() => setShowUploadOptions(false)} className="w-12 h-12 flex items-center justify-center text-slate-500 hover:text-white bg-slate-800/50 border border-slate-700 rounded-lg">
                          <i className="fa-solid fa-xmark"></i>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* File List Block */}
          <div className="flex-1 p-8">
            <div className="max-w-4xl mx-auto w-full flex flex-col h-full">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-xl font-bold text-white flex items-center gap-3">
                  <span className="w-1.5 h-6 bg-cyan-500 rounded-full"></span>
                  Danh sách hồ sơ
                </h4>
                {cvFiles.length > 0 && (
                  <button onClick={handleClearFiles} className="text-xs font-bold text-red-400 hover:text-red-300 transition-colors uppercase tracking-widest">
                    Xóa tất cả
                  </button>
                )}
              </div>

              {cvFiles.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-600 py-12 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800">
                  <i className="fa-regular fa-folder-open text-5xl mb-4 opacity-20"></i>
                  <p className="text-base font-medium">Chưa có CV nào được chọn</p>
                  <p className="text-xs">Vui lòng tải file để bắt đầu phân tích AI</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {cvFiles.map((file, index) => (
                    <div key={`${file.name}-${index}`} className="group flex items-center gap-4 p-4 rounded-xl bg-slate-800/20 border border-slate-800 hover:border-cyan-500/30 hover:bg-slate-800/40 transition-all">
                      <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-cyan-400 group-hover:bg-cyan-500/10 transition-all">
                        <i className="fa-regular fa-file-lines text-lg"></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-200 truncate">{file.name}</p>
                        <p className="text-[10px] text-slate-500 font-medium uppercase">{(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                      <button onClick={() => handleRemoveFile(index)} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-red-500/10 text-slate-600 hover:text-red-400 transition-colors">
                        <i className="fa-solid fa-xmark text-sm"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Footer Bar */}
          <div className="sticky bottom-0 z-20 border-t border-slate-700/60 bg-slate-800/80 backdrop-blur-md px-6 py-5">
            <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center gap-5">

              <div className="flex-1 w-full order-2 sm:order-1">
                {error && (
                  <div className="flex items-center gap-3 text-red-400 animate-in fade-in slide-in-from-left-2 transition-all">
                    <i className="fa-solid fa-circle-exclamation flex-shrink-0 text-sm"></i>
                    <p className="text-xs font-semibold leading-relaxed">{error}</p>
                  </div>
                )}
                {!error && cvFiles.length > 0 && (
                  <p className="text-[11px] text-slate-500 font-medium italic">
                    <i className="fa-solid fa-info-circle mr-1.5 text-cyan-500"></i>
                    Bạn đã chọn {cvFiles.length} hồ sơ. Nhấn "Phân tích ngay" để AI bắt đầu chấm điểm.
                  </p>
                )}
              </div>

              <div className="flex items-center gap-4 w-full sm:w-auto order-1 sm:order-2">
                <button
                  onClick={handleAnalyzeClick}
                  disabled={cvFiles.length === 0 || !readyForAnalysis || isLoading}
                  className={`flex-1 sm:flex-none h-12 px-10 rounded-lg font-bold text-sm shadow-xl transition-all flex items-center justify-center gap-3 ${cvFiles.length > 0 && readyForAnalysis && !isLoading
                    ? 'bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-900 hover:from-cyan-300 hover:to-emerald-300'
                    : 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700'
                    }`}
                >
                  {isLoading ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i>
                      <span>Đang xử lý...</span>
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-bolt"></i>
                      <span>Phân tích ngay</span>
                    </>
                  )}
                  <i className="fa-solid fa-arrow-right ml-1"></i>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
});

CVUpload.displayName = 'CVUpload';

export default CVUpload;
