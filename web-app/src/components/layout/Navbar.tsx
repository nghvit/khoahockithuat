import React, { useState, useEffect, useRef } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../../config/firebase";
import { UserProfileService } from "../../services/storage/userProfileService";
import SyncNotification from "../ui/SyncNotification";

interface NavbarProps {
  userEmail?: string;
  onLogout?: () => void;
  onLoginRequest?: () => void;
  onBrandClick?: () => void;
  sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  sidebarCollapsed?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({
  userEmail,
  onLogout,
  onLoginRequest,
  onBrandClick,
  sidebarOpen,
  onToggleSidebar,
  sidebarCollapsed,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [userName, setUserName] = useState("");
  const [syncNotification, setSyncNotification] = useState({
    show: false,
    syncType: "avatar" as "avatar" | "history" | "profile",
    success: false,
    message: "",
  });
  const menuRef = useRef<HTMLDivElement>(null);

  // Load avatar + name
  useEffect(() => {
    if (!userEmail) return;
    const unsub = onAuthStateChanged(auth, async (user: User | null) => {
      if (!user || user.email !== userEmail) return;
      setUserName(user.displayName || userEmail.split("@")[0]);
      if (user.photoURL) {
        setUserAvatar(user.photoURL);
        return;
      }
      try {
        const profile = await UserProfileService.getUserProfile(user.uid);
        setUserAvatar(
          profile?.avatar || localStorage.getItem(`avatar_${userEmail}`),
        );
        await UserProfileService.migrateLocalDataToFirebase(
          user.uid,
          user.email!,
        );
      } catch {
        setUserAvatar(localStorage.getItem(`avatar_${userEmail}`));
      }
    });
    return unsub;
  }, [userEmail]);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    if (showUserMenu) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showUserMenu]);

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
    if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
      setSyncNotification({
        show: true,
        syncType: "avatar",
        success: false,
        message: "Chỉ hỗ trợ JPG và PNG.",
      });
      return;
    }
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const url = ev.target?.result as string;
      setUserAvatar(url);
      try {
        if (auth.currentUser) {
          await UserProfileService.updateUserAvatar(auth.currentUser.uid, url);
          setSyncNotification({
            show: true,
            syncType: "avatar",
            success: true,
            message: "Avatar đã được đồng bộ thành công!",
          });
        } else {
          localStorage.setItem(`avatar_${userEmail}`, url);
        }
      } catch {
        localStorage.setItem(`avatar_${userEmail}`, url);
        setSyncNotification({
          show: true,
          syncType: "avatar",
          success: false,
          message: "Lưu cục bộ. Đăng nhập để đồng bộ.",
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // ── Avatar element ──────────────────────────────────────────────────────
  const AvatarCircle = ({ size = "sm" }: { size?: "sm" | "lg" }) => {
    const dim = size === "lg" ? "w-12 h-12 text-sm" : "w-8 h-8 text-[11px]";
    return (
      <div
        className={`${dim} rounded-xl flex items-center justify-center text-white font-bold overflow-hidden border border-white/10 flex-shrink-0 ${!userAvatar ? avatarColor : ""}`}
      >
        {userAvatar ? (
          <img
            src={userAvatar}
            alt="avatar"
            className="w-full h-full object-cover"
          />
        ) : (
          getInitials(userName || userEmail || "?")
        )}
      </div>
    );
  };

  return (
    <>
      <nav
        className={`
          fixed top-0 left-0 right-0 h-14 z-40 flex items-center justify-between px-4
          bg-slate-950/95 backdrop-blur-sm border-b border-white/5
          transition-[left] duration-300
          md:left-64
        `}
        style={{ left: sidebarCollapsed ? 72 : undefined }}
      >
        {/* Left — mobile toggle + brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-800 transition-colors border border-white/5"
          >
            <i
              className={`fa-solid ${sidebarOpen ? "fa-xmark" : "fa-bars"} text-sm`}
            />
          </button>

          {/* Brand — mobile only */}
          <div
            className="md:hidden flex items-center gap-2.5 cursor-pointer select-none"
            onClick={onBrandClick}
          >
            <div className="w-7 h-7 rounded-lg overflow-hidden border border-white/10 flex-shrink-0">
              <img
                src="/images/logos/logo.jpg"
                alt="Support HR"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-[13px] font-bold text-white">Support HR</span>
          </div>
        </div>

        {/* Right — user area */}
        <div className="flex items-center gap-2">
          {userEmail ? (
            <div className="relative" ref={menuRef}>
              {/* Avatar trigger */}
              <button
                onClick={() => setShowUserMenu((p) => !p)}
                className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-slate-800/60 transition-colors group"
              >
                <AvatarCircle />
                <span className="hidden sm:block text-[11px] font-semibold text-slate-300 group-hover:text-white transition-colors max-w-[120px] truncate">
                  {userName || userEmail.split("@")[0]}
                </span>
                <i className="hidden sm:block fa-solid fa-chevron-down text-[9px] text-slate-600 group-hover:text-slate-400 transition-colors" />
              </button>

              {/* Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-slate-900 border border-white/8 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden z-50">
                  {/* Header */}
                  <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/5 bg-slate-800/40">
                    <AvatarCircle size="lg" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-bold text-white truncate">
                        {userName || userEmail.split("@")[0]}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate">
                        {userEmail}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="text-[9px] text-emerald-500 font-semibold uppercase tracking-wide">
                          Đang hoạt động
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-1.5 space-y-0.5">
                    {/* Upload avatar */}
                    <label className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-800/60 cursor-pointer transition-colors">
                      <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0">
                        <i className="fa-solid fa-camera text-[11px] text-slate-400" />
                      </div>
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

                    <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-800/60 transition-colors">
                      <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0">
                        <i className="fa-solid fa-user-gear text-[11px] text-slate-400" />
                      </div>
                      <span className="text-[11px] text-slate-300 font-medium">
                        Thông tin cá nhân
                      </span>
                    </button>

                    <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-800/60 transition-colors">
                      <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0">
                        <i className="fa-solid fa-shield-halved text-[11px] text-slate-400" />
                      </div>
                      <span className="text-[11px] text-slate-300 font-medium">
                        Bảo mật tài khoản
                      </span>
                    </button>

                    <div className="h-px bg-white/5 mx-1 my-1" />

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onLogout?.();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-red-500/10 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                        <i className="fa-solid fa-right-from-bracket text-[11px] text-red-400" />
                      </div>
                      <span className="text-[11px] text-red-400 font-medium">
                        Đăng xuất
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            onLoginRequest && (
              <button
                onClick={onLoginRequest}
                className="h-8 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:brightness-110 text-white text-[12px] font-bold transition-all shadow-lg shadow-cyan-900/20 flex items-center gap-1.5"
              >
                <i className="fa-solid fa-right-to-bracket text-xs" />
                Đăng nhập
              </button>
            )
          )}
        </div>
      </nav>

      <SyncNotification
        show={syncNotification.show}
        syncType={syncNotification.syncType}
        success={syncNotification.success}
        message={syncNotification.message}
        onClose={() => setSyncNotification((p) => ({ ...p, show: false }))}
      />
    </>
  );
};

export default Navbar;
