import React, { useEffect, useState, useCallback } from 'react';
import { fetchRecentHistory, fetchManualHistory } from '../../../services/storage/historyService';
import type { HistoryEntry } from '../../../types';

interface HistoryPageProps { userEmail?: string; onRestore?: (payload: any) => void }

const HistoryPage: React.FC<HistoryPageProps> = ({ userEmail, onRestore }) => {
  const [items, setItems] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<'all' | '24h' | '7d' | '30d'>('all');
  const [selected, setSelected] = useState<HistoryEntry | null>(null); // mục được chọn để xem chi tiết
  const [refreshing, setRefreshing] = useState(false);

  const loadHistory = useCallback(async () => {
    setError(null);
    try {
      const [autoHistory, manualHistory] = await Promise.all([
        fetchRecentHistory(50, userEmail),
        fetchManualHistory(userEmail)
      ]);
      // Tag manual entries by prefixing ID (UI only)
      const taggedManual = manualHistory.map(h => ({ ...h, id: `manual-${h.id}` }));
      const merged = [...taggedManual, ...autoHistory].sort((a, b) => b.timestamp - a.timestamp);
      setItems(merged);
    } catch (e) {
      console.warn('History load failed', e);
      setError('Không tải được lịch sử');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userEmail]);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  // Debug log để xác minh dữ liệu
  useEffect(() => {
    console.log('[HistoryPage] userEmail=', userEmail, 'items=', items);
  }, [userEmail, items]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
  };

  const filtered = items.filter(it => {
    if (timeFilter === 'all') return true;
    const now = Date.now();
    const diff = now - it.timestamp;
    if (timeFilter === '24h') return diff <= 24 * 60 * 60 * 1000;
    if (timeFilter === '7d') return diff <= 7 * 24 * 60 * 60 * 1000;
    if (timeFilter === '30d') return diff <= 30 * 24 * 60 * 60 * 1000;
    return true;
  });

  if (loading) return <div className="p-8 text-slate-300">Đang tải lịch sử...</div>;
  if (error) return <div className="p-8 text-red-400">{error}</div>;

  return (
    <div className="p-6 space-y-8 min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-800/30 p-6 rounded-2xl border border-slate-700/30 backdrop-blur-sm">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-lg shadow-blue-500/10">
              <i className="fa-solid fa-clock-rotate-left text-blue-400 text-xl"></i>
            </div>
            Lịch sử Phân tích
          </h2>
          <p className="text-slate-400 text-sm ml-14">Xem lại và quản lý các phiên phân tích CV trước đây của bạn</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-700/50">
            {(['all', '24h', '7d', '30d'] as const).map(tf => (
              <button
                key={tf}
                onClick={() => setTimeFilter(tf)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-300 ${timeFilter === tf
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
              >
                {tf === 'all' ? 'Tất cả' : tf === '24h' ? '24h qua' : tf === '7d' ? '7 ngày' : '30 ngày'}
              </button>
            ))}
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${refreshing
                ? 'border-slate-700 bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white hover:border-slate-500 shadow-lg hover:shadow-blue-500/10'
              }`}
            title="Làm mới danh sách"
          >
            <i className={`fa-solid fa-rotate ${refreshing ? 'animate-spin' : ''}`}></i>
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-slate-400">
          Hiển thị <span className="font-bold text-white">{filtered.length}</span> phiên phân tích
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 bg-slate-800/20 rounded-2xl border border-slate-700/30 border-dashed">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fa-solid fa-box-open text-slate-600 text-2xl"></i>
          </div>
          <p className="text-slate-400 text-lg">Không tìm thấy phiên phân tích nào phù hợp.</p>
          <button onClick={() => setTimeFilter('all')} className="mt-4 text-blue-400 hover:text-blue-300 text-sm font-medium">
            Xem tất cả lịch sử
          </button>
        </div>
      )}

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map(item => (
          <div
            key={item.id}
            className="group bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 hover:border-blue-500/50 rounded-2xl p-5 transition-all duration-300 hover:shadow-xl hover:shadow-blue-900/10 cursor-pointer relative overflow-hidden flex flex-col"
            onClick={() => setSelected(item)}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            {/* Card Header */}
            <div className="flex items-start justify-between mb-4 relative z-10">
              <div className="flex-1 min-w-0 pr-3">
                <h3 className="font-bold text-slate-200 text-lg truncate group-hover:text-blue-400 transition-colors" title={item.jobPosition}>
                  {item.jobPosition || 'Chức danh chưa đặt'}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-slate-500 flex items-center gap-1 bg-slate-900/50 px-2 py-0.5 rounded-full border border-slate-700/50">
                    <i className="fa-regular fa-clock text-[10px]"></i>
                    {new Date(item.timestamp).toLocaleString('vi-VN')}
                  </span>
                  {item.id.startsWith('manual-') && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                      Thủ công
                    </span>
                  )}
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-700/50 flex items-center justify-center text-slate-400 group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-colors">
                <i className="fa-solid fa-chevron-right text-sm"></i>
              </div>
            </div>

            {/* JD Snippet */}
            <div className="mb-4 relative z-10 flex-1">
              <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-700/30">
                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed font-mono">
                  {item.jdTextSnippet || 'Không có nội dung JD'}
                </p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-2 mb-4 relative z-10">
              <div className="bg-slate-700/30 rounded-lg p-2 text-center border border-slate-700/30">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Tổng</div>
                <div className="font-bold text-white">{item.totalCandidates}</div>
              </div>
              <div className="bg-emerald-500/10 rounded-lg p-2 text-center border border-emerald-500/20">
                <div className="text-[10px] text-emerald-400/70 uppercase tracking-wider mb-0.5">Hạng A</div>
                <div className="font-bold text-emerald-400">{item.grades.A}</div>
              </div>
              <div className="bg-blue-500/10 rounded-lg p-2 text-center border border-blue-500/20">
                <div className="text-[10px] text-blue-400/70 uppercase tracking-wider mb-0.5">Hạng B</div>
                <div className="font-bold text-blue-400">{item.grades.B}</div>
              </div>
              <div className="bg-red-500/10 rounded-lg p-2 text-center border border-red-500/20">
                <div className="text-[10px] text-red-400/70 uppercase tracking-wider mb-0.5">Hạng C</div>
                <div className="font-bold text-red-400">{item.grades.C}</div>
              </div>
            </div>

            {/* Top Candidates Preview */}
            {item.topCandidates?.length > 0 && (
              <div className="mb-4 relative z-10">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-2">Top Ứng viên</div>
                <div className="space-y-1.5">
                  {item.topCandidates.slice(0, 2).map(c => (
                    <div key={c.id} className="flex justify-between items-center text-xs bg-slate-800/30 p-1.5 rounded border border-slate-700/30">
                      <span className="truncate max-w-[60%] text-slate-300 font-medium" title={c.name}>{c.name}</span>
                      <span className="text-blue-400 font-mono">{c.score}đ</span>
                    </div>
                  ))}
                  {item.topCandidates.length > 2 && (
                    <div className="text-[10px] text-slate-500 text-center italic">
                      +{item.topCandidates.length - 2} ứng viên khác...
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2 mt-auto relative z-10" onClick={e => e.stopPropagation()}>
              {!item.id.startsWith('manual-') && (
                <button
                  onClick={() => onRestore && item.fullPayload && onRestore(item.fullPayload)}
                  disabled={!item.fullPayload}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold border transition-all flex items-center justify-center gap-2 ${item.fullPayload
                      ? 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/50'
                      : 'border-slate-700 text-slate-600 cursor-not-allowed bg-slate-800/50'
                    }`}
                  title={item.fullPayload ? 'Khôi phục phiên này để tiếp tục làm việc' : 'Phiên cũ không đủ dữ liệu để khôi phục'}
                >
                  <i className="fa-solid fa-rotate-left"></i>
                  Khôi phục
                </button>
              )}
              <button
                onClick={() => setSelected(item)}
                className="flex-1 px-3 py-2 rounded-lg text-xs font-semibold border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/50 transition-all flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-circle-info"></i>
                Chi tiết
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto" role="dialog" aria-modal="true">
          <div className="w-full max-w-5xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-fade-in overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-start justify-between p-6 border-b border-slate-700/50 bg-slate-800/50">
              <div>
                <h3 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
                  {selected.jobPosition || 'Chức danh chưa đặt'}
                  {selected.id.startsWith('manual-') && (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                      Thủ công
                    </span>
                  )}
                </h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <i className="fa-regular fa-calendar"></i>
                    {new Date(selected.timestamp).toLocaleString('vi-VN')}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                  <span className="flex items-center gap-1.5">
                    <i className="fa-solid fa-users"></i>
                    {selected.totalCandidates} ứng viên
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {!selected.id.startsWith('manual-') && selected.fullPayload && (
                  <button
                    onClick={() => onRestore && selected.fullPayload && onRestore(selected.fullPayload)}
                    className="px-4 py-2 rounded-lg text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20 transition-all flex items-center gap-2"
                  >
                    <i className="fa-solid fa-rotate-left"></i>
                    Khôi phục phiên
                  </button>
                )}
                <button
                  onClick={() => setSelected(null)}
                  className="w-10 h-10 rounded-lg border border-slate-600 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors flex items-center justify-center"
                >
                  <i className="fa-solid fa-times text-lg"></i>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-900/50">
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Left Column: JD & Config */}
                <div className="lg:col-span-2 space-y-6">
                  <section className="bg-slate-800/40 rounded-xl border border-slate-700/50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-700/50 bg-slate-800/50 flex items-center gap-2">
                      <i className="fa-solid fa-file-lines text-blue-400"></i>
                      <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wide">Mô tả công việc (JD)</h4>
                    </div>
                    <div className="p-4">
                      <div className="max-h-64 overflow-y-auto rounded-lg bg-slate-900/50 p-4 text-sm leading-relaxed whitespace-pre-wrap text-slate-300 font-mono border border-slate-700/30 custom-scrollbar">
                        {selected.fullPayload?.jdText || selected.jdTextSnippet}
                      </div>
                    </div>
                  </section>

                  <div className="grid md:grid-cols-2 gap-6">
                    {selected.fullPayload?.hardFilters && (
                      <section className="bg-slate-800/40 rounded-xl border border-slate-700/50 overflow-hidden">
                        <div className="px-4 py-3 border-b border-slate-700/50 bg-slate-800/50 flex items-center gap-2">
                          <i className="fa-solid fa-filter text-purple-400"></i>
                          <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wide">Hard Filters</h4>
                        </div>
                        <div className="p-4">
                          <pre className="bg-slate-900/50 rounded-lg p-3 text-xs text-slate-400 overflow-auto max-h-40 custom-scrollbar font-mono border border-slate-700/30">
                            {JSON.stringify(selected.fullPayload.hardFilters, null, 2)}
                          </pre>
                        </div>
                      </section>
                    )}
                    {selected.fullPayload?.weights && (
                      <section className="bg-slate-800/40 rounded-xl border border-slate-700/50 overflow-hidden">
                        <div className="px-4 py-3 border-b border-slate-700/50 bg-slate-800/50 flex items-center gap-2">
                          <i className="fa-solid fa-scale-balanced text-orange-400"></i>
                          <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wide">Trọng số</h4>
                        </div>
                        <div className="p-4">
                          <pre className="bg-slate-900/50 rounded-lg p-3 text-xs text-slate-400 overflow-auto max-h-40 custom-scrollbar font-mono border border-slate-700/30">
                            {JSON.stringify(selected.fullPayload.weights, null, 2)}
                          </pre>
                        </div>
                      </section>
                    )}
                  </div>
                </div>

                {/* Right Column: Stats & Candidates */}
                <div className="space-y-6">
                  <section className="bg-slate-800/40 rounded-xl border border-slate-700/50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-700/50 bg-slate-800/50 flex items-center gap-2">
                      <i className="fa-solid fa-chart-pie text-emerald-400"></i>
                      <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wide">Phân bố hạng</h4>
                    </div>
                    <div className="p-6">
                      <div className="flex justify-between items-end gap-4">
                        <div className="flex flex-col items-center flex-1">
                          <div className="text-2xl font-bold text-emerald-400 mb-1">{selected.grades.A}</div>
                          <div className="h-2 w-full bg-emerald-500/20 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500" style={{ width: '100%' }}></div>
                          </div>
                          <span className="text-xs text-slate-400 mt-2 font-medium">Hạng A</span>
                        </div>
                        <div className="flex flex-col items-center flex-1">
                          <div className="text-2xl font-bold text-blue-400 mb-1">{selected.grades.B}</div>
                          <div className="h-2 w-full bg-blue-500/20 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500" style={{ width: '100%' }}></div>
                          </div>
                          <span className="text-xs text-slate-400 mt-2 font-medium">Hạng B</span>
                        </div>
                        <div className="flex flex-col items-center flex-1">
                          <div className="text-2xl font-bold text-red-400 mb-1">{selected.grades.C}</div>
                          <div className="h-2 w-full bg-red-500/20 rounded-full overflow-hidden">
                            <div className="h-full bg-red-500" style={{ width: '100%' }}></div>
                          </div>
                          <span className="text-xs text-slate-400 mt-2 font-medium">Hạng C</span>
                        </div>
                      </div>
                    </div>
                  </section>

                  {selected.topCandidates?.length > 0 && (
                    <section className="bg-slate-800/40 rounded-xl border border-slate-700/50 overflow-hidden">
                      <div className="px-4 py-3 border-b border-slate-700/50 bg-slate-800/50 flex items-center gap-2">
                        <i className="fa-solid fa-trophy text-yellow-400"></i>
                        <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wide">Top Ứng viên</h4>
                      </div>
                      <div className="p-4">
                        <ul className="space-y-3">
                          {selected.topCandidates.map((c, idx) => (
                            <li key={c.id} className="flex items-center justify-between gap-3 p-2 rounded-lg bg-slate-900/30 border border-slate-700/30">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${idx === 0 ? 'bg-yellow-500 text-yellow-900' :
                                    idx === 1 ? 'bg-slate-400 text-slate-900' :
                                      'bg-orange-700 text-orange-200'
                                  }`}>
                                  {idx + 1}
                                </div>
                                <span className="truncate text-sm text-slate-200 font-medium" title={c.name}>{c.name}</span>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-bold text-blue-400">{c.score}đ</div>
                                <div className="text-[10px] text-slate-500">{c.jdFit}% JD</div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </section>
                  )}

                  {selected.fullPayload?.candidates && (
                    <section className="bg-slate-800/40 rounded-xl border border-slate-700/50 overflow-hidden flex flex-col max-h-80">
                      <div className="px-4 py-3 border-b border-slate-700/50 bg-slate-800/50 flex items-center gap-2">
                        <i className="fa-solid fa-list-ul text-slate-400"></i>
                        <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wide">Danh sách chi tiết</h4>
                      </div>
                      <div className="overflow-y-auto custom-scrollbar">
                        <table className="w-full text-xs text-left border-collapse">
                          <thead className="text-slate-400 bg-slate-900/50 sticky top-0 z-10">
                            <tr>
                              <th className="py-2 px-3 font-medium">Tên</th>
                              <th className="py-2 px-3 font-medium text-center">Hạng</th>
                              <th className="py-2 px-3 font-medium text-right">Điểm</th>
                            </tr>
                          </thead>
                          <tbody className="text-slate-300 divide-y divide-slate-800/50">
                            {selected.fullPayload.candidates.map(c => (
                              <tr key={c.id || c.fileName} className="hover:bg-slate-700/30 transition-colors">
                                <td className="py-2 px-3 truncate max-w-[140px]" title={c.candidateName}>{c.candidateName}</td>
                                <td className="py-2 px-3 text-center">
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${c.analysis?.['Hạng'] === 'A' ? 'bg-emerald-500/20 text-emerald-400' :
                                      c.analysis?.['Hạng'] === 'B' ? 'bg-blue-500/20 text-blue-400' :
                                        'bg-red-500/20 text-red-400'
                                    }`}>
                                    {c.analysis?.['Hạng'] || '-'}
                                  </span>
                                </td>
                                <td className="py-2 px-3 text-right font-mono text-slate-400">{c.analysis?.['Tổng điểm'] ?? '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </section>
                  )}
                </div>
              </div>

              {!selected.fullPayload && !selected.id.startsWith('manual-') && (
                <div className="mt-6 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center gap-3 text-amber-400 text-xs">
                  <i className="fa-solid fa-triangle-exclamation"></i>
                  Phiên cũ không lưu đầy đủ dữ liệu chi tiết nên chỉ xem được thông tin tóm tắt.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
