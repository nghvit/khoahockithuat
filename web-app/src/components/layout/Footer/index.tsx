import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="mt-auto bg-slate-950">
      <div className="w-full px-8 sm:px-14 lg:px-20">
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <img
                src="/images/logos/logo.jpg"
                alt="SupportHR"
                className="w-8 h-8 rounded-lg object-cover"
                onError={(event) => {
                  const target = event.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling;
                  if (fallback) (fallback as HTMLElement).classList.remove('hidden');
                }}
              />
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-emerald-400 flex items-center justify-center text-white text-xs font-bold hidden">
                HR
              </div>
              <span className="text-base font-bold text-white">SupportHR</span>
            </div>
            <p className="text-base leading-relaxed text-slate-400">
              Nền tảng AI chuyên biệt cho tuyển dụng.
            </p>
            <div className="flex items-center gap-2 text-base">
              <span className="inline-flex items-center gap-1 text-emerald-400">
                <i className="fa-solid fa-check"></i>
                Sẵn dùng 24/7
              </span>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-base font-bold text-white uppercase tracking-wide mb-3">Sản phẩm</h4>
            <ul className="space-y-2 text-base text-slate-400">
              <li><a href="#features" className="hover:text-cyan-400 transition-colors">Tính năng chính</a></li>
              <li><a href="#pricing" className="hover:text-cyan-400 transition-colors">Bảng giá</a></li>
              <li><a href="#compare" className="hover:text-cyan-400 transition-colors">So sánh</a></li>
              <li><a href="#steps" className="hover:text-cyan-400 transition-colors">Cách sử dụng</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-base font-bold text-white uppercase tracking-wide mb-3">Công ty</h4>
            <ul className="space-y-2 text-base text-slate-400">
              <li><a href="#about" className="hover:text-cyan-400 transition-colors">Về chúng tôi</a></li>
              <li><a href="#blog" className="hover:text-cyan-400 transition-colors">Blog</a></li>
              <li><a href="#careers" className="hover:text-cyan-400 transition-colors">Tuyển dụng</a></li>
              <li><a href="#changelog" className="hover:text-cyan-400 transition-colors">Changelog</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-base font-bold text-white uppercase tracking-wide mb-3">Liên hệ</h4>
            <div className="space-y-2.5 text-base text-slate-400">
              <div>
                <p className="text-slate-500 mb-1">Điện thoại</p>
                <a href="tel:0899280108" className="text-white hover:text-cyan-400 transition-colors font-medium">
                  0899 280 108
                </a>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Email</p>
                <a href="mailto:support@supporthr.vn" className="text-white hover:text-cyan-400 transition-colors font-medium">
                  support@supporthr.vn
                </a>
              </div>
            </div>
          </div>
        </div>



        {/* Bottom Footer */}
        <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-base text-slate-400">
          <div className="flex items-center gap-2">
            <span>© 2026 SupportHR.</span>
            <span className="hidden sm:inline">|</span>
            <a
              href="https://github.com/phucwebdev"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cyan-400 transition-colors inline-flex items-center gap-1"
            >
              <i className="fa-brands fa-github text-xs"></i>
              phucdevweb
            </a>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/privacy-policy" className="hover:text-cyan-400 transition-colors">
              Bảo mật
            </Link>
            <span className="text-slate-700">|</span>
            <Link to="/terms" className="hover:text-cyan-400 transition-colors">
              Điều khoản
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
