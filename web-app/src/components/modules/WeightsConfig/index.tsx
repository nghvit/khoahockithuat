import React, { useMemo, useState, useCallback, memo } from "react";
import type {
  HardFilters,
  WeightCriteria,
  MainCriterion,
} from "../../../types";
import HardFilterPanel from "../../ui/HardFilterPanel";
import WeightTile from "../../ui/WeightTile";
import TotalWeightDisplay from "../../ui/TotalWeightDisplay";
import AppLayout from "../../layout/AppLayout";

interface WeightsConfigProps {
  weights: WeightCriteria;
  setWeights: React.Dispatch<React.SetStateAction<WeightCriteria>>;
  hardFilters: HardFilters;
  setHardFilters: React.Dispatch<React.SetStateAction<HardFilters>>;
  onComplete: () => void;
  sidebarCollapsed?: boolean;
}

const WeightsConfig: React.FC<WeightsConfigProps> = memo(
  ({
    weights,
    setWeights,
    hardFilters,
    setHardFilters,
    onComplete,
    sidebarCollapsed = false,
  }) => {
    const [expandedCriterion, setExpandedCriterion] = useState<string | null>(
      null,
    );
    const [errFilters, setErrFilters] = useState<string | null>(null);
    const [errWeights, setErrWeights] = useState<string | null>(null);
    const [step, setStep] = useState<1 | 2>(1);

    // ── Derived values ─────────────────────────────────────────────────────────
    const totalWeight = useMemo(
      () =>
        Object.values(weights).reduce(
          (sum: number, c: MainCriterion) =>
            c.children
              ? sum + c.children.reduce((s, ch) => s + ch.weight, 0)
              : sum + (c.weight || 0),
          0,
        ),
      [weights],
    );
    const remaining = 100 - totalWeight;

    const weightStatus = useMemo(() => {
      if (totalWeight === 100)
        return {
          label: "Đủ 100%",
          tone: "text-emerald-400",
          bg: "bg-emerald-500/10 border-emerald-500/30",
          bar: "bg-emerald-500",
          pct: 100,
          icon: "fa-circle-check",
        };
      if (totalWeight > 100)
        return {
          label: `Thừa ${Math.abs(remaining)}%`,
          tone: "text-red-400",
          bg: "bg-red-500/10 border-red-500/30",
          bar: "bg-red-500",
          pct: 100,
          icon: "fa-circle-exclamation",
        };
      return {
        label: `Còn thiếu ${Math.abs(remaining)}%`,
        tone: "text-amber-400",
        bg: "bg-amber-500/10 border-amber-500/30",
        bar: "bg-indigo-500",
        pct: Math.min(totalWeight, 100),
        icon: "fa-circle-half-stroke",
      };
    }, [remaining, totalWeight]);

    const primaryCriteria = useMemo(
      () =>
        Object.values(weights).filter(
          (c: MainCriterion) => c.children,
        ) as MainCriterion[],
      [weights],
    );

    const mandatoryProgress = useMemo(() => {
      const keys = Object.keys(hardFilters).filter((k) =>
        k.endsWith("Mandatory"),
      ) as Array<keyof HardFilters>;
      const active = keys.filter((k) => hardFilters[k]).length;
      const fulfilled = keys.filter((k) => {
        if (!hardFilters[k]) return false;
        const vk = k.replace("Mandatory", "") as keyof HardFilters;
        const v = hardFilters[vk];
        return typeof v === "string" ? v.trim().length > 0 : Boolean(v);
      }).length;
      return {
        active,
        fulfilled,
        pct: active ? Math.round((fulfilled / active) * 100) : 0,
      };
    }, [hardFilters]);

    // ── Validation ─────────────────────────────────────────────────────────────
    const validateFilters = useCallback((): boolean => {
      setErrFilters(null);
      const fields = [
        { key: "location", label: "Địa điểm" },
        { key: "minExp", label: "Kinh nghiệm" },
        { key: "seniority", label: "Cấp độ" },
        { key: "education", label: "Học vấn" },
        { key: "industry", label: "Ngành nghề" },
        { key: "language", label: "Ngôn ngữ" },
        { key: "certificates", label: "Chứng chỉ" },
        { key: "salary", label: "Lương" },
        { key: "workFormat", label: "Hình thức" },
        { key: "contractType", label: "Hợp đồng" },
      ];
      const bad = fields.find((f) => {
        const mk = `${f.key}Mandatory` as keyof HardFilters;
        if (!hardFilters[mk]) return false;
        if (f.key === "salary")
          return !hardFilters.salaryMin && !hardFilters.salaryMax;
        return !hardFilters[f.key as keyof HardFilters];
      });
      if (bad) {
        setErrFilters(`Vui lòng điền giá trị cho: ${bad.label}`);
        return false;
      }
      return true;
    }, [hardFilters]);

    const handleNextStep = () => {
      if (validateFilters()) setStep(2);
    };
    const handleComplete = () => {
      setErrWeights(null);
      if (totalWeight !== 100) {
        setErrWeights("Tổng trọng số phải bằng 100%.");
        return;
      }
      onComplete();
    };

    // ── Sub-components ──────────────────────────────────────────────────────────
    const ErrorBanner = ({ msg }: { msg: string }) => (
      <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-lg bg-red-950/60 border border-red-500/25">
        <i className="fa-solid fa-triangle-exclamation text-red-400 text-xs mt-0.5 flex-shrink-0" />
        <p className="text-[11.5px] text-red-300 leading-relaxed">{msg}</p>
      </div>
    );

    // ── Step indicator ──────────────────────────────────────────────────────────
    const StepIndicator = () => (
      <div className="flex items-center gap-1 bg-slate-900/70 border border-slate-800 rounded-lg p-1">
        {(
          [
            { n: 1, label: "Bộ lọc", icon: "fa-filter" },
            { n: 2, label: "Trọng số", icon: "fa-scale-balanced" },
          ] as const
        ).map(({ n, label, icon }, i) => (
          <React.Fragment key={n}>
            <button
              onClick={n === 1 ? () => setStep(1) : handleNextStep}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-all duration-200 ${
                step === n
                  ? "bg-indigo-600 text-white shadow-sm"
                  : step > n
                    ? "text-emerald-400 hover:text-emerald-300 hover:bg-slate-800"
                    : "text-slate-500 hover:text-slate-300 hover:bg-slate-800"
              }`}
            >
              {step > n ? (
                <i className="fa-solid fa-check text-[9px]" />
              ) : (
                <span
                  className={`w-3.5 h-3.5 rounded-full text-[8px] font-black flex items-center justify-center flex-shrink-0 ${step === n ? "bg-white/20" : "bg-slate-700 text-slate-500"}`}
                >
                  {n}
                </span>
              )}
              <span className="hidden sm:inline">{label}</span>
            </button>
            {i === 0 && (
              <i className="fa-solid fa-chevron-right text-slate-700 text-[8px] flex-shrink-0 mx-0.5" />
            )}
          </React.Fragment>
        ))}
      </div>
    );

    // ── Right panel ──────────────────────────────────────────────────────────────
    const rightPanel = (
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-700">
          {step === 1 ? (
            <>
              {/* Mandatory progress card */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/80 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-indigo-500/15 flex items-center justify-center">
                      <i className="fa-solid fa-list-check text-indigo-400 text-[9px]" />
                    </div>
                    <p className="text-[11.5px] font-semibold text-white">
                      Tiêu chí bắt buộc
                    </p>
                  </div>
                </div>
                <div className="p-4 space-y-3.5">
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="rounded-lg bg-slate-800/60 p-2.5 text-center">
                      <p className="text-[22px] font-black text-white tabular-nums leading-none">
                        {mandatoryProgress.active}
                      </p>
                      <p className="text-[9.5px] text-slate-500 mt-1 uppercase tracking-wider font-medium">
                        Đã bật
                      </p>
                    </div>
                    <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2.5 text-center">
                      <p className="text-[22px] font-black text-emerald-400 tabular-nums leading-none">
                        {mandatoryProgress.fulfilled}
                      </p>
                      <p className="text-[9.5px] text-emerald-600 mt-1 uppercase tracking-wider font-medium">
                        Hợp lệ
                      </p>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[10px] text-slate-500 font-medium">
                        Tiến độ hoàn thành
                      </span>
                      <span className="text-[10px] text-indigo-400 font-bold tabular-nums">
                        {mandatoryProgress.pct}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
                        style={{ width: `${mandatoryProgress.pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Info note */}
              <div className="flex gap-2.5 px-3.5 py-3 rounded-xl border border-slate-800/60 bg-slate-900/40">
                <i className="fa-regular fa-circle-info text-slate-600 text-[10px] mt-0.5 flex-shrink-0" />
                <p className="text-[10.5px] text-slate-500 leading-relaxed">
                  Tiêu chí được bật nhưng chưa điền giá trị sẽ bị bỏ qua khi AI
                  phân tích.
                </p>
              </div>

              {errFilters && <ErrorBanner msg={errFilters} />}
            </>
          ) : (
            <>
              {/* Weight total card */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/80 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-indigo-500/15 flex items-center justify-center">
                      <i className="fa-solid fa-percent text-indigo-400 text-[9px]" />
                    </div>
                    <p className="text-[11.5px] font-semibold text-white">
                      Tổng trọng số
                    </p>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <div
                    className={`rounded-lg border p-4 text-center ${weightStatus.bg}`}
                  >
                    <p className="text-[40px] font-black text-white tabular-nums leading-none">
                      {totalWeight}
                      <span className="text-[16px] font-normal text-slate-400 ml-0.5">
                        %
                      </span>
                    </p>
                    <div
                      className={`flex items-center justify-center gap-1.5 mt-1.5 ${weightStatus.tone}`}
                    >
                      <i
                        className={`fa-solid ${weightStatus.icon} text-[10px]`}
                      />
                      <p className="text-[10.5px] font-semibold">
                        {weightStatus.label}
                      </p>
                    </div>
                    <div className="mt-3 h-1.5 bg-black/20 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${weightStatus.bar} transition-all duration-500`}
                        style={{ width: `${weightStatus.pct}%` }}
                      />
                    </div>
                  </div>
                  <TotalWeightDisplay totalWeight={totalWeight} />
                </div>
              </div>

              {errWeights && <ErrorBanner msg={errWeights} />}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-4 border-t border-slate-800/60 space-y-2">
          {step === 1 ? (
            <button
              onClick={handleNextStep}
              className="w-full h-9 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold text-[12px] transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              Tiếp theo
              <i className="fa-solid fa-arrow-right text-[10px]" />
            </button>
          ) : (
            <div className="space-y-2">
              <button
                onClick={handleComplete}
                disabled={totalWeight !== 100}
                className={`w-full h-9 rounded-lg font-semibold text-[12px] transition-all flex items-center justify-center gap-1.5 ${
                  totalWeight === 100
                    ? "bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white shadow-sm"
                    : "bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700/60"
                }`}
              >
                <i
                  className={`fa-solid fa-check text-[10px] ${totalWeight !== 100 ? "opacity-50" : ""}`}
                />
                Hoàn tất cấu hình
              </button>
              <button
                onClick={() => setStep(1)}
                className="w-full h-8 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent hover:border-slate-700 font-medium text-[11.5px] transition-all flex items-center justify-center gap-1.5"
              >
                <i className="fa-solid fa-arrow-left text-[9px]" />
                Quay lại bộ lọc
              </button>
            </div>
          )}
        </div>
      </div>
    );

    // ── Mobile bottom bar ────────────────────────────────────────────────────────
    const bottomBar = (
      <div className="space-y-2.5">
        {/* Progress strip */}
        <div className="flex items-center gap-3 px-0.5">
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black ${step >= 1 ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-600 border border-slate-700"}`}
            >
              {step > 1 ? <i className="fa-solid fa-check" /> : "1"}
            </div>
            <span
              className={`text-[10.5px] font-medium ${step === 1 ? "text-white" : "text-slate-500"}`}
            >
              Bộ lọc
            </span>
          </div>
          <div className="flex-1 h-px bg-slate-800">
            <div
              className={`h-full bg-indigo-600 transition-all duration-300 ${step === 2 ? "w-full" : "w-0"}`}
            />
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black ${step >= 2 ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-600 border border-slate-700"}`}
            >
              2
            </div>
            <span
              className={`text-[10.5px] font-medium ${step === 2 ? "text-white" : "text-slate-500"}`}
            >
              Trọng số
            </span>
          </div>
        </div>

        {/* Error */}
        {(step === 1 ? errFilters : errWeights) && (
          <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-red-950/60 border border-red-500/20">
            <i className="fa-solid fa-triangle-exclamation text-red-400 text-[10px] mt-0.5 flex-shrink-0" />
            <p className="text-[11px] text-red-300">
              {step === 1 ? errFilters : errWeights}
            </p>
          </div>
        )}

        {/* Actions */}
        {step === 1 ? (
          <button
            onClick={handleNextStep}
            className="w-full h-10 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[12.5px] flex items-center justify-center gap-2 transition-colors"
          >
            Tiếp theo: Trọng số
            <i className="fa-solid fa-arrow-right text-[10px]" />
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => setStep(1)}
              className="h-10 w-10 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-colors flex-shrink-0"
            >
              <i className="fa-solid fa-arrow-left text-xs" />
            </button>
            <button
              onClick={handleComplete}
              disabled={totalWeight !== 100}
              className={`flex-1 h-10 rounded-lg font-semibold text-[12.5px] flex items-center justify-center gap-1.5 transition-colors ${
                totalWeight === 100
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                  : "bg-slate-800 text-slate-600 border border-slate-700/60 cursor-not-allowed"
              }`}
            >
              <i className="fa-solid fa-check text-[10px]" />
              Hoàn tất
            </button>
          </div>
        )}
      </div>
    );

    // ── Main banner per step ────────────────────────────────────────────────────
    const stepMeta =
      step === 1
        ? {
            icon: "fa-filter",
            iconColor: "text-indigo-400",
            iconBg: "bg-indigo-500/10",
            title: "Bộ lọc cứng (Hard Filters)",
            desc: "Thiết lập điều kiện bắt buộc — AI sẽ tự động loại bỏ hồ sơ không đạt.",
            borderColor: "border-indigo-500/20",
            bg: "bg-indigo-600/8",
          }
        : {
            icon: "fa-scale-balanced",
            iconColor: "text-emerald-400",
            iconBg: "bg-emerald-500/10",
            title: "Phân bổ Trọng số",
            desc: "Phân bổ % mức độ quan trọng cho từng nhóm tiêu chí. Tổng phải bằng 100%.",
            borderColor: "border-emerald-500/20",
            bg: "bg-emerald-600/8",
          };

    return (
      <AppLayout
        sidebarCollapsed={sidebarCollapsed}
        headerRight={<StepIndicator />}
        rightPanel={rightPanel}
        bottomBar={bottomBar}
      >
        {/* ── Page body ──────────────────────────────────────────────────────── */}
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-5 space-y-4">
          {/* Step context banner */}
          <div
            className={`flex items-start gap-3.5 px-4 py-3.5 rounded-xl border ${stepMeta.borderColor} ${stepMeta.bg}`}
          >
            <div
              className={`w-7 h-7 rounded-lg ${stepMeta.iconBg} flex items-center justify-center flex-shrink-0 mt-0.5`}
            >
              <i
                className={`fa-solid ${stepMeta.icon} ${stepMeta.iconColor} text-[11px]`}
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12.5px] font-semibold text-white leading-snug">
                {stepMeta.title}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                {stepMeta.desc}
              </p>
            </div>
          </div>

          {/* Step content */}
          {step === 1 ? (
            <HardFilterPanel
              hardFilters={hardFilters}
              setHardFilters={setHardFilters}
            />
          ) : (
            <div className="space-y-2">
              {primaryCriteria.map((c) => (
                <WeightTile
                  key={c.key}
                  criterion={c}
                  setWeights={setWeights}
                  isExpanded={expandedCriterion === c.key}
                  onToggle={() =>
                    setExpandedCriterion((p) => (p === c.key ? null : c.key))
                  }
                />
              ))}
            </div>
          )}
        </div>
      </AppLayout>
    );
  },
);

WeightsConfig.displayName = "WeightsConfig";
export default WeightsConfig;
