import React, { useMemo, useState, useCallback, memo } from 'react';
import type { HardFilters, WeightCriteria, MainCriterion } from '../../../types';
import HardFilterPanel from '../../ui/HardFilterPanel';
import WeightTile from '../../ui/WeightTile';
import TotalWeightDisplay from '../../ui/TotalWeightDisplay';

interface WeightsConfigProps {
  weights: WeightCriteria;
  setWeights: React.Dispatch<React.SetStateAction<WeightCriteria>>;
  hardFilters: HardFilters;
  setHardFilters: React.Dispatch<React.SetStateAction<HardFilters>>;
  onComplete: () => void;
  sidebarCollapsed?: boolean;
}

const WeightsConfig: React.FC<WeightsConfigProps> = memo(({ weights, setWeights, hardFilters, setHardFilters, onComplete, sidebarCollapsed = false }) => {
  const [expandedCriterion, setExpandedCriterion] = useState<string | null>(null);
  const [validationErrorFilters, setValidationErrorFilters] = useState<string | null>(null);
  const [validationErrorWeights, setValidationErrorWeights] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2>(1); // 1: Tiêu chí Lọc, 2: Phân bổ Trọng số

  const totalWeight = useMemo(() => {
    return Object.values(weights).reduce((total: number, criterion: MainCriterion) => {
      if (criterion.children) {
        return total + criterion.children.reduce((subTotal, child) => subTotal + child.weight, 0);
      }
      return total + (criterion.weight || 0);
    }, 0);
  }, [weights]);

  const remainingWeight = 100 - totalWeight;

  const weightStatus = useMemo(() => {
    if (totalWeight === 100) {
      return { label: 'Đầy đủ', desc: 'Tổng trọng số đạt 100%', tone: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' };
    }
    if (totalWeight > 100) {
      return { label: 'Vượt ngưỡng', desc: `Thừa ${Math.abs(remainingWeight)}%`, tone: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30' };
    }
    return { label: 'Chưa đủ', desc: `Thiếu ${Math.abs(remainingWeight)}%`, tone: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' };
  }, [remainingWeight, totalWeight]);

  const primaryCriteria = useMemo(() => {
    return Object.values(weights).filter((c: MainCriterion) => c.children) as MainCriterion[];
  }, [weights]);

  const validateFilters = useCallback((): boolean => {
    setValidationErrorFilters(null);
    const mandatoryFieldsForValidation = [
      { key: 'location', label: 'Địa điểm làm việc' },
      { key: 'minExp', label: 'Kinh nghiệm tối thiểu' },
      { key: 'seniority', label: 'Cấp độ' },
      { key: 'education', label: 'Học vấn' },
      { key: 'industry', label: 'Ngành nghề' },
      { key: 'language', label: 'Ngôn ngữ' },
      { key: 'certificates', label: 'Chứng chỉ' },
      { key: 'salary', label: 'Lương' },
      { key: 'workFormat', label: 'Hình thức làm việc' },
      { key: 'contractType', label: 'Hợp đồng' },
    ];
    const invalidField = mandatoryFieldsForValidation.find(field => {
      const mandatoryKey = `${field.key}Mandatory` as keyof HardFilters;
      if (!hardFilters[mandatoryKey]) return false;
      if (field.key === 'salary') return !hardFilters.salaryMin && !hardFilters.salaryMax;
      const valueKey = field.key as keyof HardFilters;
      return !hardFilters[valueKey];
    });
    if (invalidField) {
      setValidationErrorFilters(`Vui lòng điền giá trị cho tiêu chí bắt buộc: ${invalidField.label}.`);
      return false;
    }
    return true;
  }, [hardFilters]);

  const handleFiltersComplete = useCallback(() => {
    if (!validateFilters()) return;
    setStep(2);
  }, [validateFilters]);

  const handleWeightsComplete = useCallback(() => {
    setValidationErrorWeights(null);
    if (totalWeight !== 100) {
      setValidationErrorWeights('Tổng trọng số phải bằng 100% trước khi tiếp tục.');
      return;
    }
    onComplete();
  }, [totalWeight, onComplete]);

  // Calculate mandatory filter progress
  const mandatoryProgress = useMemo(() => {
    const keys = Object.keys(hardFilters).filter(k => k.endsWith('Mandatory')) as Array<keyof HardFilters>;
    const active = keys.filter(k => hardFilters[k]).length;
    const fulfilled = keys.filter(k => {
      if (!hardFilters[k]) return false;
      const valKey = k.replace('Mandatory', '') as keyof HardFilters;
      const val = hardFilters[valKey];
      return typeof val === 'string' ? val.trim().length > 0 : Boolean(val);
    }).length;
    return { active, fulfilled, percent: active ? Math.round((fulfilled / active) * 100) : 0 };
  }, [hardFilters]);

  // Fixed header position based on sidebar state (same pattern as JDInput)
  const sidebarWidth = sidebarCollapsed ? 'md:left-[72px]' : 'md:left-64';

  return (
    <section id="module-weights" className="module-pane active w-full h-screen flex flex-col bg-[#0B1120]">

      {/* ─── FIXED HEADER BAR ─── */}
      <div className={`fixed top-14 md:top-0 left-0 right-0 z-30 ${sidebarWidth} transition-all duration-500 ease-[cubic-bezier(0.2,0,0,1)]`}>
        <div className="bg-slate-900 border-b border-slate-800 h-[72px] flex items-center px-6 gap-4">

          {/* Step badge + Title */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 flex-shrink-0">
              <span className="font-bold text-lg">2</span>
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-white leading-tight truncate">Cấu hình Tiêu chí</h2>
              <p className="text-xs text-slate-400 leading-tight truncate">Thiết lập bộ lọc và trọng số đánh giá</p>
            </div>
          </div>

          {/* Step Tabs */}
          <div className="flex items-center bg-slate-800/40 rounded-xl p-1 border border-slate-700/50 flex-shrink-0">
            <button
              onClick={() => setStep(1)}
              className={`px-5 py-2 rounded-lg text-[13px] font-semibold transition-all ${step === 1
                ? 'bg-slate-700 text-white shadow-lg'
                : 'text-slate-500 hover:text-slate-300'
                }`}
            >
              1. Bộ lọc
            </button>
            <div className="w-[1px] h-5 bg-slate-700/60 mx-1" />
            <button
              onClick={() => { if (validateFilters()) setStep(2); }}
              className={`px-5 py-2 rounded-lg text-[13px] font-semibold transition-all ${step === 2
                ? 'bg-slate-700 text-white shadow-lg'
                : 'text-slate-500 hover:text-slate-300'
                }`}
            >
              2. Trọng số
            </button>
          </div>

        </div>
      </div>

      {/* ─── MAIN CONTENT AREA ─── */}
      <div className="flex-1 overflow-y-auto pt-[128px] md:pt-[72px] custom-scrollbar bg-slate-900">
        <div className="max-w-7xl mx-auto w-full min-h-0 pb-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start h-full px-4 md:px-6">

            {/* Left Column: Content Area (8 cols) */}
            <div className="lg:col-span-8 flex flex-col space-y-8 py-8">
              <div className="flex flex-col">
                <h4 className="text-xl font-bold text-white mb-2 flex items-center gap-3">
                  <span className="w-1.5 h-6 bg-cyan-500 rounded-full"></span>
                  {step === 1 ? 'Cấu hình bộ lọc' : 'Danh sách tiêu chí'}
                </h4>
                <p className="text-sm text-slate-500 ml-4.5">
                  {step === 1
                    ? 'Xác định các điều kiện bắt buộc để sàng lọc ứng viên phù hợp nhất.'
                    : 'Phân bổ mức độ quan trọng cho từng nhóm kỹ năng và yêu cầu.'}
                </p>
              </div>

              <div className="min-h-[400px]">
                {step === 1 ? (
                  <HardFilterPanel hardFilters={hardFilters} setHardFilters={setHardFilters} />
                ) : (
                  <div className="space-y-6">
                    {primaryCriteria.map((criterion) => (
                      <WeightTile
                        key={criterion.key}
                        criterion={criterion}
                        setWeights={setWeights}
                        isExpanded={expandedCriterion === criterion.key}
                        onToggle={() =>
                          setExpandedCriterion((prev) => (prev === criterion.key ? null : criterion.key))
                        }
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Controls & Info (4 cols) - Sticky on Desktop */}
            <div className="lg:col-span-4 lg:sticky lg:top-28 h-full py-8">
              <div className="flex flex-col gap-6">

                {step === 1 ? (
                  <>
                    <div className="bg-slate-900/40 rounded-2xl p-6 border border-slate-800/60 backdrop-blur-sm">
                      <h4 className="text-lg font-bold text-white mb-2">Tiêu chí Lọc (Hard Filters)</h4>
                      <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                        Các tiêu chí này được AI sử dụng để tự động loại bỏ các hồ sơ không đạt yêu cầu tối thiểu về địa điểm, kinh nghiệm hoặc bằng cấp.
                      </p>

                      <div className="space-y-4">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500 font-medium">Tiêu chí bắt buộc</span>
                          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-white font-bold">{mandatoryProgress.active}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500 font-medium">Đã điền hợp lệ</span>
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 font-bold">{mandatoryProgress.fulfilled}</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-[10px]">
                            <span className="text-slate-600 uppercase tracking-wider font-bold">Tiến độ</span>
                            <span className="text-cyan-400 font-bold">{mandatoryProgress.percent}%</span>
                          </div>
                          <div className="h-2 bg-slate-800/50 rounded-full overflow-hidden border border-slate-700/30">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-700 ease-out"
                              style={{ width: `${mandatoryProgress.percent}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <button
                        onClick={handleFiltersComplete}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold shadow-xl shadow-blue-900/20 transition-all flex items-center justify-center gap-3 group"
                      >
                        Tiếp tục: Trọng số
                        <i className="fa-solid fa-arrow-right transition-transform group-hover:translate-x-1" />
                      </button>

                      {validationErrorFilters && (
                        <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                          <i className="fa-solid fa-circle-exclamation text-red-400 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-red-200 leading-relaxed font-medium">{validationErrorFilters}</p>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-slate-900/40 rounded-2xl p-6 border border-slate-800/60 backdrop-blur-sm">
                      <h4 className="text-lg font-bold text-white mb-2">Phân bổ Trọng số</h4>
                      <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                        Thiết lập trọng số ưu tiên cho từng tiêu chí. Tổng trọng số bắt buộc phải đạt chính xác 100%.
                      </p>

                      <div className={`p-4 rounded-xl border ${weightStatus.bg} mb-6 transition-colors duration-300`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-xs font-bold uppercase tracking-wider ${weightStatus.tone}`}>{weightStatus.label}</span>
                          <span className="text-sm font-bold text-white tabular-nums">{totalWeight}/100%</span>
                        </div>
                        <p className="text-[11px] text-slate-300 font-medium">{weightStatus.desc}</p>
                      </div>

                      <TotalWeightDisplay totalWeight={totalWeight} />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setStep(1)}
                        className="py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold border border-slate-700 transition-all flex items-center justify-center gap-2"
                      >
                        <i className="fa-solid fa-arrow-left" /> Quay lại
                      </button>
                      <button
                        onClick={handleWeightsComplete}
                        disabled={totalWeight !== 100}
                        className={`py-4 rounded-xl font-bold shadow-xl transition-all flex items-center justify-center gap-2 ${totalWeight === 100
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-900/30'
                          : 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700'
                          }`}
                      >
                        Hoàn tất <i className="fa-solid fa-check" />
                      </button>
                    </div>

                    {validationErrorWeights && (
                      <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                        <i className="fa-solid fa-circle-exclamation text-red-400 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-red-200 leading-relaxed font-medium">{validationErrorWeights}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
});

WeightsConfig.displayName = 'WeightsConfig';

export default WeightsConfig;
