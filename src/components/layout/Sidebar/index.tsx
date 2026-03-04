import React, { useState } from 'react';
import { Home, FileText, Sliders, Upload, Sparkles, History, ChevronLeft, ChevronRight } from 'lucide-react';
import type { AppStep, HistoryEntry } from '../../../types';

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

const Sidebar: React.FC<SidebarProps> = ({ activeStep, setActiveStep, completedSteps, onReset, onLogout, userEmail, onLoginRequest, isOpen = true, onClose, onShowSettings, onCollapsedChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebarCollapsed');
      return saved ? JSON.parse(saved) : false;
    }
    return false;
  });

  // Sync collapsed state on mount
  React.useEffect(() => {
    if (onCollapsedChange) {
      onCollapsedChange(isCollapsed);
    }
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev: boolean) => {
      const newState = !prev;
      localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
      if (onCollapsedChange) {
        onCollapsedChange(newState);
      }
      return newState;
    });
  };

  // Hàm xử lý khi click vào menu item
  const handleStepClick = (step: AppStep) => {
    if (isStepEnabled(step)) {
      setActiveStep(step);

      // Tự động đóng sidebar trên mobile sau khi chọn menu
      if (typeof window !== 'undefined' && window.innerWidth < 768 && onClose) {
        onClose();
      }
    }
  };
  const steps: { key: AppStep; icon: React.ComponentType<{ className?: string }>; label: string }[] = [
    { key: 'home', icon: Home, label: 'Trang chủ' },
    { key: 'jd', icon: FileText, label: 'Mô tả Công việc' },
    { key: 'weights', icon: Sliders, label: 'Phân bổ Trọng số' },
    { key: 'upload', icon: Upload, label: 'Tải lên CV' },
    { key: 'analysis', icon: Sparkles, label: 'Phân Tích AI' },
  ];


  const isStepEnabled = (step: AppStep): boolean => {
    if (step === 'home') return true;
    if (step === 'jd') return true;
    if (step === 'weights') return completedSteps.includes('jd');
    if (step === 'upload') return completedSteps.includes('jd') && completedSteps.includes('weights');
    if (step === 'analysis') return completedSteps.includes('jd') && completedSteps.includes('weights') && completedSteps.includes('upload');
    if (step === 'process') return true;
    return false;
  };

  const renderStep = (step: { key: AppStep; icon: React.ComponentType<{ className?: string }>; label: string }) => {
    const isActive = activeStep === step.key;
    const isEnabled = isStepEnabled(step.key);
    const isCompleted = completedSteps.includes(step.key);
    const Icon = step.icon;

    const getIconColor = () => {
      if (isActive) return 'text-cyan-400';
      if (isCompleted) return 'text-emerald-400';
      if (!isEnabled) return 'text-slate-600';
      return 'text-slate-400 group-hover:text-slate-200';
    };

    return (
      <li className={`${isCollapsed ? 'md:px-2 px-2' : 'px-2'}`} key={step.key}>
        <button
          className={`relative w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group
            ${isCollapsed ? 'md:justify-center md:px-0' : 'justify-start'}
            ${isActive
              ? 'bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 text-cyan-100 shadow-lg shadow-cyan-500/10'
              : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'} 
            ${!isEnabled ? 'opacity-40 cursor-not-allowed grayscale' : 'cursor-pointer'}`}
          disabled={!isEnabled}
          onClick={() => handleStepClick(step.key)}
          title={isCollapsed ? step.label : ''}
        >
          {/* Active Left Border */}
          {isActive && (
            <div className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-gradient-to-b from-cyan-400 to-emerald-400 rounded-r-lg shadow-lg"></div>
          )}

          <div className={`flex items-center justify-center transition-all duration-200 ${getIconColor()} ${isActive ? 'scale-110' : ''} flex-shrink-0`}>
            <Icon className="w-5 h-5" />
          </div>

          <span className={`text-sm font-medium whitespace-nowrap transition-all duration-200 overflow-hidden
            ${isCollapsed ? 'md:w-0 md:max-w-0 md:opacity-0 md:ml-0' : 'max-w-[200px] opacity-100'}
            `}>
            {step.label}
          </span>

          {/* Completed Indicator */}
          {isCompleted && !isActive && (
            <div className={`rounded-full transition-all duration-300 ${isCollapsed ? 'md:w-1.5 md:h-1.5 md:opacity-100 md:ml-0 w-0 h-0 opacity-0 ml-0' : 'w-1.5 h-1.5 opacity-100 ml-auto'
              } ${isActive ? 'bg-cyan-400' : 'bg-emerald-500'} shadow-lg`} />
          )}
        </button>
      </li>
    );
  }

  return (
    <>
      {/* Overlay cho mobile khi sidebar mở */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        id="cv-sidebar"
        className={`flex flex-col fixed top-0 left-0 h-screen bg-gradient-to-b from-slate-950 to-slate-900 border-r border-slate-800/60 shadow-2xl z-50 transition-[width,transform] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] will-change-[width,transform] ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          } ${isCollapsed ? 'md:w-[72px]' : 'md:w-64'} w-64`}
        style={{ overflow: 'visible' }}
      >
        {/* Compact Logo & Brand - Top */}
        <div className={`flex items-center gap-3 border-b border-slate-800/40 transition-all duration-300 ${isCollapsed ? 'md:justify-center md:px-3 px-4 py-5' : 'px-4 py-5 justify-start'}`}>
          {/* Logo Button */}
          <button
            onClick={isCollapsed ? toggleCollapse : undefined}
            className={`flex items-center justify-center w-10 h-10 rounded-xl border border-slate-700/50 transition-all duration-300 overflow-hidden shadow-lg flex-shrink-0 ${isCollapsed ? 'md:w-10 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-500/30 md:hover:border-cyan-400 md:hover:scale-105 md:cursor-pointer'
              : 'bg-slate-800/50 md:cursor-default'
              }`}
            title={isCollapsed ? 'Mở sidebar' : ''}
          >
            <img
              src="/images/logos/logo.jpg"
              alt="Support HR Logo"
              className="w-full h-full object-contain"
            />
          </button>

          {/* Brand Text - Only when expanded */}
          <div className={`flex-1 min-w-0 overflow-hidden transition-all duration-200 ${isCollapsed ? 'md:w-0 md:opacity-0 md:pointer-events-none' : 'opacity-100'}`}>
            <h1 className="text-white font-bold text-sm leading-tight whitespace-nowrap">Support HR</h1>
            <p className="text-[9px] text-slate-500 font-medium tracking-wider uppercase whitespace-nowrap">AI Recruitment</p>
          </div>

          {/* Collapse Toggle - Only on desktop when expanded */}
          {!isCollapsed && (
            <button
              onClick={toggleCollapse}
              className="hidden md:flex items-center justify-center w-8 h-8 bg-slate-800/30 border border-slate-700/50 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 hover:border-slate-600 transition-all duration-300 flex-shrink-0"
              title="Thu gọn"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* New Campaign Button */}
        <div className={`transition-all duration-300 ${isCollapsed ? 'md:px-2 px-4 py-3 justify-center' : 'px-4 py-4'}`}>
          <button
            onClick={() => {
              if (completedSteps.includes('upload')) {
                onReset();
                if (typeof window !== 'undefined' && window.innerWidth < 768 && onClose) {
                  onClose();
                }
              }
            }}
            disabled={!completedSteps.includes('upload')}
            className={`flex items-center justify-center gap-2 font-medium transition-all duration-300 group rounded-xl ${completedSteps.includes('upload')
              ? 'bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white shadow-lg shadow-cyan-900/20 hover:shadow-cyan-500/30 cursor-pointer'
              : 'bg-slate-800/20 text-slate-600 cursor-not-allowed border border-slate-800'
              } ${isCollapsed
                ? 'md:w-10 md:h-10 md:p-0 w-full py-2.5 px-3'
                : 'w-full py-2.5 px-4'
              }`}
            title={isCollapsed ? 'Tạo chiến dịch mới' : ''}
          >
            <i className={`fa-solid fa-plus text-sm`}></i>
            {!isCollapsed && <span className="text-sm font-medium">Chiến Dịch Mới</span>}
          </button>
        </div>

        {/* Navigation Steps */}
        <nav className="flex-1 overflow-y-auto custom-scrollbar py-2">
          <ul className="flex flex-col gap-1">
            {steps.map(renderStep)}
          </ul>
        </nav>


      </aside>
    </>
  );
};

// User Profile Component
const UserProfileSection: React.FC<{
  userEmail?: string;
  onLogout?: () => void;
  onLoginRequest?: () => void;
  isCollapsed: boolean;
  onClose?: () => void;
  onShowSettings?: () => void;
}> = ({ userEmail, onLogout, onLoginRequest, isCollapsed, onClose, onShowSettings }) => {
  const [showMenu, setShowMenu] = React.useState(false);
  const [userAvatar, setUserAvatar] = React.useState<string | null>(null);
  const [userName, setUserName] = React.useState<string>('');

  // Load avatar and user name
  React.useEffect(() => {
    if (userEmail) {
      const loadUserData = async () => {
        try {
          const { onAuthStateChanged } = await import('firebase/auth');
          const { auth } = await import('../../../config/firebase');
          const { UserProfileService } = await import('../../../services/storage/userProfileService');

          const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user && user.email === userEmail) {
              // Set display name from Google
              if (user.displayName) {
                setUserName(user.displayName);
              } else {
                setUserName(userEmail.split('@')[0]);
              }

              // Load avatar - ưu tiên Google photoURL
              if (user.photoURL) {
                // Đăng nhập Google - lấy avatar từ Google
                setUserAvatar(user.photoURL);
              } else {
                // Không có Google photoURL - kiểm tra database hoặc localStorage
                try {
                  const profile = await UserProfileService.getUserProfile(user.uid);
                  if (profile?.avatar) {
                    setUserAvatar(profile.avatar);
                  } else {
                    const localAvatar = localStorage.getItem(`avatar_${userEmail}`);
                    setUserAvatar(localAvatar);
                  }
                } catch {
                  const localAvatar = localStorage.getItem(`avatar_${userEmail}`);
                  setUserAvatar(localAvatar);
                }
              }
            }
          });
          return () => unsubscribe();
        } catch (error) {
          console.error('Error loading user data:', error);
          setUserName(userEmail.split('@')[0]);
        }
      };
      loadUserData();
    }
  }, [userEmail]);

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  const getAvatarColor = (email: string) => {
    const colors = ['bg-red-500', 'bg-green-500', 'bg-blue-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500'];
    return colors[email.charCodeAt(0) % colors.length];
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && userEmail) {
      if (file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg') {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const avatarDataUrl = e.target?.result as string;
          setUserAvatar(avatarDataUrl);

          try {
            const { auth } = await import('../../../config/firebase');
            const { UserProfileService } = await import('../../../services/storage/userProfileService');
            const currentUser = auth.currentUser;

            if (currentUser) {
              await UserProfileService.updateUserAvatar(currentUser.uid, avatarDataUrl);
            } else {
              localStorage.setItem(`avatar_${userEmail}`, avatarDataUrl);
            }
          } catch {
            localStorage.setItem(`avatar_${userEmail}`, avatarDataUrl);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  if (!userEmail) {
    return onLoginRequest ? (
      <div className={`border-t border-slate-800/40 ${isCollapsed ? 'md:p-2 p-3' : 'p-3'}`}>
        <button
          onClick={onLoginRequest}
          className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg transition-all duration-200 ${isCollapsed ? 'md:justify-center' : ''}`}
          title={isCollapsed ? 'Đăng nhập' : ''}
        >
          <i className="fa-solid fa-right-to-bracket text-sm"></i>
          <span className={`text-xs font-medium transition-all duration-500 overflow-hidden ${isCollapsed ? 'max-w-0 opacity-0' : 'max-w-[200px] opacity-100'
            }`}>Đăng nhập</span>
        </button>
      </div>
    ) : null;
  }

  return (
    <div className={`transition-all duration-300 ${isCollapsed ? 'md:p-2 p-3' : 'p-3'}`}>
      <div className="relative">
        {/* Avatar Button */}
        <button
          onClick={() => setShowMenu(!showMenu)}
          className={`w-full flex items-center gap-3 py-2.5 px-2 text-slate-300 hover:bg-slate-800/50 rounded-lg transition-all duration-200 group ${isCollapsed ? 'justify-center md:justify-center' : ''}`}
          title={isCollapsed ? userEmail || 'Menu' : ''}
        >
          <div className={`rounded-lg flex items-center justify-center text-white font-bold text-xs border border-cyan-400/50 overflow-hidden flex-shrink-0 hover:border-cyan-400 transition-colors ${isCollapsed ? 'w-10 h-10' : 'w-9 h-9'
            }`}>
            {userAvatar ? (
              <img src={userAvatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className={`w-full h-full ${getAvatarColor(userEmail)} flex items-center justify-center text-xs`}>
                {getInitials(userName || userEmail)}
              </div>
            )}
          </div>
          <div className={`flex-1 min-w-0 text-left transition-all duration-500 overflow-hidden ${isCollapsed ? 'max-w-0 opacity-0' : 'max-w-[200px] opacity-100 ml-3'
            }`}>
            <p className="text-xs font-medium text-white truncate">{userName || userEmail.split('@')[0]}</p>
            <p className="text-[10px] text-slate-500 truncate">{userEmail}</p>
          </div>
        </button>

        {/* Dropdown Menu */}
        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowMenu(false)}
            />
            <div className={`absolute z-50 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-700/50 rounded-xl shadow-2xl shadow-black/50 ring-1 ring-white/10 overflow-hidden transition-all duration-200 
              ${isCollapsed
                ? 'left-full bottom-0 ml-3 w-56 origin-bottom-left'
                : 'bottom-full left-0 right-0 mx-2 mb-3 w-56 origin-bottom'
              }`}>

              {/* Header */}
              <div className="px-3 py-3 bg-slate-800/50 border-b border-slate-700/50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-xs border border-slate-600 overflow-hidden flex-shrink-0 bg-slate-800">
                    {userAvatar ? (
                      <img src={userAvatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className={`w-full h-full ${getAvatarColor(userEmail)} flex items-center justify-center text-xs`}>
                        {getInitials(userName || userEmail)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">{userName || userEmail.split('@')[0]}</p>
                    <p className="text-[10px] text-slate-400 truncate">{userEmail}</p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-1 space-y-0.5">
                {onShowSettings && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onShowSettings();
                      if (typeof window !== 'undefined' && window.innerWidth < 768 && onClose) {
                        onClose();
                      }
                    }}
                    className="w-full flex items-center gap-2 px-2 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all group"
                  >
                    <i className="fa-solid fa-clock-rotate-left text-xs w-4 text-slate-400 group-hover:text-cyan-400"></i>
                    <span className="font-medium">Lịch sử</span>
                  </button>
                )}

                <div className="h-px bg-slate-700/30 my-1"></div>

                {/* Logout */}
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onLogout?.();
                    if (typeof window !== 'undefined' && window.innerWidth < 768 && onClose) {
                      onClose();
                    }
                  }}
                  className="w-full flex items-center gap-2 px-2 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all group"
                >
                  <i className="fa-solid fa-right-from-bracket text-xs w-4"></i>
                  <span className="font-medium">Đăng xuất</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
