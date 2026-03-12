import React, { useState, useCallback, memo, useMemo } from "react";
import type {
  Candidate,
  HardFilters,
  WeightCriteria,
  AppStep,
} from "../../../types";
import { analyzeCVs } from "../../../services/ai/geminiService";
import { googleDriveService } from "../../../services/storage/googleDriveService";
import AppLayout from "../../layout/AppLayout";

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

const MAX = 20;
const ACCEPTED = ".pdf,.docx,.png,.jpg,.jpeg";

const formatSize = (bytes: number) =>
  bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(0)} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

const fileIcon = (name: string) => {
  if (/\.pdf$/i.test(name)) return "fa-file-pdf text-red-400";
  if (/\.(docx?)$/i.test(name)) return "fa-file-word text-blue-400";
  return "fa-file-image text-emerald-400";
};

const CVUpload: React.FC<CVUploadProps> = memo((props) => {
  const {
    cvFiles,
    setCvFiles,
    jdText,
    weights,
    hardFilters,
    setAnalysisResults,
    setIsLoading,
    isLoading,
    setLoadingMessage,
    onAnalysisStart,
    completedSteps,
    sidebarCollapsed = false,
  } = props;

  const [error, setError] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const ready = useMemo(
    () =>
      (["jd", "weights"] as AppStep[]).every((s) => completedSteps.includes(s)),
    [completedSteps],
  );

  const addFiles = useCallback(
    (files: File[]) => {
      setCvFiles((prev: File[]) => {
        const map = new Map(prev.map((f) => [`${f.name}-${f.size}`, true]));
        const unique = files.filter((f) => !map.has(`${f.name}-${f.size}`));
        if (!unique.length) return prev;
        if (prev.length + unique.length > MAX) {
          setError(`Tối đa ${MAX} CV.`);
          return prev;
        }
        setError("");
        return [...prev, ...unique];
      });
    },
    [setCvFiles],
  );

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      addFiles(Array.from(e.target.files));
      e.target.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = (Array.from(e.dataTransfer.files) as File[]).filter((f) =>
      /\.(pdf|docx|png|jpe?g)$/i.test(f.name),
    );
    if (files.length) addFiles(files);
  };

  const handleDrive = async () => {
    try {
      const token = await googleDriveService.authenticate();
      const files = await googleDriveService.openPicker({
        mimeTypes:
          "application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/png,image/jpeg",
        multiSelect: true,
      });
      if (!files.length) return;
      setIsLoading(true);
      setLoadingMessage(`Đang tải ${files.length} file...`);
      const loaded: File[] = [];
      for (const f of files) {
        try {
          loaded.push(
            new File(
              [await googleDriveService.downloadFile(f.id, token)],
              f.name,
              { type: f.mimeType },
            ),
          );
        } catch {}
      }
      if (loaded.length) addFiles(loaded);
    } catch {
      setError("Lỗi Google Drive.");
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  const handleAnalyze = async () => {
    if (!cvFiles.length) {
      setError("Vui lòng chọn ít nhất một CV.");
      return;
    }
    setError("");
    setIsLoading(true);
    onAnalysisStart();
    setAnalysisResults([]);
    try {
      for await (const r of analyzeCVs(jdText, weights, hardFilters, cvFiles)) {
        if (r.status === "progress") setLoadingMessage(r.message);
        else setAnalysisResults((p: Candidate[]) => [...p, r as Candidate]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi không xác định.");
    } finally {
      setIsLoading(false);
      setLoadingMessage("Hoàn tất!");
    }
  };

  const removeFile = useCallback(
    (i: number) => setCvFiles((p: File[]) => p.filter((_, idx) => idx !== i)),
    [setCvFiles],
  );
  const clearFiles = useCallback(() => setCvFiles([]), [setCvFiles]);
  const pct = Math.round((cvFiles.length / MAX) * 100);

  // ── Analyze button (shared) ──────────────────────────────────────────────
  const AnalyzeBtn = ({ full }: { full?: boolean }) => (
    <button
      onClick={handleAnalyze}
      disabled={!cvFiles.length || !ready || isLoading}
      className={`${full ? "w-full" : "h-9 px-6 flex-shrink-0"} h-9 rounded-xl font-bold text-[12px] transition-all flex items-center justify-center gap-2 ${
        cvFiles.length && ready && !isLoading
          ? "bg-gradient-to-r from-cyan-500 to-indigo-500 text-white hover:brightness-110 shadow-lg shadow-cyan-900/20"
          : "bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700"
      }`}
    >
      {isLoading ? (
        <>
          <i className="fa-solid fa-spinner fa-spin text-xs" /> Đang xử lý...
        </>
      ) : (
        <>
          <i className="fa-solid fa-bolt text-xs" /> Phân tích ngay
        </>
      )}
    </button>
  );

  // ── Prereq check item ────────────────────────────────────────────────────
  const PrereqItem = ({ done, label }: { done: boolean; label: string }) => (
    <div className="flex items-center gap-2.5">
      <div
        className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 border ${done ? "bg-emerald-500/15 border-emerald-500/30" : "bg-slate-800 border-slate-700"}`}
      >
        <i
          className={`fa-solid ${done ? "fa-check text-emerald-400" : "fa-xmark text-slate-600"}`}
          style={{ fontSize: "8px" }}
        />
      </div>
      <span
        className={`text-[11px] font-medium ${done ? "text-slate-300" : "text-slate-600"}`}
      >
        {label}
      </span>
    </div>
  );

  return (
    <AppLayout
      sidebarCollapsed={sidebarCollapsed}
      headerRight={
        <div className="flex items-center gap-1.5">
          {(["jd", "weights"] as AppStep[]).map((s) => (
            <span
              key={s}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[10px] font-bold ${completedSteps.includes(s) ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-amber-500/10 border-amber-500/20 text-amber-400"}`}
            >
              <i
                className={`fa-solid ${completedSteps.includes(s) ? "fa-check" : "fa-clock"} text-[8px]`}
              />
              {s === "jd" ? "JD" : "Weights"}
            </span>
          ))}
        </div>
      }
      rightPanel={
        <>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 flex flex-col gap-3">
            {/* Counter card */}
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-3 space-y-3">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-folder text-cyan-400 text-[11px]" />
                <p className="text-[11px] font-bold text-white">
                  Hồ sơ đã chọn
                </p>
              </div>
              <div className="text-center">
                <p className="text-[36px] font-black text-white tabular-nums leading-none">
                  {cvFiles.length}
                  <span className="text-base font-normal text-slate-500">
                    /{MAX}
                  </span>
                </p>
                <p className="text-[10px] text-slate-500 mt-1">
                  {pct}% dung lượng
                </p>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>

            {/* Prereqs card */}
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-3 space-y-2.5">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-list-check text-indigo-400 text-[11px]" />
                <p className="text-[11px] font-bold text-white">Điều kiện</p>
              </div>
              <PrereqItem
                done={completedSteps.includes("jd")}
                label="Job Description"
              />
              <PrereqItem
                done={completedSteps.includes("weights")}
                label="Cấu hình trọng số"
              />
              <PrereqItem done={cvFiles.length > 0} label="CV đã chọn" />
            </div>

            {/* Info hint */}
            <div className="flex gap-2 p-3 rounded-xl border border-slate-800/60 bg-slate-900/40">
              <i className="fa-solid fa-circle-info text-slate-600 text-[10px] mt-0.5 flex-shrink-0" />
              <p className="text-[10px] text-slate-500 leading-relaxed">
                AI sẽ đọc từng CV và so sánh với JD theo trọng số đã cấu hình.
              </p>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                <i className="fa-solid fa-circle-exclamation text-red-400 text-xs mt-0.5 flex-shrink-0" />
                <p className="text-[11px] text-red-300">{error}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-white/5 flex-shrink-0">
            <AnalyzeBtn full />
          </div>
        </>
      }
      bottomBar={
        <div className="flex items-center justify-between gap-3">
          <div>
            {error && <p className="text-[11px] text-red-400">{error}</p>}
            {!error && cvFiles.length > 0 && (
              <p className="text-[11px] text-slate-500">
                <span className="text-white font-bold">{cvFiles.length}</span> /{" "}
                {MAX} hồ sơ
              </p>
            )}
          </div>
          <AnalyzeBtn />
        </div>
      }
    >
      {/* ── Drop zone ── */}
      <div className="px-5 pt-5 pb-4 flex-shrink-0">
        <div
          className={`rounded-xl border-2 border-dashed transition-all duration-200 ${isDragging ? "border-cyan-500/60 bg-cyan-500/5 scale-[0.99]" : "border-slate-800 hover:border-slate-700"}`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <div className="flex items-center gap-4 px-5 py-4">
            <div
              className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 transition-all ${isDragging ? "bg-cyan-500/15 border-cyan-500/30 scale-110" : "bg-slate-900 border-slate-800"}`}
            >
              <i
                className={`fa-solid fa-cloud-arrow-up text-lg transition-colors ${isDragging ? "text-cyan-400" : "text-slate-600"}`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-white">
                {isDragging ? "Thả file vào đây ↓" : "Kéo thả hoặc chọn CV"}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                PDF, DOCX, PNG, JPG · Tối đa {MAX} file
              </p>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {!showUpload ? (
                <button
                  onClick={() => setShowUpload(true)}
                  className="h-8 px-4 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-500 text-white text-[12px] font-bold hover:brightness-110 transition-all flex items-center gap-1.5 shadow-lg shadow-cyan-900/20"
                >
                  <i className="fa-solid fa-plus text-xs" /> Thêm CV
                </button>
              ) : (
                <>
                  <label className="h-8 px-3 rounded-lg bg-slate-800/80 border border-slate-700 hover:bg-cyan-500/10 hover:border-cyan-500/30 text-cyan-400 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-all">
                    <i className="fa-solid fa-folder-open text-xs" /> Folder
                    <input
                      type="file"
                      multiple
                      accept={ACCEPTED}
                      className="hidden"
                      onChange={handleFile}
                    />
                  </label>
                  <button
                    onClick={handleDrive}
                    className="h-8 px-3 rounded-lg bg-slate-800/80 border border-slate-700 hover:bg-emerald-500/10 hover:border-emerald-500/30 text-emerald-400 text-[11px] font-bold flex items-center gap-1.5 transition-all"
                  >
                    <i className="fa-brands fa-google-drive text-xs" /> Drive
                  </button>
                  <button
                    onClick={() => setShowUpload(false)}
                    className="w-8 h-8 flex items-center justify-center text-slate-600 hover:text-white bg-slate-800/80 border border-slate-700 rounded-lg transition-all"
                  >
                    <i className="fa-solid fa-xmark text-xs" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── File grid ── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-5 pb-5">
        {cvFiles.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-10">
            <div className="w-14 h-14 rounded-2xl border border-dashed border-slate-800 flex items-center justify-center mb-3">
              <i className="fa-regular fa-folder-open text-2xl text-slate-700" />
            </div>
            <p className="text-[13px] font-semibold text-slate-600">
              Chưa có CV nào
            </p>
            <p className="text-[11px] text-slate-700 mt-1">
              Nhấn "Thêm CV" hoặc kéo thả file vào đây
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                {cvFiles.length} hồ sơ
              </p>
              <button
                onClick={clearFiles}
                className="text-[11px] text-slate-600 hover:text-red-400 transition-colors flex items-center gap-1"
              >
                <i className="fa-solid fa-trash text-xs" /> Xóa tất cả
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
              {cvFiles.map((f: File, i: number) => (
                <div
                  key={`${f.name}-${i}`}
                  className="group flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/25 transition-all"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0 border border-slate-700/60">
                    <i className={`fa-regular ${fileIcon(f.name)} text-sm`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold text-slate-200 truncate">
                      {f.name}
                    </p>
                    <p className="text-[9px] text-slate-600 font-medium">
                      {formatSize(f.size)}
                    </p>
                  </div>
                  <button
                    onClick={() => removeFile(i)}
                    className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-500/15 text-slate-700 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100 flex-shrink-0"
                  >
                    <i className="fa-solid fa-xmark text-xs" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
});

CVUpload.displayName = "CVUpload";
export default CVUpload;
