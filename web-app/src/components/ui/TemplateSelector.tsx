import React, { useState, useEffect } from 'react';
import { JDTemplateService } from '../../services/storage/jdTemplateService';
import type { JDTemplate, HardFilters, WeightCriteria } from '../../types';

interface TemplateSelectorProps {
  uid: string;
  onSelect: (template: JDTemplate) => void;
  className?: string;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ uid, onSelect, className = '' }) => {
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
      console.error('Failed to load templates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
    }
  }, [isOpen, uid]);

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-none text-sm text-slate-300 hover:text-white hover:border-cyan-500 transition-all"
      >
        <i className="fa-solid fa-list-ul"></i>
        <span>Mẫu đã lưu</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="absolute right-0 top-full mt-1 w-64 bg-slate-900 border border-slate-700 rounded-none shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="p-3 border-b border-slate-800 bg-slate-800/50 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Danh sách mẫu</h3>
              <button onClick={() => loadTemplates()} className="text-slate-500 hover:text-cyan-400 transition-colors">
                <i className={`fa-solid fa-rotate-right text-[10px] ${isLoading ? 'fa-spin' : ''}`}></i>
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-center">
                  <i className="fa-solid fa-circle-notch fa-spin text-cyan-500 mb-2"></i>
                  <p className="text-xs text-slate-500">Đang tải...</p>
                </div>
              ) : templates.length === 0 ? (
                <div className="p-4 text-center">
                  <p className="text-xs text-slate-500 italic">Chưa có mẫu nào được lưu</p>
                </div>
              ) : (
                templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => {
                      onSelect(template);
                      setIsOpen(false);
                    }}
                    className="w-full text-left p-3 hover:bg-slate-800 border-b border-slate-800/50 last:border-0 transition-colors group"
                  >
                    <p className="text-sm font-medium text-slate-200 group-hover:text-cyan-400 truncate">
                      {template.name}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">
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
