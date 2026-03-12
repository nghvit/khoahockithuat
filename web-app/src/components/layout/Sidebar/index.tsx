import React, { useState, useEffect, useRef } from "react";
import { Home, FileText, Sliders, Upload, Sparkles } from "lucide-react";
import type { AppStep } from "../../../types";

interface SidebarProps {
  activeStep: AppStep;
  setActiveStep: (step: AppStep) => void;
  completedSteps: AppStep[];
  onReset: () => void;
  onLogout?: () => void;
  userEmail?: string;
  onLoginRequest?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  onShowSettings?: () => void;
  onCollapsedChange?: (collapsed: boolean) => void;
}

const STEPS: {
  key: AppStep;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  desc: string;
}[] = [
  { key: "home", icon: Home, label: "Trang chủ", desc: "Dashboard" },
  { key: "jd", icon: FileText, label: "Mô tả Công việc", desc: "Bước 1/4" },
  { key: "weights", icon: Sliders, label: "Trọng số", desc: "Bước 2/4" },
  { key: "upload", icon: Upload, label: "Tải lên CV", desc: "Bước 3/4" },
  { key: "analysis", icon: Sparkles, label: "Phân Tích AI", desc: "Bước 4/4" },
];

// ─── User profile ──────────────────────────────────────────────────────────
const UserProfile: React.FC<{
  userEmail?: string;
  collapsed?: boolean;
  onLogout?: () => void;
  onLoginRequest?: () => void;
  onShowSettings?: () => void;
}> = ({
  userEmail,
  collapsed = false,
  onLogout,
  onLoginRequest,
  onShowSettings,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [userName, setUserName] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userEmail) return;
    const load = async () => {
      try {
        const { onAuthStateChanged } = await import("firebase/auth");
        const { auth } = await import("../../../config/firebase");
        const { UserProfileService } =
          await import("../../../services/storage/userProfileService");
        const unsub = onAuthStateChanged(auth, async (user) => {
          if (!user || user.email !== userEmail) return;
          setUserName(user.displayName || userEmail.split("@")[0]);
          if (user.photoURL) {
            setUserAvatar(user.photoURL);
          } else {
            try {
              const profile = await UserProfileService.getUserProfile(user.uid);
              setUserAvatar(
                profile?.avatar || localStorage.getItem(`avatar_${userEmail}`),
              );
            } catch {
              setUserAvatar(localStorage.getItem(`avatar_${userEmail}`));
            }
          }
        });
        return unsub;
      } catch {
        setUserName(userEmail.split("@")[0]);
      }
    };
    load();
  }, [userEmail]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setShowMenu(false);
    };
    if (showMenu) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showMenu]);

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : (name[0]?.toUpperCase() ?? "?");
  };

  const avatarColor = userEmail
    ? [
        "bg-violet-600",
        "bg-cyan-600",
        "bg-emerald-600",
        "bg-rose-600",
        "bg-amber-600",
      ][userEmail.charCodeAt(0) % 5]
    : "bg-slate-700";

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userEmail) return;
    if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const url = ev.target?.result as string;
      setUserAvatar(url);
      try {
        const { auth } = await import("../../../config/firebase");
        const { UserProfileService } =
          await import("../../../services/storage/userProfileService");
        if (auth.currentUser) {
          await UserProfileService.updateUserAvatar(auth.currentUser.uid, url);
        } else {
          localStorage.setItem(`avatar_${userEmail}`, url);
        }
      } catch {
        localStorage.setItem(`avatar_${userEmail}`, url);
      }
    };
    reader.readAsDataURL(file);
  };

  if (!userEmail) {
    return onLoginRequest ? (
      <div className={`p-3 border-t border-white/5 ${collapsed ? "px-2" : ""}`}>
        <button
          onClick={onLoginRequest}
          className={`w-full flex items-center justify-center gap-2 h-9 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:brightness-110 text-white font-bold transition-all ${collapsed ? "px-0" : "text-[12px]"}`}
        >
          <i className="fa-solid fa-right-to-bracket text-xs" />
          {!collapsed && <span>Đăng nhập</span>}
        </button>
      </div>
    ) : null;
  }

  return (
    <div
      className={`border-t border-white/5 relative ${collapsed ? "p-2" : "p-3"}`}
      ref={menuRef}
    >
      <button
        onClick={() => setShowMenu((p) => !p)}
        className={`w-full flex items-center rounded-xl hover:bg-slate-800/60 transition-colors group ${collapsed ? "justify-center p-2" : "gap-2.5 px-2 py-2"}`}
        title={collapsed ? userName || userEmail : undefined}
      >
        <div
          className={`rounded-lg flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0 overflow-hidden border border-white/10 ${!userAvatar ? avatarColor : ""} ${collapsed ? "w-8 h-8" : "w-8 h-8"}`}
        >
          {userAvatar ? (
            <img
              src={userAvatar}
              alt="avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            getInitials(userName || userEmail)
          )}
        </div>
        {!collapsed && (
          <>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-[11px] font-semibold text-slate-200 truncate leading-tight">
                {userName || userEmail.split("@")[0]}
              </p>
              <p className="text-[10px] text-slate-500 truncate">{userEmail}</p>
            </div>
            <i
              className={`fa-solid fa-ellipsis text-slate-600 group-hover:text-slate-400 text-[10px] flex-shrink-0 ${showMenu ? "text-slate-400" : ""}`}
            />
          </>
        )}
      </button>

      {showMenu && (
        <div
          className={`absolute bottom-full mb-2 bg-slate-900 border border-white/8 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50 ${collapsed ? "left-full ml-2 w-48" : "left-3 right-3"}`}
        >
          <label className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-slate-800/60 cursor-pointer transition-colors">
            <i className="fa-solid fa-camera text-[11px] text-slate-400 w-4 text-center" />
            <span className="text-[11px] text-slate-300 font-medium">
              Đổi ảnh đại diện
            </span>
            <input
              type="file"
              className="hidden"
              accept=".jpg,.jpeg,.png"
              onChange={handleAvatarUpload}
            />
          </label>
          {onShowSettings && (
            <button
              onClick={() => {
                setShowMenu(false);
                onShowSettings();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-slate-800/60 transition-colors"
            >
              <i className="fa-solid fa-clock-rotate-left text-[11px] text-slate-400 w-4 text-center" />
              <span className="text-[11px] text-slate-300 font-medium">
                Lịch sử
              </span>
            </button>
          )}
          <div className="h-px bg-white/5 mx-2" />
          <button
            onClick={() => {
              setShowMenu(false);
              onLogout?.();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-red-500/10 transition-colors"
          >
            <i className="fa-solid fa-right-from-bracket text-[11px] text-red-400 w-4 text-center" />
            <span className="text-[11px] text-red-400 font-medium">
              Đăng xuất
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Main Sidebar ──────────────────────────────────────────────────────────
const Sidebar: React.FC<SidebarProps> = ({
  activeStep,
  setActiveStep,
  completedSteps,
  onReset,
  onLogout,
  userEmail,
  onLoginRequest,
  isOpen = false,
  onClose,
  onShowSettings,
  onCollapsedChange,
}) => {
  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    onCollapsedChange?.(next);
  };

  const isStepEnabled = (step: AppStep): boolean => {
    if (step === "home" || step === "jd") return true;
    if (step === "weights") return completedSteps.includes("jd");
    if (step === "upload")
      return (
        completedSteps.includes("jd") && completedSteps.includes("weights")
      );
    if (step === "analysis")
      return (
        completedSteps.includes("jd") &&
        completedSteps.includes("weights") &&
        completedSteps.includes("upload")
      );
    return false;
  };

  const canReset = completedSteps.includes("upload");

  const handleStepClick = (step: AppStep) => {
    if (!isStepEnabled(step)) return;
    setActiveStep(step);
    onClose?.(); // close mobile drawer on nav
  };

  return (
    <>
      {/* ── Mobile overlay ──────────────────────────────────────────────── */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* ── Sidebar panel ───────────────────────────────────────────────── */}
      <aside
        className={`
          flex flex-col fixed top-0 left-0 h-screen z-50
          bg-slate-950 border-r border-white/5
          shadow-[4px_0_24px_rgba(0,0,0,0.4)]
          transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
          ${collapsed ? "md:w-[72px]" : "md:w-64"}
          w-64
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* ── Brand + collapse toggle ──────────────────────────────────── */}
        <div
          className={`flex items-center h-14 border-b border-white/5 flex-shrink-0 ${collapsed ? "px-0 justify-center" : "px-4 gap-3"}`}
        >
          {collapsed ? (
            <button
              onClick={toggleCollapsed}
              className="w-9 h-9 rounded-lg overflow-hidden border border-white/10 flex-shrink-0 hover:border-cyan-500/40 transition-colors"
              title="Mở rộng sidebar"
            >
              <img
                src="/images/logos/logo.jpg"
                alt="Support HR"
                className="w-full h-full object-contain"
              />
            </button>
          ) : (
            <>
              <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 border border-white/10 shadow-lg">
                <img
                  src="/images/logos/logo.jpg"
                  alt="Support HR"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-white leading-tight">
                  Support HR
                </p>
                <p className="text-[9px] text-slate-500 uppercase tracking-widest font-medium">
                  AI Recruitment
                </p>
              </div>
              {/* Collapse button — desktop only */}
              <button
                onClick={toggleCollapsed}
                className="hidden md:flex w-6 h-6 rounded-md items-center justify-center text-slate-600 hover:text-slate-300 hover:bg-slate-800 transition-colors flex-shrink-0"
                title="Thu gọn sidebar"
              >
                <i className="fa-solid fa-chevron-left text-[10px]" />
              </button>
            </>
          )}
        </div>

        {/* ── New campaign button ──────────────────────────────────────── */}
        <div
          className={`pt-3 pb-1 flex-shrink-0 ${collapsed ? "px-2" : "px-3"}`}
        >
          <button
            onClick={() => {
              if (canReset) onReset();
            }}
            disabled={!canReset}
            title={collapsed ? "Chiến Dịch Mới" : undefined}
            className={`
              w-full h-9 rounded-xl flex items-center justify-center gap-2
              text-[12px] font-bold transition-all
              ${
                canReset
                  ? "bg-gradient-to-r from-cyan-600 to-indigo-600 hover:brightness-110 text-white shadow-lg shadow-cyan-900/20"
                  : "bg-slate-900 border border-slate-800 text-slate-600 cursor-not-allowed"
              }
            `}
          >
            <i className="fa-solid fa-plus text-xs" />
            {!collapsed && <span>Chiến Dịch Mới</span>}
          </button>
        </div>

        {/* ── Section label ────────────────────────────────────────────── */}
        {!collapsed && (
          <div className="px-4 pt-4 pb-1.5 flex-shrink-0">
            <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">
              Các bước
            </p>
          </div>
        )}
        {collapsed && <div className="pt-3" />}

        {/* ── Nav steps ────────────────────────────────────────────────── */}
        <nav
          className={`flex-1 overflow-y-auto custom-scrollbar pb-2 space-y-0.5 ${collapsed ? "px-2" : "px-2"}`}
        >
          {STEPS.map((step) => {
            const isActive = activeStep === step.key;
            const isEnabled = isStepEnabled(step.key);
            const isCompleted = completedSteps.includes(step.key);
            const Icon = step.icon;

            return (
              <button
                key={step.key}
                disabled={!isEnabled}
                onClick={() => handleStepClick(step.key)}
                title={collapsed ? `${step.label} — ${step.desc}` : undefined}
                className={`
                  relative w-full flex items-center rounded-xl
                  text-left transition-all duration-150 group
                  ${collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5"}
                  ${
                    isActive
                      ? "bg-slate-800/80 text-white"
                      : isEnabled
                        ? "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
                        : "text-slate-700 cursor-not-allowed opacity-50"
                  }
                `}
              >
                {/* Active accent bar */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r bg-gradient-to-b from-cyan-400 to-indigo-400" />
                )}

                {/* Icon */}
                <div
                  className={`
                  relative w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                  border transition-all duration-150
                  ${
                    isActive
                      ? "bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 border-cyan-500/30"
                      : isCompleted
                        ? "bg-emerald-500/10 border-emerald-500/20"
                        : "bg-slate-800/60 border-slate-700/60 group-hover:border-slate-600"
                  }
                `}
                >
                  <Icon
                    className={`w-[15px] h-[15px] ${
                      isActive
                        ? "text-cyan-400"
                        : isCompleted
                          ? "text-emerald-400"
                          : "text-slate-500 group-hover:text-slate-300"
                    }`}
                  />
                  {isCompleted && !isActive && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border border-slate-950 shadow" />
                  )}
                </div>

                {/* Label — hidden when collapsed */}
                {!collapsed && (
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-[12px] font-semibold leading-tight truncate ${
                        isActive
                          ? "text-white"
                          : isEnabled
                            ? "text-slate-300"
                            : "text-slate-600"
                      }`}
                    >
                      {step.label}
                    </p>
                    <p
                      className={`text-[10px] mt-0.5 ${isActive ? "text-slate-400" : "text-slate-600"}`}
                    >
                      {step.desc}
                    </p>
                  </div>
                )}

                {isActive && !collapsed && (
                  <i className="fa-solid fa-chevron-right text-[9px] text-slate-500 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </nav>

        {/* ── User profile ─────────────────────────────────────────────── */}
        <UserProfile
          userEmail={userEmail}
          collapsed={collapsed}
          onLogout={onLogout}
          onLoginRequest={onLoginRequest}
          onShowSettings={onShowSettings}
        />
      </aside>
    </>
  );
};

export default Sidebar;
