import React, { useState, useCallback, memo, useMemo } from 'react';
import type { Candidate, HardFilters, WeightCriteria, AppStep } from '../../types';
import { analyzeCVs } from '../../services/geminiService';
import { googleDriveService } from '../../services/googleDriveService';

interface CVUploadProps {
  cvFiles: File[];
  setCvFiles: React.Dispatch<React.SetStateAction<File[]>>;
  jdText: string;
  weights: WeightCriteria;
  hardFilters: HardFilters;
  setAnalysisResults: React.Dispatch<React.SetStateAction<Candidate[]>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setLoadingMessage: React.Dispatch<React.SetStateAction<string>>;
  onAnalysisStart: () => void;
  completedSteps: AppStep[];
}

const MAX_CV_PER_BATCH = 20;

const CVUpload: React.FC<CVUploadProps> = memo((props) => {
  const { cvFiles, setCvFiles, jdText, weights, hardFilters, setAnalysisResults, setIsLoading, setLoadingMessage, onAnalysisStart, completedSteps } = props;
  const [error, setError] = useState('');
  const [showUploadOptions, setShowUploadOptions] = useState(false);
  const [showAddMoreOptions, setShowAddMoreOptions] = useState(false);

  const readyForAnalysis = useMemo(() => {
    const requiredSteps: AppStep[] = ['jd', 'weights'];
    return requiredSteps.every((step) => completedSteps.includes(step));
  }, [completedSteps]);

  const totalSizeMB = useMemo(() => {
    if (!cvFiles.length) return 0;
    const total = cvFiles.reduce((sum, file) => sum + file.size, 0);
    return (total / (1024 * 1024)).toFixed(2);
  }, [cvFiles]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      
      setCvFiles((prev: File[]) => {
        // Create a map of existing files for quick lookup
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
      
      // Reset the input so the same file can be selected again if it was removed
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
                  setError(`Chỉ được phép tải lên tối đa ${MAX_CV_PER_BATCH} CV. Bạn đang có ${prev.length} và muốn thêm ${uniqueNewFiles.length}.`);
                  return prev;
                }
                
                setError('');
                return [...prev, ...uniqueNewFiles];
              });
        }
      }
    } catch (err: any) {
      console.error("Google Drive Error:", err);
      if (err.message && (err.message.includes('Client ID') || err.message.includes('API Key'))) {
         setError('Chưa cấu hình Google Drive API. Vui lòng kiểm tra file .env');
      } else {
         setError('Lỗi khi kết nối Google Drive. Vui lòng thử lại.');
      }
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const handleAnalyzeClick = async () => {
    const requiredSteps: AppStep[] = ['jd', 'weights'];
    const missingSteps = requiredSteps.filter(step => !completedSteps.includes(step));
    
    if (missingSteps.length > 0) {
      const stepNames = missingSteps.map(s => {
        if (s === 'jd') return 'Mô tả công việc';
        if (s === 'weights') return 'Phân bổ trọng số';
        return s;
      }).join(', ');
      setError(`Vui lòng hoàn thành các bước trước: ${stepNames}.`);
      return;
    }
    
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
      
      setAnalysisResults(prev => {
        // Avoid adding duplicate system error cards
        if (prev.some(c => c.candidateName === 'Lỗi Hệ Thống')) return prev;
        return [...prev, {
          // FIX: Added the 'id' property to conform to the Candidate type for system error messages.
          id: `system-error-${Date.now()}`,
          status: 'FAILED',
          error: message,
          candidateName: 'Lỗi Hệ Thống',
          fileName: 'N/A',
          jobTitle: '',
          industry: '',
          department: '',
          experienceLevel: '',
          detectedLocation: '',
        }];
      });
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

  return (
    <section id="module-upload" className="module-pane active w-full min-h-screen flex flex-col">
      <div className="relative overflow-hidden bg-slate-950/50 border border-slate-800 rounded-2xl shadow-xl backdrop-blur-sm flex flex-col flex-1 min-h-0">
        {/* Background decoration - reduced opacity/size */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl"></div>

        <div className="relative z-10 p-6 space-y-6 flex-1 flex flex-col min-h-0">
          {/* Compact Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/50 pb-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
                  <span className="font-bold text-lg">3</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Upload CV</h3>
                  <p className="text-xs text-slate-400">Tải lên tối đa {MAX_CV_PER_BATCH} hồ sơ</p>
                </div>
              </div>
            </div>
            
            {/* Status Badges */}
            <div className="flex items-center gap-3 text-xs">
               <div className={`px-3 py-1.5 rounded-full border ${completedSteps.includes('jd') ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'}`}>
                 JD: {completedSteps.includes('jd') ? 'Đã xong' : 'Chưa xong'}
               </div>
               <div className={`px-3 py-1.5 rounded-full border ${completedSteps.includes('weights') ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'}`}>
                 Trọng số: {completedSteps.includes('weights') ? 'Đã xong' : 'Chưa xong'}
               </div>
               <div className="px-3 py-1.5 rounded-full border border-slate-700 bg-slate-800 text-slate-300">
                 Đã chọn: <span className="text-white font-bold">{cvFiles.length}</span>
               </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-6 flex-1 min-h-0">
            {/* Left Column: Upload & Actions (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              {/* Upload Zone */}
              <div className="relative group">
                 <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl opacity-20 group-hover:opacity-40 transition duration-500"></div>
                 <div className="relative bg-slate-900 rounded-xl p-6 border border-slate-800 hover:border-slate-700 transition-colors text-center">
                    <div className="w-16 h-16 mx-auto rounded-full bg-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <i className="fa-solid fa-cloud-arrow-up text-2xl text-cyan-400"></i>
                    </div>
                    <h4 className="text-lg font-medium text-white mb-1">Kéo thả hoặc chọn file</h4>
                    <p className="text-xs text-slate-500 mb-4">PDF, DOCX, PNG, JPG (Max {MAX_CV_PER_BATCH})</p>
                    
                    {/* Upload Buttons */}
                    <div className="flex flex-col gap-2">
                        {!showUploadOptions ? (
                            <button 
                                onClick={() => setShowUploadOptions(true)}
                                className="w-full py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-sm transition-all shadow-lg shadow-cyan-500/20"
                            >
                                Tải CV lên
                            </button>
                        ) : (
                            <div className="grid grid-cols-2 gap-2 animate-in fade-in zoom-in duration-200">
                                <label className="cursor-pointer py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-cyan-400 text-sm font-medium flex items-center justify-center gap-2 transition-all">
                                    <i className="fa-solid fa-folder-open"></i> Folder
                                    <input type="file" multiple accept=".pdf,.docx,.png,.jpg,.jpeg" className="hidden" onChange={handleFileChange} />
                                </label>
                                <button onClick={handleGoogleDriveSelect} className="py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-green-400 text-sm font-medium flex items-center justify-center gap-2 transition-all">
                                    <i className="fa-brands fa-google-drive"></i> Drive
                                </button>
                                <button onClick={() => setShowUploadOptions(false)} className="col-span-2 py-1 text-xs text-slate-500 hover:text-slate-300">Hủy</button>
                            </div>
                        )}
                    </div>
                 </div>
              </div>

              {/* Analyze Button */}
              <button
                onClick={handleAnalyzeClick}
                disabled={cvFiles.length === 0 || !readyForAnalysis}
                className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-3 ${
                  cvFiles.length > 0 && readyForAnalysis
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-500 hover:to-blue-500 hover:shadow-cyan-500/25 hover:-translate-y-0.5'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                }`}
              >
                <i className="fa-solid fa-rocket"></i>
                {readyForAnalysis ? 'Phân tích ngay' : 'Chưa sẵn sàng'}
              </button>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
                  <i className="fa-solid fa-circle-exclamation text-red-400 mt-0.5"></i>
                  <p className="text-xs text-red-200">{error}</p>
                </div>
              )}

              {/* Mini Checklist */}
              <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800/50">
                <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Yêu cầu</h5>
                <ul className="space-y-2 text-xs text-slate-300">
                   <li className={`flex items-center gap-2 ${completedSteps.includes('jd') ? 'text-emerald-400' : 'text-slate-500'}`}>
                     <i className={`fa-solid ${completedSteps.includes('jd') ? 'fa-check-circle' : 'fa-circle'}`}></i> Có JD
                   </li>
                   <li className={`flex items-center gap-2 ${completedSteps.includes('weights') ? 'text-emerald-400' : 'text-slate-500'}`}>
                     <i className={`fa-solid ${completedSteps.includes('weights') ? 'fa-check-circle' : 'fa-circle'}`}></i> Có Trọng số
                   </li>
                   <li className={`flex items-center gap-2 ${cvFiles.length > 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
                     <i className={`fa-solid ${cvFiles.length > 0 ? 'fa-check-circle' : 'fa-circle'}`}></i> Có CV ({cvFiles.length})
                   </li>
                </ul>
              </div>
            </div>

            {/* Right Column: File List (7 cols) */}
            <div className="lg:col-span-7 flex flex-col bg-slate-900/30 rounded-xl border border-slate-800/50 overflow-hidden min-h-0">
               <div className="p-4 border-b border-slate-800/50 flex items-center justify-between bg-slate-900/50 flex-shrink-0">
                  <h4 className="font-medium text-slate-200 text-sm">Danh sách hồ sơ</h4>
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer text-xs text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1 px-2 py-1 rounded hover:bg-cyan-500/10" title="Thêm từ máy tính">
                        <i className="fa-solid fa-folder-plus"></i>
                        <input type="file" multiple accept=".pdf,.docx,.png,.jpg,.jpeg" className="hidden" onChange={handleFileChange} />
                    </label>
                    <button 
                        onClick={handleGoogleDriveSelect} 
                        className="text-xs text-green-400 hover:text-green-300 transition-colors flex items-center gap-1 px-2 py-1 rounded hover:bg-green-500/10"
                        title="Thêm từ Google Drive"
                    >
                        <i className="fa-brands fa-google-drive"></i>
                    </button>
                    {cvFiles.length > 0 && (
                        <>
                            <div className="w-px h-4 bg-slate-700 mx-1"></div>
                            <button onClick={handleClearFiles} className="text-xs text-red-400 hover:text-red-300 transition-colors">
                            Xóa tất cả
                            </button>
                        </>
                    )}
                  </div>
               </div>
               
               <div className="overflow-y-auto p-2 custom-scrollbar flex-1 min-h-0">
                  {cvFiles.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-3 opacity-60 py-8">
                       <i className="fa-regular fa-folder-open text-4xl"></i>
                       <p className="text-sm">Chưa có CV nào được chọn</p>
                    </div>
                  ) : (
                    <div className="grid gap-2">
                      {cvFiles.map((file, index) => (
                        <div key={`${file.name}-${index}`} className="group flex items-center gap-3 p-3 rounded-lg bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800 hover:border-cyan-500/30 transition-all">
                           <div className="w-8 h-8 rounded bg-slate-700 flex items-center justify-center text-slate-300 group-hover:text-cyan-300 group-hover:bg-cyan-500/10">
                             <i className="fa-regular fa-file-lines text-sm"></i>
                           </div>
                           <div className="flex-1 min-w-0">
                             <p className="text-sm text-slate-200 truncate">{file.name}</p>
                             <p className="text-[10px] text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                           </div>
                           <button onClick={() => handleRemoveFile(index)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors">
                             <i className="fa-solid fa-xmark text-xs"></i>
                           </button>
                        </div>
                      ))}
                    </div>
                  )}
               </div>
               
               {/* Footer Info */}
               <div className="p-3 bg-slate-900/50 border-t border-slate-800/50 text-[10px] text-slate-500 text-center flex-shrink-0">
                  Mẹo: Nhóm CV theo vị trí để AI phân tích chính xác nhất.
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
