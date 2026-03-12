import React, { useEffect, useMemo, useState, useRef } from "react";
import ChatBubble from "../../ui/ChatBubble";
import type { AppStep } from "../../../types";
import { analysisCacheService } from "../../../services/cache/analysisCache";
import { cvFilterHistoryService } from "../../../services/storage/analysisHistory";
import { ComparisonCell } from "./__components/types/comparision-cell";
import { ComparisonRow } from "./__components/types/comparision-row";
import { primaryNavLinks } from "./__components/primary-nav";

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

const flowOrder: AppStep[] = ["jd", "weights", "upload", "analysis"];

const HomePage: React.FC<HomePageProps> = ({
  setActiveStep,
  isLoggedIn,
  onLoginRequest,
  completedSteps,
  userAvatar,
  userName,
  userEmail,
}) => {
  const heroHighlight = "Nhanh Gấp 10 Lần.";
  const [typedHighlight, setTypedHighlight] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileExpandedSection, setMobileExpandedSection] = useState<
    string | null
  >(null);
  const navRef = useRef<HTMLDivElement>(null);

  const [cacheStats, setCacheStats] = useState({
    size: 0,
    hitRate: 0,
    oldestEntry: 0,
    newestEntry: 0,
  });
  const [historyStats, setHistoryStats] = useState({
    totalSessions: 0,
    lastSession: null as string | null,
    thisWeekCount: 0,
    thisMonthCount: 0,
  });
  const [recentHistory, setRecentHistory] = useState<any[]>([]);

  const certificates = useMemo(
    () => [
      "/images/achive/Khuyến Khích Tin Học Trẻ.jpg",
      "/images/achive/sáng tạo thanh thiếu niên.jpg",
    ],
    [],
  );
  const [certIndex, setCertIndex] = useState(0);

  const refreshHistoryData = () => {
    setCacheStats(analysisCacheService.getCacheStats());
    setHistoryStats(cvFilterHistoryService.getHistoryStats());
    setRecentHistory(cvFilterHistoryService.getRecentHistory());
  };

  useEffect(() => {
    if (certificates.length > 1) {
      const interval = setInterval(
        () => setCertIndex((prev) => (prev + 1) % certificates.length),
        5000,
      );
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
      if (index >= heroHighlight.length) clearInterval(interval);
    }, 70);
    return () => clearInterval(interval);
  }, [heroHighlight]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsVideoOpen(false);
        setMobileMenuOpen(false);
        setActiveMegaMenu(null);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Close menus on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveMegaMenu(null);
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleStart = () => {
    isLoggedIn ? setActiveStep("jd") : onLoginRequest();
  };
  const handleSectionScroll = (targetId: string) => {
    setMobileMenuOpen(false);
    setActiveMegaMenu(null);
    document
      .getElementById(targetId)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleClearCache = () => {
    if (window.confirm("Bạn có chắc muốn xóa toàn bộ cache?")) {
      analysisCacheService.clearCache();
      refreshHistoryData();
    }
  };
  const handleClearHistory = () => {
    if (window.confirm("Bạn có chắc muốn xóa toàn bộ lịch sử lọc CV?")) {
      cvFilterHistoryService.clearHistory();
      refreshHistoryData();
    }
  };
  const formatDate = (timestamp: number) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  const nextStep = useMemo(
    () =>
      flowOrder.find((step) => !completedSteps.includes(step)) || "analysis",
    [completedSteps],
  );
  const canContinue = completedSteps.length > 0;

  const partners = [
    { name: "FPT", logo: "/images/logos/fpt.png" },
    { name: "TopCV", logo: "/images/logos/topcv-1.png" },
    { name: "Vinedimex", logo: "/images/logos/vinedimex-1.png" },
    { name: "HB", logo: "/images/logos/hb.png" },
    { name: "Mì AI", logo: "/images/logos/mi_ai.png" },
    { name: "2.1 Studio", logo: "/images/logos/2.1.png" },
  ];

  const comparisonRows: ComparisonRow[] = [
    {
      icon: "fa-solid fa-layer-group",
      label: "Xử lý hàng loạt CV",
      chatgpt: { status: "negative", text: "Chỉ 1 CV/lần" },
      support: { status: "positive", text: "Hàng trăm CV cùng lúc" },
    },
    {
      icon: "fa-solid fa-bullseye",
      label: "Độ chính xác AI",
      chatgpt: { status: "neutral", text: "~70% · AI tổng quát" },
      support: { status: "positive", text: "95%+ · AI chuyên HR" },
    },
    {
      icon: "fa-solid fa-briefcase",
      label: "Phân tích kinh nghiệm",
      chatgpt: { status: "negative", text: "Đọc text cơ bản" },
      support: { status: "positive", text: "Deep learning ngành" },
    },
    {
      icon: "fa-solid fa-image",
      label: "Đọc CV ảnh/scan",
      chatgpt: { status: "negative", text: "Không hỗ trợ" },
      support: { status: "positive", text: "OCR đa định dạng" },
    },
    {
      icon: "fa-solid fa-industry",
      label: "Nhận diện ngành nghề",
      chatgpt: { status: "negative", text: "Thủ công" },
      support: { status: "positive", text: "Tự động từ JD" },
    },
    {
      icon: "fa-solid fa-sliders",
      label: "Tùy chỉnh trọng số",
      chatgpt: { status: "negative", text: "Không có" },
      support: { status: "positive", text: "UI trực quan" },
    },
    {
      icon: "fa-solid fa-chart-line",
      label: "Dashboard phân tích",
      chatgpt: { status: "negative", text: "Chỉ chat text" },
      support: { status: "positive", text: "Biểu đồ chi tiết" },
    },
    {
      icon: "fa-solid fa-microphone-lines",
      label: "Câu hỏi phỏng vấn",
      chatgpt: { status: "neutral", text: "Prompt thủ công" },
      support: { status: "positive", text: "Tự động CV+JD" },
    },
    {
      icon: "fa-solid fa-dollar-sign",
      label: "Phân tích mức lương",
      chatgpt: { status: "negative", text: "Không có" },
      support: { status: "positive", text: "Benchmark vị trí" },
    },
    {
      icon: "fa-solid fa-rotate",
      label: "Lưu lịch sử",
      chatgpt: { status: "negative", text: "Giới hạn" },
      support: { status: "positive", text: "Vĩnh viễn" },
    },
    {
      icon: "fa-solid fa-users",
      label: "Làm việc nhóm",
      chatgpt: { status: "negative", text: "Không workspace" },
      support: { status: "positive", text: "Multi-user" },
    },
    {
      icon: "fa-solid fa-money-bill-trend-up",
      label: "Chi phí & hiệu quả",
      chatgpt: { status: "neutral", text: "$20/tháng · Vẫn thủ công nhiều" },
      support: { status: "highlight", text: "Liên hệ · Tiết kiệm 70%" },
      emphasis: true,
    },
  ];

  const statusStyles: Record<
    ComparisonCell["status"],
    { icon: string; badgeClass: string; textClass: string }
  > = {
    positive: {
      icon: "fa-solid fa-check",
      badgeClass:
        "border border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
      textClass: "text-slate-100",
    },
    negative: {
      icon: "fa-solid fa-xmark",
      badgeClass: "border border-rose-500/40 bg-rose-500/10 text-rose-200",
      textClass: "text-slate-300",
    },
    neutral: {
      icon: "fa-solid fa-minus",
      badgeClass: "border border-amber-500/30 bg-amber-500/10 text-amber-200",
      textClass: "text-slate-200",
    },
    highlight: {
      icon: "fa-solid fa-star",
      badgeClass:
        "border border-cyan-500/40 bg-gradient-to-r from-cyan-500/30 to-emerald-500/20 text-white",
      textClass: "text-white font-semibold",
    },
  };

  const renderStatusCell = (info: ComparisonCell) => {
    const style = statusStyles[info.status];
    return (
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-2xl ${style.badgeClass}`}
        >
          <i className={`${style.icon} text-base`} />
        </span>
        <span className={`leading-tight ${style.textClass}`}>{info.text}</span>
      </div>
    );
  };

  const steps = [
    { id: "01", label: "Nhập JD", detail: "Dán hoặc tải file JD." },
    { id: "02", label: "Cấu hình", detail: "Trọng số + hard filter." },
    { id: "03", label: "Upload CV", detail: "Kéo thả hàng loạt." },
    { id: "04", label: "Kết quả", detail: "Bảng điểm + gợi ý PV." },
  ];

  // ── Mobile nav items (flat list for drawer) ─────────────────────────────
  const mobileNavItems = [
    {
      label: "Về chúng tôi",
      icon: "fa-circle-info",
      action: () => handleSectionScroll("why-support-hr"),
    },
    {
      label: "So sánh",
      icon: "fa-scale-balanced",
      action: () => handleSectionScroll("compare"),
    },
    {
      label: "Quy trình",
      icon: "fa-list-ol",
      action: () => handleSectionScroll("steps"),
    },
    {
      label: "Bảo mật",
      icon: "fa-user-shield",
      action: () => window.open("/privacy", "_blank"),
    },
    {
      label: "Điều khoản",
      icon: "fa-file-contract",
      action: () => window.open("/terms", "_blank"),
    },
  ];

  return (
    <div className="min-h-screen bg-background text-slate-100 overflow-x-hidden">
      {/* ── Mobile drawer overlay ─────────────────────────────────────────── */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* ── Mobile drawer ─────────────────────────────────────────────────── */}
      <div
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 bg-slate-950 border-r border-white/8 flex flex-col transition-transform duration-300 ease-out lg:hidden ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg overflow-hidden">
              <img
                src="/images/logos/logo.jpg"
                alt="SupportHR"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-sm font-bold text-white">SupportHR</p>
              <p className="text-[10px] text-slate-500">
                AI Screening Platform
              </p>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <i className="fa-solid fa-xmark text-sm" />
          </button>
        </div>

        {/* Drawer nav items */}
        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
          {mobileNavItems.map((item) => (
            <button
              key={item.label}
              onClick={item.action}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-all text-left"
            >
              <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0">
                <i
                  className={`fa-solid ${item.icon} text-[11px] text-slate-400`}
                />
              </div>
              <span className="text-[13px] font-semibold">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Drawer footer CTA */}
        <div className="p-4 border-t border-white/8 space-y-2">
          {isLoggedIn ? (
            <>
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-800/60 mb-1">
                <img
                  src={userAvatar || "/images/logos/logo.jpg"}
                  alt="avatar"
                  className="w-7 h-7 rounded-full object-cover"
                />
                <div className="min-w-0">
                  <p className="text-[12px] font-semibold text-white truncate">
                    {userName || userEmail?.split("@")[0]}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">
                    {userEmail}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setActiveStep("jd");
                }}
                className="w-full h-10 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-[13px] transition-colors flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-bolt text-xs" /> Bắt đầu ngay
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onLoginRequest();
              }}
              className="w-full h-10 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-bold text-[13px] transition-colors"
            >
              Đăng nhập
            </button>
          )}
        </div>
      </div>

      <section className="w-full px-4 sm:px-8 lg:px-16 xl:px-24 py-4 sm:py-6">
        {/* ── Navbar ──────────────────────────────────────────────────────── */}
        <nav
          ref={navRef}
          className="w-full mb-6 sm:mb-10 rounded-2xl bg-indigo-950/80 backdrop-blur-md px-4 py-3 sm:px-5 sm:py-3.5 flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.4)] border border-white/10 relative z-10 gap-4"
        >
          {/* ── Left: Brand ───────────────────────────────────────────────── */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden shadow-md flex-shrink-0">
              <img
                src="/images/logos/logo.jpg"
                alt="SupportHR"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
            <div className="hidden xs:block">
              <p className="text-sm font-bold text-white leading-tight">
                SupportHR
              </p>
              <p className="text-[10px] text-slate-400 leading-tight">
                AI Recruitment
              </p>
            </div>
          </div>

          {/* ── Center: Desktop nav links ──────────────────────────────────── */}
          <div className="hidden lg:flex items-center gap-1 flex-1 justify-center">
            {primaryNavLinks.map((link) =>
              "megaMenu" in link ? (
                <div key={link.label} className="relative">
                  <button
                    onClick={() =>
                      setActiveMegaMenu(
                        activeMegaMenu === link.label ? null : link.label,
                      )
                    }
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all font-semibold text-xs uppercase tracking-wider ${activeMegaMenu === link.label ? "bg-cyan-500/15 text-cyan-400 ring-1 ring-cyan-500/25" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
                  >
                    {link.label}
                    <i
                      className={`fa-solid fa-chevron-down text-[9px] opacity-50 transition-transform duration-200 ${activeMegaMenu === link.label ? "rotate-180 opacity-100" : ""}`}
                    />
                  </button>

                  {/* Mega menu dropdown — positioned relative to nav, not viewport */}
                  {activeMegaMenu === link.label && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 z-50 w-[680px] max-w-[calc(100vw-2rem)]">
                      <div className="bg-indigo-950/98 backdrop-blur-3xl border border-white/10 rounded-2xl p-1.5 shadow-[0_20px_60px_rgba(0,0,0,0.7)]">
                        <div className="flex gap-1.5 max-h-[70vh] overflow-y-auto">
                          {/* Highlight card */}
                          <div className="hidden sm:flex w-[200px] flex-shrink-0 p-4 bg-gradient-to-br from-slate-900/80 to-slate-950/80 rounded-xl flex-col justify-end min-h-[160px] border border-white/5 relative overflow-hidden group/highlight">
                            <div className="absolute -top-10 -left-10 w-24 h-24 bg-cyan-500/10 blur-[40px] rounded-full" />
                            <div className="relative z-10">
                              <div className="w-8 h-8 rounded-lg bg-cyan-500/15 flex items-center justify-center text-cyan-400 mb-3 border border-cyan-500/10">
                                <i
                                  className={`${link.megaMenu.highlight.icon} text-sm`}
                                />
                              </div>
                              <h3 className="text-sm font-black text-white mb-1">
                                {link.megaMenu.highlight.title}
                              </h3>
                              <p className="text-[11px] text-slate-400 leading-snug">
                                {link.megaMenu.highlight.desc}
                              </p>
                              {"action" in link.megaMenu.highlight &&
                                (link.megaMenu.highlight as any).action && (
                                  <button
                                    onClick={() => {
                                      const action = (
                                        link.megaMenu.highlight as any
                                      ).action;
                                      if (action?.isStart) handleStart();
                                      else if (action?.href)
                                        window.open(action.href, "_blank");
                                      else if (action?.target)
                                        handleSectionScroll(action.target);
                                      setActiveMegaMenu(null);
                                    }}
                                    className="mt-3 px-3 py-1.5 rounded-lg bg-cyan-500 text-slate-950 text-[11px] font-bold hover:bg-cyan-400 transition-colors w-fit"
                                  >
                                    {
                                      (link.megaMenu.highlight as any).action
                                        .label
                                    }
                                  </button>
                                )}
                            </div>
                          </div>

                          {/* Items grid */}
                          <div className="flex-1 p-2">
                            {"items" in link.megaMenu &&
                            (link.megaMenu as any).items ? (
                              <div className="grid grid-cols-2 gap-1">
                                {(link.megaMenu as any).items.map(
                                  (item: any) => (
                                    <button
                                      key={item.label}
                                      onClick={() => {
                                        if (item.href)
                                          window.open(
                                            item.href,
                                            "_blank",
                                            "noopener,noreferrer",
                                          );
                                        else if (item.target)
                                          handleSectionScroll(item.target);
                                        setActiveMegaMenu(null);
                                      }}
                                      className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-white/5 transition-all text-left border border-transparent hover:border-white/5"
                                    >
                                      <div className="w-8 h-8 rounded-lg bg-slate-900/50 flex items-center justify-center text-slate-500 group-hover:text-cyan-400 transition-colors flex-shrink-0">
                                        <i className={`${item.icon} text-sm`} />
                                      </div>
                                      <div className="min-w-0 pt-0.5">
                                        <p className="text-[12px] font-bold text-slate-200">
                                          {item.label}
                                        </p>
                                        <p className="text-[10px] text-slate-500 truncate mt-0.5">
                                          {item.desc}
                                        </p>
                                      </div>
                                    </button>
                                  ),
                                )}
                              </div>
                            ) : (
                              /* History panel */
                              <div className="p-2 space-y-3">
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="bg-slate-900/60 border border-white/5 rounded-xl p-3 text-center">
                                    <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">
                                      Cache
                                    </p>
                                    <p className="text-xl font-black text-white">
                                      {cacheStats.size}
                                      <span className="text-xs text-slate-500">
                                        /100
                                      </span>
                                    </p>
                                  </div>
                                  <div className="bg-slate-900/60 border border-white/5 rounded-xl p-3 text-center">
                                    <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">
                                      Hit Rate
                                    </p>
                                    <p className="text-xl font-black text-cyan-400">
                                      {cacheStats.hitRate.toFixed(0)}%
                                    </p>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={refreshHistoryData}
                                    className="flex-1 py-2 bg-white/5 rounded-lg text-[11px] font-bold text-slate-300 border border-white/5 flex items-center justify-center gap-1.5"
                                  >
                                    <i className="fa-solid fa-rotate" /> Làm mới
                                  </button>
                                  <button
                                    onClick={handleClearCache}
                                    className="flex-1 py-2 bg-red-500/10 rounded-lg text-[11px] font-bold text-red-400 border border-red-500/10 flex items-center justify-center gap-1.5"
                                  >
                                    <i className="fa-solid fa-trash-can" /> Xóa
                                    Cache
                                  </button>
                                </div>
                                <div className="space-y-1 max-h-32 overflow-y-auto">
                                  {recentHistory
                                    .slice(0, 5)
                                    .map((entry, idx) => (
                                      <div
                                        key={idx}
                                        className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
                                      >
                                        <span className="text-[11px] text-slate-300 truncate">
                                          {entry.jobPosition || "Chưa đặt tên"}
                                        </span>
                                        <span className="text-[10px] text-slate-600 ml-2 flex-shrink-0">
                                          {formatDate(entry.timestamp)}
                                        </span>
                                      </div>
                                    ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : "target" in link ? (
                <button
                  key={link.label}
                  onClick={() => handleSectionScroll(link.target)}
                  className={`px-4 py-2 rounded-xl font-semibold text-xs uppercase tracking-wider transition-all ${link.target === "pricing" ? "bg-cyan-500/10 text-cyan-400" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
                >
                  {link.label}
                </button>
              ) : (
                <a
                  key={link.label}
                  href={(link as any).href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 font-semibold text-xs uppercase tracking-wider transition-all"
                >
                  {link.label}
                </a>
              ),
            )}
          </div>

          {/* ── Right: Actions ─────────────────────────────────────────────── */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Desktop: user avatar or login */}
            {isLoggedIn ? (
              <div className="relative hidden lg:block">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="w-8 h-8 rounded-full overflow-hidden border-2 border-transparent hover:border-cyan-400/50 transition-all"
                >
                  <img
                    src={userAvatar || "/images/logos/logo.jpg"}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                </button>

                {/* User dropdown */}
                {showUserMenu && (
                  <div className="absolute top-full right-0 mt-3 z-50 w-72 bg-slate-900/98 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] overflow-hidden">
                    {/* Profile section */}
                    <div className="px-5 py-4 bg-gradient-to-br from-indigo-600/15 to-transparent border-b border-white/8">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10 flex-shrink-0">
                          <img
                            src={userAvatar || "/images/logos/logo.jpg"}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-bold text-white truncate">
                            {userName || userEmail?.split("@")[0]}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">
                            {userEmail}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-0 border-b border-white/8">
                      {[
                        { label: "Cache", value: cacheStats.size },
                        {
                          label: "Hit Rate",
                          value: `${cacheStats.hitRate.toFixed(0)}%`,
                        },
                        { label: "Phiên", value: historyStats.totalSessions },
                      ].map((s, i) => (
                        <div
                          key={i}
                          className={`py-3 text-center ${i < 2 ? "border-r border-white/8" : ""}`}
                        >
                          <p className="text-[14px] font-black text-white">
                            {s.value}
                          </p>
                          <p className="text-[9px] text-slate-500 uppercase tracking-wide mt-0.5">
                            {s.label}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Recent history */}
                    <div className="px-3 py-2.5 space-y-0.5 max-h-36 overflow-y-auto">
                      {recentHistory.slice(0, 4).map((entry, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-white/5 transition-colors cursor-default"
                        >
                          <span className="text-[11.5px] text-slate-300 truncate">
                            {entry.jobPosition || "Chưa đặt tên"}
                          </span>
                          <span className="text-[10px] text-slate-600 ml-2 flex-shrink-0">
                            {formatDate(entry.timestamp)}
                          </span>
                        </div>
                      ))}
                      {recentHistory.length === 0 && (
                        <p className="text-center text-[11px] text-slate-600 py-3 italic">
                          Chưa có lịch sử
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="p-3 border-t border-white/8 space-y-1.5">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          setActiveStep("jd");
                        }}
                        className="w-full h-9 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-[12px] font-bold transition-colors flex items-center justify-center gap-2"
                      >
                        <i className="fa-solid fa-play text-[10px]" /> Bắt đầu
                        phiên mới
                      </button>
                      <div className="flex gap-1.5">
                        <button
                          onClick={refreshHistoryData}
                          className="flex-1 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 text-[11px] font-medium transition-colors flex items-center justify-center gap-1.5"
                        >
                          <i className="fa-solid fa-rotate text-[10px]" /> Làm
                          mới
                        </button>
                        <button
                          onClick={handleClearHistory}
                          className="flex-1 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[11px] font-medium transition-colors flex items-center justify-center gap-1.5"
                        >
                          <i className="fa-solid fa-trash text-[10px]" /> Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onLoginRequest}
                className="hidden lg:flex h-8 px-5 rounded-full bg-white text-slate-950 font-bold text-xs hover:bg-slate-100 transition-all items-center"
              >
                Đăng nhập
              </button>
            )}

            {/* Mobile: CTA + Hamburger */}
            <button
              onClick={handleStart}
              className="lg:hidden h-8 px-4 rounded-full bg-white text-slate-950 font-bold text-xs whitespace-nowrap flex items-center gap-1.5 flex-shrink-0"
            >
              <i className="fa-solid fa-bolt text-[10px]" />
              <span className="hidden sm:inline">Bắt đầu</span>
            </button>
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden w-8 h-8 rounded-lg bg-slate-800/80 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors flex-shrink-0"
              aria-label="Mở menu"
            >
              <i className="fa-solid fa-bars text-sm" />
            </button>
          </div>
        </nav>

        {/* Close overlay for desktop mega menus */}
        {(activeMegaMenu || showUserMenu) && (
          <div
            className="fixed inset-0 z-[5] hidden lg:block"
            onClick={() => {
              setActiveMegaMenu(null);
              setShowUserMenu(false);
            }}
          />
        )}

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <div id="hero" className="py-6 sm:py-10 lg:py-12">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-10 items-center">
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-2 w-fit">
                <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold tracking-wide">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  Công nghệ AI tuyển dụng 2025
                </span>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-[1.1] tracking-tight">
                  Sàng Lọc CV{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-emerald-300">
                    Nhanh Gấp 10 Lần.
                  </span>
                </h1>
              </div>

              <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-md">
                Nền tảng AI đọc hiểu hồ sơ chuyên sâu, tự động xếp hạng và tìm
                kiếm những ứng viên tài năng nhất phù hợp với doanh nghiệp.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleStart}
                  className="h-11 px-7 rounded-full bg-white text-slate-950 font-black text-sm shadow-[0_8px_30px_rgba(255,255,255,0.15)] hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(255,255,255,0.2)] transition-all duration-200 whitespace-nowrap flex items-center gap-2 active:scale-95"
                >
                  <i className="fa-solid fa-bolt text-xs" /> Bắt đầu ngay
                </button>
                <button
                  onClick={() => setIsVideoOpen(true)}
                  className="h-11 px-6 rounded-full bg-slate-800/60 border border-white/8 text-slate-300 font-semibold text-sm hover:bg-slate-700/60 hover:text-white whitespace-nowrap flex items-center gap-2 transition-all active:scale-95"
                >
                  <i className="fa-regular fa-circle-play text-cyan-400 text-base" />{" "}
                  Xem demo
                </button>
                {canContinue && (
                  <button
                    onClick={() => setActiveStep(nextStep)}
                    className="h-11 px-5 flex items-center gap-2 rounded-full bg-indigo-500/15 border border-indigo-500/20 text-indigo-300 font-semibold text-sm hover:bg-indigo-500/25 whitespace-nowrap transition-all active:scale-95"
                  >
                    <i className="fa-solid fa-rotate-right text-xs" /> Tiếp tục
                    bước {flowOrder.indexOf(nextStep) + 1 || 4}
                  </button>
                )}
              </div>

              <p className="text-xs text-slate-600 font-medium tracking-wide">
                7 day free trial · Không cần thẻ tín dụng
              </p>

              <div className="flex items-center gap-6 pt-1">
                {[
                  { value: "100+", label: "CV/phiên" },
                  { value: "< 2 phút", label: "Thời gian xử lý" },
                  { value: "95%+", label: "Độ chính xác" },
                ].map((stat) => (
                  <div key={stat.label} className="flex flex-col gap-0.5">
                    <span className="text-base font-black text-white tracking-tight">
                      {stat.value}
                    </span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-medium">
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="relative cursor-pointer group/preview"
              onClick={() => setIsVideoOpen(true)}
            >
              <div className="absolute -inset-2 rounded-[26px] bg-gradient-to-br from-blue-600/30 via-purple-500/20 to-cyan-600/30 blur-2xl opacity-50 group-hover/preview:opacity-80 transition-opacity duration-500" />
              <div className="relative rounded-[20px] overflow-hidden border border-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.5)] bg-slate-950">
                <div className="relative aspect-video overflow-hidden bg-slate-950">
                  <video
                    src="/images/video demo/SPHR Ver3.mp4"
                    muted
                    playsInline
                    preload="metadata"
                    className="w-full h-full object-cover opacity-80 group-hover/preview:opacity-100 scale-[1.02] group-hover/preview:scale-100 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-slate-950/20 group-hover/preview:from-slate-950/30 transition-all duration-300" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-white/20 animate-ping opacity-60 group-hover/preview:opacity-0 transition-opacity" />
                      <div className="w-14 h-14 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.4)] group-hover/preview:scale-110 group-hover/preview:bg-white transition-all duration-300">
                        <i className="fa-solid fa-play text-slate-900 text-lg ml-0.5" />
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm border border-white/10 rounded-full px-2.5 py-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-white text-[10px] font-bold tracking-wider">
                      DEMO
                    </span>
                  </div>
                </div>
                <div className="px-4 py-2.5 flex items-center justify-between bg-slate-900/90 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <i className="fa-solid fa-circle-play text-blue-400 text-xs" />
                    <span className="text-slate-300 text-xs font-semibold">
                      SPHR – AI CV Screening
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-medium group-hover/preview:text-slate-300 transition-colors">
                    <i className="fa-solid fa-arrow-up-right-from-square" />{" "}
                    Nhấn để xem
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Tech scroll ──────────────────────────────────────────────────── */}
        <div className="mt-6 sm:mt-10 py-6 overflow-hidden">
          <p className="text-center text-[10px] font-bold tracking-[0.3em] text-slate-500 uppercase mb-8">
            Powered by Modern Technologies
          </p>
          <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] pointer-events-none">
            <div className="flex animate-scroll gap-16 w-max">
              {[...Array(3)]
                .flatMap(() => [
                  {
                    name: "Tailwind CSS",
                    icon: "fa-brands fa-css3-alt",
                    color: "text-[#38bdf8]",
                  },
                  {
                    name: "Python",
                    icon: "fa-brands fa-python",
                    color: "text-[#ffd343]",
                  },
                  {
                    name: "Gemini AI",
                    icon: "fa-solid fa-brain",
                    color: "text-[#8e75ff]",
                  },
                  {
                    name: "Firebase",
                    icon: "fa-solid fa-fire",
                    color: "text-[#ff9100]",
                  },
                  {
                    name: "Vercel",
                    icon: "fa-solid fa-server",
                    color: "text-white",
                  },
                  {
                    name: "React",
                    icon: "fa-brands fa-react",
                    color: "text-[#00d8ff]",
                  },
                  {
                    name: "TypeScript",
                    icon: "fa-brands fa-js",
                    color: "text-[#3178c6]",
                  },
                  {
                    name: "Rapid API",
                    icon: "fa-solid fa-cloud-bolt",
                    color: "text-[#0055ff]",
                  },
                ])
                .map((tech, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 text-slate-300 whitespace-nowrap"
                  >
                    <i className={`${tech.icon} text-2xl ${tech.color}`} />
                    <span className="text-sm font-bold uppercase tracking-wider">
                      {tech.name}
                    </span>
                  </div>
                ))}
            </div>
          </div>
          <div className="relative w-full mt-10 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] pointer-events-none">
            <div className="flex animate-scroll-reverse gap-12 w-max">
              {[...partners, ...partners, ...partners, ...partners].map(
                (partner, idx) => (
                  <div
                    key={idx}
                    className="h-10 w-28 flex items-center justify-center brightness-125"
                  >
                    <img
                      src={partner.logo}
                      alt={partner.name}
                      className="h-full object-contain filter drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]"
                    />
                  </div>
                ),
              )}
            </div>
          </div>
        </div>

        {/* ── Steps ─────────────────────────────────────────────────────────── */}
        <div
          id="steps"
          className="mt-6 sm:mt-12 -mx-4 sm:-mx-8 lg:-mx-12 px-4 sm:px-8 lg:px-12 py-6 sm:py-10"
        >
          <div className="text-center mb-12">
            <p className="text-[10px] tracking-[0.4em] text-indigo-400/70 uppercase mb-2">
              Quy trình
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              4 bước đơn giản
            </h2>
          </div>
          <div className="relative">
            <div className="hidden md:block absolute top-6 left-[12.5%] right-[12.5%] h-px bg-white/5" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-6">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className="flex flex-col items-center text-center group"
                >
                  <div className="relative w-12 h-12 rounded-2xl bg-indigo-950 border border-white/8 flex items-center justify-center group-hover:border-cyan-500/30 group-hover:bg-indigo-900/60 transition-all duration-300 shadow-md">
                    <div className="text-lg text-indigo-400 group-hover:text-cyan-400 transition-colors duration-300">
                      {index === 0 && <i className="fa-solid fa-file-import" />}
                      {index === 1 && <i className="fa-solid fa-sliders" />}
                      {index === 2 && (
                        <i className="fa-solid fa-cloud-arrow-up" />
                      )}
                      {index === 3 && <i className="fa-solid fa-chart-pie" />}
                    </div>
                    <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-slate-900 border border-white/10 text-[9px] font-black text-slate-500 flex items-center justify-center">
                      {step.id}
                    </span>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-sm font-bold text-slate-100 group-hover:text-white transition-colors">
                      {step.label}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {step.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Why Support HR ─────────────────────────────────────────────────── */}
        <div
          id="why-support-hr"
          className="mt-4 sm:mt-8 -mx-4 sm:-mx-8 lg:-mx-12 px-4 sm:px-8 lg:px-12 py-5 sm:py-8"
        >
          <div className="grid gap-10 lg:grid-cols-2 items-start">
            <div>
              <p className="text-[10px] font-bold tracking-[0.4em] text-indigo-400/70 uppercase">
                Lý do chọn
              </p>
              <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-white">
                Tại sao chọn{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">
                  Support HR?
                </span>
              </h2>
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/3 p-4">
                  <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-400">
                    <i className="fa-solid fa-xmark text-xs" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-200">
                      Quy trình thủ công
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      30-45 phút/CV. Dễ bỏ sót ứng viên.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 rounded-xl border border-emerald-500/10 bg-emerald-500/5 p-4">
                  <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
                    <i className="fa-solid fa-check text-xs" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-100">
                      Quy trình Support HR AI
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      100 CV trong 2 phút. Tự động highlight kỹ năng.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid gap-3 grid-cols-2">
              {[
                {
                  value: "85%",
                  label: "Thời gian tiết kiệm",
                  color: "text-cyan-400",
                },
                {
                  value: "3X",
                  label: "Tốc độ tuyển dụng",
                  color: "text-indigo-400",
                },
                {
                  value: "99%",
                  label: "Độ hài lòng",
                  color: "text-violet-400",
                },
                {
                  value: "0đ",
                  label: "Chi phí dùng thử",
                  color: "text-emerald-400",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/5 bg-white/3 p-5 flex flex-col gap-1.5 hover:border-white/10 hover:bg-white/5 transition-all"
                >
                  <span
                    className={`text-3xl font-black tracking-tight ${stat.color}`}
                  >
                    {stat.value}
                  </span>
                  <span className="text-[11px] text-slate-500 uppercase tracking-widest font-medium">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Comparison ────────────────────────────────────────────────────── */}
        <div
          id="compare"
          className="mt-4 sm:mt-8 -mx-4 sm:-mx-8 lg:-mx-12 px-4 sm:px-8 lg:px-12 py-5 sm:py-8"
        >
          <p className="text-[10px] font-bold tracking-[0.4em] text-indigo-400/70 uppercase">
            So sánh
          </p>
          <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-white">
            Support HR vs ChatGPT
          </h2>
          <div className="mt-8">
            <div className="hidden md:block overflow-x-auto">
              <div className="min-w-[680px] rounded-2xl border border-white/5 overflow-hidden">
                <div className="grid grid-cols-[1.5fr_1fr_1fr] px-5 py-3 text-[10px] uppercase tracking-[0.35em] text-slate-600 bg-white/3 border-b border-white/5">
                  <div>Tiêu chí</div>
                  <div>
                    <p className="text-slate-300 text-xs normal-case font-semibold">
                      ChatGPT
                    </p>
                    <p className="text-[10px] text-slate-600 normal-case mt-0.5">
                      AI tổng quát
                    </p>
                  </div>
                  <div>
                    <p className="text-emerald-400 text-xs normal-case font-semibold">
                      Support HR
                    </p>
                    <p className="text-[10px] text-slate-600 normal-case mt-0.5">
                      AI chuyên biệt
                    </p>
                  </div>
                </div>
                <div>
                  {comparisonRows.map((row) => (
                    <div
                      key={row.label}
                      className={`grid grid-cols-[1.5fr_1fr_1fr] px-5 py-4 border-b border-white/5 last:border-b-0 hover:bg-white/3 transition-colors ${row.emphasis ? "bg-emerald-500/3" : ""}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 text-slate-400 flex-shrink-0">
                          <i className={row.icon} />
                        </span>
                        <p className="text-sm font-medium text-slate-200">
                          {row.label}
                        </p>
                      </div>
                      <div className="flex items-center">
                        {renderStatusCell(row.chatgpt)}
                      </div>
                      <div className="flex items-center">
                        {renderStatusCell(row.support)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="md:hidden space-y-2">
              {comparisonRows.map((row) => (
                <div
                  key={row.label}
                  className={`rounded-xl border border-white/5 p-4 ${row.emphasis ? "border-emerald-500/10 bg-emerald-500/3" : "bg-white/3"}`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 text-slate-400">
                      <i className={`${row.icon} text-sm`} />
                    </span>
                    <p className="text-sm font-semibold text-slate-100">
                      {row.label}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-slate-600 mb-1">
                        ChatGPT
                      </p>
                      <div className="flex items-start gap-2">
                        <i
                          className={`${statusStyles[row.chatgpt.status].icon} mt-0.5 text-xs ${row.chatgpt.status === "negative" ? "text-rose-400" : "text-slate-500"}`}
                        />
                        <span className="text-xs text-slate-400 leading-tight">
                          {row.chatgpt.text}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-emerald-500/70 mb-1">
                        Support HR
                      </p>
                      <div className="flex items-start gap-2">
                        <i
                          className={`${statusStyles[row.support.status].icon} mt-0.5 text-xs text-emerald-400`}
                        />
                        <span
                          className={`text-xs leading-tight ${row.support.status === "highlight" ? "text-white font-semibold" : "text-emerald-300/80"}`}
                        >
                          {row.support.text}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Video modal ───────────────────────────────────────────────────────── */}
      {isVideoOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          onClick={() => setIsVideoOpen(false)}
        >
          <div
            className="absolute inset-0 bg-black/85 backdrop-blur-sm"
            style={{ animation: "fadeIn .2s ease" }}
          />
          <div
            className="relative z-10 w-full max-w-4xl rounded-2xl overflow-hidden border border-slate-700 shadow-2xl"
            style={{ animation: "scaleIn .25s ease" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3 bg-slate-900/95 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-circle-play text-blue-400" />
                <span className="text-white font-semibold text-sm">
                  Video Demo – SPHR
                </span>
              </div>
              <button
                onClick={() => setIsVideoOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
              >
                <i className="fa-solid fa-xmark text-lg" />
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
            @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
            @keyframes scaleIn { from { opacity:0; transform:scale(.92) } to { opacity:1; transform:scale(1) } }
          `}</style>
        </div>
      )}

      <ChatBubble />
    </div>
  );
};

export default HomePage;
