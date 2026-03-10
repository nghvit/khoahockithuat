import React from 'react';
import type { AppStep } from '../../../types';

interface ProgressBarProps {
  activeStep: AppStep;
  completedSteps: AppStep[];
}

const ProgressBar: React.FC<ProgressBarProps> = ({ activeStep, completedSteps }) => {
  const steps = [
    { key: 'jd', label: 'JD', icon: 'fa-clipboard-list' },
    { key: 'weights', label: 'Trọng số', icon: 'fa-sliders' },
    { key: 'upload', label: 'CV', icon: 'fa-file-arrow-up' },
    { key: 'analysis', label: 'AI', icon: 'fa-rocket' },
  ];

  const getStepIndex = (step: AppStep): number => {
    return steps.findIndex(s => s.key === step);
  };

  const activeIndex = getStepIndex(activeStep);
  // Calculate progress for the connecting line (0 to 100%)
  const progress = (activeIndex / (steps.length - 1)) * 100;

  return (
    <div className="md:hidden w-full mb-4 px-2 mt-2">
      <div className="bg-[#0f172a]/90 backdrop-blur-md border border-slate-800 rounded-xl p-4 shadow-xl">
        <div className="flex items-center justify-between relative">
          {/* Connecting line background */}
          <div className="absolute top-4 left-2 right-2 h-0.5 bg-slate-700 -z-10"></div>
          
          {/* Active progress line */}
          <div
            className="absolute top-4 left-2 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500 ease-out -z-10"
            style={{ width: `calc(${progress}% - 16px)` }} 
          ></div>
          {/* Note: The width calculation is approximate. For perfect alignment, we might need a different approach, 
              but this is usually "good enough" for visual feedback. 
              Actually, let's try a safer simple percentage since justify-between is consistent.
          */}
           <div
            className="absolute top-4 left-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500 ease-out -z-10"
            style={{ width: `${progress}%` }}
          ></div>

          {steps.map((step, index) => {
            const isCompleted = completedSteps.includes(step.key as AppStep);
            const isActive = activeStep === step.key;
            const isEnabled = index <= activeIndex;

            // Simplified color scheme for cleaner mobile look
            let circleClass = "bg-slate-800 border-2 border-slate-700 text-slate-500";
            let iconClass = "";
            let textClass = "text-slate-500";

            if (isActive) {
                circleClass = "bg-slate-900 border-2 border-cyan-400 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.3)] scale-110";
                iconClass = "animate-pulse";
                textClass = "text-cyan-400 font-bold";
            } else if (isCompleted) {
                circleClass = "bg-slate-900 border-2 border-emerald-500 text-emerald-500";
                textClass = "text-emerald-500 font-medium";
            } else if (isEnabled) {
                 circleClass = "bg-slate-800 border-2 border-blue-500 text-blue-500";
                 textClass = "text-blue-500";
            }

            return (
              <div key={step.key} className="flex flex-col items-center relative z-10 group cursor-default">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all duration-300 ${circleClass}`}>
                  <i className={`fa-solid ${step.icon} ${iconClass}`}></i>
                </div>
                <span className={`text-[10px] mt-1.5 transition-colors duration-300 ${textClass}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
