import React, { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import debounce from "lodash.debounce";
import type { Candidate, AppStep } from "../../../types";
import ExpandedContent from "../ExpandedContent";
import ChatbotPanel from "../ChatbotPanel";
import InterviewQuestionGenerator from "../InterviewQuestionGenerator";
import ProgressBar from "../../ui/ProgressBar";
import Loader from "../../ui/Loader";

interface AnalysisResultsProps {
  isLoading: boolean;
  loadingMessage: string;
  results: Candidate[];
  jobPosition: string;
  locationRequirement: string;
  jdText: string;
  setActiveStep?: (step: AppStep) => void;
  markStepAsCompleted?: (step: AppStep) => void;
  activeStep?: AppStep;
  completedSteps?: AppStep[];
  sidebarCollapsed?: boolean;
}

type RankedCandidate = Candidate & { rank: number; jdFit: number };

const GRADE_STYLE: Record<string, { badge: string; bar: string; dot: string }> =
  {
    A: {
      badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
      bar: "from-emerald-500 to-teal-400",
      dot: "bg-emerald-400",
    },
    B: {
      badge: "bg-blue-500/15    text-blue-400    border-blue-500/30",
      bar: "from-blue-500 to-indigo-400",
      dot: "bg-blue-400",
    },
    C: {
      badge: "bg-amber-500/15   text-amber-400   border-amber-500/30",
      bar: "from-amber-500 to-orange-400",
      dot: "bg-amber-400",
    },
    FAILED: {
      badge: "bg-red-500/15     text-red-400     border-red-500/30",
      bar: "from-red-500 to-rose-400",
      dot: "bg-red-400",
    },
  };

const getGrade = (c: Candidate) =>
  c.status === "FAILED" ? "FAILED" : c.analysis?.["Hạng"] || "C";
const getScore = (c: Candidate) =>
  c.status === "FAILED" ? 0 : c.analysis?.["Tổng điểm"] || 0;
const getJdFit = (c: Candidate) =>
  c.status === "FAILED"
    ? 0
    : parseInt(
        c.analysis?.["Chi tiết"]
          ?.find((i) => i["Tiêu chí"]?.startsWith("Phù hợp JD"))
          ?.["Điểm"]?.split("/")[0] || "0",
        10,
      );

const AnalysisResults: React.FC<AnalysisResultsProps> = ({
  isLoading,
  loadingMessage,
  results,
  jobPosition,
  locationRequirement,
  jdText,
  setActiveStep,
  markStepAsCompleted,
  activeStep = "analysis",
  completedSteps = [],
  sidebarCollapsed = false,
}) => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"score" | "jdFit">("score");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [detailCandidate, setDetailCandidate] =
    useState<RankedCandidate | null>(null);
  const [detailPage, setDetailPage] = useState(1);
  const [expandedCriteria, setExpandedCriteria] = useState<
    Record<string, Record<string, boolean>>
  >({});
  const [showChatbot, setShowChatbot] = useState(false);
  const [showInterviewQ, setShowInterviewQ] = useState(false);

  const sidebarW = sidebarCollapsed ? "md:left-[72px]" : "md:left-64";

  const debouncedSetSearch = useCallback(
    debounce((v: string) => setDebouncedSearch(v), 300),
    [],
  );
  const handleSearch = (v: string) => {
    setSearchTerm(v);
    debouncedSetSearch(v);
  };

  const summary = useMemo(() => {
    if (!results?.length)
      return { total: 0, A: 0, B: 0, C: 0, FAILED: 0, avgScore: 0 };
    const ok = results.filter((c) => c.status === "SUCCESS" && c.analysis);
    const scores = ok.map(getScore).filter(Boolean);
    return {
      total: results.length,
      A: ok.filter((c) => c.analysis?.["Hạng"] === "A").length,
      B: ok.filter((c) => c.analysis?.["Hạng"] === "B").length,
      C: ok.filter((c) => c.analysis?.["Hạng"] === "C").length,
      FAILED: results.filter((c) => c.status === "FAILED").length,
      avgScore: scores.length
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0,
    };
  }, [results]);

  const ranked = useMemo((): RankedCandidate[] => {
    if (!results?.length) return [];
    return results
      .map((c) => ({
        ...c,
        id: c.id || `c-${Math.random()}`,
        jdFit: getJdFit(c),
      }))
      .sort((a, b) => {
        const va = sortBy === "score" ? getScore(a) : a.jdFit;
        const vb = sortBy === "score" ? getScore(b) : b.jdFit;
        return vb - va;
      })
      .map((c, i) => ({ ...c, rank: i + 1 }));
  }, [results, sortBy]);

  const filtered = useMemo(
    () =>
      ranked.filter((c) => {
        const matchSearch =
          !debouncedSearch ||
          c.candidateName
            ?.toLowerCase()
            .includes(debouncedSearch.toLowerCase());
        const matchFilter =
          filter === "all" ||
          (c.status === "FAILED"
            ? filter === "FAILED"
            : c.analysis?.["Hạng"] === filter);
        return matchSearch && matchFilter;
      }),
    [ranked, debouncedSearch, filter],
  );

  const analysisData = useMemo(
    () =>
      results?.length
        ? {
            timestamp: Date.now(),
            job: {
              position: jobPosition,
              locationRequirement: locationRequirement || "N/A",
            },
            candidates: results,
          }
        : null,
    [results, jobPosition, locationRequirement],
  );

  const toggleSelect = (id: string) =>
    setSelectedIds((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  const toggleAll = () =>
    selectedIds.size === filtered.length
      ? setSelectedIds(new Set())
      : setSelectedIds(new Set(filtered.map((c) => c.id)));

  const exportCSV = () => {
    const rows = filtered
      .filter((c) => selectedIds.has(c.id))
      .map((c, i) =>
        [
          i + 1,
          c.candidateName || "",
          getGrade(c),
          getScore(c),
          c.jdFit,
          c.jobTitle || "",
          c.fileName || "",
        ]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(","),
      );
    const blob = new Blob(
      [
        "\uFEFF" +
          ["STT,HoTen,Hang,DiemTong,JDFit,ChucDanh,File", ...rows].join("\n"),
      ],
      { type: "text/csv;charset=utf-8;" },
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `candidates_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  if (isLoading)
    return (
      <section className="w-full h-screen bg-background flex items-center justify-center">
        <Loader message={loadingMessage} />
      </section>
    );
  if (!results?.length)
    return (
      <section className="w-full h-screen bg-background flex flex-col items-center justify-center text-center p-6">
        <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center mb-4 text-slate-600">
          <i className="fa-solid fa-chart-line text-2xl" />
        </div>
        <h3 className="text-base font-bold text-white mb-1">
          Sẵn sàng phân tích
        </h3>
        <p className="text-[12px] text-slate-500 max-w-xs">
          Kết quả sẽ hiển thị sau khi bạn tải CV và cung cấp JD.
        </p>
      </section>
    );

  return (
    <section
      id="module-analysis"
      className="w-full h-screen flex flex-col bg-background"
    >
      {/* ═══ HEADER ═══ */}
      <div
        className={`fixed top-14 md:top-0 left-0 right-0 z-30 ${sidebarW} transition-all duration-300`}
      >
        <div className="bg-background/95 backdrop-blur-sm border-b border-white/5">
          <div className="h-14 flex items-center px-5 gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
              <i className="fa-solid fa-chart-bar text-white text-xs" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate leading-none">
                {jobPosition || "Kết quả phân tích"}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-slate-500">Bước 4/4</span>
                <span className="text-[10px] font-bold text-emerald-400">
                  {summary.A}A
                </span>
                <span className="text-[10px] font-bold text-blue-400">
                  {summary.B}B
                </span>
                <span className="text-[10px] font-bold text-amber-400">
                  {summary.C}C
                </span>
                {summary.FAILED > 0 && (
                  <span className="text-[10px] font-bold text-red-400">
                    {summary.FAILED}✗
                  </span>
                )}
              </div>
            </div>
            {selectedIds.size > 0 ? (
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-[10px] text-slate-400 hidden sm:block">
                  {selectedIds.size} đã chọn
                </span>
                <button
                  onClick={exportCSV}
                  className="h-7 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold rounded-lg transition-all flex items-center gap-1.5"
                >
                  <i className="fa-solid fa-download text-xs" /> Xuất CSV
                </button>
                <button
                  onClick={() => setSelectedIds(new Set())}
                  className="h-7 px-2 bg-slate-800 text-slate-400 text-[10px] font-bold rounded-lg border border-slate-700 transition-all"
                >
                  Bỏ chọn
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={() => setShowInterviewQ(true)}
                  className="h-7 px-3 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold rounded-lg transition-all flex items-center gap-1.5"
                >
                  <i className="fa-solid fa-microphone-lines text-xs" />
                  <span className="hidden sm:inline">Câu hỏi PV</span>
                </button>
                <button
                  onClick={() => {
                    setActiveStep?.("dashboard");
                    markStepAsCompleted?.("analysis");
                    navigate("/detailed-analytics");
                  }}
                  className="h-7 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold rounded-lg border border-slate-700 transition-all flex items-center gap-1.5"
                >
                  <i className="fa-solid fa-chart-line text-xs" />
                  <span className="hidden sm:inline">Thống kê</span>
                </button>
              </div>
            )}
          </div>
          <div className="px-5 pb-2">
            <ProgressBar
              activeStep={activeStep}
              completedSteps={completedSteps}
            />
          </div>
        </div>
      </div>

      {/* ═══ BODY — 2 COLUMN ═══ */}
      <div className="flex-1 flex min-h-0 pt-[calc(56px+40px)] md:pt-[calc(56px+40px)] overflow-hidden">
        {/* LEFT: Table */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Filter bar */}
          <div className="px-5 py-3 border-b border-white/5 flex-shrink-0 flex flex-col sm:flex-row gap-2 items-start sm:items-center bg-background">
            <div className="relative flex-shrink-0">
              <i className="fa-solid fa-magnifying-glass text-slate-600 absolute left-3 top-1/2 -translate-y-1/2 text-xs" />
              <input
                type="text"
                placeholder="Tìm ứng viên..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="h-8 w-52 bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 text-[12px] text-white placeholder-slate-600 focus:border-indigo-500/30 outline-none transition-all"
              />
            </div>
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar flex-1">
              {[
                ["all", "Tất cả"],
                ["A", "★ A"],
                ["B", "★ B"],
                ["C", "★ C"],
                ["FAILED", "Lỗi"],
              ].map(([v, l]) => (
                <button
                  key={v}
                  onClick={() => setFilter(v)}
                  className={`h-7 px-3 rounded-lg text-[11px] font-semibold transition-all border whitespace-nowrap flex-shrink-0 ${filter === v ? "bg-indigo-500/15 border-indigo-500/30 text-indigo-400" : "bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300"}`}
                >
                  {l}
                </button>
              ))}
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "score" | "jdFit")}
              className="h-8 bg-slate-900 border border-slate-800 text-slate-400 text-[11px] rounded-lg px-2.5 outline-none cursor-pointer flex-shrink-0"
            >
              <option value="score">Điểm ↓</option>
              <option value="jdFit">JD Fit ↓</option>
            </select>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-card/80 border-b border-white/5 z-10">
                <tr className="text-slate-600 text-[10px] uppercase tracking-wider font-bold">
                  <th className="px-4 py-3 w-8">
                    <input
                      type="checkbox"
                      checked={
                        filtered.length > 0 &&
                        selectedIds.size === filtered.length
                      }
                      onChange={toggleAll}
                      className="rounded border-slate-700 bg-slate-900 text-indigo-500 w-3.5 h-3.5 cursor-pointer"
                    />
                  </th>
                  <th className="px-2 py-3 w-8">#</th>
                  <th className="px-3 py-3">Họ tên</th>
                  <th className="px-3 py-3">Hạng</th>
                  <th className="px-3 py-3">Điểm</th>
                  <th className="px-3 py-3 w-36">JD Fit</th>
                  <th className="px-3 py-3 hidden md:table-cell">File</th>
                  <th className="px-3 py-3 w-8" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filtered.map((c) => {
                  const grade = getGrade(c);
                  const score = getScore(c);
                  const gs = GRADE_STYLE[grade] || GRADE_STYLE.C;
                  return (
                    <tr
                      key={c.id}
                      onClick={() => {
                        setDetailCandidate(c);
                        setDetailPage(1);
                      }}
                      className="hover:bg-slate-800/30 transition-colors cursor-pointer group"
                    >
                      <td
                        className="px-4 py-3"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelect(c.id);
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedIds.has(c.id)}
                          onChange={() => toggleSelect(c.id)}
                          className="rounded border-slate-700 bg-slate-900 text-indigo-500 w-3.5 h-3.5 cursor-pointer"
                        />
                      </td>
                      <td className="px-2 py-3 text-[11px] text-slate-600 font-mono">
                        {c.rank}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${gs.dot}`}
                          />
                          <span className="text-[12px] font-semibold text-slate-200">
                            {c.candidateName || "Chưa xác định"}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${gs.badge}`}
                        >
                          {grade}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-[13px] font-bold text-white tabular-nums">
                        {score}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-300 tabular-nums w-9 text-right">
                            {c.jdFit}%
                          </span>
                          <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden min-w-0 hidden sm:block">
                            <div
                              className={`h-full bg-gradient-to-r ${gs.bar} rounded-full`}
                              style={{ width: `${c.jdFit}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-[10px] text-slate-600 truncate max-w-[120px] font-mono hidden md:table-cell">
                        {c.fileName}
                      </td>
                      <td className="px-3 py-3">
                        <i className="fa-solid fa-chevron-right text-indigo-500 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-12 text-center text-slate-600 text-[12px]"
                    >
                      Không tìm thấy ứng viên phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT: Stats sidebar */}
        <div className="w-52 flex-shrink-0 border-l border-white/5 flex flex-col bg-card/80 overflow-y-auto custom-scrollbar hidden lg:flex">
          <div className="p-4 space-y-4">
            {/* Summary stats */}
            <div>
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3">
                Tổng quan
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Tổng CV", val: summary.total, color: "text-white" },
                  {
                    label: "TB điểm",
                    val: summary.avgScore,
                    color: "text-white",
                  },
                  {
                    label: "Hạng A",
                    val: summary.A,
                    color: "text-emerald-400",
                  },
                  { label: "Hạng B", val: summary.B, color: "text-blue-400" },
                  { label: "Hạng C", val: summary.C, color: "text-amber-400" },
                  { label: "Lỗi", val: summary.FAILED, color: "text-red-400" },
                ].map(({ label, val, color }) => (
                  <div
                    key={label}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center"
                  >
                    <div className={`text-lg font-black tabular-nums ${color}`}>
                      {val}
                    </div>
                    <div className="text-[9px] text-slate-600 font-medium uppercase tracking-wide mt-0.5">
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Grade distribution bar */}
            {summary.total > 0 && (
              <div>
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2">
                  Phân phối
                </p>
                <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
                  {summary.A > 0 && (
                    <div
                      className="bg-emerald-500"
                      style={{ flex: summary.A }}
                    />
                  )}
                  {summary.B > 0 && (
                    <div className="bg-blue-500" style={{ flex: summary.B }} />
                  )}
                  {summary.C > 0 && (
                    <div className="bg-amber-500" style={{ flex: summary.C }} />
                  )}
                  {summary.FAILED > 0 && (
                    <div
                      className="bg-red-500"
                      style={{ flex: summary.FAILED }}
                    />
                  )}
                </div>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {[
                    ["A", "bg-emerald-500"],
                    ["B", "bg-blue-500"],
                    ["C", "bg-amber-500"],
                    ["✗", "bg-red-500"],
                  ].map(([l, cl]) => (
                    <div key={l} className="flex items-center gap-1">
                      <span className={`w-2 h-2 rounded-full ${cl}`} />
                      <span className="text-[9px] text-slate-600">{l}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Selected count */}
            {selectedIds.size > 0 && (
              <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/8 p-3">
                <p className="text-[11px] font-bold text-indigo-400">
                  {selectedIds.size} đã chọn
                </p>
                <button
                  onClick={exportCSV}
                  className="mt-2 w-full h-7 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <i className="fa-solid fa-download text-xs" /> Xuất CSV
                </button>
              </div>
            )}
          </div>

          {/* AI Chatbot toggle */}
          {analysisData && (
            <div className="mt-auto p-4 border-t border-white/5">
              <button
                onClick={() => setShowChatbot(!showChatbot)}
                className={`w-full h-9 rounded-xl font-bold text-[11px] transition-all flex items-center justify-center gap-2 ${showChatbot ? "bg-slate-800 border border-slate-700 text-slate-300" : "bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:brightness-110"}`}
              >
                <i
                  className={`fa-solid ${showChatbot ? "fa-xmark" : "fa-robot"} text-xs`}
                />
                {showChatbot ? "Đóng AI" : "AI Chat"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ═══ DETAIL MODAL ═══ */}
      {detailCandidate && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
          <div
            className="absolute inset-0 bg-background/85 backdrop-blur-md"
            onClick={() => setDetailCandidate(null)}
          />
          <div className="relative w-full max-w-4xl h-[88vh] bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            {/* Modal header */}
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-800 flex-shrink-0">
              <div
                className={`w-2 h-8 rounded-full ${GRADE_STYLE[getGrade(detailCandidate)]?.dot || "bg-slate-500"}`}
              />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-white leading-none">
                  {detailCandidate.candidateName}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border ${GRADE_STYLE[getGrade(detailCandidate)]?.badge}`}
                  >
                    {getGrade(detailCandidate)}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {getScore(detailCandidate)} điểm · JD Fit{" "}
                    {detailCandidate.jdFit}%
                  </span>
                </div>
              </div>
              <button
                onClick={() => setDetailCandidate(null)}
                className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-all flex items-center justify-center flex-shrink-0"
              >
                <i className="fa-solid fa-xmark text-xs" />
              </button>
            </div>
            {/* Modal body */}
            <div className="flex-1 relative overflow-hidden">
              <div
                className={`absolute inset-0 p-5 overflow-y-auto custom-scrollbar transition-all duration-300 ${detailPage === 1 ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0 pointer-events-none"}`}
              >
                <ExpandedContent
                  candidate={detailCandidate}
                  expandedCriteria={expandedCriteria}
                  onToggleCriterion={(id, c) =>
                    setExpandedCriteria((p) => ({
                      ...p,
                      [id]: { ...p[id], [c]: !p[id]?.[c] },
                    }))
                  }
                  jdText={jdText}
                  viewMode="summary"
                />
              </div>
              <div
                className={`absolute inset-0 p-5 overflow-y-auto custom-scrollbar transition-all duration-300 ${detailPage === 2 ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none"}`}
              >
                <ExpandedContent
                  candidate={detailCandidate}
                  expandedCriteria={expandedCriteria}
                  onToggleCriterion={(id, c) =>
                    setExpandedCriteria((p) => ({
                      ...p,
                      [id]: { ...p[id], [c]: !p[id]?.[c] },
                    }))
                  }
                  jdText={jdText}
                  viewMode="details"
                />
              </div>
            </div>
            {/* Modal footer */}
            <div className="px-5 py-3 border-t border-slate-800 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${detailPage === 1 ? "w-5 bg-indigo-500" : "w-1.5 bg-slate-700"}`}
                />
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${detailPage === 2 ? "w-5 bg-indigo-500" : "w-1.5 bg-slate-700"}`}
                />
              </div>
              <div className="flex gap-2">
                {detailPage === 2 && (
                  <button
                    onClick={() => setDetailPage(1)}
                    className="h-8 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-[11px] font-bold transition-all flex items-center gap-1.5"
                  >
                    <i className="fa-solid fa-arrow-left text-xs" /> Tóm tắt
                  </button>
                )}
                {detailPage === 1 ? (
                  <button
                    onClick={() => setDetailPage(2)}
                    className="h-8 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold transition-all flex items-center gap-1.5"
                  >
                    Chi tiết <i className="fa-solid fa-arrow-right text-xs" />
                  </button>
                ) : (
                  <button
                    onClick={() => setDetailCandidate(null)}
                    className="h-8 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition-all flex items-center gap-1.5"
                  >
                    Xong <i className="fa-solid fa-check text-xs" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chatbot panel */}
      {showChatbot && analysisData && (
        <div className="fixed bottom-6 right-6 w-80 z-50">
          <ChatbotPanel
            analysisData={analysisData}
            onClose={() => setShowChatbot(false)}
          />
        </div>
      )}

      {/* Mobile chatbot FAB */}
      <div className="lg:hidden">
        {analysisData && (
          <button
            onClick={() => setShowChatbot(!showChatbot)}
            className="fixed bottom-6 right-6 w-11 h-11 bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-full shadow-2xl flex items-center justify-center transition-all z-50 hover:scale-110"
          >
            <i
              className={`fa-solid ${showChatbot ? "fa-xmark" : "fa-robot"} text-sm`}
            />
          </button>
        )}
      </div>

      {/* Interview Q modal */}
      {showInterviewQ && analysisData && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-[70] flex items-center justify-center p-4">
          <div className="w-full max-w-4xl max-h-[88vh] bg-slate-900 rounded-2xl border border-slate-700/60 overflow-hidden shadow-2xl">
            <InterviewQuestionGenerator
              analysisData={analysisData}
              selectedCandidates={Array.from(selectedIds)
                .map((id) => results.find((c) => c.id === id)!)
                .filter(Boolean)}
              onClose={() => setShowInterviewQ(false)}
            />
          </div>
        </div>
      )}
    </section>
  );
};

export default AnalysisResults;
