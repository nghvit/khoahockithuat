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
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl ring-1 ring-black/10 dark:ring-white/10 z-50 overflow-hidden">
                  {/* User Info Header */}
                  <div className="px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold border-2 border-white/30 overflow-hidden">
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
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white">Tài khoản</p>
                        <p className="text-xs text-white/80 truncate">{userEmail}</p>
                      </div>
                    </div>
                  </div>

                  <div className="py-1">
                    {/* Settings Section */}
                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Cài đặt</h3>

                    </div>

                    {/* Logout */}
                    <div className="px-2 py-2">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onLogout?.();
                        }}
                        className="w-full flex items-center px-2 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors duration-150"
                      >
                        <i className="fa-solid fa-right-from-bracket w-4 text-center mr-3"></i>
                        <span>Đăng xuất</span>
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
