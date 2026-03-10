
import React from 'react';

interface LoaderProps {
  message: string;
}

const Loader: React.FC<LoaderProps> = ({ message }) => {
  return (
    <div className="flex justify-center items-center flex-col gap-8 text-center py-20 md:py-24">
      <div className="relative w-24 h-24">
        {/* Outer ring */}
        <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>

        {/* Spinning gradient ring */}
        <div className="absolute inset-0 border-4 border-transparent border-t-sky-500 border-r-blue-500 rounded-full animate-spin"></div>

        {/* Inner pulsing circle */}
        <div className="absolute inset-4 bg-slate-900 rounded-full flex items-center justify-center shadow-inner shadow-black/50">
          <div className="w-8 h-8 bg-gradient-to-br from-sky-400 to-blue-600 rounded-full animate-pulse shadow-[0_0_15px_rgba(56,189,248,0.5)]"></div>
        </div>

        {/* Orbiting dots */}
        <div className="absolute inset-0 animate-[spin_3s_linear_infinite]">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-2 h-2 bg-sky-400 rounded-full shadow-[0_0_10px_rgba(56,189,248,0.8)]"></div>
        </div>
        <div className="absolute inset-0 animate-[spin_4s_linear_infinite_reverse]">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
        </div>
      </div>

      <div className="space-y-3 max-w-md mx-auto px-4">
        <h3 className="text-xl font-bold bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent animate-pulse">
          {message || 'Đang phân tích CV với AI...'}
        </h3>
        <p className="text-slate-400 text-sm">
          Vui lòng chờ đợi trong vài phút. Hệ thống đang đọc hiểu và chấm điểm từng hồ sơ.
        </p>

        {/* Progress bar simulation */}
        <div className="w-48 h-1 bg-slate-800 rounded-full mx-auto overflow-hidden mt-4">
          <div className="h-full bg-gradient-to-r from-sky-500 to-blue-600 w-1/3 animate-[shimmer_2s_infinite_linear] rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default Loader;
