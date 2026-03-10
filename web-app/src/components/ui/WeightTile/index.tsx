import React, { useMemo, useRef, useState, useEffect } from 'react';
import type { MainCriterion, WeightCriteria } from '../../../types';

interface WeightTileProps {
  criterion: MainCriterion;
  setWeights: React.Dispatch<React.SetStateAction<WeightCriteria>>;
  isExpanded: boolean;
  onToggle: () => void;
}

const clampWeight = (value: number) => Math.max(0, Math.min(100, Number.isNaN(value) ? 0 : value));

const WeightTile: React.FC<WeightTileProps> = ({ criterion, setWeights, isExpanded, onToggle }) => {
  const [measuredHeight, setMeasuredHeight] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  const total = useMemo(() => {
    return criterion.children?.reduce((sum, child) => sum + child.weight, 0) || 0;
  }, [criterion.children]);

  useEffect(() => {
    if (contentRef.current) {
      setMeasuredHeight(contentRef.current.scrollHeight);
    }
  }, [criterion.children]);

  useEffect(() => {
    if (isExpanded && contentRef.current) {
      setMeasuredHeight(contentRef.current.scrollHeight);
    }
  }, [isExpanded]);

  const handleSubChange = (childKey: string, newValue: number) => {
    const safeValue = clampWeight(newValue);
    setWeights((prev) => {
      const newCriterion = { ...prev[criterion.key] };
      if (newCriterion.children) {
        newCriterion.children = newCriterion.children.map((child) =>
          child.key === childKey ? { ...child, weight: safeValue } : child
        );
      }
      return { ...prev, [criterion.key]: newCriterion };
    });
  };

  const getProgressColor = () => {
    if (total >= 35) return 'from-emerald-400 via-emerald-300 to-cyan-300';
    if (total >= 15) return 'from-blue-400 via-cyan-300 to-sky-300';
    return 'from-amber-400 via-orange-300 to-yellow-300';
  };

  return (
    <div
      className={`rounded-2xl border transition-all duration-500 ${isExpanded ? 'bg-slate-900/40 border-cyan-500/50 shadow-lg shadow-cyan-500/5' : 'bg-slate-900/20 border-slate-800 hover:border-slate-700'
        }`}
    >
      <button
        type="button"
        className="w-full text-left p-4 flex items-center justify-between gap-4 group"
        onClick={onToggle}
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all duration-500 ${isExpanded ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30' : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-slate-200'}`}>
            <i className={`${criterion.icon}`}></i>
          </div>
          <div>
            <p className="text-sm font-bold text-white tracking-tight">{criterion.name}</p>
            <div className="flex items-center gap-3 mt-1.5">
              <div className="h-1.5 w-32 rounded-full bg-slate-800/50 overflow-hidden border border-slate-700/30">
                <div
                  className={`h-full rounded-full bg-gradient-to-r transition-all duration-700 ${getProgressColor()}`}
                  style={{ width: `${Math.min(total, 100)}%` }}
                ></div>
              </div>
              <span className="text-[10px] font-bold text-slate-500 tabular-nums uppercase tracking-wider">{total}%</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className={`text-lg font-bold tabular-nums transition-colors duration-500 ${isExpanded ? 'text-cyan-400' : 'text-slate-400'}`}>{total}%</p>
          </div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isExpanded ? 'bg-cyan-500/10 text-cyan-400' : 'text-slate-600 group-hover:text-slate-400'}`}>
            <i className={`fa-solid fa-chevron-down text-xs transition-transform duration-500 ${isExpanded ? 'rotate-180' : ''}`}></i>
          </div>
        </div>
      </button>

      <div
        className="overflow-hidden transition-[height,opacity] duration-350 ease-in-out"
        style={{ height: isExpanded ? measuredHeight : 0, opacity: isExpanded ? 1 : 0 }}
      >
        <div ref={contentRef} className="border-t border-slate-800/50 p-6 space-y-6 bg-slate-900/40 rounded-b-2xl">
          {criterion.children?.map((child) => {
            const sliderMax = Math.max(60, child.weight);
            const sliderPercent = (child.weight / sliderMax) * 100;
            return (
              <div key={child.key} className="flex flex-col gap-4 group/item">
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-cyan-500"></span>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 group-hover/item:text-slate-200 transition-colors">{child.name}</p>
                  </div>
                  <span className="text-[11px] font-bold text-cyan-500 tabular-nums bg-cyan-500/10 px-2 py-0.5 rounded-md">{child.weight}%</span>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex-1 relative py-2">
                    <input
                      type="range"
                      min={0}
                      max={sliderMax}
                      value={child.weight}
                      onChange={(e) => handleSubChange(child.key, parseInt(e.target.value, 10))}
                      className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-slate-800 focus:outline-none accent-cyan-500"
                      style={{
                        background: `linear-gradient(90deg, #06b6d4 ${sliderPercent}%, #1e293b ${sliderPercent}%)`,
                      }}
                    />
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={child.weight}
                      onChange={(e) => handleSubChange(child.key, parseInt(e.target.value, 10))}
                      className="w-16 rounded-lg border border-slate-700 bg-slate-950/50 px-2 py-1.5 text-xs font-bold text-white text-center focus:outline-none focus:border-cyan-500 transition-all tabular-nums"
                    />
                    <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] font-bold text-slate-600 uppercase tracking-tighter">Value</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WeightTile;
