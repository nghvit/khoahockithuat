import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { UserProfileService } from '../../services/storage/userProfileService';
import SyncNotification from '../ui/SyncNotification';

interface NavbarProps {
  userEmail?: string;
  onLogout?: () => void;
  onLoginRequest?: () => void;
  onBrandClick?: () => void;
  sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  sidebarCollapsed?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ userEmail, onLogout, onLoginRequest, onBrandClick, sidebarOpen, onToggleSidebar, sidebarCollapsed }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);

  // Sync notification states
  const [syncNotification, setSyncNotification] = useState({
    show: false,
    syncType: 'avatar' as 'avatar' | 'history' | 'profile',
    success: false,
    message: ''
  });

  // Settings states


  // Khởi tạo dark mode từ localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const isDark = savedTheme === 'dark';
    setIsDarkMode(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  // Load saved avatar từ Firebase hoặc localStorage
  useEffect(() => {
    const loadUserProfile = async () => {
      if (userEmail) {
        // Lắng nghe auth state để lấy uid
        const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
          if (user && user.email === userEmail) {
            try {
              // Lấy profile từ Firebase
              const profile = await UserProfileService.getUserProfile(user.uid);
              if (profile?.avatar) {
                setUserAvatar(profile.avatar);
              } else {
                // Fallback to localStorage
                const localAvatar = localStorage.getItem(`avatar_${userEmail}`);
                setUserAvatar(localAvatar);
              }

              // Migrate dữ liệu local sang Firebase nếu cần
              await UserProfileService.migrateLocalDataToFirebase(user.uid, user.email!);
            } catch (error) {
              console.error('Error loading user profile:', error);
              // Fallback to localStorage
              const localAvatar = localStorage.getItem(`avatar_${userEmail}`);
              setUserAvatar(localAvatar);
            }
          }
        });

        return () => unsubscribe();
      }
    };

    loadUserProfile();
  }, [userEmail]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newMode);
  };

  // Tạo avatar từ email
  const getInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  // Tạo màu avatar từ email
  const getAvatarColor = (email: string) => {
    const colors = ['bg-red-500', 'bg-green-500', 'bg-blue-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500'];
    const index = email.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Handle avatar upload - Lưu vào Firebase
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && userEmail) {
      if (file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg') {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const avatarDataUrl = e.target?.result as string;
          setUserAvatar(avatarDataUrl);

          try {
            // Lấy current user
            const currentUser = auth.currentUser;
            if (currentUser) {
              // Lưu vào Firebase
              await UserProfileService.updateUserAvatar(currentUser.uid, avatarDataUrl);
              console.log('Avatar updated successfully in Firebase');

              // Show success notification
              setSyncNotification({
                show: true,
                syncType: 'avatar',
                success: true,
                message: 'Avatar đã được đồng bộ thành công với tài khoản Gmail!'
              });
            } else {
              // Fallback to localStorage
              localStorage.setItem(`avatar_${userEmail}`, avatarDataUrl);
            }
          } catch (error) {
            console.error('Error updating avatar in Firebase:', error);
            // Fallback to localStorage
            localStorage.setItem(`avatar_${userEmail}`, avatarDataUrl);

            // Show info notification for guests
            setSyncNotification({
              show: true,
              syncType: 'avatar',
              success: false,
              message: 'Vui lòng đăng nhập để đồng bộ avatar với tài khoản Gmail.'
            });            // Show warning notification
            setSyncNotification({
              show: true,
              syncType: 'avatar',
              success: false,
              message: 'Không thể đồng bộ với Firebase. Avatar đã lưu cục bộ.'
            });
          }
        };
        reader.readAsDataURL(file);
      } else {
        setSyncNotification({
          show: true,
          syncType: 'avatar',
          success: false,
          message: 'Chỉ hỗ trợ định dạng JPG và PNG.'
        });
      }
    }
  };



  return (
    <>
      <nav className={`fixed top-0 h-14 flex items-center justify-between px-4 bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95 dark:from-gray-900/95 dark:via-gray-800/95 dark:to-gray-900/95 backdrop-blur-lg border-b border-slate-600/30 dark:border-gray-600/30 z-40 navbar shadow-lg transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'md:left-16 md:w-[calc(100vw-4rem)]' : 'md:left-64 md:w-[calc(100vw-16rem)]'} left-0 w-full`}>
        <div className="flex items-center gap-3">
          {/* Sidebar Toggle Button - Only on mobile */}
          <button
            onClick={onToggleSidebar}
            className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors duration-200 border border-slate-600/30 hover:border-slate-500/50"
            title={sidebarOpen ? "Đóng thanh bên" : "Mở thanh bên"}
          >
            <i className={`fa-solid ${sidebarOpen ? 'fa-xmark' : 'fa-bars'} text-sm transition-transform duration-200`}></i>
          </button>

          {/* Logo & Brand - Hidden on desktop since it's in sidebar */}
          <div className="md:hidden flex items-center gap-3 cursor-pointer select-none" onClick={onBrandClick} title="Support HR">
            <div className="w-9 h-9 rounded-lg overflow-hidden border border-white/10 bg-slate-800/50 flex items-center justify-center">
              <img
                src="/images/logos/logo.jpg"
                alt="Support HR"
                className="object-cover w-full h-full"
                onError={(e) => { const t = e.currentTarget as HTMLImageElement; t.style.display = 'none'; (t.parentElement as HTMLElement).innerHTML = '<span class=\"font-bold text-sm text-white\">HR</span>'; }}
                draggable={false}
              />
            </div>
            <span className="text-lg font-bold tracking-wide bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Support HR</span>
          </div>
        </div>

        <div className="flex items-center gap-3">

          {userEmail ? (
            <div className="relative">
              {/* User Avatar */}
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold hover:ring-2 hover:ring-white/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400/60 text-sm border border-white/20 overflow-hidden"
                title="Menu tài khoản"
              >
                {userAvatar ? (
                  <img
                    src={userAvatar}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className={`w-full h-full ${getAvatarColor(userEmail)} flex items-center justify-center rounded-full`}>
                    {getInitials(userEmail)}
                  </div>
                )}
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-4 w-72 bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 z-50 overflow-hidden ring-1 ring-white/5 transition-all animate-in fade-in zoom-in-95 duration-200">
                  {/* User Info Header - Premium Gradient */}
                  <div className="px-5 py-6 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-slate-900 border-b border-white/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full"></div>
                    <div className="relative z-10 flex flex-col items-center text-center space-y-3">
                      <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-tr from-cyan-400 to-purple-500 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
                        <div className="relative w-16 h-16 rounded-xl bg-slate-800 flex items-center justify-center text-white font-bold border border-white/20 overflow-hidden shadow-2xl">
                          {userAvatar ? (
                            <img
                              src={userAvatar}
                              alt="Avatar"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className={`w-full h-full ${getAvatarColor(userEmail)} flex items-center justify-center text-xl`}>
                              {getInitials(userEmail)}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-sm font-black text-white tracking-wide uppercase">Tài khoản</p>
                        <p className="text-[11px] text-slate-400 font-medium truncate max-w-[240px]">{userEmail}</p>
                      </div>
                      <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Đang hoạt động
                      </div>
                    </div>
                  </div>

                  <div className="p-3 space-y-1">
                    {/* Settings Section */}
                    <div className="px-3 py-2">
                      <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Cài đặt & Tiện ích</h3>
                      <div className="grid grid-cols-1 gap-1">
                        <button className="flex items-center gap-3 px-3 py-2.5 text-[11px] font-bold text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-all group">
                          <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-cyan-400 group-hover:bg-cyan-400/10 transition-all">
                            <i className="fa-solid fa-user-gear"></i>
                          </div>
                          Thông tin cá nhân
                        </button>
                        <button className="flex items-center gap-3 px-3 py-2.5 text-[11px] font-bold text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-all group">
                          <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-purple-400 group-hover:bg-purple-400/10 transition-all">
                            <i className="fa-solid fa-shield-halved"></i>
                          </div>
                          Bảo mật tài khoản
                        </button>
                      </div>
                    </div>

                    <div className="pt-2 px-3 border-t border-white/5">
                      {/* Logout */}
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onLogout?.();
                        }}
                        className="w-full flex items-center gap-3 px-3 py-3 text-[11px] font-black text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all group uppercase tracking-widest"
                      >
                        <div className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 group-hover:scale-110 transition-all">
                          <i className="fa-solid fa-right-from-bracket"></i>
                        </div>
                        <span>Đăng xuất</span>
                        <i className="fa-solid fa-chevron-right ml-auto text-[8px] opacity-30 group-hover:translate-x-1 transition-transform"></i>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Overlay */}
              {showUserMenu && (
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                ></div>
              )}
            </div>
          ) : (
            onLoginRequest && (
              <button
                onClick={onLoginRequest}
                className="px-4 py-2 rounded-md bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400/40"
              >
                <i className="fa-solid fa-right-to-bracket mr-2"></i>
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
        onClose={() => setSyncNotification(prev => ({ ...prev, show: false }))}
      />
    </>
  );
};

export default Navbar;
