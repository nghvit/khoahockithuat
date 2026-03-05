import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import debounce from 'lodash.debounce';
import type { Candidate, DetailedScore, AppStep } from '../../../types';
import ExpandedContent from '../ExpandedContent';
import ChatbotPanel from '../ChatbotPanel';
import InterviewQuestionGenerator from '../InterviewQuestionGenerator';
import ProgressBar from '../../ui/ProgressBar';
// Removed manual history save functionality


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

// --- Inlined Loader Component ---
// This component is inlined to avoid a separate import that fails during lazy loading.
const Loader: React.FC<{ message: string }> = ({ message }) => {
  return (
    <div className="flex justify-center items-center flex-col gap-8 text-center py-20 md:py-24">
      <div className="relative w-24 h-24">
        {/* Outer ring */}
        <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>

        {/* Spinning gradient ring */}
        <div className="absolute inset-0 border-4 border-transparent border-t-cyan-500 border-r-blue-500 rounded-full animate-spin"></div>

        {/* Inner pulsing circle */}
        <div className="absolute inset-4 bg-slate-900 rounded-full flex items-center justify-center shadow-inner shadow-black/50">
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full animate-pulse shadow-[0_0_15px_rgba(6,182,212,0.5)]"></div>
        </div>

        {/* Orbiting dots */}
        <div className="absolute inset-0 animate-[spin_3s_linear_infinite]">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)]"></div>
        </div>
        <div className="absolute inset-0 animate-[spin_4s_linear_infinite_reverse]">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
        </div>
      </div>

      <div className="space-y-3 max-w-md mx-auto px-4">
        <h3 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent animate-pulse">
          {message || 'Đang phân tích CV với AI...'}
        </h3>
        <p className="text-slate-400 text-sm">
          Vui lòng chờ đợi trong vài phút. Hệ thống đang đọc hiểu và chấm điểm từng hồ sơ.
        </p>

        {/* Progress bar simulation */}
        <div className="w-48 h-1 bg-slate-800 rounded-full mx-auto overflow-hidden mt-4">
          <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 w-1/3 animate-[shimmer_2s_infinite_linear] rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

// --- Main AnalysisResults Component ---

type RankedCandidate = Candidate & { rank: number; jdFitScore: number; gradeValue: number };

// Memoized table row component for performance
const TableRow = React.memo<{
  candidate: RankedCandidate;
  index: number;
  isSelected: boolean;
  expandedCandidate: string | null;
  expandedCriteria: Record<string, Record<string, boolean>>;
  onSelect: (id: string, index: number) => void;
  onExpand: (id: string) => void;
  onToggleCriterion: (candidateId: string, criterion: string) => void;
}>(({ candidate, index, isSelected, expandedCandidate, expandedCriteria, onSelect, onExpand, onToggleCriterion }) => {
  const grade = candidate.status === 'FAILED' ? 'FAILED' : (candidate.analysis?.['Hạng'] || 'C');
  const overallScore = candidate.status === 'FAILED' ? 0 : (candidate.analysis?.['Tổng điểm'] || 0);
  const jdFitScore = candidate.status === 'FAILED' ? 0 : parseInt(candidate.analysis?.['Chi tiết']?.find(i => i['Tiêu chí'].startsWith('Phù hợp JD'))?.['Điểm'].split('/')[0] || '0', 10);

  return (
    <React.Fragment>
      <tr
        className={`border-t border-slate-700/50 ${isSelected ? 'bg-blue-500/10' : 'hover:bg-slate-700/30'} cursor-pointer`}
        onClick={(e) => {
          if ((e.target as HTMLInputElement).type !== 'checkbox') {
            onExpand(candidate.id);
          }
        }}
      >
        <td className="px-4 py-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation();
              onSelect(candidate.id, index);
            }}
            className="rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500"
          />
        </td>
        <td className="px-4 py-3 text-sm text-slate-200">{candidate.candidateName || 'Chưa xác định'}</td>
        <td className="px-4 py-3 text-sm">
          <span className={`px-2 py-1 rounded text-xs font-semibold ${candidate.status === 'FAILED' ? 'bg-slate-600 text-slate-400' :
            grade === 'A' ? 'bg-emerald-600 text-emerald-400' :
              grade === 'B' ? 'bg-blue-600 text-blue-400' :
                'bg-red-600 text-red-400'
            }`}>
            {grade}
          </span>
        </td>
        <td className="px-4 py-3 text-sm text-slate-200">{overallScore}</td>
        <td className="px-4 py-3 text-sm text-slate-200">{jdFitScore}%</td>
        <td className="px-4 py-3 text-sm text-slate-200">{candidate.jobTitle || ''}</td>
        <td className="px-4 py-3 text-sm text-slate-200 flex items-center justify-between">
          <span>{candidate.fileName || ''}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onExpand(candidate.id);
            }}
            className="text-blue-400 hover:text-blue-300 ml-2"
          >
            <i className={`fa-solid fa-chevron-down transition-transform duration-300 ${expandedCandidate === candidate.id ? 'rotate-180' : ''}`}></i>
          </button>
        </td>
      </tr>
      {expandedCandidate === candidate.id && candidate.status !== 'FAILED' && candidate.analysis && (
        <tr>
          <td colSpan={7} className="bg-slate-900/40 border-t border-slate-700/50">
            <ExpandedContent
              candidate={candidate}
              expandedCriteria={expandedCriteria}
              onToggleCriterion={onToggleCriterion}
            />
          </td>
        </tr>
      )}
    </React.Fragment>
  );
});


const AnalysisResults: React.FC<AnalysisResultsProps> = ({ isLoading, loadingMessage, results, jobPosition, locationRequirement, jdText, setActiveStep, markStepAsCompleted, activeStep = 'analysis', completedSteps = [], sidebarCollapsed = false }) => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'score' | 'jdFit'>('score');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set());
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);
  const [expandedCandidate, setExpandedCandidate] = useState<string | null>(null);
  const [expandedCriteria, setExpandedCriteria] = useState<Record<string, Record<string, boolean>>>({});
  const [showChatbot, setShowChatbot] = useState(false);
  const [showInterviewQuestions, setShowInterviewQuestions] = useState(false);
  // Removed manual save state & handler

  // Debounced search handler
  const debouncedSetSearchTerm = useCallback(
    debounce((value: string) => setDebouncedSearchTerm(value), 300),
    []
  );

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    debouncedSetSearchTerm(value);
  };

  const handleSelectCandidate = (candidateId: string, index: number, isShift: boolean = false) => {
    setSelectedCandidates(prev => {
      const newSet = new Set(prev);
      if (isShift && lastSelectedIndex !== null) {
        const start = Math.min(lastSelectedIndex, index);
        const end = Math.max(lastSelectedIndex, index);
        for (let i = start; i <= end; i++) {
          const id = filteredResults[i]?.id;
          if (id) newSet.add(id);
        }
      } else {
        if (newSet.has(candidateId)) {
          newSet.delete(candidateId);
        } else {
          newSet.add(candidateId);
        }
        setLastSelectedIndex(index);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    const allIds = filteredResults.map(c => c.id).filter(Boolean);
    setSelectedCandidates(prev => {
      if (prev.size === allIds.length) {
        return new Set();
      } else {
        return new Set(allIds);
      }
    });
  };

  const handleRemoveSelected = (candidateId: string) => {
    setSelectedCandidates(prev => {
      const newSet = new Set(prev);
      newSet.delete(candidateId);
      return newSet;
    });
  };

  const handleClearAllSelected = () => {
    if (window.confirm('Bạn có chắc muốn bỏ chọn tất cả ứng viên?')) {
      setSelectedCandidates(new Set());
    }
  };

  const handleExpandCandidate = (candidateId: string) => {
    setExpandedCandidate(expandedCandidate === candidateId ? null : candidateId);
  };

  const handleToggleCriterion = (candidateId: string, criterion: string) => {
    setExpandedCriteria(prev => ({
      ...prev,
      [candidateId]: {
        ...prev[candidateId],
        [criterion]: !prev[candidateId]?.[criterion]
      }
    }));
  };

  const exportSelectedToCSV = () => {
    if (selectedCandidates.size === 0) return;

    const selectedData = filteredResults.filter(c => selectedCandidates.has(c.id));
    const csvContent = [
      ['STT', 'HoTen', 'Hang', 'DiemTong', 'PhuHopJD%', 'ChucDanh', 'FileName', 'CandidateID'],
      ...selectedData.map((c, index) => [
        (index + 1).toString(),
        c.candidateName || '',
        c.status === 'FAILED' ? 'FAILED' : (c.analysis?.['Hạng'] || 'C'),
        c.status === 'FAILED' ? '0' : (c.analysis?.['Tổng điểm']?.toString() || '0'),
        c.status === 'FAILED' ? '0' : (parseInt(c.analysis?.['Chi tiết']?.find(i => i['Tiêu chí'].startsWith('Phù hợp JD'))?.['Điểm'].split('/')[0] || '0', 10)).toString(),
        c.jobTitle || '',
        c.fileName || '',
        c.id || ''
      ])
    ].map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n');

    // Thêm BOM để Excel nhận ra UTF-8
    const BOM = '\uFEFF';
    const csvWithBOM = BOM + csvContent;

    const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ung_vien_da_chon_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const summaryData = useMemo(() => {
    if (!results || results.length === 0) {
      return { total: 0, countA: 0, countB: 0, countC: 0 };
    }
    const successfulCandidates = results.filter(c => c.status === 'SUCCESS' && c.analysis);
    const countA = successfulCandidates.filter(c => c.analysis?.['Hạng'] === 'A').length;
    const countB = successfulCandidates.filter(c => c.analysis?.['Hạng'] === 'B').length;
    const countC = results.length - countA - countB; // Includes failed and grade C
    return {
      total: successfulCandidates.length,
      countA,
      countB,
      countC,
    };
  }, [results]);

  const analysisData = useMemo(() => {
    if (!results || results.length === 0) return null;
    return {
      timestamp: Date.now(),
      job: {
        position: jobPosition,
        locationRequirement: locationRequirement || 'Không có',
      },
      candidates: results.map((c, index) => ({
        ...c,
        id: c.id || `candidate-${index}-${c.fileName}-${c.candidateName}`.replace(/[^a-zA-Z0-9]/g, '-')
      })),
    };
  }, [results, jobPosition, locationRequirement]);

  const rankedAndSortedResults = useMemo((): RankedCandidate[] => {
    if (!results || results.length === 0) return [];
    const gradeValues: { [key: string]: number } = { 'A': 3, 'B': 2, 'C': 1, 'FAILED': 0 };
    const enrichedResults = results.map(c => ({
      ...c,
      jdFitScore: parseInt(c.analysis?.['Chi tiết']?.find(i => i['Tiêu chí'].startsWith('Phù hợp JD'))?.['Điểm'].split('/')[0] || '0', 10),
      gradeValue: gradeValues[c.status === 'FAILED' ? 'FAILED' : (c.analysis?.['Hạng'] || 'C')]
    }));
    enrichedResults.sort((a, b) => {
      const primaryDiff = sortBy === 'score' ? (b.analysis?.['Tổng điểm'] || 0) - (a.analysis?.['Tổng điểm'] || 0) : b.jdFitScore - a.jdFitScore;
      if (primaryDiff !== 0) return primaryDiff;
      const secondaryDiff = sortBy === 'score' ? b.jdFitScore - a.jdFitScore : (b.analysis?.['Tổng điểm'] || 0) - (a.analysis?.['Tổng điểm'] || 0);
      if (secondaryDiff !== 0) return secondaryDiff;
      return b.gradeValue - a.gradeValue;
    });
    return enrichedResults.map((c, index) => ({ ...c, rank: index + 1 }));
  }, [results, sortBy]);

  const filteredResults = useMemo(() => {
    let resultsToFilter = rankedAndSortedResults;
    if (debouncedSearchTerm) resultsToFilter = resultsToFilter.filter(c => (c.candidateName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())) || (c.jobTitle?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())));
    if (filter !== 'all') resultsToFilter = resultsToFilter.filter(c => c.status === 'FAILED' ? filter === 'C' : c.analysis?.['Hạng'] === filter);

    // Remove duplicates based on id
    const uniqueResults = resultsToFilter.filter((candidate, index, self) =>
      index === self.findIndex(c => c.id === candidate.id)
    );

    return uniqueResults;
  }, [rankedAndSortedResults, filter, debouncedSearchTerm]);

  const sidebarWidth = sidebarCollapsed ? 'md:left-[72px]' : 'md:left-64';
  const headerHeight = 'h-[101px] md:h-[148px]';

  if (isLoading) return <section id="module-analysis" className="module-pane active w-full h-full flex flex-col overflow-hidden bg-[#0B1120]"><Loader message={loadingMessage} /></section>;

  if (results.length === 0) return (
    <section id="module-analysis" className="module-pane active w-full h-full flex flex-col overflow-hidden bg-[#0B1120]">
      {/* Fixed Header for Empty State */}
      <div className={`fixed top-14 md:top-0 left-0 right-0 z-30 ${sidebarWidth} transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]`}>
        <div className={`bg-slate-900 border-b border-slate-800 flex flex-col ${headerHeight}`}>
          <div className="flex-1 flex items-center px-6 gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg flex-shrink-0">
              <i className="fa-solid fa-chart-pie text-lg"></i>
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-white leading-tight truncate">Kết quả phân tích</h2>
              <p className="text-xs text-slate-400 leading-tight truncate">Chưa có dữ liệu để hiển thị</p>
            </div>
          </div>
          <div className="px-6 pb-4">
            <ProgressBar activeStep={activeStep as any} completedSteps={completedSteps} />
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center py-16 md:py-20 pt-[156px] md:pt-[148px]">
        <div className="relative inline-block mb-6"><i className="fa-solid fa-chart-line text-5xl md:text-6xl text-slate-600 float-animation"></i><div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full pulse-animation"></div></div>
        <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-3">Sẵn Sàng Phân Tích</h3>
        <p className="text-slate-400 text-lg max-w-md mx-auto leading-relaxed">Kết quả AI sẽ xuất hiện ở đây sau khi bạn cung cấp mô tả công việc và các tệp CV.</p>
      </div>
    </section>
  );

  return (
    <>
      <section id="module-analysis" className="module-pane active w-full min-h-screen flex flex-col bg-[#0B1120]">
        {/* ─── FIXED HEADER BAR ─── */}
        <div className={`fixed top-14 md:top-0 left-0 right-0 z-30 ${sidebarWidth} transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]`}>
          <div className={`bg-slate-900 border-b border-slate-800 flex flex-col ${headerHeight}`}>
            <div className="flex-1 flex items-center px-6 gap-4">
              {/* Step badge + Title */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20 flex-shrink-0">
                  <span className="font-bold text-lg">4</span>
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg font-bold text-white leading-tight truncate">{analysisData?.job?.position || 'Kết quả phân tích'}</h2>
                  <p className="text-xs text-slate-400 leading-tight truncate">Phân tích chuyên sâu bởi AI</p>
                </div>
              </div>

              {/* Quick Stats for Header */}
              <div className="hidden lg:flex items-center gap-4 flex-shrink-0">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Tổng ứng viên</span>
                  <span className="text-sm font-bold text-white">{summaryData.total}</span>
                </div>
                <div className="w-px h-8 bg-slate-800"></div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-emerald-500 uppercase font-bold tracking-wider">Hạng A</span>
                  <span className="text-sm font-bold text-emerald-400">{summaryData.countA}</span>
                </div>
              </div>
            </div>

            {/* Integrated Progress Bar */}
            <div className="px-6 pb-4">
              <ProgressBar activeStep={activeStep as any} completedSteps={completedSteps} />
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col pt-[156px] md:pt-[148px] px-6 md:px-10 lg:px-16 py-6 space-y-6">
          {/* Summary header */}
          <div className="grid gap-4 xl:grid-cols-[2fr,1fr]">
            <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-5 sm:p-6 shadow-2xl shadow-black/30">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.35em] text-slate-500">Chiến dịch hiện tại</p>
                  <h2 className="text-2xl lg:text-3xl font-semibold text-white mt-1">{analysisData.job.position}</h2>
                  <p className="text-slate-400 text-sm mt-1">Phân tích lúc <span className="text-slate-200 font-semibold">{new Date(analysisData.timestamp).toLocaleString('vi-VN')}</span></p>
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-slate-300">
                  <span className="px-3 py-1.5 rounded-full border border-slate-800 bg-slate-900/70">Tổng CV: {summaryData.total}</span>
                  <span className="px-3 py-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-200">Hạng A: {summaryData.countA}</span>
                  <span className="px-3 py-1.5 rounded-full border border-blue-500/40 bg-blue-500/10 text-blue-200">Hạng B: {summaryData.countB}</span>
                  <span className="px-3 py-1.5 rounded-full border border-rose-500/40 bg-rose-500/10 text-rose-200">Hạng C/Lỗi: {summaryData.countC}</span>
                </div>
              </div>
            </div>
            <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-5 flex flex-col gap-3 justify-center shadow-2xl shadow-cyan-900/30">
              <button
                onClick={() => setShowInterviewQuestions(true)}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-900/40 transition hover:translate-y-[-1px]"
              >
                <i className="fa-solid fa-question-circle"></i>
                Gợi ý câu hỏi PV
              </button>
              <button
                onClick={() => {
                  if (setActiveStep) setActiveStep('dashboard');
                  if (markStepAsCompleted) markStepAsCompleted('analysis');
                  navigate('/detailed-analytics');
                }}
                className="w-full flex items-center justify-center gap-2 rounded-2xl border border-cyan-500/40 bg-slate-950/70 py-3 text-sm font-semibold text-cyan-200 transition hover:border-cyan-400 hover:text-white"
              >
                <i className="fa-solid fa-chart-line"></i>
                Thống Kê Chi Tiết
              </button>
            </div>
          </div>
          {/* KPI cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {[
              { label: 'Tổng CV Phân Tích', value: summaryData.total, accent: 'from-slate-800 via-slate-900 to-slate-950', text: 'text-white' },
              { label: 'Hạng A', value: summaryData.countA, accent: 'from-emerald-900/40 via-emerald-900/10 to-slate-950', text: 'text-emerald-300' },
              { label: 'Hạng B', value: summaryData.countB, accent: 'from-blue-900/40 via-blue-900/10 to-slate-950', text: 'text-sky-300' },
              { label: 'Hạng C/Lỗi', value: summaryData.countC, accent: 'from-rose-900/40 via-rose-900/10 to-slate-950', text: 'text-rose-300' }
            ].map((card) => (
              <div key={card.label} className={`rounded-3xl border border-white/5 bg-gradient-to-br ${card.accent} p-5 shadow-xl shadow-black/30`}>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{card.label}</p>
                <p className={`text-4xl font-semibold mt-3 ${card.text}`}>{card.value}</p>
              </div>
            ))}
          </div>

          {/* Filter bar */}
          <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-4 sm:p-5 shadow-inner shadow-black/30">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full lg:max-w-sm">
                <i className="fa-solid fa-magnifying-glass text-slate-500 absolute left-4 top-1/2 -translate-y-1/2"></i>
                <input
                  type="text"
                  placeholder="Tìm theo tên, chức danh..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-900/80 pl-12 pr-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { label: 'Tất cả', value: 'all', cls: 'bg-slate-900/70 text-slate-300' },
                  { label: 'Hạng A', value: 'A', cls: 'bg-emerald-500/10 text-emerald-200' },
                  { label: 'Hạng B', value: 'B', cls: 'bg-blue-500/10 text-blue-200' },
                  { label: 'Hạng C', value: 'C', cls: 'bg-amber-500/10 text-amber-200' },
                  { label: 'Lỗi', value: 'FAILED', cls: 'bg-rose-500/10 text-rose-200' }
                ].map((chip) => (
                  <button
                    key={chip.value}
                    onClick={() => setFilter(chip.value)}
                    className={`px-4 py-1.5 rounded-full border transition ${filter === chip.value ? 'border-cyan-400 text-white shadow-cyan-500/20' : 'border-slate-800 text-slate-400 hover:border-cyan-500/30'} ${chip.cls}`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <span className="text-slate-500">Sắp xếp</span>
                <div className="relative">
                  <select
                    id="sort-by"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'score' | 'jdFit')}
                    className="appearance-none rounded-full border border-slate-800 bg-slate-900/80 py-2 pl-4 pr-10 font-semibold text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30"
                  >
                    <option value="score">Điểm Tổng</option>
                    <option value="jdFit">Phù hợp JD</option>
                  </select>
                  <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500"></i>
                </div>
              </div>
            </div>
          </div>

          {/* Results table */}
          <div className="rounded-3xl border border-slate-900 bg-slate-950/70 shadow-2xl shadow-black/50 overflow-hidden">
            <div className="hidden md:block max-h-[70vh] overflow-y-auto results-container">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10 bg-slate-900/90 backdrop-blur">
                  <tr className="text-slate-300">
                    <th className="px-5 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedCandidates.size === filteredResults.length && filteredResults.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-slate-600 bg-slate-900 text-cyan-400 focus:ring-cyan-500"
                      />
                    </th>
                    <th className="px-5 py-3 text-left font-semibold">Họ tên</th>
                    <th className="px-5 py-3 text-left font-semibold">Hạng</th>
                    <th className="px-5 py-3 text-left font-semibold">Điểm</th>
                    <th className="px-5 py-3 text-left font-semibold">Phù hợp JD</th>
                    <th className="px-5 py-3 text-left font-semibold">File</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.map((candidate, index) => {
                    const isSelected = selectedCandidates.has(candidate.id);
                    const grade = candidate.status === 'FAILED' ? 'FAILED' : (candidate.analysis?.['Hạng'] || 'C');
                    const overallScore = candidate.status === 'FAILED' ? 0 : (candidate.analysis?.['Tổng điểm'] || 0);
                    const jdFitScore = candidate.status === 'FAILED' ? 0 : parseInt(candidate.analysis?.['Chi tiết']?.find(i => i['Tiêu chí'].startsWith('Phù hợp JD'))?.['Điểm'].split('/')[0] || '0', 10);

                    return (
                      <React.Fragment key={candidate.id}>
                        <tr
                          className={`border-t border-slate-800/80 ${isSelected ? 'bg-cyan-500/5' : 'hover:bg-slate-900/60'} cursor-pointer transition-colors duration-150`}
                          onClick={(e) => {
                            if ((e.target as HTMLInputElement).type !== 'checkbox') {
                              handleExpandCandidate(candidate.id);
                            }
                          }}
                        >
                          <td className="px-5 py-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleSelectCandidate(candidate.id, index);
                              }}
                              className="rounded border-slate-600 bg-slate-900 text-cyan-400 focus:ring-cyan-500"
                            />
                          </td>
                          <td className="px-5 py-3 font-medium text-slate-100">{candidate.candidateName || 'Chưa xác định'}</td>
                          <td className="px-5 py-3">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${candidate.status === 'FAILED'
                              ? 'bg-slate-800 text-slate-400'
                              : grade === 'A'
                                ? 'bg-emerald-500/15 text-emerald-300'
                                : grade === 'B'
                                  ? 'bg-sky-500/15 text-sky-300'
                                  : 'bg-rose-500/15 text-rose-300'
                              }`}>
                              {grade}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-slate-100">{overallScore}</td>
                          <td className="px-5 py-3 text-slate-100">{jdFitScore}%</td>
                          <td className="px-5 py-3 text-slate-200 flex items-center justify-between gap-3">
                            <span className="truncate">{candidate.fileName || ''}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleExpandCandidate(candidate.id);
                              }}
                              className="text-cyan-400 hover:text-white"
                            >
                              <i className={`fa-solid fa-chevron-down transition-transform duration-300 ${expandedCandidate === candidate.id ? 'rotate-180' : ''}`}></i>
                            </button>
                          </td>
                        </tr>
                        {expandedCandidate === candidate.id && candidate.status !== 'FAILED' && candidate.analysis && (
                          <tr className="expanded-content">
                            <td colSpan={6} className="bg-slate-950 border-t border-slate-900/80">
                              <ExpandedContent
                                candidate={candidate}
                                expandedCriteria={expandedCriteria}
                                onToggleCriterion={handleToggleCriterion}
                                jdText={jdText}
                              />
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                  {filteredResults.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-slate-500">
                        <i className="fa-solid fa-ghost text-4xl mb-4"></i>
                        <p>Không có ứng viên nào khớp với bộ lọc của bạn.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden max-h-[70vh] overflow-y-auto p-4 space-y-4 results-container">
              {filteredResults.map((candidate, index) => {
                const isSelected = selectedCandidates.has(candidate.id);
                const grade = candidate.status === 'FAILED' ? 'FAILED' : (candidate.analysis?.['Hạng'] || 'C');
                const overallScore = candidate.status === 'FAILED' ? 0 : (candidate.analysis?.['Tổng điểm'] || 0);
                const jdFitScore = candidate.status === 'FAILED' ? 0 : parseInt(candidate.analysis?.['Chi tiết']?.find(i => i['Tiêu chí'].startsWith('Phù hợp JD'))?.['Điểm'].split('/')[0] || '0', 10);

                return (
                  <div key={candidate.id} className={`rounded-xl border ${isSelected ? 'border-cyan-500/50 bg-cyan-500/5' : 'border-slate-800 bg-slate-900/40'} p-4 transition-all`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleSelectCandidate(candidate.id, index);
                          }}
                          className="rounded border-slate-600 bg-slate-900 text-cyan-400 focus:ring-cyan-500 w-5 h-5"
                        />
                        <div className="min-w-0">
                          <h4 className="font-semibold text-slate-200 text-base truncate max-w-[180px]">{candidate.candidateName || 'Chưa xác định'}</h4>
                          <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[180px]">{candidate.jobTitle || 'Chưa có chức danh'}</p>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold shrink-0 ${candidate.status === 'FAILED'
                        ? 'bg-slate-800 text-slate-400'
                        : grade === 'A'
                          ? 'bg-emerald-500/15 text-emerald-300'
                          : grade === 'B'
                            ? 'bg-sky-500/15 text-sky-300'
                            : 'bg-rose-500/15 text-rose-300'
                        }`}>
                        {grade}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="bg-slate-950/50 rounded-lg p-2 border border-slate-800/50">
                        <p className="text-xs text-slate-500 mb-1">Điểm tổng</p>
                        <p className="text-lg font-semibold text-slate-200">{overallScore}</p>
                      </div>
                      <div className="bg-slate-950/50 rounded-lg p-2 border border-slate-800/50">
                        <p className="text-xs text-slate-500 mb-1">Phù hợp JD</p>
                        <p className="text-lg font-semibold text-slate-200">{jdFitScore}%</p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between pt-3 border-t border-slate-800/50">
                      <span className="text-xs text-slate-500 truncate max-w-[150px]">{candidate.fileName}</span>
                      <button
                        onClick={() => handleExpandCandidate(candidate.id)}
                        className="flex items-center gap-1 text-xs font-medium text-cyan-400 hover:text-cyan-300 px-2 py-1 rounded hover:bg-cyan-500/10 transition-colors"
                      >
                        {expandedCandidate === candidate.id ? 'Thu gọn' : 'Chi tiết'}
                        <i className={`fa-solid fa-chevron-down transition-transform duration-300 ${expandedCandidate === candidate.id ? 'rotate-180' : ''}`}></i>
                      </button>
                    </div>

                    {expandedCandidate === candidate.id && candidate.status !== 'FAILED' && candidate.analysis && (
                      <div className="mt-4 pt-4 border-t border-slate-800">
                        <ExpandedContent
                          candidate={candidate}
                          expandedCriteria={expandedCriteria}
                          onToggleCriterion={handleToggleCriterion}
                          jdText={jdText}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
              {filteredResults.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  <i className="fa-solid fa-ghost text-4xl mb-4"></i>
                  <p>Không có ứng viên nào khớp với bộ lọc của bạn.</p>
                </div>
              )}
            </div>
          </div>

          {selectedCandidates.size > 0 && (
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-200">Ứng viên đã chọn ({selectedCandidates.size})</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={exportSelectedToCSV}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-semibold rounded-full transition-colors"
                  >
                    <i className="fa-solid fa-file-csv"></i>
                    Xuất CSV đã chọn
                  </button>
                  <button
                    onClick={handleClearAllSelected}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-full transition-colors"
                  >
                    <i className="fa-solid fa-trash"></i>
                    Xoá tất cả
                  </button>
                </div>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {filteredResults.filter(c => selectedCandidates.has(c.id)).map(candidate => {
                  const grade = candidate.status === 'FAILED' ? 'FAILED' : (candidate.analysis?.['Hạng'] || 'C');
                  const overallScore = candidate.status === 'FAILED' ? 0 : (candidate.analysis?.['Tổng điểm'] || 0);
                  const jdFitScore = candidate.status === 'FAILED' ? 0 : parseInt(candidate.analysis?.['Chi tiết']?.find(i => i['Tiêu chí'].startsWith('Phù hợp JD'))?.['Điểm'].split('/')[0] || '0', 10);

                  return (
                    <div key={candidate.id} className="flex items-center justify-between bg-slate-700/50 p-3 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-slate-400">{candidate.candidateName || 'Chưa xác định'}</span>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${candidate.status === 'FAILED' ? 'bg-slate-600 text-slate-400' :
                          grade === 'A' ? 'bg-emerald-600 text-emerald-400' :
                            grade === 'B' ? 'bg-blue-600 text-blue-400' :
                              'bg-red-600 text-red-400'
                          }`}>
                          {grade}
                        </span>
                        <span className="text-sm text-slate-400">{overallScore} / {jdFitScore}%</span>
                        <span className="text-sm text-slate-500">{candidate.jobTitle || ''}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveSelected(candidate.id)}
                        className="text-red-400 hover:text-red-300 text-sm underline"
                      >
                        Bỏ chọn
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Chatbot Button */}
      {analysisData && (
        <button
          onClick={() => setShowChatbot(!showChatbot)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 z-50 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-500/40"
          aria-label="Mở trợ lý AI"
          title="Trợ lý AI - Hỏi về ứng viên"
        >
          <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center">
            <i className="fa-solid fa-robot text-white text-xl"></i>
          </div>
        </button>
      )}

      {/* Chatbot Panel */}
      {showChatbot && analysisData && (
        <div className="fixed bottom-20 right-6 w-96 max-w-[calc(100vw-2rem)] z-40">
          <ChatbotPanel
            analysisData={analysisData}
            onClose={() => setShowChatbot(false)}
          />
        </div>
      )}

      {/* Interview Questions Modal */}
      {showInterviewQuestions && analysisData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <InterviewQuestionGenerator
              analysisData={analysisData}
              selectedCandidates={Array.from(selectedCandidates).map(id =>
                results.find(c => c.id === id)!
              ).filter(Boolean)}
              onClose={() => setShowInterviewQuestions(false)}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default AnalysisResults;
