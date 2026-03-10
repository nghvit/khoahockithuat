import React, { useState, useEffect } from 'react';
import { JDHistoryService } from '../../services/storage/jdHistoryService';
import type { JDTemplate } from '../../types';

interface HistorySelectorProps {
  uid: string;
  onSelect: (item: JDTemplate) => void;
  className?: string;
}

const HistorySelector: React.FC<HistorySelectorProps> = ({ uid, onSelect, className = '' }) => {
  const [historyItems, setHistoryItems] = useState<JDTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const loadHistory = async () => {
    if (!uid) return;
    setIsLoading(true);
    try {
      const fetchedHistory = await JDHistoryService.getUserHistory(uid);
      setHistoryItems(fetchedHistory);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen, uid]);

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-slate-800/40 border border-slate-700/50 rounded-none text-sm text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50 transition-all"
      >
        <i className="fa-solid fa-clock-rotate-left"></i>
        <span>Lịch sử JD</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="absolute right-0 top-full mt-1 w-72 bg-slate-900 border border-slate-700 rounded-none shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="p-3 border-b border-slate-800 bg-slate-800/50 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lịch sử gần đây</h3>
              <button onClick={() => loadHistory()} className="text-slate-500 hover:text-cyan-400 transition-colors">
                <i className={`fa-solid fa-rotate-right text-[10px] ${isLoading ? 'fa-spin' : ''}`}></i>
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto custom-scrollbar">
              {isLoading ? (
                <div className="p-4 text-center">
                  <i className="fa-solid fa-circle-notch fa-spin text-cyan-500 mb-2"></i>
                  <p className="text-xs text-slate-500">Đang tải...</p>
                </div>
              ) : historyItems.length === 0 ? (
                <div className="p-4 text-center">
                  <p className="text-xs text-slate-500 italic">Chưa có lịch sử</p>
                </div>
              ) : (
                historyItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelect(item);
                      setIsOpen(false);
                    }}
                    className="w-full text-left p-3 hover:bg-slate-800 border-b border-slate-800/50 last:border-0 transition-colors group"
                  >
                    <div className="flex justify-between items-start mb-0.5">
                      <p className="text-sm font-medium text-slate-200 group-hover:text-cyan-400 truncate flex-1">
                        {item.jobPosition || 'Không tên'}
                      </p>
                      <span className="text-[9px] text-slate-600 shrink-0 ml-2">
                        {item.createdAt?.seconds ? new Date(item.createdAt.seconds * 1000).toLocaleDateString('vi-VN') : ''}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed h-[30px]">
                      {item.jdText}
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

export default HistorySelector;
