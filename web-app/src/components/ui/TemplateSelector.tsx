import React, { useState, useEffect } from "react";
import { JDTemplateService } from "../../services/storage/jdTemplateService";
import type { JDTemplate } from "../../types";

interface TemplateSelectorProps {
  uid: string;
  onSelect: (template: JDTemplate) => void;
  className?: string;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  uid,
  onSelect,
  className = "",
}) => {
  const [templates, setTemplates] = useState<JDTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const loadTemplates = async () => {
    if (!uid) return;
    setIsLoading(true);
    try {
      const fetchedTemplates = await JDTemplateService.getUserTemplates(uid);
      setTemplates(fetchedTemplates);
    } catch (error) {
      console.error("Failed to load templates:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) loadTemplates();
  }, [isOpen, uid]);

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`h-7 px-3 flex items-center gap-1.5 rounded-lg border text-[11px] font-semibold transition-all ${
          isOpen
            ? "bg-indigo-500/15 border-indigo-500/40 text-indigo-300"
            : "bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600 hover:bg-slate-800"
        }`}
      >
        <i className="fa-solid fa-layer-group text-xs" />
        <span>Mẫu JD</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-64 bg-slate-900 border border-slate-700/60 rounded-xl shadow-2xl shadow-black/40 z-50 overflow-hidden">
            {/* Header */}
            <div className="px-3.5 py-2.5 border-b border-slate-800 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Mẫu đã lưu
              </span>
              <button
                onClick={() => loadTemplates()}
                className="w-6 h-6 rounded-md flex items-center justify-center text-slate-600 hover:text-indigo-400 hover:bg-slate-800 transition-all"
              >
                <i
                  className={`fa-solid fa-rotate-right text-[10px] ${isLoading ? "fa-spin" : ""}`}
                />
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto custom-scrollbar">
              {isLoading ? (
                <div className="py-8 text-center">
                  <i className="fa-solid fa-circle-notch fa-spin text-indigo-400 text-lg mb-2" />
                  <p className="text-[11px] text-slate-500">Đang tải...</p>
                </div>
              ) : templates.length === 0 ? (
                <div className="py-8 text-center">
                  <i className="fa-regular fa-file text-2xl text-slate-700 mb-2" />
                  <p className="text-[11px] text-slate-500 italic">
                    Chưa có mẫu nào
                  </p>
                </div>
              ) : (
                templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => {
                      onSelect(template);
                      setIsOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-3 hover:bg-slate-800/60 border-b border-slate-800/40 last:border-0 transition-colors group"
                  >
                    <p className="text-[12px] font-semibold text-slate-200 group-hover:text-indigo-300 truncate transition-colors">
                      {template.name}
                    </p>
                    <p className="text-[10px] text-slate-600 truncate mt-0.5 group-hover:text-slate-500 transition-colors">
                      {template.jobPosition}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TemplateSelector;
