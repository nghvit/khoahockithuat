import React, { useEffect, useMemo, useState } from 'react';
import ChatBubble from '../../ui/ChatBubble';
import type { AppStep } from '../../../types';
import { analysisCacheService } from '../../../services/cache/analysisCache';
import { cvFilterHistoryService } from '../../../services/storage/analysisHistory';

interface HomePageProps {
  setActiveStep: (step: AppStep) => void;
  isLoggedIn: boolean;
  onLoginRequest: () => void;
  completedSteps: AppStep[];
  userAvatar?: string | null;
  userName?: string;
  userEmail?: string;
  onLogout?: () => void;
}

const flowOrder: AppStep[] = ['jd', 'weights', 'upload', 'analysis'];

type NavLink =
  | { label: string; target: string }
  | { label: string; href: string }
  | {
    label: string;
    type?: 'history' | 'support';
    megaMenu: {
      highlight: {
        title: string;
        desc: string;
        icon: string;
        action?: { label: string; target?: string; href?: string; isStart?: boolean };
      };
      items: { label: string; desc?: string; icon: string; target?: string; href?: string }[];
    };
  }
  | {
    label: string;
    type: 'history';
    megaMenu: {
      highlight: {
        title: string;
        desc: string;
        icon: string;
      };
    };
  };

type ComparisonCell = {
  status: 'positive' | 'negative' | 'neutral' | 'highlight';
  text: string;
};

type ComparisonRow = {
  icon: string;
  label: string;
  chatgpt: ComparisonCell;
  support: ComparisonCell;
  emphasis?: boolean;
};

const HomePage: React.FC<HomePageProps> = ({
  setActiveStep,
  isLoggedIn,
  onLoginRequest,
  completedSteps,
  userAvatar,
  userName,
  userEmail,
  onLogout,
  onShowSettings
}) => {
  const heroHighlight = 'Nhanh Gấp 10 Lần.';
  const [typedHighlight, setTypedHighlight] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  // Statistics State for History Mega Menu
  const [cacheStats, setCacheStats] = useState({
    size: 0,
    hitRate: 0,
    oldestEntry: 0,
    newestEntry: 0
  });

  const [historyStats, setHistoryStats] = useState({
    totalSessions: 0,
    lastSession: null as string | null,
    thisWeekCount: 0,
    thisMonthCount: 0
  });

  const [recentHistory, setRecentHistory] = useState<any[]>([]);

  // Certificates slideshow state
  const certificates = useMemo(() => [
    '/images/achive/Khuyến Khích Tin Học Trẻ.jpg',
    '/images/achive/sáng tạo thanh thiếu niên.jpg'
  ], []);
  const [certIndex, setCertIndex] = useState(0);

  const refreshHistoryData = () => {
    setCacheStats(analysisCacheService.getCacheStats());
    setHistoryStats(cvFilterHistoryService.getHistoryStats());
    setRecentHistory(cvFilterHistoryService.getRecentHistory());
  };

  useEffect(() => {
    if (certificates.length > 1) {
      const interval = setInterval(() => {
        setCertIndex((prev) => (prev + 1) % certificates.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [certificates]);

  useEffect(() => {
    refreshHistoryData();
  }, []);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      index += 1;
      setTypedHighlight(heroHighlight.slice(0, index));
      if (index >= heroHighlight.length) {
        clearInterval(interval);
      }
    }, 70);
    return () => clearInterval(interval);
  }, [heroHighlight]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsVideoOpen(false);
    };
    if (isVideoOpen) document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVideoOpen]);

  const handleStart = () => {
    if (isLoggedIn) {
      setActiveStep('jd');
    } else {
      onLoginRequest();
    }
  };


  const primaryNavLinks: NavLink[] = [
    {
      label: 'Features',
      megaMenu: {
        highlight: {
          title: 'AI-Powered Screening',
          desc: 'Optimize your hiring process with our advanced AI tools and structured workflow.',
          icon: 'fa-solid fa-rocket'
        },
        items: [
          { label: 'AI CV Analysis', desc: 'Phân tích & xếp hạng CV tự động.', icon: 'fa-solid fa-magnifying-glass-chart', target: 'features' },
          { label: 'Resume Builder', desc: 'Tạo CV chuẩn ATS chuyên nghiệp.', icon: 'fa-solid fa-pen-nib', target: 'features' },
          { label: 'Job Matching', desc: 'Tìm kiếm ứng viên phù hợp nhất.', icon: 'fa-solid fa-bullseye', target: 'features' },
          { label: 'AI Analytics', desc: 'Bảng điểm & gợi ý phỏng vấn chuyên sâu.', icon: 'fa-solid fa-square-poll-vertical', target: 'steps' }
        ]
      }
    },
    {
      label: 'Solutions',
      megaMenu: {
        highlight: {
          title: 'Tailored Solutions',
          desc: 'Discover how SupportHR transforms recruitment for every stakeholder.',
          icon: 'fa-solid fa-lightbulb'
        },
        items: [
          { label: 'For Candidates', desc: 'Tối ưu hồ sơ & tìm việc thông minh.', icon: 'fa-solid fa-user-graduate', target: 'hero' },
          { label: 'For Enterprise', desc: 'Quy trình tuyển dụng tinh gọn, hiệu quả.', icon: 'fa-solid fa-building-briefcase', target: 'partners' },
          { label: 'Why SupportHR', desc: 'Lý do chúng tôi vượt trội trên thị trường.', icon: 'fa-solid fa-award', target: 'why-support-hr' },
          { label: 'Compare Platforms', desc: 'So sánh chi tiết với các nền tảng khác.', icon: 'fa-solid fa-code-compare', target: 'compare' }
        ]
      }
    },
    {
      label: 'Tools',
      megaMenu: {
        highlight: {
          title: 'TechFuture Tools',
          desc: 'Hệ sinh thái công cụ thông minh cho quy trình làm việc hiện đại.',
          icon: 'fa-solid fa-screwdriver-wrench'
        },
        items: [
          { label: 'Parse JD Standardizer', desc: 'Phần Mềm Hỗ Trợ Tuyển Dụng', icon: 'fa-solid fa-wand-magic-sparkles', href: 'https://parse-jd.vercel.app/' },
          { label: 'Lọc CV Gia sư', desc: 'Phần Mềm Hỗ Trợ Tuyển Dụng', icon: 'fa-solid fa-user-graduate', href: 'https://turbondcv.vercel.app/' },
          { label: 'Database & Phân Loại Rác', desc: 'Phần Mềm Khác', icon: 'fa-solid fa-dumpster', href: 'https://tf-greeneye1.netlify.app/' }
        ]
      }
    },
    {
      label: 'Pricing',
      megaMenu: {
        highlight: {
          title: 'Bảng giá',
          desc: 'Dùng thử miễn phí và các gói trả phí linh hoạt cho mọi nhu cầu.',
          icon: 'fa-solid fa-tags'
        },
        items: [
          { label: 'BASIC', desc: '$39 / tháng · 300CV', icon: 'fa-solid fa-leaf', target: 'pricing' },
          { label: 'STANDARD', desc: '$99 / tháng · 1000CV', icon: 'fa-solid fa-tree', target: 'pricing' },
          { label: 'PREMIUM', desc: '$249 / tháng · 5000CV', icon: 'fa-solid fa-crown', target: 'pricing' },
          { label: 'ENTERPRISE', desc: '$599 / tháng · 20000CV', icon: 'fa-solid fa-building', target: 'pricing' }
        ]
      }
    },
  ];

  const handleSectionScroll = (targetId: string) => {
    if (typeof window === 'undefined') return;
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleClearCache = () => {
    if (window.confirm('Bạn có chắc muốn xóa toàn bộ cache? Điều này sẽ làm chậm các lần phân tích tiếp theo.')) {
      analysisCacheService.clearCache();
      refreshHistoryData();
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Bạn có chắc muốn xóa toàn bộ lịch sử lọc CV? Hành động này không thể hoàn tác.')) {
      cvFilterHistoryService.clearHistory();
      refreshHistoryData();
    }
  };

  const formatDate = (timestamp: number) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  };

  const nextStep = useMemo(() => {
    const pending = flowOrder.find((step) => !completedSteps.includes(step));
    return pending || 'analysis';
  }, [completedSteps]);

  const canContinue = completedSteps.length > 0;

  const features = [
    {
      title: 'Sàng Lọc Hồ Sơ',
      desc: 'Tự động lọc và xếp hạng ứng viên theo tiêu chí đa chiều.',
      icon: 'fa-solid fa-filter-circle-dollar',
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
      glow: 'bg-cyan-500'
    },
    {
      title: 'Bộ Công cụ hỗ trợ HR',
      desc: 'Phân tích sâu, gợi ý phỏng vấn và đánh giá mức lương.',
      icon: 'fa-solid fa-briefcase-medical',
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      glow: 'bg-purple-500'
    },
  ];

  const partners = [
    { name: 'FPT', logo: '/images/logos/fpt.png' },
    { name: 'TopCV', logo: '/images/logos/topcv-1.png' },
    { name: 'Vinedimex', logo: '/images/logos/vinedimex-1.png' },
    { name: 'HB', logo: '/images/logos/hb.png' },
    { name: 'Mì AI', logo: '/images/logos/mi_ai.png' },
    { name: '2.1 Studio', logo: '/images/logos/2.1.png' },
  ];

  const comparisonRows: ComparisonRow[] = [
    {
      icon: 'fa-solid fa-layer-group',
      label: 'Xử lý hàng loạt CV',
      chatgpt: { status: 'negative', text: 'Chỉ 1 CV/lần' },
      support: { status: 'positive', text: 'Hàng trăm CV cùng lúc' },
    },
    {
      icon: 'fa-solid fa-bullseye',
      label: 'Độ chính xác AI',
      chatgpt: { status: 'neutral', text: '~70% · AI tổng quát' },
      support: { status: 'positive', text: '95%+ · AI chuyên HR' },
    },
    {
      icon: 'fa-solid fa-briefcase',
      label: 'Phân tích kinh nghiệm',
      chatgpt: { status: 'negative', text: 'Đọc text cơ bản' },
      support: { status: 'positive', text: 'Deep learning ngành' },
    },
    {
      icon: 'fa-solid fa-image',
      label: 'Đọc CV ảnh/scan',
      chatgpt: { status: 'negative', text: 'Không hỗ trợ' },
      support: { status: 'positive', text: 'OCR đa định dạng' },
    },
    {
      icon: 'fa-solid fa-industry',
      label: 'Nhận diện ngành nghề',
      chatgpt: { status: 'negative', text: 'Thủ công' },
      support: { status: 'positive', text: 'Tự động từ JD' },
    },
    {
      icon: 'fa-solid fa-sliders',
      label: 'Tùy chỉnh trọng số',
      chatgpt: { status: 'negative', text: 'Không có' },
      support: { status: 'positive', text: 'UI trực quan' },
    },
    {
      icon: 'fa-solid fa-chart-line',
      label: 'Dashboard phân tích',
      chatgpt: { status: 'negative', text: 'Chỉ chat text' },
      support: { status: 'positive', text: 'Biểu đồ chi tiết' },
    },
    {
      icon: 'fa-solid fa-microphone-lines',
      label: 'Câu hỏi phỏng vấn',
      chatgpt: { status: 'neutral', text: 'Prompt thủ công' },
      support: { status: 'positive', text: 'Tự động CV+JD' },
    },
    {
      icon: 'fa-solid fa-dollar-sign',
      label: 'Phân tích mức lương',
      chatgpt: { status: 'negative', text: 'Không có' },
      support: { status: 'positive', text: 'Benchmark vị trí' },
    },
    {
      icon: 'fa-solid fa-rotate',
      label: 'Lưu lịch sử',
      chatgpt: { status: 'negative', text: 'Giới hạn' },
      support: { status: 'positive', text: 'Vĩnh viễn' },
    },
    {
      icon: 'fa-solid fa-users',
      label: 'Làm việc nhóm',
      chatgpt: { status: 'negative', text: 'Không workspace' },
      support: { status: 'positive', text: 'Multi-user' },
    },
    {
      icon: 'fa-solid fa-money-bill-trend-up',
      label: 'Chi phí & hiệu quả',
      chatgpt: { status: 'neutral', text: '$20/tháng · Vẫn thủ công nhiều' },
      support: { status: 'highlight', text: 'Liên hệ · Tiết kiệm 70%' },
      emphasis: true,
    },
  ];

  const statusStyles: Record<ComparisonCell['status'], { icon: string; badgeClass: string; textClass: string }> = {
    positive: {
      icon: 'fa-solid fa-check',
      badgeClass: 'border border-emerald-500/40 bg-emerald-500/10 text-emerald-200',
      textClass: 'text-slate-100',
    },
    negative: {
      icon: 'fa-solid fa-xmark',
      badgeClass: 'border border-rose-500/40 bg-rose-500/10 text-rose-200',
      textClass: 'text-slate-300',
    },
    neutral: {
      icon: 'fa-solid fa-minus',
      badgeClass: 'border border-amber-500/30 bg-amber-500/10 text-amber-200',
      textClass: 'text-slate-200',
    },
    highlight: {
      icon: 'fa-solid fa-star',
      badgeClass: 'border border-cyan-500/40 bg-gradient-to-r from-cyan-500/30 to-emerald-500/20 text-white',
      textClass: 'text-white font-semibold',
    },
  };

  const renderStatusCell = (info: ComparisonCell) => {
    const style = statusStyles[info.status];
    return (
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className={`flex h-9 w-9 items-center justify-center rounded-2xl ${style.badgeClass}`}>
          <i className={`${style.icon} text-base`}></i>
        </span>
        <span className={`leading-tight ${style.textClass}`}>{info.text}</span>
      </div>
    );
  };

  const steps = [
    { id: '01', label: 'Nhập JD', detail: 'Dán hoặc tải file JD.' },
    { id: '02', label: 'Cấu hình', detail: 'Trọng số + hard filter.' },
    { id: '03', label: 'Upload CV', detail: 'Kéo thả hàng loạt.' },
    { id: '04', label: 'Kết quả', detail: 'Bảng điểm + gợi ý PV.' },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-slate-100 overflow-x-hidden">
      <section className="w-full px-3 sm:px-8 lg:px-14 py-6 sm:py-12">
        <nav className="w-full mb-6 sm:mb-10 rounded-2xl bg-indigo-950/80 backdrop-blur-md px-3 py-3 sm:px-6 sm:py-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between shadow-[0_8px_32px_rgba(0,0,0,0.4)] border border-white/10 relative">
          <button
            onClick={() => setActiveMegaMenu(activeMegaMenu === 'Support HR' ? null : 'Support HR')}
            className={`flex items-center gap-3 lg:gap-8 hover:bg-white/5 p-2 -m-2 rounded-2xl transition-all group/brand relative ${activeMegaMenu === 'Support HR' ? 'bg-white/10 ring-1 ring-white/20' : ''}`}
          >
            <div className="flex items-center gap-3 lg:gap-4">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden relative shadow-lg group-hover/brand:scale-105 transition-transform">
                <img
                  src="/images/logos/logo.jpg"
                  alt="SupportHR"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling as HTMLElement | null;
                    if (fallback) fallback.classList.remove('hidden');
                  }}
                />
                <div className="hidden absolute inset-0 flex items-center justify-center text-xs font-bold tracking-wider text-white bg-gradient-to-br from-cyan-500 to-emerald-400">
                  SHR
                </div>
              </div>
              <div className="text-left">
                <p className="text-sm sm:text-base font-bold text-white group-hover/brand:text-cyan-400 transition-colors">SupportHR</p>
                <p className="text-[10px] sm:text-xs text-slate-400 font-medium">AI Screening Platform</p>
              </div>
            </div>
            <i className={`fa-solid fa-chevron-down text-[10px] text-slate-500 transition-all duration-300 ${activeMegaMenu === 'Support HR' ? 'rotate-180 text-cyan-400' : 'group-hover/brand:text-slate-300'}`}></i>

            {/* Support HR Mega Menu Dropdown */}
            <div className={`absolute top-full left-0 mt-[26px] opacity-0 translate-y-2 pointer-events-none transition-all duration-300 z-50 ${activeMegaMenu === 'Support HR' ? 'opacity-100 translate-y-0 pointer-events-auto' : ''}`}>
              <div className="w-[1000px] bg-indigo-950/95 backdrop-blur-3xl border border-white/10 rounded-[24px] p-2 shadow-[0_40px_100px_rgba(0,0,0,0.8)] ring-1 ring-white/10 flex gap-2">
                {/* Left: Photos Section */}
                <div className="w-[80%] flex gap-2 p-1">
                  {/* Frame 1: Hackathon 2024 */}
                  <div className="flex-1 rounded-[20px] overflow-hidden border border-white/5 relative group/team-img shadow-2xl aspect-[16/10]">
                    <img
                      src="/images/team/hackathon_2024.jpg"
                      alt="Hackathon 2024"
                      className="w-full h-full object-cover group-hover/team-img:scale-110 transition-transform duration-700"
                      onError={(e) => {
                        e.currentTarget.src = "/images/logos/logo.jpg";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent flex flex-col justify-end p-4">
                      <p className="text-white text-[10px] font-black mb-0.5 tracking-tight uppercase">Hackathon 2024</p>
                      <p className="text-slate-300 text-[8px] font-bold opacity-80 uppercase tracking-tighter">Đội ngũ TechFuture</p>
                    </div>
                  </div>

                  {/* Frame 2: TopCV Founder Meeting */}
                  <div className="flex-1 rounded-[20px] overflow-hidden border border-white/5 relative group/founder-img shadow-2xl aspect-[16/10]">
                    <img
                      src="/images/team/contact.jpg"
                      alt="Founder TopCV Meeting"
                      className="w-full h-full object-cover group-hover/founder-img:scale-110 transition-transform duration-700"
                      onError={(e) => {
                        e.currentTarget.src = "/images/logos/logo.jpg";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent flex flex-col justify-end p-4">
                      <p className="text-white text-[10px] font-black mb-0.5 tracking-tight uppercase line-clamp-2">Làm việc cùng Founder Top CV</p>
                      <p className="text-emerald-400 text-[8px] font-bold opacity-80 uppercase tracking-tighter">Hợp tác & Phát triển</p>
                    </div>
                  </div>

                  {/* Frame 3: Achievements Slideshow */}
                  <div className="flex-1 rounded-[20px] overflow-hidden border border-white/5 relative group/cert-img shadow-2xl aspect-[16/10]">
                    {certificates.map((cert, idx) => (
                      <img
                        key={cert}
                        src={cert}
                        alt={`Achievement ${idx + 1}`}
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${idx === certIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                      />
                    ))}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent flex flex-col justify-end p-4 z-20">
                      <p className="text-white text-[10px] font-black mb-0.5 tracking-tight uppercase">Thành tích</p>
                      <p className="text-yellow-400 text-[8px] font-bold opacity-80 uppercase tracking-tighter">Giải thưởng tiêu biểu</p>
                    </div>
                  </div>
                </div>

                {/* Right: Links & Socials */}
                <div className="flex-1 p-3 flex flex-col gap-3 justify-between bg-white/5 rounded-[20px] border border-white/5">
                  <div className="flex flex-col gap-2">
                    <a href="/privacy" className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/10 transition-all group/item border border-transparent hover:border-white/10">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 flex-shrink-0 group-hover/item:scale-110 transition-transform">
                        <i className="fa-solid fa-user-shield text-sm"></i>
                      </div>
                      <p className="text-xs font-bold text-slate-100 group-hover/item:text-white">Bảo mật</p>
                    </a>
                    <a href="/terms" className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/10 transition-all group/item border border-transparent hover:border-white/10">
                      <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400 flex-shrink-0 group-hover/item:scale-110 transition-transform">
                        <i className="fa-solid fa-file-contract text-sm"></i>
                      </div>
                      <p className="text-xs font-bold text-slate-100 group-hover/item:text-white">Điều khoản</p>
                    </a>
                  </div>

                  <div className="flex items-center justify-center gap-4 pt-3 border-t border-white/10">
                    <a href="https://www.linkedin.com/in/tmhpprofile2801/" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-slate-900/80 border border-white/5 flex items-center justify-center text-slate-400 hover:text-[#0077b5] hover:border-[#0077b5]/50 transition-all group/social shadow-inner">
                      <i className="fa-brands fa-linkedin-in text-base group-hover/social:scale-110"></i>
                    </a>
                    <a href="https://github.com/TechFutureAIFPT" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-slate-900/80 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:border-white/50 transition-all group/social shadow-inner">
                      <i className="fa-brands fa-github text-base group-hover/social:scale-110"></i>
                    </a>
                    <a href="https://www.facebook.com/profile.php?id=61577736765345" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-slate-900/80 border border-white/5 flex items-center justify-center text-slate-400 hover:text-[#1877f2] hover:border-[#1877f2]/50 transition-all group/social shadow-inner">
                      <i className="fa-brands fa-facebook-f text-base group-hover/social:scale-110"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </button>

          <div className="flex items-center gap-6 lg:gap-10">
            {/* Navigation links grouped on the right */}
            <div className="hidden lg:flex items-center gap-6 text-sm text-slate-300">
              {primaryNavLinks.map((link) => (
                'megaMenu' in link ? (
                  <div key={link.label} className="relative">
                    <button
                      onClick={() => setActiveMegaMenu(activeMegaMenu === link.label ? null : link.label)}
                      className={`flex items-center gap-1.5 whitespace-nowrap px-5 py-2.5 rounded-xl transition-all font-bold text-xs uppercase tracking-wider shadow-lg shadow-black/20 ${activeMegaMenu === link.label ? 'bg-cyan-500/20 text-cyan-400 ring-1 ring-cyan-500/30' : 'bg-slate-800/40 text-slate-200 hover:bg-slate-800/80 hover:text-white'}`}
                    >
                      {link.label}
                      <i className={`fa-solid fa-chevron-down text-[10px] opacity-40 transition-transform duration-300 ml-1 ${activeMegaMenu === link.label ? 'rotate-180 opacity-100 text-cyan-400' : ''}`}></i>
                    </button>

                    {/* Mega Menu Dropdown */}
                    <div className={`absolute top-full left-0 right-0 -mt-[24px] lg:fixed lg:left-0 lg:right-0 lg:flex lg:justify-center opacity-0 translate-y-2 pointer-events-none transition-all duration-300 z-50 ${activeMegaMenu === link.label ? 'opacity-100 translate-y-0 pointer-events-auto' : ''}`}>
                      <div className="w-full max-w-5xl mx-2 sm:mx-4 lg:mx-6 bg-indigo-950/95 backdrop-blur-3xl border border-white/10 rounded-[24px] p-1.5 shadow-[0_40px_100px_rgba(0,0,0,0.8)] ring-1 ring-white/10 flex">
                        {/* Left Highlight Card - More Compact */}
                        <div className="hidden md:flex w-[28%] p-5 bg-gradient-to-br from-slate-900/80 to-slate-950/80 rounded-[20px] m-1 flex-col justify-end min-h-[180px] border border-white/5 relative overflow-hidden group/highlight">
                          <div className="absolute -top-16 -left-16 w-32 h-32 bg-cyan-500/10 blur-[50px] rounded-full group-hover/highlight:bg-cyan-500/20 transition-colors duration-700"></div>
                          <div className="relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 flex items-center justify-center text-cyan-400 text-xl mb-4 shadow-inner border border-cyan-500/10 group-hover/highlight:scale-110 transition-transform duration-500">
                              <i className={link.megaMenu.highlight.icon}></i>
                            </div>
                            <h3 className="text-base font-black text-white mb-1.5 tracking-tight">{link.megaMenu.highlight.title}</h3>
                            <p className="text-[12px] text-slate-400 leading-snug font-medium line-clamp-2">{link.megaMenu.highlight.desc}</p>

                            {('action' in link.megaMenu.highlight) && (link.megaMenu.highlight as any).action && (
                              <button
                                onClick={() => {
                                  const action = (link.megaMenu.highlight as any).action;
                                  if (action?.isStart) {
                                    handleStart();
                                  } else if (action?.href) {
                                    window.open(action.href, '_blank');
                                  } else if (action?.target) {
                                    handleSectionScroll(action.target);
                                  }
                                  setActiveMegaMenu(null);
                                }}
                                className="mt-4 px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 text-[11px] font-bold hover:bg-cyan-400 transition-all shadow-lg shadow-cyan-500/20 w-fit"
                              >
                                {(link.megaMenu.highlight as any).action.label}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Right Content - Traditional Grid, History, or Support */}
                        <div className="flex-1 p-4 overflow-hidden">
                          {('type' in link && (link as any).type === 'history') ? (
                            <div className="h-full flex flex-col gap-4 pr-1">
                              <div className="grid grid-cols-2 gap-3">
                                <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-4 flex flex-col justify-center items-center group/card">
                                  <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1 font-bold">Cache Entries</div>
                                  <div className="text-2xl font-black text-white tracking-tighter">
                                    {cacheStats.size}<span className="text-xs text-slate-500 ml-1">/100</span>
                                  </div>
                                </div>
                                <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-4 flex flex-col justify-center items-center">
                                  <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1 font-bold">Hit Rate</div>
                                  <div className="text-2xl font-black text-cyan-400 tracking-tighter">
                                    {cacheStats.hitRate.toFixed(1)}%
                                  </div>
                                </div>
                              </div>

                              <div className="flex gap-2">
                                <button
                                  onClick={refreshHistoryData}
                                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[11px] font-bold text-slate-300 transition-all border border-white/5 flex items-center justify-center gap-2"
                                >
                                  <i className="fa-solid fa-rotate"></i> Làm mới
                                </button>
                                <button
                                  onClick={handleClearCache}
                                  className="flex-1 py-3 bg-red-500/10 hover:bg-red-500/20 rounded-xl text-[11px] font-bold text-red-400 transition-all border border-red-500/10 flex items-center justify-center gap-2"
                                >
                                  <i className="fa-solid fa-trash-can"></i> Xóa Cache
                                </button>
                              </div>

                              <div className="flex-1 min-h-0 flex flex-col">
                                <div className="flex items-center justify-between mb-2 px-1">
                                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Gần đây</span>
                                  <div className="flex items-center gap-3">
                                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">
                                      {historyStats.totalSessions} Phiên
                                    </span>
                                    <button
                                      onClick={handleClearHistory}
                                      className="text-[10px] text-red-400 font-bold uppercase tracking-widest hover:text-red-300 transition-colors"
                                    >
                                      Xóa Lịch sử
                                    </button>
                                  </div>
                                </div>
                                <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                                  {recentHistory.length > 0 ? (
                                    recentHistory.slice(0, 5).map((entry, idx) => (
                                      <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 transition-all group/item cursor-default border border-transparent hover:border-white/5">
                                        <div className="flex items-center gap-2.5 overflow-hidden">
                                          <div className="w-1.5 h-1.5 rounded-full bg-cyan-500/50 shadow-[0_0_8px_rgba(6,182,212,0.5)]"></div>
                                          <span className="text-xs text-slate-300 truncate font-semibold group-hover/item:text-white transition-colors">
                                            {entry.jobPosition || 'Chưa đặt tên'}
                                          </span>
                                        </div>
                                        <span className="text-[10px] text-slate-500 font-bold ml-2">
                                          {formatDate(entry.timestamp)}
                                        </span>
                                      </div>
                                    ))
                                  ) : (
                                    <div className="h-20 flex items-center justify-center text-[11px] text-slate-600 font-medium italic">
                                      Chưa có lịch sử hoạt động
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 gap-2 content-center">
                              {('items' in link.megaMenu) && (link.megaMenu as any).items.map((item: any) => (
                                <button
                                  key={item.label}
                                  onClick={() => {
                                    if (item.href) {
                                      window.open(item.href, '_blank', 'noopener,noreferrer');
                                    } else if (item.target) {
                                      handleSectionScroll(item.target);
                                    }
                                    setActiveMegaMenu(null);
                                  }}
                                  className="w-full flex items-start gap-3 p-3 rounded-[16px] hover:bg-white/5 transition-all group/item text-left border border-transparent hover:border-white/5"
                                >
                                  <div className="w-9 h-9 rounded-lg bg-slate-900/50 flex items-center justify-center text-slate-500 group-hover/item:bg-cyan-500/10 group-hover/item:text-cyan-400 transition-all duration-300 shadow-inner flex-shrink-0 group-hover/item:scale-110">
                                    <i className={`${item.icon} text-base`}></i>
                                  </div>
                                  <div className="min-w-0 pt-0.5">
                                    <p className="text-[13px] font-bold text-slate-100 group-hover/item:text-white transition-colors mb-0.5">{item.label}</p>
                                    <p className="text-[10px] text-slate-500 line-clamp-1 group-hover/item:text-slate-400 transition-colors">{item.desc}</p>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : 'target' in link ? (
                  <button
                    key={link.label}
                    type="button"
                    onClick={() => handleSectionScroll(link.target)}
                    className={`whitespace-nowrap px-5 py-2.5 rounded-xl hover:bg-slate-800/80 hover:text-white transition-all font-bold text-xs uppercase tracking-wider ${link.target === 'pricing' ? 'bg-cyan-500/10 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.1)]' : 'bg-slate-800/40'}`}
                  >
                    {link.label}
                  </button>
                ) : (
                  <a
                    key={link.label}
                    href={(link as any).href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="whitespace-nowrap px-5 py-2.5 rounded-xl bg-slate-800/40 hover:bg-slate-800/80 text-slate-200 hover:text-white transition-all font-bold text-xs uppercase tracking-wider"
                  >
                    {link.label}
                  </a>
                )
              ))}
            </div>

            <div className="flex items-center gap-4 sm:gap-8">
              {isLoggedIn ? (
                <div className="group">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden cursor-pointer hover:ring-2 hover:ring-cyan-400/50 transition-all flex items-center justify-center bg-slate-800/40"
                    title="Menu tài khoản"
                  >
                    <img
                      src={userAvatar || "/images/logos/logo.jpg"}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.style.display = 'none';
                        const fallback = target.nextElementSibling as HTMLElement | null;
                        if (fallback) fallback.classList.remove('hidden');
                      }}
                    />
                    <div className="hidden w-full h-full flex items-center justify-center text-xs font-bold text-white bg-gradient-to-br from-cyan-500 to-emerald-400">
                      {userName ? userName.charAt(0).toUpperCase() : 'U'}
                    </div>
                  </button>

                  <div className={`absolute top-full left-0 right-0 -mt-[22px] lg:fixed lg:left-0 lg:right-0 lg:flex lg:justify-center ${showUserMenu ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-2 pointer-events-none'} transition-all duration-300 z-50`}>
                    <div className="w-full max-w-7xl mx-2 sm:mx-[5%] lg:mx-6 bg-indigo-950/95 backdrop-blur-3xl border border-white/10 rounded-[28px] p-1.5 shadow-[0_40px_120px_rgba(0,0,0,0.9)] ring-1 ring-white/10 flex">
                      {/* Left Highlight Card - User Profile */}
                      <div className="w-[32%] p-5 bg-gradient-to-br from-slate-900/80 to-slate-950/80 rounded-[24px] m-1 flex flex-col justify-center border border-white/5 relative overflow-hidden group/profile min-h-[160px]">
                        <div className="absolute -top-24 -left-24 w-48 h-48 bg-purple-500/10 blur-[80px] rounded-full group-hover/profile:bg-purple-500/20 transition-colors duration-700"></div>
                        <div className="relative z-10">
                          <div className="flex items-start gap-4">
                            {/* Avatar */}
                            <div className="w-12 h-12 rounded-xl bg-indigo-500/15 flex items-center justify-center shadow-inner border border-white/10 overflow-hidden flex-shrink-0">
                              <img
                                src={userAvatar || "/images/logos/logo.jpg"}
                                alt="Profile"
                                className="w-full h-full object-cover"
                              />
                            </div>

                            {/* User Info & Actions */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <h3 className="text-lg font-black text-white truncate tracking-tight">
                                  {userName || (userEmail ? userEmail.split('@')[0] : 'User')}
                                </h3>

                                <div className="flex items-center gap-2 flex-shrink-0">
                                  {/* Status Icon */}
                                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" title="Đang hoạt động"></div>

                                  {/* Logout Icon Button */}
                                  <button
                                    onClick={() => {
                                      setShowUserMenu(false);
                                      onLogout?.();
                                    }}
                                    className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/40 transition-all flex items-center justify-center group/logout"
                                    title="Đăng xuất"
                                  >
                                    <i className="fa-solid fa-right-from-bracket text-[10px] group-hover/logout:translate-x-0.5 transition-transform"></i>
                                  </button>
                                </div>
                              </div>
                              <p className="text-[11px] text-slate-400 font-medium truncate opacity-80">{userEmail}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Column List - Account History & Stats */}
                      <div className="flex-1 p-5 flex flex-col gap-4 overflow-hidden">
                        {/* Header Actions */}
                        <div className="flex items-center justify-between">
                          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <i className="fa-solid fa-clock-rotate-left"></i> Lịch sử và Thống kê
                          </h4>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={refreshHistoryData}
                              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 border border-white/5 transition-all flex items-center justify-center"
                              title="Làm mới"
                            >
                              <i className="fa-solid fa-rotate text-[10px]"></i>
                            </button>
                            <button
                              onClick={handleClearHistory}
                              className="text-[10px] text-red-400/70 font-bold uppercase tracking-widest hover:text-red-400 transition-colors"
                            >
                              Xóa tất cả
                            </button>
                          </div>
                        </div>

                        {/* Middle Row - Mini Stats */}
                        <div className="grid grid-cols-3 gap-2.5">
                          <div className="bg-slate-900/40 border border-white/5 rounded-xl p-2.5 flex flex-col items-center">
                            <div className="text-[8px] text-slate-500 uppercase tracking-widest mb-0.5 font-bold">Cache</div>
                            <div className="text-lg font-black text-white">{cacheStats.size}<span className="text-[9px] text-slate-500 ml-0.5">/100</span></div>
                          </div>
                          <div className="bg-slate-900/40 border border-white/5 rounded-xl p-2.5 flex flex-col items-center">
                            <div className="text-[8px] text-slate-500 uppercase tracking-widest mb-0.5 font-bold">Hit Rate</div>
                            <div className="text-lg font-black text-cyan-400">{cacheStats.hitRate.toFixed(0)}%</div>
                          </div>
                          <div className="bg-slate-900/40 border border-white/5 rounded-xl p-2.5 flex flex-col items-center">
                            <div className="text-[8px] text-slate-500 uppercase tracking-widest mb-0.5 font-bold">Sessions</div>
                            <div className="text-lg font-black text-emerald-400">{historyStats.totalSessions}</div>
                          </div>
                        </div>

                        {/* Bottom - Recent Activity List */}
                        <div className="flex-1 min-h-[100px] flex flex-col">
                          <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                            {recentHistory.length > 0 ? (
                              recentHistory.slice(0, 3).map((entry, idx) => (
                                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 transition-all group/item cursor-default border border-transparent hover:border-white/5">
                                  <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.3)] flex-shrink-0"></div>
                                    <span className="text-xs text-slate-300 truncate font-semibold group-hover/item:text-white transition-colors">
                                      {entry.jobPosition || 'Chưa đặt tên'}
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-slate-500 font-bold ml-2">
                                    {formatDate(entry.timestamp)}
                                  </span>
                                </div>
                              ))
                            ) : (
                              <div className="h-full flex items-center justify-center text-[11px] text-slate-600 font-medium italic">
                                Chưa có lịch sử hoạt động
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Final Action Button */}
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            setActiveStep('jd');
                          }}
                          className="mt-2 w-full py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
                        >
                          <i className="fa-solid fa-play text-[10px]"></i> BẮT ĐẦU PHIÊN MỚI
                        </button>
                      </div>
                    </div>
                  </div>
                  {showUserMenu && (
                    <div
                      className="fixed inset-0 z-40 bg-black/10 backdrop-blur-[2px]"
                      onClick={() => setShowUserMenu(false)}
                    ></div>
                  )}
                </div>
              )
                : (
                  <div className="flex items-center gap-2 sm:gap-4">
                    <button
                      onClick={onLoginRequest}
                      className="px-6 py-2.5 text-xs sm:text-sm font-black text-slate-950 bg-white rounded-full hover:bg-slate-100 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/5"
                    >
                      Login
                    </button>
                    <button
                      onClick={handleStart}
                      className="h-10 sm:h-12 px-6 sm:px-8 rounded-full bg-gradient-to-r from-cyan-500 via-sky-500 to-emerald-500 text-slate-950 text-xs sm:text-sm font-black shadow-lg shadow-cyan-500/25 hover:scale-105 hover:shadow-cyan-500/40 transition-all active:scale-95 flex items-center gap-2"
                    >
                      <div className="w-5 h-5 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm group/btn-icon">
                        <i className="fa-solid fa-shapes text-[10px]"></i>
                      </div>
                      Get Started for Free
                    </button>
                  </div>
                )}
            </div>
          </div>

          {/* Global Overlay for Mega Menus */}
          {activeMegaMenu && (
            <div
              className="fixed inset-0 z-40 bg-black/5 backdrop-blur-[1px]"
              onClick={() => setActiveMegaMenu(null)}
            ></div>
          )}
        </nav>
        <div id="hero" className="rounded-3xl p-4 sm:p-8 sm:py-10 lg:py-16 overflow-hidden flex flex-col items-center justify-center text-center">
          <div className="w-full max-w-4xl space-y-10">
            <div className="space-y-6">
              <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black text-white leading-tight break-words">
                Sàng Lọc CV{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-emerald-300 block sm:inline mt-1 sm:mt-0">
                  {typedHighlight || '\u00A0'}
                </span>
              </h1>
            </div>
            <p className="text-sm sm:text-xl text-slate-300 w-full max-w-2xl mx-auto leading-relaxed break-words">
              Nền tảng AI đọc hiểu hồ sơ chuyên sâu, tự động xếp hạng và tìm kiếm những ứng viên tài năng nhất phù hợp với doanh nghiệp.
            </p>
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row flex-wrap gap-4 w-full justify-center items-center">
                <button
                  onClick={handleStart}
                  className="h-12 sm:h-16 px-10 rounded-full bg-white text-slate-950 font-black text-lg sm:text-xl shadow-[0_20px_50px_rgba(255,255,255,0.2)] hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto whitespace-nowrap flex items-center justify-center active:scale-95"
                >
                  Bắt đầu ngay
                </button>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleSectionScroll('steps')}
                    className="h-12 sm:h-16 px-8 rounded-full bg-slate-800/50 text-slate-200 font-bold hover:bg-slate-700/50 w-full sm:w-auto whitespace-nowrap flex items-center justify-center transition-all border border-white/5 active:scale-95"
                  >
                    Xem quy trình
                  </button>
                  {canContinue && (
                    <button
                      onClick={() => setActiveStep(nextStep)}
                      className="h-12 sm:h-16 px-8 flex items-center justify-center gap-2 rounded-full bg-slate-800/50 text-slate-200 font-bold hover:bg-slate-700/50 w-full sm:w-auto whitespace-nowrap transition-all border border-white/5 active:scale-95"
                    >
                      <i className="fa-regular fa-circle-play text-cyan-400"></i>
                      Tiếp tục bước {flowOrder.indexOf(nextStep) + 1 || 4}
                    </button>
                  )}
                </div>
              </div>
              <p className="text-xs text-slate-500 font-medium tracking-wide">
                7 day free trial. No credit card required.
              </p>
            </div>
          </div>
        </div>

        {/* ── App Preview Card with Play Button ── */}
        <div
          className="relative w-full max-w-4xl mx-auto mt-6 mb-4 cursor-pointer group/preview px-3 sm:px-0"
          onClick={() => setIsVideoOpen(true)}
        >
          {/* Outer glow ring */}
          <div className="absolute -inset-1 rounded-[28px] bg-gradient-to-br from-blue-600/40 via-purple-500/25 to-cyan-600/40 blur-xl opacity-60 group-hover/preview:opacity-100 transition-opacity duration-500" />

          {/* Card */}
          <div className="relative rounded-[20px] overflow-hidden border border-white/10 shadow-[0_32px_80px_rgba(0,0,0,0.6)] bg-slate-950">

            {/* Video preview frame */}
            <div className="relative aspect-video overflow-hidden bg-slate-950">
              <video
                src="/images/video demo/SPHR Ver3.mp4"
                muted
                playsInline
                preload="metadata"
                className="w-full h-full object-cover opacity-75 group-hover/preview:opacity-95 scale-[1.01] group-hover/preview:scale-100 transition-all duration-500"
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-slate-950/30 group-hover/preview:from-slate-950/40 transition-all duration-300" />

              {/* Center Play Button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  {/* Ripple effect */}
                  <div className="absolute inset-0 rounded-full bg-white/20 scale-110 group-hover/preview:scale-150 opacity-0 group-hover/preview:opacity-0 transition-all duration-500 animate-ping" />
                  {/* Button */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-[0_8px_40px_rgba(0,0,0,0.5)] group-hover/preview:scale-110 group-hover/preview:bg-white transition-all duration-300">
                    <i className="fa-solid fa-play text-slate-900 text-xl sm:text-2xl ml-1"></i>
                  </div>
                </div>
              </div>

              {/* LIVE badge */}
              <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm border border-white/10 rounded-full px-3 py-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                <span className="text-white text-xs font-bold tracking-wide">DEMO</span>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="px-5 py-3 flex items-center justify-between bg-slate-900/90 border-t border-white/5">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-circle-play text-blue-400 text-sm"></i>
                <span className="text-slate-300 text-sm font-semibold">SPHR – AI CV Screening</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500 text-xs font-medium group-hover/preview:text-slate-300 transition-colors">
                <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
                Nhấn để xem video
              </div>
            </div>
          </div>
        </div>


        <div className="mt-10 sm:mt-16 py-10 overflow-hidden">
          <p className="text-center text-[10px] font-bold tracking-[0.3em] text-slate-500 uppercase mb-8">
            Powered by Modern Technologies
          </p>

          <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] pointer-events-none">
            <div className="flex animate-scroll gap-16 w-max">
              {[
                { name: 'Tailwind CSS', icon: 'fa-brands fa-css3-alt', color: 'text-[#38bdf8]' },
                { name: 'Python', icon: 'fa-brands fa-python', color: 'text-[#ffd343]' },
                { name: 'Gemini AI', icon: 'fa-solid fa-brain', color: 'text-[#8e75ff]' },
                { name: 'Firebase', icon: 'fa-solid fa-fire', color: 'text-[#ff9100]' },
                { name: 'Vercel', icon: 'fa-solid fa-server', color: 'text-white' },
                { name: 'React', icon: 'fa-brands fa-react', color: 'text-[#00d8ff]' },
                { name: 'TypeScript', icon: 'fa-brands fa-js', color: 'text-[#3178c6]' },
                { name: 'Rapid API', icon: 'fa-solid fa-cloud-bolt', color: 'text-[#0055ff]' },
              ].concat([
                { name: 'Tailwind CSS', icon: 'fa-brands fa-css3-alt', color: 'text-[#38bdf8]' },
                { name: 'Python', icon: 'fa-brands fa-python', color: 'text-[#ffd343]' },
                { name: 'Gemini AI', icon: 'fa-solid fa-brain', color: 'text-[#8e75ff]' },
                { name: 'Firebase', icon: 'fa-solid fa-fire', color: 'text-[#ff9100]' },
                { name: 'Vercel', icon: 'fa-solid fa-server', color: 'text-white' },
                { name: 'React', icon: 'fa-brands fa-react', color: 'text-[#00d8ff]' },
                { name: 'TypeScript', icon: 'fa-brands fa-js', color: 'text-[#3178c6]' },
                { name: 'Rapid API', icon: 'fa-solid fa-cloud-bolt', color: 'text-[#0055ff]' },
              ]).concat([
                { name: 'Tailwind CSS', icon: 'fa-brands fa-css3-alt', color: 'text-[#38bdf8]' },
                { name: 'Python', icon: 'fa-brands fa-python', color: 'text-[#ffd343]' },
                { name: 'Gemini AI', icon: 'fa-solid fa-brain', color: 'text-[#8e75ff]' },
                { name: 'Firebase', icon: 'fa-solid fa-fire', color: 'text-[#ff9100]' },
                { name: 'Vercel', icon: 'fa-solid fa-server', color: 'text-white' },
                { name: 'React', icon: 'fa-brands fa-react', color: 'text-[#00d8ff]' },
                { name: 'TypeScript', icon: 'fa-brands fa-js', color: 'text-[#3178c6]' },
                { name: 'Rapid API', icon: 'fa-solid fa-cloud-bolt', color: 'text-[#0055ff]' },
              ]).map((tech, idx) => (
                <div key={`${tech.name}-${idx}`} className="flex items-center gap-3 text-slate-300 group cursor-default whitespace-nowrap">
                  <i className={`${tech.icon} text-2xl ${tech.color}`}></i>
                  <span className="text-sm font-bold uppercase tracking-wider">{tech.name}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative w-full mt-10 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] pointer-events-none">
            <div className="flex animate-scroll-reverse gap-12 w-max">
              {[...partners, ...partners, ...partners, ...partners].map((partner, idx) => (
                <div key={`${partner.name}-${idx}`} className="h-10 w-28 flex items-center justify-center brightness-125">
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    className="h-full object-contain filter drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div id="steps" className="mt-10 sm:mt-20 -mx-3 sm:-mx-8 lg:-mx-14 px-3 sm:px-8 lg:px-14 py-8 sm:py-14">
          <div className="text-center mb-12">
            <p className="text-[10px] tracking-[0.4em] text-indigo-400/70 uppercase mb-2">Quy trình</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">4 bước đơn giản</h2>
          </div>

          <div className="relative">
            {/* Connecting Line (desktop) */}
            <div className="hidden md:block absolute top-6 left-[12.5%] right-[12.5%] h-px bg-white/5"></div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-6">
              {steps.map((step, index) => (
                <div key={step.id} className="flex flex-col items-center text-center group">
                  {/* Icon */}
                  <div className="relative w-12 h-12 rounded-2xl bg-indigo-950 border border-white/8 flex items-center justify-center group-hover:border-cyan-500/30 group-hover:bg-indigo-900/60 transition-all duration-300 shadow-md">
                    <div className="text-lg text-slate-400 group-hover:text-cyan-400 transition-colors duration-300">
                      {index === 0 && <i className="fa-solid fa-file-import"></i>}
                      {index === 1 && <i className="fa-solid fa-sliders"></i>}
                      {index === 2 && <i className="fa-solid fa-cloud-arrow-up"></i>}
                      {index === 3 && <i className="fa-solid fa-chart-pie"></i>}
                    </div>
                    <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-slate-900 border border-white/10 text-[9px] font-black text-slate-500 flex items-center justify-center">{step.id}</span>
                  </div>
                  {/* Label */}
                  <div className="mt-5">
                    <h3 className="text-sm font-bold text-slate-100 group-hover:text-white transition-colors">{step.label}</h3>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{step.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Logo slider moved below modern technologies section */}


        <div id="why-support-hr" className="mt-8 sm:mt-12 -mx-3 sm:-mx-8 lg:-mx-14 px-3 sm:px-8 lg:px-14 py-8 sm:py-12">
          <div className="grid gap-10 lg:grid-cols-2 items-start">
            <div>
              <p className="text-[10px] font-bold tracking-[0.4em] text-indigo-400/70 uppercase">Lý do chọn</p>
              <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-white">
                Tại sao chọn <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">Support HR?</span>
              </h2>

              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/3 p-4">
                  <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-400">
                    <i className="fa-solid fa-xmark text-xs"></i>
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-200">Quy trình thủ công</p>
                    <p className="text-xs text-slate-500 mt-0.5">30-45 phút/CV. Dễ bỏ sót ứng viên.</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 rounded-xl border border-emerald-500/10 bg-emerald-500/5 p-4">
                  <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
                    <i className="fa-solid fa-check text-xs"></i>
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-100">Quy trình Support HR AI</p>
                    <p className="text-xs text-slate-400 mt-0.5">100 CV trong 2 phút. Tự động highlight kỹ năng.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { value: '85%', label: 'Thời gian tiết kiệm', color: 'text-cyan-400' },
                { value: '3X', label: 'Tốc độ tuyển dụng', color: 'text-indigo-400' },
                { value: '99%', label: 'Độ hài lòng', color: 'text-violet-400' },
                { value: '0đ', label: 'Chi phí dùng thử', color: 'text-emerald-400' }
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/5 bg-white/3 p-5 flex flex-col gap-1.5 hover:border-white/10 hover:bg-white/5 transition-all"
                >
                  <span className={`text-3xl font-black tracking-tight ${stat.color}`}>{stat.value}</span>
                  <span className="text-[11px] text-slate-500 uppercase tracking-widest font-medium">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div id="compare" className="mt-8 sm:mt-12 -mx-3 sm:-mx-8 lg:-mx-14 px-3 sm:px-8 lg:px-14 py-8 sm:py-12">
          <p className="text-[10px] font-bold tracking-[0.4em] text-indigo-400/70 uppercase">So sánh</p>
          <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-white">Support HR vs ChatGPT</h2>

          <div className="mt-8">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <div className="min-w-[680px] rounded-2xl border border-white/5 overflow-hidden">
                {/* Header */}
                <div className="grid grid-cols-[1.5fr_1fr_1fr] px-5 py-3 text-[10px] uppercase tracking-[0.35em] text-slate-600 bg-white/3 border-b border-white/5">
                  <div>Tiêu chí</div>
                  <div>
                    <p className="text-slate-300 text-xs normal-case tracking-tight font-semibold">ChatGPT</p>
                    <p className="text-[10px] text-slate-600 normal-case tracking-wide mt-0.5">AI tổng quát</p>
                  </div>
                  <div>
                    <p className="text-emerald-400 text-xs normal-case tracking-tight font-semibold">Support HR</p>
                    <p className="text-[10px] text-slate-600 normal-case tracking-wide mt-0.5">AI chuyên biệt</p>
                  </div>
                </div>

                <div>
                  {comparisonRows.map((row, index) => (
                    <div
                      key={row.label}
                      className={`grid grid-cols-[1.5fr_1fr_1fr] px-5 py-4 border-b border-white/5 last:border-b-0 transition-colors hover:bg-white/3 ${row.emphasis ? 'bg-emerald-500/3' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 text-slate-400 text-sm flex-shrink-0">
                          <i className={row.icon}></i>
                        </span>
                        <p className="text-sm font-medium text-slate-200">{row.label}</p>
                      </div>
                      <div className="flex items-center">{renderStatusCell(row.chatgpt)}</div>
                      <div className="flex items-center">{renderStatusCell(row.support)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-2">
              {comparisonRows.map((row) => (
                <div
                  key={row.label}
                  className={`rounded-xl border border-white/5 p-4 ${row.emphasis ? 'border-emerald-500/10 bg-emerald-500/3' : 'bg-white/3'}`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 text-slate-400">
                      <i className={`${row.icon} text-sm`}></i>
                    </span>
                    <p className="text-sm font-semibold text-slate-100">{row.label}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-slate-600 mb-1">ChatGPT</p>
                      <div className="flex items-start gap-2">
                        <i className={`${statusStyles[row.chatgpt.status].icon} mt-0.5 text-xs ${row.chatgpt.status === 'negative' ? 'text-rose-400' : 'text-slate-500'}`}></i>
                        <span className="text-xs text-slate-400 leading-tight">{row.chatgpt.text}</span>
                      </div>
                    </div>

                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-emerald-500/70 mb-1">Support HR</p>
                      <div className="flex items-start gap-2">
                        <i className={`${statusStyles[row.support.status].icon} mt-0.5 text-xs text-emerald-400`}></i>
                        <span className={`text-xs leading-tight ${row.support.status === 'highlight' ? 'text-white font-semibold' : 'text-emerald-300/80'}`}>{row.support.text}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>


      </section >

      {/* ── Video Popup Modal ── */}
      {isVideoOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          onClick={() => setIsVideoOpen(false)}
        >
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" style={{ animation: 'fadeIn .2s ease' }} />
          <div
            className="relative z-10 w-full max-w-4xl rounded-2xl overflow-hidden border border-slate-700 shadow-2xl shadow-black/70"
            style={{ animation: 'scaleIn .25s ease' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3 bg-slate-900/95 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-circle-play text-blue-400"></i>
                <span className="text-white font-semibold text-sm">Video Demo – SPHR</span>
              </div>
              <button
                onClick={() => setIsVideoOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
              >
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>
            <div className="bg-black aspect-video">
              <video
                src="/images/video demo/SPHR Ver3.mp4"
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          <style>{`
            @keyframes fadeIn  { from { opacity:0 } to { opacity:1 } }
            @keyframes scaleIn { from { opacity:0; transform:scale(.92) } to { opacity:1; transform:scale(1) } }
          `}</style>
        </div>
      )}

      <ChatBubble />
    </div >
  );
};

export default HomePage;
