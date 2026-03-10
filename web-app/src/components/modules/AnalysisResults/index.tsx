import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import debounce from 'lodash.debounce';
import type { Candidate, DetailedScore, AppStep } from '../../../types';
import ExpandedContent from '../ExpandedContent';
import ChatbotPanel from '../ChatbotPanel';
import InterviewQuestionGenerator from '../InterviewQuestionGenerator';
import ProgressBar from '../../ui/ProgressBar';
import Loader from '../../ui/Loader';
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

// --- Sub-components for Redesigned UI ---

const CampaignHeader: React.FC<{
  position: string;
  total: number;
  countA: number;
  countB: number;
  countC: number;
  onQuestionsClick: () => void;
  onStatsClick: () => void;
}> = ({ position, total, countA, countB, countC, onQuestionsClick, onStatsClick }) => (
  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between bg-[#111827] p-5 rounded-2xl border border-[#1F2937] shadow-lg">
    <div className="min-w-0">
      <h2 className="text-xl font-bold text-white truncate">{position}</h2>
      <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
        <span>CV: <span className="text-white font-semibold">{total}</span></span>
        <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
        <span>A: <span className="text-emerald-400 font-semibold">{countA}</span></span>
        <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
        <span>B: <span className="text-blue-400 font-semibold">{countB}</span></span>
        <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
        <span>C: <span className="text-rose-400 font-semibold">{countC}</span></span>
      </div>
    </div>
    <div className="flex gap-2 shrink-0">
      <button
        onClick={onQuestionsClick}
        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-blue-900/20"
      >
        Gợi ý câu hỏi PV
      </button>
      <button
        onClick={onStatsClick}
        className="px-4 py-2 bg-[#1F2937] hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-xl border border-slate-700 transition-all"
      >
        Thống kê chi tiết
      </button>
    </div>
  </div>
);

const FilterBar: React.FC<{
  searchTerm: string;
  onSearchChange: (val: string) => void;
  filter: string;
  onFilterChange: (val: string) => void;
  sortBy: string;
  onSortChange: (val: 'score' | 'jdFit') => void;
}> = ({ searchTerm, onSearchChange, filter, onFilterChange, sortBy, onSortChange }) => (
  <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[#0B1220] py-4">
    <div className="relative w-full md:max-w-xs">
      <i className="fa-solid fa-magnifying-glass text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 text-sm"></i>
      <input
        type="text"
        placeholder="Search candidate..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full bg-[#111827] border border-[#1F2937] rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
      />
    </div>
    <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 w-full md:w-auto no-scrollbar">
      {[
        { label: 'All', value: 'all' },
        { label: 'A', value: 'A' },
        { label: 'B', value: 'B' },
        { label: 'C', value: 'C' },
        { label: 'Error', value: 'FAILED' }
      ].map((btn) => (
        <button
          key={btn.value}
          onClick={() => onFilterChange(btn.value)}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all border ${filter === btn.value
            ? 'bg-blue-500/10 border-blue-500/50 text-blue-400'
            : 'bg-[#111827] border-[#1F2937] text-slate-400 hover:border-slate-600'
            }`}
        >
          {btn.label}
        </button>
      ))}
    </div>
    <div className="flex items-center gap-2 shrink-0">
      <span className="text-xs text-slate-500">Sort by:</span>
      <select
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value as 'score' | 'jdFit')}
        className="bg-[#111827] border border-[#1F2937] text-slate-200 text-sm rounded-xl px-3 py-1.5 focus:border-blue-500 outline-none cursor-pointer hover:bg-slate-800"
      >
        <option value="score">Score ▼</option>
        <option value="jdFit">JD Fit ▼</option>
      </select>
    </div>
  </div>
);

type RankedCandidate = Candidate & { rank: number; jdFitScore: number; gradeValue: number };


const CandidateRow: React.FC<{
  candidate: RankedCandidate;
  isSelected: boolean;
  onSelect: () => void;
  onDetail: () => void;
}> = ({ candidate, isSelected, onSelect, onDetail }) => {
  const grade = candidate.status === 'FAILED' ? 'FAILED' : (candidate.analysis?.['Hạng'] || 'C');
  const overallScore = candidate.status === 'FAILED' ? 0 : (candidate.analysis?.['Tổng điểm'] || 0);
  const jdFitScore = candidate.status === 'FAILED' ? 0 : parseInt(candidate.analysis?.['Chi tiết']?.find(i => i['Tiêu chí'].startsWith('Phù hợp JD'))?.['Điểm'].split('/')[0] || '0', 10);

  return (
    <tr className={`border-b border-[#1F2937] hover:bg-[#1F2937]/50 transition-colors group cursor-pointer`} onClick={onDetail}>
      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className="rounded border-[#1F2937] bg-[#0B1220] text-blue-500 focus:ring-blue-500 w-4 h-4 cursor-pointer"
        />
      </td>
      <td className="px-4 py-3 text-sm font-medium text-slate-200">{candidate.candidateName || 'Chưa xác định'}</td>
      <td className="px-4 py-3">
        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${grade === 'A' ? 'bg-emerald-500/10 text-emerald-400' :
          grade === 'B' ? 'bg-blue-500/10 text-blue-400' :
            grade === 'C' ? 'bg-amber-500/10 text-amber-400' :
              'bg-red-500/10 text-red-400'
          }`}>
          {grade}
        </span>
      </td>
      <td className="px-4 py-3 text-sm font-semibold text-white">{overallScore}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-300">{jdFitScore}%</span>
          <div className="w-12 h-1 bg-slate-800 rounded-full overflow-hidden hidden sm:block">
            <div
              className={`h-full ${jdFitScore >= 70 ? 'bg-emerald-500' : jdFitScore >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
              style={{ width: `${jdFitScore}%` }}
            />
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-xs text-slate-500 truncate max-w-[120px]">{candidate.fileName}</td>
      <td className="px-4 py-3 text-right">
        <button
          onClick={(e) => { e.stopPropagation(); onDetail(); }}
          className="text-blue-500 hover:text-blue-400 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity"
        >
          Chi tiết
        </button>
      </td>
    </tr>
  );
};

const CandidateTable: React.FC<{
  candidates: RankedCandidate[];
  selectedIds: Set<string>;
  onSelectAll: () => void;
  onSelectOne: (id: string, index: number) => void;
  onDetail: (candidate: RankedCandidate) => void;
}> = ({ candidates, selectedIds, onSelectAll, onSelectOne, onDetail }) => (
  <div className="bg-[#111827] rounded-2xl border border-[#1F2937] shadow-xl overflow-hidden">
    <div className="overflow-x-auto overflow-y-auto max-h-[60vh] custom-scrollbar">
      <table className="w-full text-left border-collapse">
        <thead className="sticky top-0 bg-[#111827] z-10 border-b border-[#1F2937]">
          <tr className="text-slate-500 text-[11px] uppercase tracking-wider">
            <th className="px-4 py-3 w-10">
              <input
                type="checkbox"
                checked={candidates.length > 0 && selectedIds.size === candidates.length}
                onChange={onSelectAll}
                className="rounded border-[#1F2937] bg-[#0B1220] text-blue-500 focus:ring-blue-500 w-4 h-4 cursor-pointer"
              />
            </th>
            <th className="px-4 py-3 font-semibold">Họ tên</th>
            <th className="px-4 py-3 font-semibold">Hạng</th>
            <th className="px-4 py-3 font-semibold">Điểm</th>
            <th className="px-4 py-3 font-semibold">Phù hợp JD</th>
            <th className="px-4 py-3 font-semibold">File</th>
            <th className="px-4 py-3 font-semibold text-right text-transparent">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1F2937]/50">
          {candidates.map((c, idx) => (
            <CandidateRow
              key={c.id}
              candidate={c}
              isSelected={selectedIds.has(c.id)}
              onSelect={() => onSelectOne(c.id, idx)}
              onDetail={() => onDetail(c)}
            />
          ))}
          {candidates.length === 0 && (
            <tr><td colSpan={7} className="px-4 py-12 text-center text-slate-500 italic">No candidates found matching your criteria.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);


const CandidateDetailModal: React.FC<{
  candidate: RankedCandidate | null;
  onClose: () => void;
  jdText: string;
}> = ({ candidate, onClose, jdText }) => {
  const [currentPage, setCurrentPage] = useState(1);

  if (!candidate) return null;

  const overallScore = candidate.status === 'FAILED' ? 0 : (candidate.analysis?.['Tổng điểm'] || 0);
  const jdFitScore = candidate.status === 'FAILED' ? 0 : parseInt(candidate.analysis?.['Chi tiết']?.find(i => i['Tiêu chí'].startsWith('Phù hợp JD'))?.['Điểm'].split('/')[0] || '0', 10);
  const grade = candidate.status === 'FAILED' ? 'FAILED' : (candidate.analysis?.['Hạng'] || 'C');

  const goToNext = () => setCurrentPage(2);
  const goToBack = () => setCurrentPage(1);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#0B1220]/80 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-5xl h-[85vh] bg-[#111827] border border-[#1F2937] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#1F2937] shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-white">Candidate Analysis</h2>
            <p className="text-slate-400 text-sm mt-1">{candidate.candidateName}</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-[#1F2937] text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        {/* Body Container with Pages */}
        <div className="flex-1 relative overflow-hidden">
          {/* Page 1: Summary */}
          <div 
            className={`absolute inset-0 transition-transform duration-500 ease-in-out p-6 overflow-y-auto custom-scrollbar ${
              currentPage === 1 ? 'translate-x-0' : '-translate-x-full opacity-0'
            }`}
          >
            <div className="grid grid-cols-1 lg:grid-cols-[1fr,2fr] gap-8">
              {/* Left Column: Basic Info & Recommendation */}
              <div className="space-y-6">
                <div className="p-6 bg-[#0B1220] rounded-2xl border border-[#1F2937]">
                  <div className="flex items-center justify-between mb-6">
                    <div className="text-center flex-1 border-r border-[#1F2937]">
                      <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Overall Score</p>
                      <p className="text-4xl font-bold text-white mt-1">{overallScore}</p>
                    </div>
                    <div className="text-center flex-1 border-r border-[#1F2937]">
                      <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Rank</p>
                      <span className={`inline-block mt-2 px-3 py-1 rounded-lg text-sm font-bold ${grade === 'A' ? 'bg-emerald-500/10 text-emerald-400' :
                        grade === 'B' ? 'bg-blue-500/10 text-blue-400' :
                          'bg-amber-500/10 text-amber-400'
                        }`}>
                        {grade}
                      </span>
                    </div>
                    <div className="text-center flex-1">
                      <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Match JD</p>
                      <p className="text-2xl font-bold text-blue-400 mt-1">{jdFitScore}%</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Position</p>
                      <p className="text-sm font-medium text-slate-200">{candidate.jobTitle || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">File Name</p>
                      <p className="text-sm font-medium text-slate-200 truncate">{candidate.fileName}</p>
                    </div>
                  </div>
                </div>

                <div className="p-5 bg-blue-500/5 rounded-2xl border border-blue-500/20">
                  <h4 className="text-sm font-bold text-blue-400 flex items-center gap-2 mb-3">
                    <i className="fa-solid fa-robot"></i>
                    AI Recommendation
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed italic">
                    "{overallScore >= 70 ? 'Highly recommended candidate with strong alignment to project requirements.' :
                      overallScore >= 50 ? 'Potential candidate with relevant skills, recommended for secondary review.' :
                        'Limited alignment with current JD requirements.'}"
                  </p>
                </div>
              </div>

              {/* Right Column: AI Summary Sections */}
              <div className="space-y-6">
                <ExpandedContent
                  candidate={candidate}
                  expandedCriteria={{}}
                  onToggleCriterion={() => { }}
                  jdText={jdText}
                  viewMode="summary"
                />
              </div>
            </div>
          </div>

          {/* Page 2: Detailed Analysis */}
          <div 
            className={`absolute inset-0 transition-transform duration-500 ease-in-out p-6 overflow-y-auto custom-scrollbar ${
              currentPage === 2 ? 'translate-x-0' : 'translate-x-full opacity-0'
            }`}
          >
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center text-cyan-400">
                  <i className="fa-solid fa-magnifying-glass-chart text-xl"></i>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Detailed Analysis</h3>
                  <p className="text-xs text-slate-500">Breakdown of scoring criteria and evidence in CV</p>
                </div>
              </div>
              
              <ExpandedContent
                candidate={candidate}
                expandedCriteria={{ [candidate.id]: { 'Phù hợp JD (Job Fit)': true } }}
                onToggleCriterion={(cid, crit) => {
                  // Local toggle hack for detail view if needed, or just use the parent's logic
                  // For now, keep it simple as the user didn't ask for state persist here
                }}
                jdText={jdText}
                viewMode="details"
              />
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-4 border-t border-[#1F2937] bg-[#111827] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className={`w-2 h-2 rounded-full transition-all duration-300 ${currentPage === 1 ? 'w-6 bg-blue-500' : 'bg-slate-700'}`}></div>
              <div className={`w-2 h-2 rounded-full transition-all duration-300 ${currentPage === 2 ? 'w-6 bg-blue-500' : 'bg-slate-700'}`}></div>
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2">Page {currentPage} / 2</span>
          </div>

          <div className="flex gap-3">
            {currentPage === 2 ? (
              <button
                onClick={goToBack}
                className="px-5 py-2 rounded-xl bg-[#1F2937] hover:bg-slate-700 text-slate-200 text-sm font-bold flex items-center gap-2 transition-all border border-slate-700"
              >
                <i className="fa-solid fa-arrow-left"></i>
                Back
              </button>
            ) : null}

            {currentPage === 1 ? (
              <button
                onClick={goToNext}
                className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-900/20"
              >
                Next
                <i className="fa-solid fa-arrow-right"></i>
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold flex items-center gap-2 transition-all"
              >
                Done
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
const AnalysisResults: React.FC<AnalysisResultsProps> = ({ isLoading, loadingMessage, results, jobPosition, locationRequirement, jdText, setActiveStep, markStepAsCompleted, activeStep = 'analysis', completedSteps = [], sidebarCollapsed = false }) => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'score' | 'jdFit'>('score');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedCandidateForModal, setSelectedCandidateForModal] = useState<RankedCandidate | null>(null);
  const [showChatbot, setShowChatbot] = useState(false);
  const [showInterviewQuestions, setShowInterviewQuestions] = useState(false);

  const debouncedSetSearchTerm = useCallback(
    debounce((value: string) => setDebouncedSearchTerm(value), 300),
    []
  );

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    debouncedSetSearchTerm(value);
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredResults.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filteredResults.map(c => c.id)));
  };

  const exportSelectedToCSV = () => {
    if (selectedIds.size === 0) return;
    const selectedData = filteredResults.filter(c => selectedIds.has(c.id));
    const csvContent = [
      ['STT', 'HoTen', 'Hang', 'DiemTong', 'PhuHopJD%', 'ChucDanh', 'FileName'],
      ...selectedData.map((c, index) => [
        (index + 1).toString(),
        c.candidateName || '',
        c.status === 'FAILED' ? 'FAILED' : (c.analysis?.['Hạng'] || 'C'),
        c.status === 'FAILED' ? '0' : (c.analysis?.['Tổng điểm']?.toString() || '0'),
        c.status === 'FAILED' ? '0' : (parseInt(c.analysis?.['Chi tiết']?.find(i => i['Tiêu chí'].startsWith('Phù hợp JD'))?.['Điểm'].split('/')[0] || '0', 10)).toString(),
        c.jobTitle || '',
        c.fileName || ''
      ])
    ].map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `candidates_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const summaryData = useMemo(() => {
    if (!results) return { total: 0, countA: 0, countB: 0, countC: 0 };
    const success = results.filter(c => c.status === 'SUCCESS' && c.analysis);
    const countA = success.filter(c => c.analysis?.['Hạng'] === 'A').length;
    const countB = success.filter(c => c.analysis?.['Hạng'] === 'B').length;
    return { total: results.length, countA, countB, countC: results.length - countA - countB };
  }, [results]);

  const rankedAndSortedResults = useMemo((): RankedCandidate[] => {
    if (!results) return [];
    const gradeValues: Record<string, number> = { 'A': 3, 'B': 2, 'C': 1, 'FAILED': 0 };
    const enriched = results.map(c => ({
      ...c,
      id: c.id || `c-${Math.random()}`,
      jdFitScore: parseInt(c.analysis?.['Chi tiết']?.find(i => i['Tiêu chí'].startsWith('Phù hợp JD'))?.['Điểm'].split('/')[0] || '0', 10),
      gradeValue: gradeValues[c.status === 'FAILED' ? 'FAILED' : (c.analysis?.['Hạng'] || 'C')]
    }));
    return enriched.sort((a, b) => {
      const valA = sortBy === 'score' ? (a.analysis?.['Tổng điểm'] || 0) : a.jdFitScore;
      const valB = sortBy === 'score' ? (b.analysis?.['Tổng điểm'] || 0) : b.jdFitScore;
      return valB - valA;
    }).map((c, i) => ({ ...c, rank: i + 1 }));
  }, [results, sortBy]);

  const filteredResults = useMemo(() => {
    return rankedAndSortedResults.filter(c => {
      const matchesSearch = !debouncedSearchTerm ||
        c.candidateName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        c.jobTitle?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      const matchesFilter = filter === 'all' ||
        (c.status === 'FAILED' ? filter === 'FAILED' : c.analysis?.['Hạng'] === filter);
      return matchesSearch && matchesFilter;
    });
  }, [rankedAndSortedResults, debouncedSearchTerm, filter]);

  const analysisData = useMemo(() => {
    if (!results?.length) return null;
    return {
      timestamp: Date.now(),
      job: { position: jobPosition, locationRequirement: locationRequirement || 'N/A' },
      candidates: results,
    };
  }, [results, jobPosition, locationRequirement]);

  if (isLoading) return <section className="w-full h-screen bg-[#0B1220] flex items-center justify-center"><Loader message={loadingMessage} /></section>;

  if (!results?.length) return (
    <section className="w-full h-screen bg-[#0B1220] flex flex-col items-center justify-center text-center p-6">
      <div className="w-20 h-20 bg-[#111827] border border-[#1F2937] rounded-3xl flex items-center justify-center mb-6 text-slate-500 shadow-xl">
        <i className="fa-solid fa-chart-line text-3xl"></i>
      </div>
      <h3 className="text-2xl font-bold text-white mb-2">Ready for Analysis</h3>
      <p className="text-slate-400 max-w-sm">Results will appear here after you upload CVs and provide a JD.</p>
    </section>
  );

  return (
    <div className="w-full min-h-screen bg-[#0B1220] p-4 md:p-8 space-y-6">
      <div className="space-y-4">
        <CampaignHeader
          position={jobPosition}
          total={summaryData.total}
          countA={summaryData.countA}
          countB={summaryData.countB}
          countC={summaryData.countC}
          onQuestionsClick={() => setShowInterviewQuestions(true)}
          onStatsClick={() => {
            if (setActiveStep) setActiveStep('dashboard');
            if (markStepAsCompleted) markStepAsCompleted('analysis');
            navigate('/detailed-analytics');
          }}
        />
        <div className="px-2">
          <ProgressBar activeStep={activeStep as any} completedSteps={completedSteps} />
        </div>
      </div>

      <FilterBar
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        filter={filter}
        onFilterChange={setFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      <CandidateTable
        candidates={filteredResults}
        selectedIds={selectedIds}
        onSelectAll={handleSelectAll}
        onSelectOne={handleSelectOne}
        onDetail={(c) => setSelectedCandidateForModal(c)}
      />

      {selectedIds.size > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#111827] border border-blue-500/30 p-4 rounded-full shadow-2xl flex items-center gap-6 z-40 animate-in slide-in-from-bottom-4">
          <span className="text-sm text-slate-300 font-medium ml-2">{selectedIds.size} candidates selected</span>
          <div className="flex gap-2">
            <button onClick={exportSelectedToCSV} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-full transition-colors">Export CSV</button>
            <button onClick={() => setSelectedIds(new Set())} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-bold rounded-full transition-colors">Clear</button>
          </div>
        </div>
      )}

      <CandidateDetailModal
        candidate={selectedCandidateForModal}
        onClose={() => setSelectedCandidateForModal(null)}
        jdText={jdText}
      />

      {/* AI Assistant Button */}
      {analysisData && (
        <button
          onClick={() => setShowChatbot(!showChatbot)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-2xl flex items-center justify-center transition-all z-50 hover:scale-110"
        >
          <i className="fa-solid fa-robot text-xl"></i>
        </button>
      )}

      {showChatbot && analysisData && (
        <div className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] z-50">
          <ChatbotPanel analysisData={analysisData} onClose={() => setShowChatbot(false)} />
        </div>
      )}

      {showInterviewQuestions && analysisData && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[70] flex items-center justify-center p-4">
          <div className="w-full max-w-5xl max-h-[90vh] bg-[#111827] rounded-3xl overflow-hidden shadow-2xl">
            <InterviewQuestionGenerator
              analysisData={analysisData}
              selectedCandidates={Array.from(selectedIds).map(id => results.find(c => c.id === id)!).filter(Boolean)}
              onClose={() => setShowInterviewQuestions(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisResults;
