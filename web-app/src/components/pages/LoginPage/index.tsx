import React, { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../../../config/firebase';


interface LoginPageProps {
  onLogin: (email: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [successStage, setSuccessStage] = useState<'idle' | 'celebrating' | 'transitioning'>('idle');
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    setError('');
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      try { localStorage.setItem('authEmail', user.email || ''); } catch { }
      setShowSuccess(true);
      setSuccessStage('celebrating');
      setTimeout(() => {
        setSuccessStage('transitioning');
        setTimeout(() => {
          onLogin(user.email || '');
        }, 800);
      }, 2000);
    } catch (err: any) {
      setError('Đăng nhập Google thất bại: ' + (err.message || 'Vui lòng thử lại'));
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center relative overflow-hidden transition-all duration-800 ${successStage === 'transitioning' ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`} style={{ backgroundColor: '#020617' }}>
      {/* AI Aurora Effect */}
      <div className="ai-aurora"></div>
      <div className="grid-overlay"></div>

      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className={`absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl transition-all duration-1000 ${successStage === 'celebrating' ? 'animate-pulse scale-110 bg-green-500/20' : 'animate-pulse'}`}></div>
        <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/12 rounded-full blur-3xl transition-all duration-1000 delay-1000 ${successStage === 'celebrating' ? 'animate-pulse scale-110 bg-emerald-500/20' : 'animate-pulse'}`}></div>
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl transition-all duration-1000 delay-500 ${successStage === 'celebrating' ? 'animate-pulse scale-110 bg-teal-500/20' : 'animate-pulse'}`}></div>

        {/* Success confetti effect */}
        {successStage === 'celebrating' && (
          <>
            <div className="absolute top-10 left-10 w-4 h-4 bg-yellow-400 rounded-full animate-bounce delay-0 opacity-70"></div>
            <div className="absolute top-20 right-20 w-3 h-3 bg-pink-400 rounded-full animate-bounce delay-200 opacity-70"></div>
            <div className="absolute bottom-20 left-20 w-5 h-5 bg-blue-400 rounded-full animate-bounce delay-400 opacity-70"></div>
            <div className="absolute bottom-10 right-10 w-2 h-2 bg-green-400 rounded-full animate-bounce delay-600 opacity-70"></div>
            <div className="absolute top-1/3 left-1/3 w-3 h-3 bg-purple-400 rounded-full animate-bounce delay-300 opacity-70"></div>
            <div className="absolute bottom-1/3 right-1/3 w-4 h-4 bg-orange-400 rounded-full animate-bounce delay-500 opacity-70"></div>
          </>
        )}
      </div>

      <div className="relative z-10 w-full flex flex-col items-center justify-center px-4 py-8">
        {/* Success Notification */}
        {showSuccess && (
          <div className={`mb-6 p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/50 rounded-2xl backdrop-blur-sm shadow-lg transition-all duration-700 ease-out transform max-w-md w-full
            ${successStage === 'celebrating' ? 'scale-100 opacity-100 translate-y-0 animate-pulse' : 'scale-95 opacity-0 translate-y-4'}`}>
            <div className="flex items-center justify-center space-x-2">
              <i className={`fa-solid fa-check-circle text-green-400 text-xl transition-all duration-500 ${successStage === 'celebrating' ? 'animate-bounce scale-110' : ''}`}></i>
              <span className="text-green-200 font-medium animate-pulse">Đăng nhập thành công!</span>
            </div>
            {successStage === 'celebrating' && (
              <div className="mt-3 flex justify-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce delay-0"></div>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce delay-200"></div>
              </div>
            )}
          </div>
        )}

        {/* Error Notification */}
        {error && (
          <div className="mb-6 p-4 bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-400/50 rounded-2xl backdrop-blur-sm shadow-lg transition-all duration-500 ease-in-out max-w-md w-full">
            <div className="flex items-center justify-center space-x-2">
              <i className="fa-solid fa-exclamation-triangle text-red-400 text-xl animate-bounce"></i>
              <span className="text-red-200 font-medium">{error}</span>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl w-full items-center">
          {/* Left side - Features/Benefits */}
          <div className="hidden lg:flex flex-col justify-center space-y-6">
            <div className="space-y-2">
              <h2 className="text-4xl font-bold text-white leading-tight">
                Tuyển dụng <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">thông minh</span> hơn
              </h2>
              <p className="text-lg text-slate-300">Giảm 70% thời gian sàng lọc CV nhờ AI</p>
            </div>

            <div className="space-y-4">
              {[
                { icon: 'fa-solid fa-lightning-bolt', title: 'Nhanh gấp 10 lần', desc: 'Xử lý 100 CV trong vài phút' },
                { icon: 'fa-solid fa-bullseye', title: '95%+ độ chính xác', desc: 'AI chuyên biệt cho tuyển dụng Việt' },
                { icon: 'fa-solid fa-lock', title: 'Bảo mật tối đa', desc: 'Dữ liệu ứng viên được mã hóa' },
              ].map((feature, idx) => (
                <div key={idx} className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <i className={`${feature.icon} text-cyan-400`}></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{feature.title}</h3>
                    <p className="text-sm text-slate-400">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right side - Login Card */}
          <div className="flex flex-col items-center">
            {/* Main card */}
            <div className={`backdrop-blur-xl bg-gradient-to-br from-slate-950/80 to-slate-900/60 border border-white/10 rounded-3xl shadow-2xl p-8 w-full max-w-md transform transition-all duration-500 hover:border-white/20 ${successStage === 'celebrating' ? 'scale-105 shadow-green-500/20 border-green-400/30 animate-pulse' : ''}`}>
              {/* Logo/Brand Section */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl shadow-lg mb-6 transform hover:scale-110 transition-transform duration-300 overflow-hidden bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30">
                  <img
                    src="/images/logos/logo.jpg"
                    alt="Support HR Logo"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Support HR
                </h1>
                <p className="text-slate-400 text-sm">
                  Nền tảng tuyển dụng AI hiện đại
                </p>
              </div>

              {/* Features Preview */}
              <div className="mb-8 space-y-3">
                {[
                  { icon: 'fa-solid fa-filter', text: 'Sàng lọc CV thông minh' },
                  { icon: 'fa-solid fa-chart-line', text: 'Phân tích năng lực chi tiết' },
                  { icon: 'fa-solid fa-microphone', text: 'Gợi ý câu hỏi phỏng vấn' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-sm">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300">
                      <i className={`${item.icon} text-xs`}></i>
                    </span>
                    <span className="text-slate-200">{item.text}</span>
                  </div>
                ))}
              </div>

              {/* Google Sign In Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full flex justify-center items-center py-3 px-6 border border-white/20 rounded-xl shadow-lg text-base font-semibold text-white bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 hover:from-cyan-500/20 hover:to-emerald-500/20 hover:border-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transform transition-all duration-200 hover:scale-[1.02] backdrop-blur-sm group mb-4"
              >
                <svg className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-200" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M5.26620003,9.76452941 C6.19878754,6.93863203 8.85444915,4.90909091 12,4.90909091 C13.6909091,4.90909091 15.2181818,5.50909091 16.4181818,6.49090909 L19.9090909,3 C17.7818182,1.14545455 15.0545455,0 12,0 C7.27006974,0 3.1977497,2.69829785 1.23999023,6.65002441 L5.26620003,9.76452941 Z" />
                  <path fill="#34A853" d="M16.0407269,18.0125889 C14.9509167,18.7163016 13.5660892,19.0909091 12,19.0909091 C8.86648613,19.0909091 6.21911939,17.076871 5.27698177,14.2678769 L1.23746264,17.3349879 C3.19279051,21.2936293 7.26500293,24 12,24 C14.9328362,24 17.7353462,22.9573905 19.834192,20.9995801 L16.0407269,18.0125889 Z" />
                  <path fill="#4A90E2" d="M19.834192,20.9995801 C22.0291676,18.9520994 23.4545455,15.903663 23.4545455,12 C23.4545455,11.2909091 23.3454545,10.5818182 23.1818182,9.90909091 L12,9.90909091 L12,14.4545455 L18.4363636,14.4545455 C18.1187732,16.013626 17.2662994,17.2212117 16.0407269,18.0125889 L19.834192,20.9995801 Z" />
                  <path fill="#FBBC05" d="M5.27698177,14.2678769 C5.03832634,13.556323 4.90909091,12.7937589 4.90909091,12 C4.90909091,11.2182781 5.03443647,10.4668121 5.26620003,9.76452941 L1.23999023,6.65002441 C0.43658717,8.26043162 0,10.0753848 0,12 C0,13.9195484 0.444780743,15.7301709 1.23746264,17.3349879 L5.27698177,14.2678769 Z" />
                </svg>
                Đăng nhập với Google
              </button>

              <div className="text-center">
                <p className="text-slate-500 text-xs leading-relaxed">
                  Bằng cách đăng nhập bạn đồng ý với <a href="#" className="text-cyan-400 hover:text-cyan-300">điều khoản sử dụng</a> và <a href="#" className="text-cyan-400 hover:text-cyan-300">chính sách bảo mật</a>
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-8">
              <p className="text-slate-500 text-xs">
                © 2025 Support HR - Hệ thống tuyển dụng AI
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
