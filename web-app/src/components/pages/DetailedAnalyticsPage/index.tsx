import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import type { Candidate } from '../../../types';
import { saveHistorySession } from '../../../services/storage/historyService';
import { auth } from '../../../config/firebase';

interface DetailedAnalyticsPageProps {
  candidates: Candidate[];
  jobPosition: string;
  onReset: () => void;
}

const DetailedAnalyticsPage: React.FC<DetailedAnalyticsPageProps> = ({ candidates, jobPosition, onReset }) => {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);

  const handleCompleteProcess = async () => {
    try {
      setIsSaving(true);

      // Lấy thông tin user
      const currentUser = auth.currentUser;
      if (!currentUser || !currentUser.email) {
        alert('Vui lòng đăng nhập để lưu lịch sử');
        return;
      }

      // Lấy JD text và location từ localStorage
      const jdText = localStorage.getItem('currentJD') || '';
      const locationRequirement = localStorage.getItem('currentLocation') || '';
      const weights = JSON.parse(localStorage.getItem('analysisWeights') || '{}');
      const hardFilters = JSON.parse(localStorage.getItem('hardFilters') || '{}');

      // Lưu lịch sử phân tích
      await saveHistorySession({
        jdText,
        jobPosition,
        locationRequirement,
        candidates,
        userEmail: currentUser.email,
        weights,
        hardFilters
      });

      // Thông báo thành công
      alert('Đã lưu lịch sử phân tích thành công!');

      // Reset state và quay về trang chủ
      onReset();
      navigate('/');
    } catch (error) {
      console.error('Lỗi khi lưu lịch sử:', error);
      alert('Có lỗi xảy ra khi lưu lịch sử. Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  // Xử lý dữ liệu phân tích
  const analyticsData = useMemo(() => {
    const successfulCandidates = candidates.filter(c => c.status === 'SUCCESS' && c.analysis);

    if (successfulCandidates.length === 0) {
      return null;
    }

    // Thống kê theo hạng
    const gradeStats = {
      A: successfulCandidates.filter(c => c.analysis?.['Hạng'] === 'A').length,
      B: successfulCandidates.filter(c => c.analysis?.['Hạng'] === 'B').length,
      C: successfulCandidates.filter(c => c.analysis?.['Hạng'] === 'C').length,
    };

    // Thống kê điểm theo từng tiêu chí
    const criteriaStats: Record<string, { total: number, count: number, scores: number[] }> = {};

    successfulCandidates.forEach(candidate => {
      if (candidate.analysis?.['Chi tiết']) {
        candidate.analysis['Chi tiết'].forEach(detail => {
          const criterion = detail['Tiêu chí'];
          const scoreText = detail['Điểm'];
          let score = 0;

          // Xử lý điểm số
          if (scoreText.includes('/')) {
            score = parseInt(scoreText.split('/')[0]) || 0;
          } else if (scoreText.includes('%')) {
            score = parseInt(scoreText.replace('%', '')) || 0;
          } else {
            score = parseInt(scoreText) || 0;
          }

          if (!criteriaStats[criterion]) {
            criteriaStats[criterion] = { total: 0, count: 0, scores: [] };
          }

          criteriaStats[criterion].total += score;
          criteriaStats[criterion].count += 1;
          criteriaStats[criterion].scores.push(score);
        });
      }
    });

    // Tính điểm trung bình cho từng tiêu chí
    const criteriaAverages = Object.entries(criteriaStats).map(([criterion, stats]) => ({
      criterion: criterion.length > 20 ? criterion.substring(0, 20) + '...' : criterion,
      fullCriterion: criterion,
      average: Math.round(stats.total / stats.count),
      count: stats.count,
      min: Math.min(...stats.scores),
      max: Math.max(...stats.scores),
      scores: stats.scores
    }));

    // Thống kê phân bố điểm
    const scoreDistribution = Array.from({ length: 10 }, (_, i) => {
      const range = `${i * 10}-${(i + 1) * 10}`;
      const count = successfulCandidates.filter(c => {
        const score = c.analysis?.['Tổng điểm'] || 0;
        return score >= i * 10 && score < (i + 1) * 10;
      }).length;
      return { range, count };
    }).filter(item => item.count > 0);

    // Radar chart data cho top 5 tiêu chí
    const topCriteria = criteriaAverages
      .sort((a, b) => b.average - a.average)
      .slice(0, 6)
      .map(c => ({
        subject: c.criterion,
        fullName: c.fullCriterion,
        score: c.average,
        fullMark: 100
      }));

    // Thống kê xu hướng theo thời gian (giả lập)
    const timeStats = successfulCandidates.map((c, index) => ({
      order: index + 1,
      score: c.analysis?.['Tổng điểm'] || 0,
      jdFit: parseInt(c.analysis?.['Chi tiết']?.find(d => d['Tiêu chí'].includes('Phù hợp JD'))?.['Điểm'].split('/')[0] || '0')
    }));

    return {
      gradeStats,
      criteriaAverages,
      scoreDistribution,
      topCriteria,
      timeStats,
      totalCandidates: successfulCandidates.length
    };
  }, [candidates]);

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-[#0B1120] text-slate-200 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="relative inline-block mb-6">
              <i className="fa-solid fa-chart-pie text-6xl text-slate-600"></i>
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full pulse-animation"></div>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-4">
              Thống Kê Chi Tiết
            </h2>
            <p className="text-slate-400 text-lg max-w-md mx-auto">
              Chưa có dữ liệu phân tích để hiển thị. Vui lòng thực hiện phân tích CV trước.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const COLORS = ['#10B981', '#3B82F6', '#EF4444', '#F59E0B', '#8B5CF6', '#EC4899'];

  const gradeData = [
    { name: 'Hạng A', value: analyticsData.gradeStats.A, color: '#10B981' },
    { name: 'Hạng B', value: analyticsData.gradeStats.B, color: '#3B82F6' },
    { name: 'Hạng C', value: analyticsData.gradeStats.C, color: '#EF4444' }
  ].filter(item => item.value > 0);

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-200 p-6 animate-fadeIn">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 bg-slate-900/50 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <i className="fa-solid fa-chart-line text-white text-2xl"></i>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                Thống Kê Chi Tiết
              </h1>
              <p className="text-slate-400 mt-1 flex items-center gap-2">
                Phân tích sâu cho vị trí: <span className="font-semibold text-slate-200 bg-slate-700/50 px-2 py-0.5 rounded border border-slate-600/50">{jobPosition}</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/50 backdrop-blur-sm p-4 rounded-xl border border-slate-800 hover:border-blue-500/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center border border-blue-500/20">
                  <i className="fa-solid fa-users text-blue-400"></i>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Tổng CV</p>
                  <p className="text-2xl font-bold text-white">{analyticsData.totalCandidates}</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-sm p-4 rounded-xl border border-slate-800 hover:border-emerald-500/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center border border-emerald-500/20">
                  <i className="fa-solid fa-medal text-emerald-400"></i>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Hạng A</p>
                  <p className="text-2xl font-bold text-emerald-400">{analyticsData.gradeStats.A}</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-sm p-4 rounded-xl border border-slate-800 hover:border-blue-500/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center border border-blue-500/20">
                  <i className="fa-solid fa-star text-blue-400"></i>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Hạng B</p>
                  <p className="text-2xl font-bold text-blue-400">{analyticsData.gradeStats.B}</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-sm p-4 rounded-xl border border-slate-800 hover:border-red-500/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center border border-red-500/20">
                  <i className="fa-solid fa-triangle-exclamation text-red-400"></i>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Hạng C</p>
                  <p className="text-2xl font-bold text-red-400">{analyticsData.gradeStats.C}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Pie Chart - Phân bố hạng */}
          <div className="bg-slate-900/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-800 shadow-lg shadow-blue-900/5">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-200">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                <i className="fa-solid fa-chart-pie text-purple-400"></i>
              </div>
              Phân Bố Theo Hạng
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={gradeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  innerRadius={60}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {gradeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0.2)" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    border: '1px solid rgba(51, 65, 85, 0.5)',
                    borderRadius: '12px',
                    color: '#F3F4F6',
                    backdropFilter: 'blur(8px)'
                  }}
                  itemStyle={{ color: '#E2E8F0' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart - Phân bố điểm */}
          <div className="bg-slate-900/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-800 shadow-lg shadow-blue-900/5">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-200">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                <i className="fa-solid fa-chart-column text-blue-400"></i>
              </div>
              Phân Bố Điểm Số
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.scoreDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="range" stroke="#94a3b8" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} dx={-10} />
                <Tooltip
                  cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    border: '1px solid rgba(51, 65, 85, 0.5)',
                    borderRadius: '12px',
                    color: '#F3F4F6',
                    backdropFilter: 'blur(8px)'
                  }}
                />
                <Bar dataKey="count" fill="#3B82F6" radius={[6, 6, 0, 0]}>
                  {analyticsData.scoreDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`url(#colorGradient-${index})`} />
                  ))}
                </Bar>
                <defs>
                  {analyticsData.scoreDistribution.map((entry, index) => (
                    <linearGradient key={`colorGradient-${index}`} id={`colorGradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#60A5FA" stopOpacity={1} />
                      <stop offset="100%" stopColor="#2563EB" stopOpacity={0.8} />
                    </linearGradient>
                  ))}
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar Chart - Top tiêu chí */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-slate-900/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-800 shadow-lg shadow-blue-900/5">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-200">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <i className="fa-solid fa-radar text-emerald-400"></i>
              </div>
              Top 6 Tiêu Chí Đánh Giá
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={analyticsData.topCriteria} outerRadius={90}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  axisLine={false}
                />
                <Radar
                  name="Điểm trung bình"
                  dataKey="score"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    border: '1px solid rgba(51, 65, 85, 0.5)',
                    borderRadius: '12px',
                    color: '#F3F4F6',
                    backdropFilter: 'blur(8px)'
                  }}
                  labelFormatter={(label, payload) => {
                    const item = analyticsData.topCriteria.find(c => c.subject === label);
                    return item ? item.fullName : label;
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Line Chart - Xu hướng điểm */}
          <div className="bg-slate-900/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-800 shadow-lg shadow-blue-900/5">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-200">
              <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                <i className="fa-solid fa-chart-line text-orange-400"></i>
              </div>
              Xu Hướng Điểm Theo CV
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.timeStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="order" stroke="#94a3b8" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} dx={-10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    border: '1px solid rgba(51, 65, 85, 0.5)',
                    borderRadius: '12px',
                    color: '#F3F4F6',
                    backdropFilter: 'blur(8px)'
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#F59E0B"
                  strokeWidth={3}
                  dot={{ fill: '#F59E0B', r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                  name="Tổng điểm"
                />
                <Line
                  type="monotone"
                  dataKey="jdFit"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                  name="Phù hợp JD (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Criteria Table */}
        <div className="bg-slate-900/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-800 shadow-lg shadow-blue-900/5">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-200">
            <div className="w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center border border-slate-600/50">
              <i className="fa-solid fa-table text-slate-300"></i>
            </div>
            Chi Tiết Điểm Theo Tiêu Chí
          </h3>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-900/80 border-b border-slate-800">
                  <th className="text-left py-4 px-6 text-sm font-bold text-slate-300 uppercase tracking-wider">Tiêu Chí</th>
                  <th className="text-center py-4 px-6 text-sm font-bold text-slate-300 uppercase tracking-wider">Điểm TB</th>
                  <th className="text-center py-4 px-6 text-sm font-bold text-slate-300 uppercase tracking-wider">Min</th>
                  <th className="text-center py-4 px-6 text-sm font-bold text-slate-300 uppercase tracking-wider">Max</th>
                  <th className="text-center py-4 px-6 text-sm font-bold text-slate-300 uppercase tracking-wider">Số CV</th>
                  <th className="text-center py-4 px-6 text-sm font-bold text-slate-300 uppercase tracking-wider">Đánh Giá</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {analyticsData.criteriaAverages
                  .sort((a, b) => b.average - a.average)
                  .map((criteria, index) => (
                    <tr key={criteria.fullCriterion} className="hover:bg-slate-700/20 transition-colors">
                      <td className="py-4 px-6 text-sm text-slate-200">
                        <div className="font-medium">{criteria.fullCriterion}</div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${criteria.average >= 80 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          criteria.average >= 60 ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                            'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}>
                          {criteria.average}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center text-slate-400 font-mono">{criteria.min}</td>
                      <td className="py-4 px-6 text-center text-slate-400 font-mono">{criteria.max}</td>
                      <td className="py-4 px-6 text-center text-slate-400">{criteria.count}</td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex justify-center">
                          {criteria.average >= 80 ? (
                            <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/5 px-2 py-1 rounded border border-emerald-500/10">
                              <i className="fa-solid fa-thumbs-up text-xs"></i>
                              <span className="text-xs font-medium">Tốt</span>
                            </div>
                          ) : criteria.average >= 60 ? (
                            <div className="flex items-center gap-1.5 text-blue-400 bg-blue-500/5 px-2 py-1 rounded border border-blue-500/10">
                              <i className="fa-solid fa-minus text-xs"></i>
                              <span className="text-xs font-medium">Khá</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-red-400 bg-red-500/5 px-2 py-1 rounded border border-red-500/10">
                              <i className="fa-solid fa-triangle-exclamation text-xs"></i>
                              <span className="text-xs font-medium">Yếu</span>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Complete Process Button */}
        <div className="mt-10 text-center">
          <button
            onClick={handleCompleteProcess}
            disabled={isSaving}
            className={`px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-2xl font-bold shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-3 mx-auto ${isSaving ? 'opacity-70 cursor-not-allowed' : ''
              }`}
          >
            {isSaving ? (
              <>
                <i className="fa-solid fa-circle-notch fa-spin"></i>
                Đang lưu kết quả...
              </>
            ) : (
              <>
                <i className="fa-solid fa-check-circle text-xl"></i>
                Hoàn thành & Lưu kết quả
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailedAnalyticsPage;
