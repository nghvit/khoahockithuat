import React, { useState } from "react";
import { extractTextFromJdFile } from "../../../services/data/ocrService";
import {
  extractJobPositionFromJD,
  filterAndStructureJD,
  extractHardFiltersFromJD,
  extractJDMetadata,
} from "../../../services/ai/geminiService";
import { googleDriveService } from "../../../services/storage/googleDriveService";
import type { HardFilters, WeightCriteria, JDTemplate } from "../../../types";
import TemplateSelector from "../../ui/TemplateSelector";
import HistorySelector from "../../ui/HistorySelector";
import { JDTemplateService } from "../../../services/storage/jdTemplateService";
import { JDHistoryService } from "../../../services/storage/jdHistoryService";
import AppLayout from "../../layout/AppLayout";

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
  jdText,
  setJdText,
  jobPosition,
  setJobPosition,
  hardFilters,
  setHardFilters,
  onComplete,
  sidebarCollapsed = false,
  companyName,
  setCompanyName,
  salary,
  setSalary,
  requirementsSummary,
  setRequirementsSummary,
  uid,
  setWeights,
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [ocrMessage, setOcrMessage] = useState("");
  const [ocrError, setOcrError] = useState("");
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summarizeError, setSummarizeError] = useState("");
  const [showUploadOptions, setShowUploadOptions] = useState(false);

  const isCompleteEnabled =
    jdText.trim().length > 50 && jobPosition.trim().length > 3;
  const errorMsg = ocrError || summarizeError;

  const getFriendlyError = (error: unknown, ctx: "ocr" | "summarize") => {
    if (error instanceof Error) {
      const m = error.message.toLowerCase();
      if (m.includes("không thể trích xuất đủ nội dung")) return error.message;
      if (m.includes("network") || m.includes("failed to fetch"))
        return "Lỗi kết nối mạng. Vui lòng thử lại.";
      if (m.includes("gemini") || m.includes("api"))
        return "Dịch vụ AI gặp sự cố. Vui lòng thử lại sau.";
    }
    return `Lỗi khi ${ctx === "ocr" ? "quét file" : "tối ưu JD"}. Vui lòng thử lại.`;
  };

  const handleGoogleDriveSelect = async () => {
    try {
      const token = await googleDriveService.authenticate();
      const driveFiles = await googleDriveService.openPicker({
        mimeTypes:
          "application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/png,image/jpeg",
        multiSelect: false,
      });
      if (driveFiles.length > 0) {
        const dFile = driveFiles[0];
        setIsOcrLoading(true);
        setOcrError("");
        setSummarizeError("");
        setJdText("");
        setJobPosition("");
        setOcrMessage(`Đang tải ${dFile.name} từ Drive...`);
        try {
          const blob = await googleDriveService.downloadFile(dFile.id, token);
          await processFile(
            new File([blob], dFile.name, { type: dFile.mimeType }),
          );
        } catch {
          setOcrError("Không thể tải file từ Google Drive.");
          setIsOcrLoading(false);
        }
      }
    } catch (err: any) {
      setOcrError(
        err.message?.includes("Client ID") || err.message?.includes("API Key")
          ? "Chưa cấu hình Google Drive API."
          : "Lỗi khi kết nối Google Drive.",
      );
    }
  };

  const processFile = async (file: File) => {
    try {
      const rawText = await extractTextFromJdFile(file, (msg) =>
        setOcrMessage(msg),
      );
      if (!rawText || rawText.trim().length < 50)
        throw new Error(
          "Không thể trích xuất đủ nội dung từ file. Vui lòng thử file khác.",
        );
      setOcrMessage("Đang cấu trúc JD...");
      const structuredJd = await filterAndStructureJD(rawText);
      setJdText(structuredJd);
      const pos = await extractJobPositionFromJD(structuredJd);
      let msg = "";
      if (pos) {
        setJobPosition(pos);
        msg = `✔ Chức danh: ${pos}`;
      }
      const meta = await extractJDMetadata(structuredJd);
      if (meta.companyName) setCompanyName(meta.companyName);
      if (meta.salary) setSalary(meta.salary);
      if (meta.requirementsSummary)
        setRequirementsSummary(meta.requirementsSummary);
      const filters = await extractHardFiltersFromJD(structuredJd);
      if (filters && Object.keys(filters).length > 0) {
        const mandatory: any = {};
        if (filters.location) mandatory.locationMandatory = true;
        if (filters.minExp) mandatory.minExpMandatory = true;
        if (filters.seniority) mandatory.seniorityMandatory = true;
        if (filters.education) mandatory.educationMandatory = true;
        if (filters.language) mandatory.languageMandatory = true;
        if (filters.certificates) mandatory.certificatesMandatory = true;
        if (filters.workFormat) mandatory.workFormatMandatory = true;
        if (filters.contractType) mandatory.contractTypeMandatory = true;
        setHardFilters((prev) => ({ ...prev, ...filters, ...mandatory }));
        const labelMap: any = {
          location: "Địa điểm",
          minExp: "K.nghiệm",
          seniority: "Cấp bậc",
          education: "Học vấn",
          language: "Ngôn ngữ",
          certificates: "Chứng chỉ",
          workFormat: "Hình thức",
          contractType: "Hợp đồng",
        };
        const info = Object.entries(filters)
          .filter(([, v]) => v && v !== "")
          .map(([k, v]) =>
            labelMap[k] ? `${labelMap[k]}: ${v}` : `${k}: ${v}`,
          )
          .join(" · ");
        if (info)
          msg += ` | 🎯 ${Object.keys(mandatory).length} tiêu chí: ${info}`;
      }
      if (msg) {
        setOcrMessage(msg);
        setTimeout(() => setOcrMessage(""), 7000);
      } else {
        setOcrMessage("⚠ Vui lòng nhập chức danh thủ công");
        setTimeout(() => setOcrMessage(""), 3000);
      }
    } catch (error) {
      setOcrError(getFriendlyError(error, "ocr"));
      setJdText("");
    } finally {
      setIsOcrLoading(false);
      setOcrMessage("");
    }
  };

  const handleOcrFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsOcrLoading(true);
    setOcrError("");
    setSummarizeError("");
    setJdText("");
    setJobPosition("");
    setOcrMessage("Bắt đầu xử lý...");
    await processFile(file);
  };

  const handleSummarize = async () => {
    if (jdText.trim().length < 200) {
      setSummarizeError("JD quá ngắn để tóm tắt.");
      return;
    }
    setIsSummarizing(true);
    setSummarizeError("");
    setOcrError("");
    try {
      const structured = await filterAndStructureJD(jdText);
      setJdText(structured);
      const pos = await extractJobPositionFromJD(structured);
      if (pos) setJobPosition(pos);
      const meta = await extractJDMetadata(structured);
      if (meta.companyName) setCompanyName(meta.companyName);
      if (meta.salary) setSalary(meta.salary);
      if (meta.requirementsSummary)
        setRequirementsSummary(meta.requirementsSummary);
      const filters = await extractHardFiltersFromJD(structured);
      if (filters && Object.keys(filters).length > 0) {
        const mandatory: any = {};
        if (filters.location) mandatory.locationMandatory = true;
        if (filters.minExp) mandatory.minExpMandatory = true;
        if (filters.seniority) mandatory.seniorityMandatory = true;
        if (filters.education) mandatory.educationMandatory = true;
        if (filters.language) mandatory.languageMandatory = true;
        if (filters.certificates) mandatory.certificatesMandatory = true;
        if (filters.workFormat) mandatory.workFormatMandatory = true;
        if (filters.contractType) mandatory.contractTypeMandatory = true;
        setHardFilters((prev) => ({ ...prev, ...filters, ...mandatory }));
      }
    } catch (error) {
      setSummarizeError(getFriendlyError(error, "summarize"));
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
    setTimeout(() => setOcrMessage(""), 3000);
  };

  const handleSaveTemplate = async () => {
    if (!uid) {
      setOcrError("Bạn cần đăng nhập để lưu mẫu.");
      return;
    }
    if (jdText.length < 50 || jobPosition.length < 3) {
      setOcrError("Nhập đầy đủ JD và chức danh trước khi lưu.");
      return;
    }
    const name = prompt("Tên mẫu:", `Mẫu ${jobPosition}`);
    if (!name) return;
    setIsSaving(true);
    setSaveMessage("Đang lưu...");
    try {
      await JDTemplateService.saveTemplate({
        uid,
        name,
        jdText,
        jobPosition,
        hardFilters,
      });
      setSaveMessage("✔ Đã lưu!");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch {
      setOcrError("Lỗi khi lưu mẫu.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleComplete = async () => {
    if (uid && jdText.length >= 50 && jobPosition.length >= 3) {
      try {
        await JDHistoryService.saveHistory({
          uid,
          jobPosition,
          jdText,
          hardFilters,
        });
      } catch {}
    }
    onComplete();
  };

  // ── Shared input field classes ──────────────────────────────────────────
  const inputCls =
    "w-full h-9 bg-slate-900 border border-slate-800 rounded-lg px-3 text-[12px] text-slate-300 placeholder-slate-600 outline-none focus:border-violet-500/40 transition-all";

  return (
    <AppLayout
      reversePanels
      mainNoScroll
      sidebarCollapsed={sidebarCollapsed}
      headerRight={
        <>
          {saveMessage && (
            <span className="text-[10px] font-semibold text-emerald-400 hidden sm:block px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
              {saveMessage}
            </span>
          )}
          <HistorySelector uid={uid} onSelect={handleSelectTemplate} />
          <TemplateSelector uid={uid} onSelect={handleSelectTemplate} />
          <div className="w-px h-5 bg-slate-700" />
          <button
            onClick={handleSaveTemplate}
            disabled={isSaving || jdText.length < 50}
            className="h-7 px-3 rounded-lg bg-slate-800/60 border border-slate-700 text-[11px] font-semibold text-slate-400 hover:text-emerald-300 hover:border-emerald-500/40 transition-all disabled:opacity-30 flex items-center gap-1.5"
          >
            <i
              className={`fa-solid ${isSaving ? "fa-spinner fa-spin" : "fa-floppy-disk"} text-xs`}
            />
            <span className="hidden sm:inline">Lưu mẫu</span>
          </button>
        </>
      }
      leftPanel={
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 flex flex-col gap-3">
          {/* Job info card */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-3 space-y-3">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-briefcase text-violet-400 text-[11px]" />
              <p className="text-[11px] font-bold text-white">
                Thông tin vị trí
              </p>
            </div>
            <div className="space-y-2">
              <div>
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1 block">
                  Chức danh{" "}
                  <span className="text-violet-400 normal-case font-bold tracking-normal">
                    *
                  </span>
                </label>
                <div className="relative">
                  <i className="fa-solid fa-briefcase absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 text-xs" />
                  <input
                    type="text"
                    value={jobPosition}
                    onChange={(e) => setJobPosition(e.target.value)}
                    className={`${inputCls} pl-8 pr-6 font-semibold text-white`}
                    placeholder="VD: Senior Frontend Dev"
                    maxLength={100}
                  />
                  {jobPosition.trim().length > 3 && (
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  )}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1 block">
                  Công ty
                </label>
                <div className="relative">
                  <i className="fa-solid fa-building absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 text-xs" />
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Tên công ty"
                    className={`${inputCls} pl-8`}
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1 block">
                  Mức lương
                </label>
                <div className="relative">
                  <i className="fa-solid fa-money-bill-wave absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 text-xs" />
                  <input
                    type="text"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    placeholder="VD: 2.000 – 4.000 USD"
                    className={`${inputCls} pl-8`}
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1 block">
                  Yêu cầu chính
                </label>
                <textarea
                  value={requirementsSummary}
                  onChange={(e) => setRequirementsSummary(e.target.value)}
                  placeholder="Tóm tắt yêu cầu chính..."
                  rows={3}
                  className="w-full bg-slate-800/60 border border-slate-700/60 rounded-lg px-3 py-2 text-[12px] text-slate-300 placeholder-slate-600 outline-none focus:border-violet-500/40 transition-all resize-none leading-relaxed custom-scrollbar"
                />
              </div>
            </div>
          </div>

          {/* Auto filters card — only shown when filters exist */}
          {(hardFilters.location ||
            hardFilters.minExp ||
            hardFilters.seniority) && (
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-3 space-y-2.5">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-filter text-violet-400 text-[11px]" />
                <p className="text-[11px] font-bold text-white">
                  Bộ lọc tự động
                </p>
              </div>
              {hardFilters.location && (
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-lg bg-slate-800 border border-slate-700/60 flex items-center justify-center flex-shrink-0">
                    <i
                      className="fa-solid fa-location-dot text-violet-400"
                      style={{ fontSize: "8px" }}
                    />
                  </div>
                  <span className="text-[11px] text-slate-300">
                    {hardFilters.location}
                  </span>
                </div>
              )}
              {hardFilters.minExp && (
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-lg bg-slate-800 border border-slate-700/60 flex items-center justify-center flex-shrink-0">
                    <i
                      className="fa-solid fa-clock text-violet-400"
                      style={{ fontSize: "8px" }}
                    />
                  </div>
                  <span className="text-[11px] text-slate-300">
                    {hardFilters.minExp}
                  </span>
                </div>
              )}
              {hardFilters.seniority && (
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-lg bg-slate-800 border border-slate-700/60 flex items-center justify-center flex-shrink-0">
                    <i
                      className="fa-solid fa-layer-group text-violet-400"
                      style={{ fontSize: "8px" }}
                    />
                  </div>
                  <span className="text-[11px] text-slate-300">
                    {hardFilters.seniority}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Status card */}
          <div
            className={`rounded-xl border p-3 space-y-2 ${isCompleteEnabled ? "bg-emerald-500/8 border-emerald-500/20" : "bg-slate-900 border-slate-800"}`}
          >
            <div className="flex items-center gap-2">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 border ${isCompleteEnabled ? "bg-emerald-500/15 border-emerald-500/30" : "bg-slate-800 border-slate-700"}`}
              >
                <i
                  className={`fa-solid ${isCompleteEnabled ? "fa-check text-emerald-400" : "fa-xmark text-slate-600"}`}
                  style={{ fontSize: "8px" }}
                />
              </div>
              <span
                className={`text-[11px] font-bold ${isCompleteEnabled ? "text-emerald-400" : "text-slate-500"}`}
              >
                {isCompleteEnabled ? "Sẵn sàng" : "Chưa đầy đủ"}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed pl-7">
              {isCompleteEnabled
                ? "Đã có chức danh và JD. Nhấn Tiếp theo để tiếp tục."
                : "Cần nhập chức danh (>3 ký tự) và JD (>50 ký tự)."}
            </p>
          </div>

          {/* Info hint */}
          <div className="flex gap-2 p-3 rounded-xl border border-slate-800/60 bg-slate-900/40">
            <i className="fa-solid fa-circle-info text-slate-600 text-[10px] mt-0.5 flex-shrink-0" />
            <p className="text-[10px] text-slate-500 leading-relaxed">
              AI sẽ tự động điền thông tin từ JD khi bạn tải file lên.
            </p>
          </div>
        </div>
      }
      bottomBar={
        <div className="space-y-2">
          <div className="relative">
            <i className="fa-solid fa-briefcase absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 text-xs" />
            <input
              type="text"
              value={jobPosition}
              onChange={(e) => setJobPosition(e.target.value)}
              className={`${inputCls} pl-8 font-semibold text-white`}
              placeholder="Chức danh tuyển dụng *"
            />
          </div>
          {errorMsg && (
            <div className="flex items-start gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg">
              <i className="fa-solid fa-triangle-exclamation text-red-400 text-xs mt-0.5 flex-shrink-0" />
              <p className="text-red-300 text-[11px]">{errorMsg}</p>
            </div>
          )}
          <div className="flex gap-2">
            <button
              onClick={handleSummarize}
              disabled={
                isOcrLoading || isSummarizing || jdText.trim().length < 200
              }
              className="h-8 px-3 flex items-center gap-1.5 text-[11px] font-semibold text-violet-300 bg-violet-600/10 border border-violet-500/20 rounded-lg disabled:opacity-40"
            >
              <i className="fa-solid fa-wand-magic-sparkles text-xs" />
              {isSummarizing ? "Đang tối ưu..." : "AI Optimize"}
            </button>
            <button
              onClick={handleComplete}
              disabled={!isCompleteEnabled}
              className="flex-1 h-8 flex items-center justify-center gap-1.5 text-[12px] font-bold text-white bg-violet-500 rounded-lg hover:brightness-110 transition-all disabled:grayscale disabled:opacity-40"
            >
              Tiếp theo <i className="fa-solid fa-arrow-right text-xs" />
            </button>
          </div>
        </div>
      }
    >
      {/* ── Editor toolbar ── */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-2.5 border-b border-white/5 bg-slate-900/40">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
            Nội dung JD
          </span>
          {jdText.length > 0 && (
            <span className="text-[10px] text-slate-600 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60">
              {jdText.length} ký tự
            </span>
          )}
        </div>
        <div>
          {isOcrLoading ? (
            <div className="flex items-center gap-1.5 text-[11px] text-violet-400 font-semibold">
              <i className="fa-solid fa-spinner fa-spin text-xs" />
              {ocrMessage || "Đang xử lý..."}
            </div>
          ) : !showUploadOptions ? (
            <button
              onClick={() => setShowUploadOptions(true)}
              disabled={isSummarizing}
              className="h-7 px-3 flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 bg-slate-800/80 border border-slate-700 rounded-lg hover:bg-slate-700 hover:text-white transition-all disabled:opacity-50"
            >
              <i className="fa-solid fa-cloud-arrow-up text-violet-400 text-xs" />{" "}
              Tải file JD
            </button>
          ) : (
            <div className="flex items-center gap-1">
              <label className="h-7 px-3 flex items-center gap-1.5 bg-slate-800/80 border border-slate-700 rounded-lg cursor-pointer hover:bg-violet-500/10 hover:text-violet-400 text-slate-400 text-[11px] font-semibold transition-all">
                <i className="fa-solid fa-folder-open text-xs" /> Chọn file
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.docx,.png,.jpg,.jpeg"
                  onChange={handleOcrFileChange}
                />
              </label>
              <button
                onClick={handleGoogleDriveSelect}
                title="Google Drive"
                className="h-7 px-2 flex items-center bg-slate-800/80 border border-slate-700 rounded-lg hover:bg-emerald-500/10 hover:text-emerald-400 text-slate-400 transition-all"
              >
                <i className="fa-brands fa-google-drive text-xs" />
              </button>
              <button
                onClick={() => setShowUploadOptions(false)}
                className="h-7 px-2 flex items-center bg-slate-800/80 border border-slate-700 rounded-lg text-slate-600 hover:text-white transition-all"
              >
                <i className="fa-solid fa-xmark text-xs" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Textarea ── */}
      <textarea
        id="job-description"
        className="flex-1 min-h-0 w-full p-4 bg-slate-950 text-[13px] text-slate-300 placeholder-slate-600 outline-none resize-none leading-relaxed overflow-y-auto custom-scrollbar font-mono"
        placeholder={
          'Dán nội dung Job Description tại đây...\n\nHoặc nhấn "Tải file JD" để AI tự động phân tích.\n\nSupport: PDF, DOCX, ảnh (PNG, JPG)'
        }
        value={jdText}
        onChange={(e) => setJdText(e.target.value)}
      />

      {/* ── Desktop bottom bar ── */}
      <div className="hidden md:flex flex-col flex-shrink-0 border-t border-white/5 bg-slate-900/40 px-4 py-3 gap-2">
        {errorMsg && (
          <div className="flex items-start gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg">
            <i className="fa-solid fa-triangle-exclamation text-red-400 text-xs mt-0.5 flex-shrink-0" />
            <p className="text-red-300 text-[11px] leading-relaxed">
              {errorMsg}
            </p>
          </div>
        )}
        {ocrMessage && !isOcrLoading && (
          <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/8 border border-emerald-500/15 rounded-lg">
            <i className="fa-solid fa-circle-check text-emerald-400 text-xs flex-shrink-0" />
            <p className="text-emerald-300 text-[11px] truncate">
              {ocrMessage}
            </p>
          </div>
        )}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1 text-[10px] text-slate-600">
            <i className="fa-solid fa-circle-info" />
            <span>Hỗ trợ PDF, DOCX, PNG, JPG</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSummarize}
              disabled={
                isOcrLoading || isSummarizing || jdText.trim().length < 200
              }
              className="h-8 px-3 flex items-center gap-1.5 text-[11px] font-semibold text-violet-300 bg-violet-600/10 border border-violet-500/20 rounded-lg hover:bg-violet-600/20 transition-all disabled:opacity-40"
            >
              <i className="fa-solid fa-wand-magic-sparkles text-xs" />
              {isSummarizing ? "Đang tối ưu..." : "AI Optimize"}
            </button>
            <button
              onClick={handleComplete}
              disabled={!isCompleteEnabled}
              className="h-8 px-5 flex items-center gap-1.5 text-[12px] font-bold text-white bg-violet-500 rounded-lg hover:brightness-110 transition-all disabled:grayscale disabled:opacity-40 shadow-lg shadow-violet-500/20"
            >
              Tiếp theo <i className="fa-solid fa-arrow-right text-xs" />
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default JDInput;
