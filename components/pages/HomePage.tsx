import React, { useEffect, useMemo, useState } from 'react';
import ChatBubble from '../ui/ChatBubble';
import type { AppStep } from '../../types';

interface HomePageProps {
  setActiveStep: (step: AppStep) => void;
  isLoggedIn: boolean;
  onLoginRequest: () => void;
  completedSteps: AppStep[];
}

const flowOrder: AppStep[] = ['jd', 'weights', 'upload', 'analysis'];

type NavLink =
  | { label: string; target: string }
  | { label: string; href: string };

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

const HomePage: React.FC<HomePageProps> = ({ setActiveStep, isLoggedIn, onLoginRequest, completedSteps }) => {
  const heroHighlight = 'Nhanh Gấp 10 Lần.';
  const [typedHighlight, setTypedHighlight] = useState('');

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

  const handleStart = () => {
    if (isLoggedIn) {
      setActiveStep('jd');
    } else {
      onLoginRequest();
    }
  };


  const primaryNavLinks: NavLink[] = [
    { label: 'Tính năng', target: 'features' },
    { label: 'Quy trình', target: 'steps' },
    { label: 'Doanh nghiệp', target: 'partners' },
    { label: 'Lý do chọn', target: 'why-support-hr' },
    { label: 'So sánh', target: 'compare' },
  ];

  const handleSectionScroll = (targetId: string) => {
    if (typeof window === 'undefined') return;
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const nextStep = useMemo(() => {
    const pending = flowOrder.find((step) => !completedSteps.includes(step));
    return pending || 'analysis';
  }, [completedSteps]);

  const canContinue = completedSteps.length > 0;

  const features = [
    { 
      title: 'Sàng Lọc Hồ Sơ', 
      desc: 'Thiết lập tiêu chí đa chiều, tự động lọc và xếp hạng ứng viên tiềm năng nhất.',
      icon: 'fa-solid fa-filter-circle-dollar',
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10 border border-cyan-500/20',
      glow: 'bg-cyan-500'
    },
    { 
      title: 'Bộ Công cụ hỗ trợ HR', 
      desc: 'Trợ lý AI toàn năng: Phân tích sâu, gợi ý phỏng vấn và đánh giá mức lương.',
      icon: 'fa-solid fa-briefcase-medical',
      color: 'text-purple-400',
      bg: 'bg-purple-500/10 border border-purple-500/20',
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
    { id: '01', label: 'Nhập JD', detail: 'Dán nội dung hoặc tải file PDF/DOCX/PNG.' },
    { id: '02', label: 'Cấu hình lọc', detail: 'Điều chỉnh trọng số + hard filter.' },
    { id: '03', label: 'Upload CV', detail: 'Kéo thả hàng loạt hồ sơ.' },
    { id: '04', label: 'Xem kết quả', detail: 'AI trả về bảng điểm & gợi ý phỏng vấn.' },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-slate-100 overflow-x-hidden">
      <section className="w-full px-3 sm:px-8 lg:px-14 py-6 sm:py-12">
        <nav className="w-full mb-6 sm:mb-10 rounded-2xl border border-slate-800/80 bg-slate-950/70 backdrop-blur-sm px-3 py-3 sm:px-6 sm:py-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-slate-700 overflow-hidden relative">
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
                HR
              </div>
            </div>
            <div>
              <p className="text-sm sm:text-base font-semibold text-white">SupportHR</p>
              <p className="text-[10px] sm:text-xs text-slate-400">AI Screening Platform</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3 text-sm text-slate-300 overflow-x-auto pb-1 lg:pb-0 -mx-1 px-1 lg:mx-0 lg:px-0 no-scrollbar mask-linear-fade">
            {primaryNavLinks.map((link) => (
              'href' in link ? (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="whitespace-nowrap px-3 py-1.5 rounded-full border border-transparent hover:border-cyan-500/50 hover:text-white transition bg-slate-900/50 lg:bg-transparent"
                >
                  {link.label}
                </a>
              ) : (
                <button
                  key={link.target}
                  type="button"
                  onClick={() => handleSectionScroll(link.target)}
                  className="whitespace-nowrap px-3 py-1.5 rounded-full border border-transparent hover:border-cyan-500/50 hover:text-white transition bg-slate-900/50 lg:bg-transparent"
                >
                  {link.label}
                </button>
              )
            ))}
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3 justify-between sm:justify-end">
            <button
              onClick={handleStart}
              className="h-9 sm:h-10 px-4 sm:px-5 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400 text-slate-950 text-xs sm:text-sm font-semibold whitespace-nowrap w-full sm:w-auto"
            >
              Bắt đầu ngay
            </button>
          </div>
        </nav>
        <div id="hero" className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-4 sm:p-8 shadow-[0_25px_120px_rgba(2,6,23,0.6)] overflow-hidden">
          <div className="grid gap-8 lg:gap-10 lg:grid-cols-2">
            <div className="space-y-5 sm:space-y-6 w-full flex flex-col items-center text-center sm:items-start sm:text-left">
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-900/70 border border-slate-800 px-3 py-1 sm:px-4 text-[11px] sm:text-[13px] text-slate-300">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-cyan-400"></span>
                Công nghệ AI tuyển dụng 2025
              </span>
              <div>
                <p className="text-[10px] sm:text-xs font-bold tracking-normal sm:tracking-widest text-cyan-200 uppercase mb-2 break-words">
                  Trang chủ tối giản cho quy trình lọc CV
                </p>
                <h1 className="text-2xl sm:text-4xl lg:text-6xl font-black text-white leading-tight break-words">
                  Sàng Lọc CV{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-emerald-300 block sm:inline mt-1 sm:mt-0">
                    {typedHighlight || '\u00A0'}
                  </span>
                </h1>
              </div>
              <p className="text-sm sm:text-lg text-slate-300 w-full max-w-full sm:max-w-xl leading-relaxed text-center sm:text-left break-words">
                Support HR sử dụng mô hình ngôn ngữ lớn (LLM) để đọc hiểu CV như một chuyên gia nhân sự, tự động xếp hạng và tìm ra ứng viên sáng giá nhất cho bạn.
              </p>
              <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 w-full sm:w-auto justify-center sm:justify-start">
                <button
                  onClick={handleStart}
                  className="h-11 sm:h-14 px-6 rounded-2xl bg-white text-slate-900 font-semibold text-base sm:text-lg shadow-lg shadow-cyan-500/30 hover:-translate-y-0.5 transition w-full sm:w-auto whitespace-nowrap flex items-center justify-center"
                >
                  Bắt đầu ngay
                </button>
                <button
                  onClick={() => handleSectionScroll('steps')}
                  className="h-11 sm:h-14 px-6 rounded-2xl border border-slate-700 text-slate-200 font-semibold hover:border-cyan-500/60 w-full sm:w-auto whitespace-nowrap flex items-center justify-center"
                >
                  Xem quy trình
                </button>
                {canContinue && (
                  <button
                    onClick={() => setActiveStep(nextStep)}
                    className="h-11 sm:h-14 px-6 flex items-center justify-center gap-2 rounded-2xl border border-slate-700 text-slate-200 font-semibold hover:border-cyan-500/60 w-full sm:w-auto whitespace-nowrap"
                  >
                    <i className="fa-regular fa-circle-play"></i>
                    Tiếp tục bước {flowOrder.indexOf(nextStep) + 1 || 4}
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm text-slate-300 justify-center sm:justify-start">
                {['Không cần thẻ tín dụng', 'Setup trong 2 phút'].map((item) => (
                  <span key={item} className="flex items-center gap-2">
                    <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-emerald-500/10 text-emerald-300 flex items-center justify-center text-[10px] sm:text-xs">
                      ✓
                    </span>
                    {item}
                  </span>
                ))}
              </div>
              <div className="flex flex-col gap-3 sm:flex-row w-full sm:w-auto">
                {!isLoggedIn && (
                  <button
                    onClick={onLoginRequest}
                    className="h-10 sm:h-11 px-5 flex items-center justify-center gap-2 rounded-xl border border-slate-700 text-slate-200 hover:border-slate-500 w-full sm:w-auto text-sm"
                  >
                    <i className="fa-solid fa-right-to-bracket"></i>
                    Đăng nhập để trải nghiệm
                  </button>
                )}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -top-10 -right-8 w-56 h-56 bg-cyan-500/20 blur-3xl rounded-full"></div>
              <div className="absolute -bottom-12 -left-6 w-48 h-48 bg-purple-500/20 blur-3xl rounded-full"></div>
              <div className="relative rounded-[32px] border border-slate-800 bg-gradient-to-b from-[#0b1220] via-[#070d18] to-[#04070d] p-6 shadow-[0_25px_80px_rgba(3,7,18,0.7)] overflow-visible lg:mr-0">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-4">
                  <div className="flex items-center gap-2">
                    {['bg-red-400','bg-amber-300','bg-emerald-400'].map(color => (
                      <span key={color} className={`w-2.5 h-2.5 rounded-full ${color}`}></span>
                    ))}
                  </div>
                  <span className="tracking-[0.35em] text-slate-500">SCAN_ID: 8492A</span>
                </div>

                <div className="relative rounded-[28px] border border-white/5 bg-[#11192b] p-5 shadow-inner overflow-hidden group">
                  {/* Scan Line Animation */}
                  <div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-scan-line z-20 shadow-[0_0_15px_rgba(34,211,238,0.5)]"></div>
                  
                  <div className="flex items-center gap-3 mb-6 relative z-10">
                    <div className="w-12 h-12 rounded-full border border-white/15 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center text-white text-xl">
                      <i className="fa-regular fa-user"></i>
                    </div>
                    <div className="flex-1">
                      <div className="h-3 w-28 rounded-full bg-slate-800/70 mb-2"></div>
                      <div className="h-2 w-20 rounded-full bg-slate-800/60"></div>
                    </div>
                    <span className="text-[11px] text-slate-500">ID 4829A</span>
                  </div>

                  {[{
                    label: 'Java Spring', value: '95%', percent: 95, accent: 'from-cyan-400 to-emerald-300', text: 'text-emerald-200'
                  }, {
                    label: 'ReactJS', value: '88%', percent: 88, accent: 'from-sky-400 to-sky-200', text: 'text-sky-200'
                  }, {
                    label: 'English (IELTS)', value: '7.0', percent: 70, accent: 'from-amber-400 to-amber-200', text: 'text-amber-300'
                  }].map((skill, idx) => (
                    <div key={skill.label} className={`pb-4 ${idx === 2 ? 'pb-0' : 'border-b border-white/5 mb-4'} relative z-10`}>
                      <div className="flex items-center justify-between text-sm text-slate-200 mb-1">
                        <span>{skill.label}</span>
                        <span className={`font-semibold ${skill.text}`}>{skill.value}</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-800/80 overflow-hidden">
                        <div className={`h-full rounded-full bg-gradient-to-r ${skill.accent} animate-[pulse_3s_ease-in-out_infinite]`} style={{ width: `${skill.percent}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-[24px] border border-emerald-500/40 bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 px-5 py-4 flex items-center justify-between shadow-[0_20px_40px_rgba(6,40,26,0.35)] relative overflow-hidden">
                  <div className="absolute inset-0 bg-emerald-500/5 animate-pulse"></div>
                  <div className="relative z-10">
                    <p className="text-xs text-emerald-200/80 uppercase tracking-[0.35em]">Matching score</p>
                    <p className="text-4xl font-bold text-emerald-300">96.8%</p>
                  </div>
                  <span className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-400/60 text-emerald-200 flex items-center justify-center text-2xl relative z-10">
                    <i className="fa-solid fa-check"></i>
                    <div className="absolute inset-0 bg-emerald-500/20 rounded-2xl animate-ping opacity-20"></div>
                  </span>
                </div>


              </div>
            </div>
          </div>
        </div>



        <div id="features" className="mt-8 sm:mt-12 grid gap-6 lg:grid-cols-3">
          {/* JD Standardizer - Takes 2 columns */}
          <div className="lg:col-span-2 relative rounded-3xl overflow-hidden border border-cyan-500/20 bg-slate-900/40 backdrop-blur-sm group">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            
            <div className="relative p-6 lg:p-8 flex flex-col lg:flex-row items-center gap-8 h-full">
              {/* Left Content */}
              <div className="flex-1 text-center lg:text-left space-y-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-3">
                    <i className="fa-solid fa-wand-magic-sparkles"></i>
                    AI Tool
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                    Parse JD <span className="text-slate-500 font-light">Standardizer</span>
                  </h2>
                  <p className="text-slate-400 text-base">
                    Biến mọi bản mô tả công việc lộn xộn thành cấu trúc chuẩn AI. Tách bạch yêu cầu, quyền lợi và kỹ năng chỉ trong 1 click.
                  </p>
                </div>

                <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                  <a
                    href="https://parse-jd.vercel.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-10 px-6 rounded-xl bg-white text-slate-900 font-bold flex items-center gap-2 hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.3)] text-sm"
                  >
                    <span>Mở công cụ</span>
                    <i className="fa-solid fa-arrow-up-right-from-square text-xs"></i>
                  </a>
                  <button
                    onClick={handleStart}
                    className="h-10 px-6 rounded-xl border border-slate-600 text-slate-200 font-semibold hover:bg-slate-800 transition-colors text-sm"
                  >
                    Dán vào SupportHR
                  </button>
                </div>
              </div>

              {/* Right Visual - Transformation Flow */}
              <div className="flex-1 w-full max-w-md">
                <div className="relative grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
                  {/* Input Card */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/60 shadow-lg transform -rotate-3 scale-95 opacity-60">
                    <div className="h-1.5 w-10 bg-slate-800 rounded mb-2"></div>
                    <div className="space-y-1.5">
                      <div className="h-1 w-full bg-slate-800/50 rounded"></div>
                      <div className="h-1 w-3/4 bg-slate-800/50 rounded"></div>
                      <div className="h-1 w-5/6 bg-slate-800/50 rounded"></div>
                    </div>
                    <p className="mt-3 text-[8px] text-slate-500 text-center font-mono">Raw Text</p>
                  </div>

                  {/* Arrow */}
                  <div className="flex flex-col items-center gap-1 text-cyan-400">
                    <i className="fa-solid fa-arrow-right text-xl animate-pulse"></i>
                    <i className="fa-solid fa-gear fa-spin text-xs opacity-50"></i>
                  </div>

                  {/* Output Card */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 to-slate-950 border border-cyan-500/30 shadow-xl shadow-cyan-900/20 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                    <div className="flex items-center gap-1.5 mb-2 border-b border-white/5 pb-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                      <span className="text-[8px] font-bold text-emerald-300 uppercase">Structured</span>
                    </div>
                    <div className="space-y-2">
                      <div className="p-1.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                        <div className="h-1 w-12 bg-cyan-400/40 rounded mb-1"></div>
                        <div className="h-0.5 w-full bg-cyan-400/20 rounded"></div>
                      </div>
                      <div className="p-1.5 rounded bg-purple-500/10 border border-purple-500/20">
                        <div className="h-1 w-8 bg-purple-400/40 rounded mb-1"></div>
                        <div className="h-0.5 w-3/4 bg-purple-400/20 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Other Features - Takes 1 column, stacked */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            {features.map((feature) => (
              <div 
                key={feature.title} 
                className="group relative p-1 rounded-3xl bg-gradient-to-b from-slate-800 to-slate-900 hover:from-cyan-500/50 hover:to-purple-500/50 transition-all duration-500 flex-1"
              >
                <div className="relative h-full p-6 rounded-[22px] bg-slate-950 overflow-hidden flex flex-col justify-center">
                  {/* Background Glow */}
                  <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 ${feature.glow}`}></div>
                  
                  <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <i className={`${feature.icon} text-xl ${feature.color}`}></i>
                  </div>
                  
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-300 transition-all">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 sm:mt-16 py-10 border-y border-slate-800/50 bg-slate-950/30 backdrop-blur-sm overflow-hidden">
          <p className="text-center text-[10px] font-bold tracking-[0.3em] text-slate-500 uppercase mb-8">
            Powered by Modern Technologies
          </p>
          
          <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] pointer-events-none">
            <div className="flex animate-scroll gap-16 w-max">
              {[
                { name: 'Tailwind CSS', icon: 'fa-brands fa-css3-alt' },
                { name: 'Python', icon: 'fa-brands fa-python' },
                { name: 'Gemini AI', icon: 'fa-solid fa-brain' },
                { name: 'Firebase', icon: 'fa-solid fa-fire' },
                { name: 'Vercel', icon: 'fa-solid fa-server' },
                { name: 'React', icon: 'fa-brands fa-react' },
                { name: 'TypeScript', icon: 'fa-brands fa-js' },
                { name: 'Rapid API', icon: 'fa-solid fa-cloud-bolt' },
              ].concat([
                { name: 'Tailwind CSS', icon: 'fa-brands fa-css3-alt' },
                { name: 'Python', icon: 'fa-brands fa-python' },
                { name: 'Gemini AI', icon: 'fa-solid fa-brain' },
                { name: 'Firebase', icon: 'fa-solid fa-fire' },
                { name: 'Vercel', icon: 'fa-solid fa-server' },
                { name: 'React', icon: 'fa-brands fa-react' },
                { name: 'TypeScript', icon: 'fa-brands fa-js' },
                { name: 'Rapid API', icon: 'fa-solid fa-cloud-bolt' },
              ]).concat([
                { name: 'Tailwind CSS', icon: 'fa-brands fa-css3-alt' },
                { name: 'Python', icon: 'fa-brands fa-python' },
                { name: 'Gemini AI', icon: 'fa-solid fa-brain' },
                { name: 'Firebase', icon: 'fa-solid fa-fire' },
                { name: 'Vercel', icon: 'fa-solid fa-server' },
                { name: 'React', icon: 'fa-brands fa-react' },
                { name: 'TypeScript', icon: 'fa-brands fa-js' },
                { name: 'Rapid API', icon: 'fa-solid fa-cloud-bolt' },
              ]).map((tech, idx) => (
                <div key={`${tech.name}-${idx}`} className="flex items-center gap-3 text-slate-400 hover:text-slate-200 transition-colors group cursor-default whitespace-nowrap">
                  <i className={`${tech.icon} text-2xl group-hover:text-cyan-400 transition-colors`}></i>
                  <span className="text-sm font-bold uppercase tracking-wider">{tech.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div id="steps" className="mt-10 sm:mt-20 rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900/80 to-slate-950/60 p-5 sm:p-10 relative overflow-hidden">
          {/* Background Elements */}
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-slate-950/0 to-slate-950/0 pointer-events-none"></div>
          
          <div className="text-center mb-16 relative z-10">
            <p className="text-xs tracking-[0.35em] text-cyan-200 uppercase">Quy trình 4 bước</p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-white">Luồng làm việc thông minh</h2>
            <p className="text-slate-400 mt-2 max-w-2xl mx-auto">
              Tối ưu hóa quy trình tuyển dụng với 4 bước đơn giản, từ nhập liệu đến phân tích chuyên sâu.
            </p>
          </div>

          <div className="relative z-10">
            {/* Desktop Connecting Line */}
            <div className="hidden md:block absolute top-12 left-[12%] right-[12%] h-0.5 bg-slate-800">
              <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-cyan-500/0 via-cyan-500/50 to-cyan-500/0 animate-pulse"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-6">
              {steps.map((step, index) => (
                <div key={step.id} className="relative flex flex-col items-center text-center group">
                  {/* Step Circle */}
                  <div className="w-24 h-24 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center relative z-10 group-hover:border-cyan-500/50 group-hover:-translate-y-2 transition-all duration-300 shadow-xl">
                    <div className="absolute inset-0 bg-cyan-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="text-4xl font-black text-slate-800 group-hover:text-slate-700 transition-colors absolute select-none">{step.id}</span>
                    
                    {/* Icon Overlay */}
                    <div className="relative z-10 text-2xl text-cyan-400 group-hover:scale-110 transition-transform duration-300">
                        {index === 0 && <i className="fa-solid fa-file-import"></i>}
                        {index === 1 && <i className="fa-solid fa-sliders"></i>}
                        {index === 2 && <i className="fa-solid fa-cloud-arrow-up"></i>}
                        {index === 3 && <i className="fa-solid fa-chart-pie"></i>}
                    </div>

                    {/* Status Dot */}
                    <div className="absolute -bottom-1.5 -right-1.5 w-4 h-4 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center">
                      <div className={`w-2 h-2 rounded-full ${index < 2 ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`}></div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="mt-6 relative">
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">{step.label}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed px-2">{step.detail}</p>
                    
                    {/* Mobile Connector Line */}
                    {index < steps.length - 1 && (
                      <div className="md:hidden absolute left-1/2 -bottom-12 w-0.5 h-8 bg-slate-800 -translate-x-1/2"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div id="partners" className="mt-8 sm:mt-12 rounded-3xl border border-slate-800 bg-slate-900/70 p-4 sm:p-6 overflow-hidden">
          <div className="flex items-center gap-3 flex-wrap mb-6">
            <i className="fa-solid fa-handshake-simple text-cyan-300"></i>
            <h2 className="text-xl font-semibold">Doanh nghiệp đồng hành</h2>
            <span className="text-sm text-slate-400">Các đơn vị đang thử nghiệm & triển khai Support HR AI.</span>
          </div>

          <div className="mb-8 rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-900/20 to-slate-900/40 p-1">
             <div className="relative rounded-xl bg-slate-950/50 backdrop-blur-sm p-4 flex flex-col md:flex-row items-center gap-6">
                <div className="relative w-full md:w-1/3 aspect-video rounded-lg overflow-hidden border border-slate-700 shadow-lg group shrink-0">
                   <img 
                    src="/images/team/contact.jpg" 
                    alt="Team SupportHR gặp gỡ Founder TopCV Vũ Nhật Anh" 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-2">
                    <p className="text-[10px] text-white/90 font-medium text-center">Gặp gỡ Founder TopCV</p>
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                   <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                      <i className="fa-solid fa-handshake"></i>
                      <span>Chuyên gia tư vấn</span>
                   </div>
                   <h3 className="text-lg font-bold text-white">
                      Founder TopCV <span className="text-emerald-400">Vũ Nhật Anh</span>
                   </h3>
                   <p className="text-slate-300 text-xs leading-relaxed">
                      Dự án vinh dự nhận được sự quan tâm và tư vấn trực tiếp từ anh Vũ Nhật Anh - Founder & CEO TopCV. Những chia sẻ quý báu từ chuyên gia đầu ngành giúp SupportHR tối ưu hóa trải nghiệm và quy trình tuyển dụng sát với thực tế doanh nghiệp.
                   </p>
                </div>
             </div>
          </div>

          <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] pointer-events-none">
             <div className="flex animate-scroll gap-12 w-max">
                {[...partners, ...partners, ...partners, ...partners].map((partner, idx) => (
                  <div key={`${partner.name}-${idx}`} className="h-10 w-28 flex items-center justify-center brightness-110">
                    <img
                      src={partner.logo}
                      alt={partner.name}
                      className="max-h-full max-w-full object-contain"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent && !parent.querySelector('span')) {
                          const span = document.createElement('span');
                          span.textContent = partner.name;
                          span.className = 'text-xs font-bold text-slate-500';
                          parent.appendChild(span);
                        }
                      }}
                    />
                  </div>
                ))}
             </div>
          </div>
        </div>

        <div id="pricing" className="mt-8 sm:mt-12 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8">
          <div className="text-center mb-6">
            <p className="text-xs font-semibold tracking-[0.35em] text-cyan-200 uppercase">Bảng giá</p>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-white">Gói sử dụng</h2>
            <p className="mt-2 text-sm text-slate-400 max-w-2xl mx-auto">Chọn gói phù hợp với quy mô tuyển dụng của bạn. Dùng thử miễn phí cho gói Free.</p>
          </div>

          <div className="w-full overflow-x-auto -mx-2">
            <div className="min-w-[900px] grid grid-cols-5 gap-4 px-2">
              {[
                { name: 'FREE TIER', price: '$0 / tháng', cap: '50CV', duration: 'Vĩnh viễn', notes: ['Chuẩn hóa JD cơ bản', 'Loc tiêu chí - cứng', 'Chấm điểm AI sơ bộ'] },
                { name: 'BASIC', price: '$39 / tháng', cap: '300CV', duration: '1 Tháng', notes: ['Tất cả tính năng Free', 'Xuất kết quả ra Excel', 'Gửi email tự động cho ứng viên đạt/trượt'] },
                { name: 'STANDARD', price: '$99 / tháng', cap: '1000 CV', duration: '1 Tháng', notes: ['Tất cả tính năng Basic', 'Tùy chỉnh trọng số', 'Biểu đồ phân tích năng lực'] },
                { name: 'PREMIUM', price: '$249 / tháng', cap: '5000CV', duration: '1 Tháng (Cam kết 6 tháng)', notes: ['Tất cả tính năng Standard', 'API tích hợp ATS', 'Hỗ trợ ưu tiên 24/7'] },
                { name: 'ENTERPRISE', price: '$599 / tháng', cap: '20 000CV', duration: '1 Tháng (Cam kết 12 tháng)', notes: ['Tất cả tính năng Premium', 'Private Cloud', 'Quản lý tài khoản riêng (Account Manager)'] },
              ].map((pkg) => (
                <div key={pkg.name} className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-950 to-slate-900 p-4 flex flex-col items-start gap-4">
                  <div className="w-full flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold tracking-widest text-slate-400">{pkg.name}</p>
                      <p className="mt-2 text-2xl font-bold text-white">{pkg.price}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-300">{pkg.cap}</p>
                      <p className="text-[11px] text-slate-400">{pkg.duration}</p>
                    </div>
                  </div>

                  <ul className="text-sm text-slate-300 list-inside space-y-1">
                    {pkg.notes.map((n) => (
                      <li key={n} className="flex items-start gap-3">
                        <span className="w-6 h-6 flex items-center justify-center rounded-full bg-emerald-500/10 text-emerald-300 text-xs">✓</span>
                        <span>{n}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto w-full">
                    <button className="w-full h-10 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400 text-slate-950 font-semibold">Chọn gói</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div id="why-support-hr" className="mt-8 sm:mt-12 rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-5 sm:p-8">
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <p className="text-xs font-semibold tracking-[0.35em] text-cyan-200 uppercase">Why Support HR</p>
              <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-white">
                Tại sao các HR Manager chọn <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Support HR?</span>
              </h2>
              <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-xl">
                Quy trình cũ kỹ đang kìm hãm sự phát triển của doanh nghiệp bạn. Đã đến lúc thay đổi bằng nền tảng AI được xây dựng riêng cho HR Việt Nam.
              </p>

              <div className="mt-8 space-y-4">
                <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-5 shadow-lg shadow-red-900/20">
                  <div className="flex items-center gap-3 text-red-200 font-semibold text-lg">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/20 text-red-200 text-base">
                      <i className="fa-solid fa-xmark"></i>
                    </span>
                    Quy trình thủ công
                  </div>
                  <p className="mt-3 text-sm text-red-100/90">Mất trung bình 30-45 phút để đọc kỹ 1 CV. Dễ bỏ sót ứng viên tiềm năng do mệt mỏi.</p>
                </div>

                <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/5 p-5 shadow-lg shadow-emerald-900/20">
                  <div className="flex items-center gap-3 text-emerald-200 font-semibold text-lg">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-200 text-base">
                      <i className="fa-solid fa-check"></i>
                    </span>
                    Quy trình Support HR AI
                  </div>
                  <p className="mt-3 text-sm text-emerald-100/90">Xử lý 100 CV trong 2 phút. Tự động highlight kỹ năng quan trọng, không bao giờ mệt mỏi.</p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[{ value: '85%', label: 'Thời gian tiết kiệm', accent: 'from-indigo-500/20 to-indigo-900/40', text: 'text-indigo-200' },
                { value: '3X', label: 'Tốc độ tuyển dụng', accent: 'from-cyan-500/20 to-cyan-900/40', text: 'text-cyan-200' },
                { value: '99%', label: 'Độ hài lòng', accent: 'from-fuchsia-500/20 to-fuchsia-900/40', text: 'text-fuchsia-200' },
                { value: '0đ', label: 'Chi phí dùng thử', accent: 'from-violet-500/20 to-violet-900/40', text: 'text-violet-200' }].map((stat) => (
                <div
                  key={stat.label}
                  className={`rounded-2xl border border-white/10 bg-gradient-to-br ${stat.accent} p-6 shadow-xl flex flex-col gap-2`}
                >
                  <span className={`text-4xl font-bold ${stat.text}`}>{stat.value}</span>
                  <span className="text-sm text-slate-200 uppercase tracking-widest">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div id="compare" className="mt-8 sm:mt-12 rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 sm:p-6">
          <p className="text-sm font-semibold tracking-[0.35em] text-emerald-200 uppercase">So sánh hiệu quả</p>
          <h2 className="mt-3 text-3xl font-bold text-white">Support HR AI vs ChatGPT</h2>
          <p className="mt-2 text-sm text-slate-300 max-w-3xl">
            Bảng so sánh chi tiết giữa AI đa dụng và hệ thống AI chuyên sâu cho tuyển dụng Việt Nam.
          </p>
          <div className="mt-8">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <div className="min-w-[760px] rounded-2xl border border-white/10 bg-slate-950/80 shadow-2xl">
                <div className="grid grid-cols-[1.2fr_1fr_1fr] gap-4 border-b border-white/10 px-6 py-5 text-xs uppercase tracking-[0.35em] text-slate-400">
                  <div className="text-slate-300">Tiêu chí</div>
                  <div>
                    <p className="text-white text-sm normal-case tracking-tight font-semibold">ChatGPT</p>
                    <p className="text-[11px] text-slate-500 normal-case tracking-wide">AI tổng quát</p>
                  </div>
                  <div>
                    <p className="text-white text-sm normal-case tracking-tight font-semibold">Support HR</p>
                    <p className="text-[11px] text-slate-500 normal-case tracking-wide">AI chuyên biệt</p>
                  </div>
                </div>
                <div className="divide-y divide-white/5">
                  {comparisonRows.map((row, index) => (
                    <div
                      key={row.label}
                      className={`grid grid-cols-[1.2fr_1fr_1fr] gap-4 px-6 py-5 ${
                        row.emphasis
                          ? 'bg-gradient-to-r from-cyan-500/5 via-emerald-500/5 to-transparent'
                          : index % 2 === 1
                          ? 'bg-white/5'
                          : 'bg-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3 pr-4">
                        <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-cyan-200 text-lg">
                          <i className={row.icon}></i>
                        </span>
                        <p className="text-base font-semibold text-white leading-tight">{row.label}</p>
                      </div>
                      <div>{renderStatusCell(row.chatgpt)}</div>
                      <div>{renderStatusCell(row.support)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {comparisonRows.map((row) => (
                <div 
                  key={row.label}
                  className={`rounded-xl border p-4 ${
                    row.emphasis 
                      ? 'border-emerald-500/30 bg-gradient-to-br from-emerald-900/20 to-slate-900/50' 
                      : 'border-white/10 bg-slate-900/40'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3 pb-3 border-b border-white/5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-cyan-200">
                      <i className={row.icon}></i>
                    </span>
                    <p className="font-semibold text-white">{row.label}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-wider text-slate-500">ChatGPT</p>
                      <div className="flex items-start gap-2">
                         <i className={`${statusStyles[row.chatgpt.status].icon} mt-1 text-xs ${row.chatgpt.status === 'negative' ? 'text-rose-400' : 'text-slate-400'}`}></i>
                         <span className="text-sm text-slate-400 leading-tight">{row.chatgpt.text}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-wider text-emerald-400">Support HR</p>
                      <div className="flex items-start gap-2">
                         <i className={`${statusStyles[row.support.status].icon} mt-1 text-xs text-emerald-400`}></i>
                         <span className={`text-sm leading-tight ${row.support.status === 'highlight' ? 'text-white font-bold' : 'text-emerald-100'}`}>{row.support.text}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>


      </section>
      <ChatBubble />
    </div>
  );
};

export default HomePage;
