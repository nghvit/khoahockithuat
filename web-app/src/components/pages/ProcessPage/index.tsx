import React, { useState, useEffect } from 'react';

interface ProcessPageProps {
  isIntroMode?: boolean;
  onStart?: () => void;
}

const ProcessPage: React.FC<ProcessPageProps> = ({ isIntroMode = false, onStart }) => {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsVideoOpen(false);
    };
    if (isVideoOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVideoOpen]);

  const fullProcessSteps = [
    {
      icon: 'fa-solid fa-clipboard-list',
      title: 'Nhập Mô tả Công việc (JD)',
      description: 'Cung cấp JD chi tiết hoặc sử dụng OCR để AI hiểu rõ yêu cầu tuyển dụng.',
      color: 'text-sky-400',
    },
    {
      icon: 'fa-solid fa-sliders',
      title: 'Đặt Tiêu chí & Trọng số',
      description: 'Thiết lập các bộ lọc bắt buộc (địa điểm, kinh nghiệm) và phân bổ trọng số điểm cho từng kỹ năng.',
      color: 'text-purple-400',
    },
    {
      icon: 'fa-solid fa-file-arrow-up',
      title: 'Tải lên và Lọc CV',
      description: 'Tải lên hàng loạt CV. Hệ thống tự động lọc các CV không đạt yêu cầu bắt buộc.',
      color: 'text-green-400',
    },
    {
      icon: 'fa-solid fa-rocket',
      title: 'Phân tích & Chấm điểm AI',
      description: 'AI đọc hiểu, chấm điểm, xếp hạng từng CV dựa trên JD và trọng số đã thiết lập.',
      color: 'text-yellow-400',
    },
    {
      icon: 'fa-solid fa-comments',
      title: 'Tư vấn & Lựa chọn',
      description: 'Sử dụng Dashboard và Chatbot AI để so sánh, nhận đề xuất và lựa chọn các ứng viên tiềm năng nhất.',
      color: 'text-pink-400',
    },
    {
      icon: 'fa-solid fa-file-csv',
      title: 'Xuất Danh sách & Phỏng vấn',
      description: 'Xuất danh sách ứng viên đã chọn ra file CSV để chia sẻ và bắt đầu quy trình phỏng vấn.',
      color: 'text-emerald-400',
    },
  ];

  const processSteps = fullProcessSteps;

  return (
    <div className="container mx-auto py-8">
      {!isIntroMode && (
        <div className="mb-6">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors duration-200 group"
          >
            <i className="fa-solid fa-arrow-left text-lg text-blue-400 group-hover:text-blue-300"></i>
            <span className="text-sm font-medium">Quay lại</span>
          </button>
        </div>
      )}

      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 text-transparent bg-clip-text mb-3">Quy trình Sàng lọc CV Thông minh</h1>
        <p className={`text-lg max-w-3xl mx-auto hidden sm:block ${isIntroMode ? 'text-sky-400' : 'text-slate-400'}`}>
          {isIntroMode
            ? "Bắt đầu tối ưu hóa hiệu quả tuyển dụng của bạn với quy trình 6 bước toàn diện."
            : "Dưới đây là luồng làm việc được đề xuất để tối ưu hóa hiệu quả tuyển dụng của bạn."
          }
        </p>

        {/* Video Demo Button */}
        <button
          onClick={() => setIsVideoOpen(true)}
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full
                     bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500
                     text-white font-semibold text-sm shadow-lg shadow-blue-900/40
                     transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <i className="fa-solid fa-circle-play text-lg"></i>
          Xem Video Demo
        </button>
      </header>

      <div className="relative">
        {/* Connecting line */}
        <div className="hidden md:block absolute top-8 left-1/2 w-0.5 h-[calc(100%-4rem)] bg-slate-700 -translate-x-1/2"></div>

        <div className="space-y-8">
          {processSteps.map((step, index) => (
            <div key={index} className="flex flex-col md:flex-row items-center w-full">
              {/* Left Side (or Top on Mobile) */}
              <div className={`w-full md:w-1/2 ${index % 2 === 0 ? 'md:pr-8 md:text-right' : 'md:pl-8 md:text-left md:order-2'}`}>
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 transform hover:scale-[1.02] transition-transform duration-300">
                  <h3 className={`text-xl font-bold ${step.color} mb-2`}>{step.title}</h3>
                  <p className="text-slate-300 hidden sm:block">{step.description}</p>
                </div>
              </div>

              {/* Center Icon */}
              <div className={`w-full md:w-auto flex-shrink-0 my-4 md:my-0 ${index % 2 === 0 ? '' : 'md:order-1'}`}>
                <div className="relative w-16 h-16 bg-slate-900 border-2 border-slate-700 rounded-full flex items-center justify-center mx-auto">
                  <div className={`w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center`}>
                    <i className={`${step.icon} ${step.color} text-2xl`}></i>
                  </div>
                </div>
              </div>

              {/* Spacer on Desktop */}
              <div className="hidden md:block w-1/2"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Video Popup Modal */}
      {isVideoOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setIsVideoOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in" />

          {/* Modal Container */}
          <div
            className="relative z-10 w-full max-w-4xl rounded-2xl overflow-hidden
                       border border-slate-700 shadow-2xl shadow-black/60
                       animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3 bg-slate-900/90 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-circle-play text-blue-400"></i>
                <span className="text-white font-semibold text-sm">Video Demo – SPHR</span>
              </div>
              <button
                onClick={() => setIsVideoOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full
                           text-slate-400 hover:text-white hover:bg-slate-700
                           transition-all duration-150"
              >
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>

            {/* Video Player */}
            <div className="bg-black aspect-video">
              <video
                src="/images/video demo/SPHR Ver3.mp4"
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* Inline animation styles */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.92); }
          to   { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in  { animation: fade-in  0.2s ease forwards; }
        .animate-scale-in { animation: scale-in 0.25s ease forwards; }
      `}</style>
    </div>
  );
};

export default ProcessPage;
