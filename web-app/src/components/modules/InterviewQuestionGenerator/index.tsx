import React, { useState, useMemo } from 'react';
import type { AnalysisRunData, Candidate } from '../../../types';
import { generateInterviewQuestions } from '../../../services/ai/interviewQuestionService';

interface InterviewQuestionGeneratorProps {
  analysisData: AnalysisRunData;
  selectedCandidates?: Candidate[];
  onClose?: () => void;
}

interface QuestionSet {
  category: string;
  icon: string;
  color: string;
  questions: string[];
}

const InterviewQuestionGenerator: React.FC<InterviewQuestionGeneratorProps> = ({
  analysisData,
  selectedCandidates = [],
  onClose
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [questionSets, setQuestionSets] = useState<QuestionSet[]>([]);
  const [selectedType, setSelectedType] = useState<'general' | 'specific' | 'comparative'>('general');
  const [selectedCandidate, setSelectedCandidate] = useState<string>('');

  // Lấy thông tin tổng hợp từ dữ liệu phân tích
  const analysisStats = useMemo(() => {
    const candidates = analysisData.candidates.filter(c => c.status === 'SUCCESS');
    const industries = [...new Set(candidates.map(c => c.industry).filter(Boolean))];
    const levels = [...new Set(candidates.map(c => c.experienceLevel).filter(Boolean))];
    const topCandidates = candidates
      .filter(c => c.analysis?.['Hạng'] === 'A')
      .slice(0, 5);

    // Tìm điểm yếu phổ biến
    const commonWeaknesses = new Map<string, number>();
    candidates.forEach(c => {
      c.analysis?.['Điểm yếu CV']?.forEach(weakness => {
        commonWeaknesses.set(weakness, (commonWeaknesses.get(weakness) || 0) + 1);
      });
    });

    // Tìm kỹ năng thiếu phổ biến từ Chi tiết điểm
    const skillGaps = new Map<string, number>();
    candidates.forEach(c => {
      c.analysis?.['Chi tiết']?.forEach(detail => {
        const score = parseFloat(detail['Điểm'].split('/')[0]);
        const maxScore = parseFloat(detail['Điểm'].split('/')[1]);
        const percentage = (score / maxScore) * 100;

        if (percentage < 50) { // Điểm yếu nếu dưới 50%
          skillGaps.set(detail['Tiêu chí'], (skillGaps.get(detail['Tiêu chí']) || 0) + 1);
        }
      });
    });

    return {
      jobPosition: analysisData.job.position,
      totalCandidates: candidates.length,
      industries: industries.slice(0, 3), // Top 3 ngành
      levels: levels.slice(0, 3), // Top 3 level
      topCandidates,
      commonWeaknesses: Array.from(commonWeaknesses.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([weakness]) => weakness),
      skillGaps: Array.from(skillGaps.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([skill]) => skill)
    };
  }, [analysisData]);

  const generateQuestions = async () => {
    setIsLoading(true);
    try {
      let candidateData = null;

      if (selectedType === 'specific' && selectedCandidate) {
        candidateData = analysisData.candidates.find(c => c.id === selectedCandidate);
      } else if (selectedType === 'comparative' && selectedCandidates.length > 0) {
        candidateData = selectedCandidates;
      }

      const questions = await generateInterviewQuestions(
        analysisData,
        analysisStats,
        selectedType,
        candidateData
      );

      setQuestionSets(questions);
    } catch (error) {
      console.error('Error generating questions:', error);
      // Fallback questions nếu AI không khả dụng
      setQuestionSets(getFallbackQuestions());
    } finally {
      setIsLoading(false);
    }
  };

  const getFallbackQuestions = (): QuestionSet[] => {
    const { jobPosition, industries, commonWeaknesses } = analysisStats;

    return [
      {
        category: 'Câu hỏi chung về vị trí',
        icon: 'fa-solid fa-briefcase',
        color: 'text-blue-400',
        questions: [
          `Bạn hiểu như thế nào về vai trò ${jobPosition} trong tổ chức?`,
          `Những thách thức lớn nhất mà một ${jobPosition} thường gặp phải là gì?`,
          `Bạn có kinh nghiệm gì liên quan đến ${jobPosition}?`,
          'Tại sao bạn quan tâm đến vị trí này?',
          'Điều gì làm bạn khác biệt so với các ứng viên khác?'
        ]
      },
      {
        category: 'Câu hỏi kỹ thuật theo ngành',
        icon: 'fa-solid fa-cogs',
        color: 'text-green-400',
        questions: industries.length > 0 ? [
          `Trong ngành ${industries[0]}, xu hướng nào đang ảnh hưởng lớn nhất?`,
          'Bạn đã từng giải quyết vấn đề phức tạp nào trong công việc?',
          'Mô tả một dự án thành công mà bạn đã tham gia.',
          'Bạn cập nhật kiến thức chuyên môn bằng cách nào?'
        ] : [
          'Mô tả kinh nghiệm làm việc ấn tượng nhất của bạn.',
          'Bạn xử lý áp lực công việc như thế nào?',
          'Kỹ năng nào bạn muốn phát triển thêm?'
        ]
      },
      {
        category: 'Câu hỏi về điểm yếu phổ biến',
        icon: 'fa-solid fa-exclamation-triangle',
        color: 'text-orange-400',
        questions: commonWeaknesses.length > 0 ? [
          `Nhiều ứng viên có vấn đề về "${commonWeaknesses[0]}". Bạn tự đánh giá thế nào?`,
          'Bạn đã khắc phục những thiếu sót trong CV như thế nào?',
          'Điểm yếu lớn nhất của bạn là gì và bạn cải thiện ra sao?'
        ] : [
          'Điểm yếu lớn nhất của bạn là gì?',
          'Bạn học hỏi từ thất bại như thế nào?',
          'Kỹ năng nào bạn cần cải thiện?'
        ]
      }
    ];
  };

  const candidateOptions = analysisData.candidates
    .filter(c => c.status === 'SUCCESS')
    .sort((a, b) => (b.analysis?.['Tổng điểm'] || 0) - (a.analysis?.['Tổng điểm'] || 0));

  return (
    <div className="bg-[#0B1120] border border-slate-800 rounded-2xl shadow-2xl w-full max-w-6xl mx-auto flex flex-col overflow-hidden h-[85vh]">
      {/* Header */}
      <div 
        className="p-6 border-b border-slate-800 shrink-0 relative"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #0b1220 40%, #020617 100%)',
          transform: 'translateZ(0)',
        }}
      >
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
        <div className="flex items-center justify-between relative z-10">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <i className="fa-solid fa-wand-magic-sparkles text-purple-400"></i>
              Gợi ý Câu hỏi Phỏng vấn AI
            </h2>
            <p className="text-slate-400 mt-1 text-sm font-medium">
              Tạo câu hỏi phỏng vấn thông minh dựa trên JD và dữ liệu lọc CV
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700 transition-all border border-slate-700/50"
            >
              <i className="fa-solid fa-times text-lg"></i>
            </button>
          )}
        </div>
      </div>

      {/* Content Area - 2 Panels */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Left Panel: Question Generator */}
        <div className="w-full lg:w-[45%] p-6 overflow-y-auto custom-scrollbar border-b lg:border-b-0 lg:border-r border-slate-800/60 flex flex-col">
          {/* Thông tin tổng quan */}
          <div className="space-y-4 mb-8">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <i className="fa-solid fa-database text-cyan-500/80"></i>
              Tổng quan dữ liệu lọc CV
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-900/40 rounded-xl p-3 border border-slate-800/60 hover:border-slate-700 transition-colors">
                <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Vị trí</div>
                <div className="text-sm text-slate-200 font-semibold truncate">{analysisStats.jobPosition}</div>
              </div>
              <div className="bg-slate-900/40 rounded-xl p-3 border border-slate-800/60 hover:border-slate-700 transition-colors">
                <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Số lượng CV</div>
                <div className="text-sm text-white font-semibold flex items-center gap-2">
                  <i className="fa-solid fa-file-invoice text-blue-400/80"></i>
                  {analysisStats.totalCandidates}
                </div>
              </div>
              <div className="bg-slate-900/40 rounded-xl p-3 border border-slate-800/60 hover:border-slate-700 transition-colors">
                <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Ứng viên hạng A</div>
                <div className="text-sm text-emerald-400 font-bold flex items-center gap-2">
                  <i className="fa-solid fa-star"></i>
                  {analysisStats.topCandidates.length}
                </div>
              </div>
              <div className="bg-slate-900/40 rounded-xl p-3 border border-slate-800/60 hover:border-slate-700 transition-colors">
                <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Ngành nghề</div>
                <div className="text-[11px] text-blue-300 font-medium truncate">
                  {analysisStats.industries[0] || 'IT/Software'}
                </div>
              </div>
            </div>
          </div>

          {/* Lựa chọn loại câu hỏi */}
          <div className="space-y-4 mb-8">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Chọn loại câu hỏi:
            </h3>
            <div className="space-y-3">
              {[
                { id: 'general', title: 'Câu hỏi chung', desc: 'Dựa trên JD và xu hướng ngành', icon: 'fa-users', color: 'purple' },
                { id: 'specific', title: 'Câu hỏi cụ thể', desc: 'Dành cho 1 ứng viên cụ thể', icon: 'fa-user-tag', color: 'emerald' },
                { id: 'comparative', title: 'So sánh ứng viên', desc: 'So sánh điểm mạnh giữa nhiều người', icon: 'fa-scale-balanced', color: 'orange' }
              ].map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id as any)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all group ${
                    selectedType === type.id
                    ? `border-${type.color}-500 bg-${type.color}-500/10 shadow-[0_0_20px_rgba(0,0,0,0.2)]`
                    : 'border-slate-800 bg-slate-900/40 hover:border-slate-600'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border transition-colors ${
                    selectedType === type.id ? `bg-${type.color}-500/20 border-${type.color}-500/30 text-${type.color}-400` : 'bg-slate-800 border-slate-700 text-slate-500'
                  }`}>
                    <i className={`fa-solid ${type.icon} text-lg`}></i>
                  </div>
                  <div className="min-w-0">
                    <div className={`font-bold text-sm ${selectedType === type.id ? `text-${type.color}-400` : 'text-slate-300'}`}>{type.title}</div>
                    <div className="text-[11px] text-slate-500 truncate group-hover:text-slate-400">{type.desc}</div>
                  </div>
                  {selectedType === type.id && (
                    <div className={`ml-auto text-${type.color}-500`}>
                      <i className="fa-solid fa-circle-check"></i>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Chọn ứng viên cụ thể */}
          {selectedType === 'specific' && (
            <div className="mb-8 animate-in fade-in slide-in-from-top-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Chọn ứng viên:</label>
              <select
                value={selectedCandidate}
                onChange={(e) => setSelectedCandidate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500 outline-none transition-all"
              >
                <option value="">-- Chọn ứng viên từ danh sách --</option>
                {candidateOptions.map(candidate => (
                  <option key={candidate.id} value={candidate.id}>
                    {candidate.candidateName} (Hạng {candidate.analysis?.['Hạng']} - {candidate.analysis?.['Tổng điểm']}đ)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Hiển thị ứng viên so sánh */}
          {selectedType === 'comparative' && selectedCandidates.length > 0 && (
            <div className="mb-8 p-4 bg-orange-500/5 rounded-2xl border border-orange-500/20 animate-in fade-in slide-in-from-top-2">
              <h4 className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-3">Ứng viên đang so sánh:</h4>
              <div className="flex flex-wrap gap-2">
                {selectedCandidates.map(candidate => (
                  <div key={candidate.id} className="bg-orange-950/40 text-orange-300 px-3 py-1.5 rounded-lg text-[10px] font-bold border border-orange-900/40 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                    {candidate.candidateName}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Logic check for comparative */}
          {selectedType === 'comparative' && selectedCandidates.length === 0 && (
            <div className="mb-8 p-4 bg-amber-500/5 rounded-2xl border border-amber-500/20 text-xs text-amber-300 italic">
              <i className="fa-solid fa-circle-info mr-2"></i>
              Vui lòng chọn ứng viên ở bảng danh sách trước khi so sánh.
            </div>
          )}

          {/* Button tạo câu hỏi */}
          <div className="mt-auto pt-4">
            <button
              onClick={generateQuestions}
              disabled={isLoading || (selectedType === 'specific' && !selectedCandidate) || (selectedType === 'comparative' && selectedCandidates.length === 0)}
              className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 text-white rounded-xl font-bold transition-all transform hover:scale-[1.02] active:scale-95 disabled:scale-100 disabled:cursor-not-allowed shadow-xl shadow-blue-900/20 relative overflow-hidden"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-3">
                  <i className="fa-solid fa-circle-notch fa-spin"></i>
                  <span>Đang xử lý dữ liệu...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <i className="fa-solid fa-brain"></i>
                  <span>Tạo câu hỏi phỏng vấn AI</span>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Right Panel: Suggested Questions */}
        <div className="flex-1 bg-slate-950/30 p-6 overflow-y-auto custom-scrollbar flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-3">
              <i className="fa-solid fa-list-check text-emerald-400"></i>
              Gợi ý từ AI
            </h3>
            {questionSets.length > 0 && (
              <button
                onClick={() => {
                  const allQuestions = questionSets.map(set =>
                    `${set.category}:\n${set.questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`
                  ).join('\n\n');
                  navigator.clipboard.writeText(allQuestions);
                }}
                className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest px-3 py-1.5 bg-emerald-500/10 rounded-lg border border-emerald-500/30 hover:bg-emerald-500/20 transition-all"
              >
                Copy tất cả
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in">
              <div className="w-16 h-16 rounded-full border-4 border-slate-800 border-t-purple-500 animate-spin"></div>
              <div>
                <p className="text-slate-300 font-bold">AI đang phân tích CV...</p>
                <p className="text-xs text-slate-500 mt-1">Đang trích xuất nội dung và tạo câu hỏi tối ưu</p>
              </div>
            </div>
          ) : questionSets.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-800/60 rounded-3xl opacity-50">
              <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center mb-6 text-slate-700">
                <i className="fa-solid fa-comment-nodes text-4xl"></i>
              </div>
              <h4 className="text-slate-300 font-bold mb-2">Chưa có câu hỏi được tạo</h4>
              <p className="text-sm text-slate-500 max-w-xs">Nhấn "Tạo câu hỏi phỏng vấn" để AI trích xuất các câu hỏi phù hợp nhất cho ứng viên.</p>
            </div>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
              {questionSets.map((set, setIndex) => (
                <div key={setIndex} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <i className={`${set.icon} ${set.color} text-sm`}></i>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{set.category}</h4>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {set.questions.map((question, qIndex) => (
                      <div 
                        key={qIndex} 
                        className="group bg-slate-900/60 border border-slate-800/40 rounded-xl p-4 flex gap-4 hover:border-slate-700 hover:bg-slate-900/80 transition-all shadow-sm"
                      >
                        <div className={`w-6 h-6 rounded-lg ${set.color.replace('text-', 'bg-').replace('400', '500/20')} ${set.color} flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 border border-current opacity-60`}>
                          {qIndex + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-200 leading-relaxed font-medium">{question}</p>
                        </div>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(question);
                            // Optionally add a toast here
                          }}
                          className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-800/50 text-slate-500 hover:text-white hover:bg-slate-700 transition-all opacity-0 group-hover:opacity-100 shrink-0"
                          title="Copy câu hỏi"
                        >
                          <i className="fa-solid fa-copy text-xs"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewQuestionGenerator;
