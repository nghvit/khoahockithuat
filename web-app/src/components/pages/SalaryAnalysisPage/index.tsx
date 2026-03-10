import React, { useState } from 'react';
import { DollarSign } from 'lucide-react';
import SalaryAnalysisPanel from '../../modules/SalaryAnalysisPanel';
import type { Candidate } from '../../../types';

interface SalaryAnalysisPageProps {
  candidates?: Candidate[];
  jdText?: string;
}

/**
 * Page component for salary analysis feature
 * Demonstrates integration of SalaryAnalysisPanel
 */
const SalaryAnalysisPage: React.FC<SalaryAnalysisPageProps> = ({ candidates, jdText }) => {
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | undefined>(
    candidates && candidates.length > 0 ? candidates[0] : undefined
  );
  const [analysisResults, setAnalysisResults] = useState<any[]>([]);

  const handleAnalysisComplete = (result: any) => {
    console.log('✅ Salary analysis completed:', result);
    setAnalysisResults(prev => [...prev, result]);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-green-600/20 rounded-lg">
              <DollarSign className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Phân Tích Mức Lương</h1>
              <p className="text-slate-400 mt-1">
                So sánh mức lương với thị trường Việt Nam
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Candidate Selection */}
          {candidates && candidates.length > 0 && (
            <div className="lg:col-span-1">
              <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 p-6">
                <h2 className="text-lg font-semibold mb-4">Chọn Ứng Viên</h2>
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {candidates.map((candidate) => (
                    <button
                      key={candidate.id}
                      onClick={() => setSelectedCandidate(candidate)}
                      className={`w-full text-left p-4 rounded-lg transition-all ${
                        selectedCandidate?.id === candidate.id
                          ? 'bg-green-600/20 border-2 border-green-500'
                          : 'bg-slate-700 border-2 border-transparent hover:bg-slate-600'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-white truncate">
                            {candidate.candidateName}
                          </h3>
                          <p className="text-sm text-slate-400 truncate mt-1">
                            {candidate.jobTitle}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                candidate.analysis?.['Hạng'] === 'A'
                                  ? 'bg-emerald-600/20 text-emerald-400'
                                  : candidate.analysis?.['Hạng'] === 'B'
                                  ? 'bg-blue-600/20 text-blue-400'
                                  : 'bg-red-600/20 text-red-400'
                              }`}
                            >
                              Grade {candidate.analysis?.['Hạng'] || 'N/A'}
                            </span>
                            <span className="text-xs text-slate-500">
                              Score: {candidate.analysis?.['Tổng điểm'] || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Right Column - Salary Analysis Panel */}
          <div className={candidates && candidates.length > 0 ? 'lg:col-span-2' : 'lg:col-span-3'}>
            <SalaryAnalysisPanel
              candidate={selectedCandidate}
              jdText={jdText}
              onAnalysisComplete={handleAnalysisComplete}
            />
          </div>
        </div>

        {/* Analysis History (Optional) */}
        {analysisResults.length > 0 && (
          <div className="mt-8">
            <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 p-6">
              <h2 className="text-xl font-semibold mb-4">Lịch Sử Phân Tích</h2>
              <div className="space-y-4">
                {analysisResults.map((result, index) => (
                  <div
                    key={index}
                    className="bg-slate-700/50 rounded-lg p-4 border border-slate-600"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-sm text-slate-300">{result.summary}</p>
                        {result.marketSalary && (
                          <div className="mt-2 flex gap-4">
                            <span className="text-xs text-slate-400">
                              Median: {(result.marketSalary.median / 1_000_000).toFixed(1)} tr VNĐ
                            </span>
                            {result.comparison && (
                              <span
                                className={`text-xs font-medium ${
                                  result.comparison.marketPosition === 'below'
                                    ? 'text-orange-400'
                                    : result.comparison.marketPosition === 'reasonable'
                                    ? 'text-green-400'
                                    : 'text-blue-400'
                                }`}
                              >
                                {result.comparison.marketPosition === 'below'
                                  ? '↓ Dưới thị trường'
                                  : result.comparison.marketPosition === 'reasonable'
                                  ? '✓ Hợp lý'
                                  : '↑ Trên thị trường'}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-slate-500">
                        {new Date().toLocaleTimeString('vi-VN')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-blue-900/20 border border-blue-700/50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-300 mb-2">
            💡 Hướng Dẫn Sử Dụng
          </h3>
          <ul className="space-y-2 text-sm text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-blue-400 flex-shrink-0">•</span>
              <span>
                <strong>Tự động:</strong> Chọn ứng viên từ danh sách bên trái để phân tích
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 flex-shrink-0">•</span>
              <span>
                <strong>Thủ công:</strong> Nhập thông tin trực tiếp vào form
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 flex-shrink-0">•</span>
              <span>
                <strong>API:</strong> Dữ liệu từ job-salary-data.p.rapidapi.com
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 flex-shrink-0">•</span>
              <span>
                <strong>Fallback:</strong> Ước tính thông minh khi API không khả dụng
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SalaryAnalysisPage;
