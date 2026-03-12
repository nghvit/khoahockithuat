import React, { useState, useEffect } from "react";
import { JDHistoryService } from "../../services/storage/jdHistoryService";
import type { JDTemplate } from "../../types";

interface HistorySelectorProps {
  uid: string;
  onSelect: (item: JDTemplate) => void;
  className?: string;
}

const HistorySelector: React.FC<HistorySelectorProps> = ({
  uid,
  onSelect,
  className = "",
}) => {
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
      console.error("Failed to load history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) loadHistory();
  }, [isOpen, uid]);

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`h-7 px-3 flex items-center gap-1.5 rounded-lg border text-[11px] font-semibold transition-all ${
          isOpen
            ? "bg-violet-500/15 border-violet-500/40 text-violet-300"
            : "bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600 hover:bg-slate-800"
        }`}
      >
        <i className="fa-solid fa-clock-rotate-left text-xs" />
        <span>Lịch sử</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-72 bg-slate-900 border border-slate-700/60 rounded-xl shadow-2xl shadow-black/40 z-50 overflow-hidden">
            {/* Header */}
            <div className="px-3.5 py-2.5 border-b border-slate-800 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Lịch sử gần đây
              </span>
              <button
                onClick={() => loadHistory()}
                className="w-6 h-6 rounded-md flex items-center justify-center text-slate-600 hover:text-violet-400 hover:bg-slate-800 transition-all"
              >
                <i
                  className={`fa-solid fa-rotate-right text-[10px] ${isLoading ? "fa-spin" : ""}`}
                />
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto custom-scrollbar">
              {isLoading ? (
                <div className="py-8 text-center">
                  <i className="fa-solid fa-circle-notch fa-spin text-violet-400 text-lg mb-2" />
                  <p className="text-[11px] text-slate-500">Đang tải...</p>
                </div>
              ) : historyItems.length === 0 ? (
                <div className="py-8 text-center">
                  <i className="fa-regular fa-clock text-2xl text-slate-700 mb-2" />
                  <p className="text-[11px] text-slate-500 italic">
                    Chưa có lịch sử
                  </p>
                </div>
              ) : (
                historyItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelect(item);
                      setIsOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-3 hover:bg-slate-800/60 border-b border-slate-800/40 last:border-0 transition-colors group"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-[12px] font-semibold text-slate-200 group-hover:text-violet-300 truncate flex-1 transition-colors">
                        {item.jobPosition || "Không tên"}
                      </p>
                      <span className="text-[9px] text-slate-600 shrink-0 ml-2">
                        {item.createdAt?.seconds
                          ? new Date(
                              item.createdAt.seconds * 1000,
                            ).toLocaleDateString("vi-VN")
                          : ""}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-600 line-clamp-1 leading-relaxed group-hover:text-slate-500 transition-colors">
                      {item.jdText?.slice(0, 80)}...
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
