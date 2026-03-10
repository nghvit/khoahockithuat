import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const PrivacyPolicyPage: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [activeSection, setActiveSection] = useState('intro');

  const sections = [
    { id: 'roles', title: 'Vai trò xử lý dữ liệu', number: 1 },
    { id: 'scope', title: 'Phạm vi dữ liệu', number: 2 },
    { id: 'improvement', title: 'Cải thiện dữ liệu', number: 3 },
    { id: 'security', title: 'Bảo mật & Lưu trữ', number: 4 },
    { id: 'rights', title: 'Quyền chủ thể', number: 5 }
  ];

  useEffect(() => {
    setIsVisible(true);
    setActiveSection('roles');
    
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSectionChange = (sectionId: string) => {
    setActiveSection(sectionId);
  };

  const renderSectionContent = () => {
    switch(activeSection) {
      case 'roles':
        return (
          <section className="group hover:bg-slate-800/20 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/5 border border-transparent hover:border-slate-700/30">
            <h2 className="text-2xl font-bold text-white mb-6">
              <span className="bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">1. Vai trò xử lý dữ liệu</span>
            </h2>
            <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl p-6 border border-cyan-500/20 mb-6">
              <p className="text-slate-300 leading-relaxed mb-4">
                Để đảm bảo tính minh bạch theo <strong className="text-cyan-400">Nghị định 13/2023/NĐ-CP</strong>:
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-slate-800/60 to-slate-700/30 rounded-2xl p-6 border border-slate-700/50 hover:border-emerald-500/30 transition-all duration-300">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">👤</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-lg mb-2">Bên Kiểm soát Dữ liệu (Data Controller)</h3>
                    <p className="text-slate-300 leading-relaxed">
                      Là <strong className="text-emerald-400">Khách hàng</strong>. Khách hàng quyết định mục đích và phương tiện xử lý dữ liệu cá nhân của ứng viên.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-800/60 to-slate-700/30 rounded-2xl p-6 border border-slate-700/50 hover:border-blue-500/30 transition-all duration-300">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">⚙️</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-lg mb-2">Bên Xử lý Dữ liệu (Data Processor)</h3>
                    <p className="text-slate-300 leading-relaxed">
                      Là <strong className="text-blue-400">Support HR</strong>. Chúng tôi thực hiện các hoạt động xử lý (thu thập, lưu trữ, phân tích) thay mặt cho Khách hàng và theo chỉ thị của Khách hàng.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );

      case 'scope':
        return (
          <section className="group hover:bg-slate-800/20 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/5 border border-transparent hover:border-slate-700/30">
            <h2 className="text-2xl font-bold text-white mb-6">
              <span className="bg-gradient-to-r from-white to-emerald-200 bg-clip-text text-transparent">2. Phạm vi dữ liệu thu thập</span>
            </h2>
            <p className="text-slate-300 leading-relaxed mb-6">
              Hệ thống thu thập và xử lý các loại dữ liệu sau để vận hành tính năng cốt lõi (Sàng lọc & Chấm điểm):
            </p>
            
            <div className="space-y-4">
              <div className="group bg-gradient-to-br from-slate-800/60 to-slate-700/30 rounded-2xl p-6 border border-slate-700/50 hover:border-cyan-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-xl">🏢</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-lg mb-3">Thông tin Tài khoản Doanh nghiệp</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-3">
                        <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></span>
                        <span className="text-slate-300">Tên doanh nghiệp</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></span>
                        <span className="text-slate-300">Email liên hệ</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></span>
                        <span className="text-slate-300">Logo công ty</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></span>
                        <span className="text-slate-300">Mã số thuế</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="group bg-gradient-to-br from-slate-800/60 to-slate-700/30 rounded-2xl p-6 border border-slate-700/50 hover:border-emerald-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-xl">📄</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-lg mb-3">Dữ liệu Ứng viên (Candidate Data)</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-3">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-2 flex-shrink-0"></span>
                        <span className="text-slate-300">Họ tên, thông tin liên hệ</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-2 flex-shrink-0"></span>
                        <span className="text-slate-300">Lịch sử làm việc</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-2 flex-shrink-0"></span>
                        <span className="text-slate-300">Học vấn</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-2 flex-shrink-0"></span>
                        <span className="text-slate-300">Kỹ năng và các thông tin khác có trong tệp CV (PDF/Word/Image)</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="group bg-gradient-to-br from-slate-800/60 to-slate-700/30 rounded-2xl p-6 border border-slate-700/50 hover:border-purple-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-xl">💼</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-lg mb-3">Dữ liệu Tuyển dụng</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-3">
                        <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0"></span>
                        <span className="text-slate-300">Nội dung Mô tả công việc (JD)</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0"></span>
                        <span className="text-slate-300">Tiêu chí đánh giá</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0"></span>
                        <span className="text-slate-300">Trọng số ưu tiên</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );

      case 'improvement':
        return (
          <section className="group hover:bg-slate-800/20 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5 border border-transparent hover:border-slate-700/30">
            <h2 className="text-2xl font-bold text-white mb-6">
              <span className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">3. Quyền sử dụng dữ liệu để cải thiện</span>
            </h2>
            <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-xl p-6 border border-blue-500/20 mb-6">
              <p className="text-slate-300 leading-relaxed">
                Khách hàng đồng ý cấp quyền cho Support HR thực hiện các hoạt động sau đối với Dữ liệu Khách hàng:
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-gradient-to-br from-slate-800/60 to-slate-700/30 rounded-2xl p-6 border border-slate-700/50 hover:border-amber-500/30 transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-xl">🔒</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white text-lg mb-2">Ẩn danh hóa (De-identification)</h3>
                    <p className="text-slate-300 leading-relaxed">
                      Loại bỏ hoàn toàn các thông tin định danh cá nhân (PII) như Tên, Email, SĐT, Địa chỉ khỏi dữ liệu gốc.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-800/60 to-slate-700/30 rounded-2xl p-6 border border-slate-700/50 hover:border-green-500/30 transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-xl">🤖</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white text-lg mb-2">Huấn luyện Mô hình</h3>
                    <p className="text-slate-300 leading-relaxed">
                      Sử dụng dữ liệu đã được ẩn danh và tổng hợp (Aggregated Data) để huấn luyện lại (Re-train), tinh chỉnh (Fine-tune) thuật toán chấm điểm và cải thiện độ chính xác của AI.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-800/60 to-slate-700/30 rounded-2xl p-6 border border-slate-700/50 hover:border-indigo-500/30 transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-xl">📊</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white text-lg mb-2">Thống kê</h3>
                    <p className="text-slate-300 leading-relaxed">
                      Tạo các báo cáo thị trường lao động (ví dụ: Xu hướng kỹ năng, Mức lương trung bình) phục vụ cộng đồng.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );

      case 'security':
        return (
          <section className="group hover:bg-slate-800/20 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/5 border border-transparent hover:border-slate-700/30">
            <h2 className="text-2xl font-bold text-white mb-6">
              <span className="bg-gradient-to-r from-white to-green-200 bg-clip-text text-transparent">4. Bảo mật & Lưu trữ</span>
            </h2>
            
            {/* 4.1 */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-green-500/20 text-green-400 flex items-center justify-center text-lg">🛡️</span>
                4.1. Biện pháp an ninh
              </h3>
              <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl p-6 border border-green-500/20">
                <p className="text-slate-300 leading-relaxed mb-4">
                  Chúng tôi áp dụng các biện pháp bảo vệ kỹ thuật bao gồm:
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-green-400">🔐</span>
                      <h4 className="font-medium text-white">Mã hóa đường truyền</h4>
                    </div>
                    <p className="text-slate-400 text-sm">TLS 1.2+ để bảo vệ dữ liệu khi truyền tải</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-green-400">💾</span>
                      <h4 className="font-medium text-white">Mã hóa tại chỗ</h4>
                    </div>
                    <p className="text-slate-400 text-sm">AES-256 để bảo vệ dữ liệu lưu trữ</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-green-400">🔑</span>
                      <h4 className="font-medium text-white">Quản lý khóa API</h4>
                    </div>
                    <p className="text-slate-400 text-sm">Server-side API Key Management</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-green-400">🚫</span>
                      <h4 className="font-medium text-white">Ngăn chặn rò rỉ</h4>
                    </div>
                    <p className="text-slate-400 text-sm">Bảo vệ khỏi truy cập trái phép</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 4.2 */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center text-lg">⏱️</span>
                4.2. Thời gian lưu trữ
              </h3>
              <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-xl p-6 border border-blue-500/20">
                <p className="text-slate-300 leading-relaxed mb-4">
                  Dữ liệu sẽ được lưu trữ trong suốt thời gian Khách hàng sử dụng Dịch vụ.
                </p>
                <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/30">
                  <p className="text-blue-200 leading-relaxed">
                    Khi Khách hàng chấm dứt hợp đồng hoặc gửi yêu cầu xóa tài khoản, Support HR sẽ tiến hành 
                    <strong className="text-blue-400"> xóa vĩnh viễn toàn bộ Dữ liệu Khách hàng</strong> khỏi hệ thống sản xuất 
                    trong vòng <strong className="text-blue-400">30 ngày</strong>, trừ khi pháp luật yêu cầu lưu trữ lâu hơn.
                  </p>
                </div>
              </div>
            </div>
          </section>
        );

      case 'rights':
        return (
          <section className="group hover:bg-slate-800/20 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/5 border border-transparent hover:border-slate-700/30">
            <h2 className="text-2xl font-bold text-white mb-6">
              <span className="bg-gradient-to-r from-white to-pink-200 bg-clip-text text-transparent">5. Quyền của chủ thể dữ liệu</span>
            </h2>
            <div className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-xl p-6 border border-pink-500/20 mb-6">
              <p className="text-slate-300 leading-relaxed">
                Support HR cam kết hỗ trợ Khách hàng thực hiện nghĩa vụ đối với chủ thể dữ liệu (ứng viên) theo quy định pháp luật:
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-gradient-to-br from-slate-800/60 to-slate-700/30 rounded-2xl p-6 border border-slate-700/50 hover:border-cyan-500/30 transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">📥</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white text-lg mb-2">Trích xuất dữ liệu</h3>
                    <p className="text-slate-300 leading-relaxed">
                      Hỗ trợ trích xuất dữ liệu khi có yêu cầu từ ứng viên hoặc cơ quan có thẩm quyền.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-800/60 to-slate-700/30 rounded-2xl p-6 border border-slate-700/50 hover:border-red-500/30 transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🗑️</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white text-lg mb-2">Quyền được lãng quên</h3>
                    <p className="text-slate-300 leading-relaxed">
                      Hỗ trợ xóa bỏ hoàn toàn thông tin của một ứng viên cụ thể ra khỏi hệ thống khi ứng viên thực hiện "Quyền được lãng quên".
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl p-5 border border-indigo-500/30 mt-6">
                <div className="flex items-start gap-3">
                  <span className="text-2xl mt-1">⚖️</span>
                  <div>
                    <h4 className="font-semibold text-indigo-200 mb-2">Tuân thủ pháp luật</h4>
                    <p className="text-indigo-100 text-sm leading-relaxed">
                      Tất cả các quyền này được thực hiện theo quy định của <strong>Nghị định 13/2023/NĐ-CP</strong> về 
                      Bảo vệ dữ liệu cá nhân và các văn bản pháp luật có liên quan.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );

      default:
        return (
          <section className="group hover:bg-slate-800/20 rounded-2xl p-6 transition-all duration-300">
            <p className="text-slate-400">Vui lòng chọn một mục để xem nội dung chi tiết.</p>
          </section>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 blur-3xl animate-pulse delay-1000"></div>
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 blur-3xl animate-pulse delay-500"
          style={{ transform: `translateY(${scrollY * 0.1}px)` }}
        ></div>
      </div>
      
      {/* Header */}
      <div className="bg-slate-900/90 border-b border-slate-800/60 sticky top-0 z-10 backdrop-blur-md shadow-xl">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <Link 
            to="/" 
            className="group inline-flex items-center gap-3 text-slate-400 hover:text-cyan-400 transition-all duration-300 hover:gap-4"
          >
            <span className="text-2xl">←</span>
            <span className="font-medium">Quay lại trang chủ</span>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 relative z-10">
        {/* Main content container */}
        <div className={`bg-slate-900/60 backdrop-blur-sm border border-slate-800/60 rounded-3xl p-6 sm:p-8 lg:p-12 shadow-2xl shadow-slate-950/50 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white via-cyan-200 to-emerald-200 bg-clip-text text-transparent mb-2 tracking-tight">
              Chính sách bảo mật & Xử lý dữ liệu
            </h1>
            <p className="text-slate-400 text-sm mb-1">
              (Privacy Policy & Data Processing)
            </p>
            <p className="text-slate-500 text-xs">
              Tuân thủ Nghị định 13/2023/NĐ-CP và Tiêu chuẩn Bảo mật Quốc tế
            </p>
          </div>

          {/* Horizontal Navigation Stepper */}
          <div className="mb-10">
            {/* Desktop Navigation */}
            <div className="hidden lg:block">
              <div className="relative">
                {/* Progress Line */}
                <div className="absolute top-6 left-0 right-0 h-0.5 bg-slate-700/50">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-500"
                    style={{ 
                      width: `${((sections.findIndex(s => s.id === activeSection) + 1) / sections.length) * 100}%` 
                    }}
                  ></div>
                </div>
                
                {/* Steps */}
                <div className="relative flex items-center justify-between">
                  {sections.map((section, index) => {
                    const isActive = section.id === activeSection;
                    const isPassed = sections.findIndex(s => s.id === activeSection) >= index;
                    
                    return (
                      <div key={section.id} className="flex-1 flex flex-col items-center">
                        <button
                          onClick={() => handleSectionChange(section.id)}
                          className="group flex flex-col items-center gap-2 transition-all duration-300"
                        >
                          {/* Circle */}
                          <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                            isActive 
                              ? 'bg-gradient-to-br from-cyan-500 to-emerald-500 text-white shadow-lg shadow-cyan-500/50 scale-110' 
                              : isPassed
                                ? 'bg-gradient-to-br from-cyan-500/30 to-emerald-500/30 text-cyan-300 border-2 border-cyan-400/50'
                                : 'bg-slate-800/80 text-slate-500 border-2 border-slate-700/50 group-hover:border-slate-600 group-hover:bg-slate-700/80'
                          }`}>
                            {section.number}
                          </div>
                          
                          {/* Label */}
                          <span className={`text-xs sm:text-sm text-center max-w-[100px] transition-all duration-300 ${
                            isActive 
                              ? 'text-white font-semibold' 
                              : isPassed 
                                ? 'text-slate-300'
                                : 'text-slate-500 group-hover:text-slate-400'
                          }`}>
                            {section.title}
                          </span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Tablet Navigation - Scrollable */}
            <div className="hidden md:block lg:hidden">
              <div className="flex items-center gap-3 overflow-x-auto pb-4 px-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800/50">
                {sections.map((section) => {
                  const isActive = section.id === activeSection;
                  
                  return (
                    <button
                      key={section.id}
                      onClick={() => handleSectionChange(section.id)}
                      className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 ${
                        isActive 
                          ? 'bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 border-2 border-cyan-500/50 shadow-lg shadow-cyan-500/20' 
                          : 'bg-slate-800/50 border-2 border-slate-700/50'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                        isActive 
                          ? 'bg-gradient-to-br from-cyan-500 to-emerald-500 text-white' 
                          : 'bg-slate-700 text-slate-400'
                      }`}>
                        {section.number}
                      </div>
                      <span className={`text-sm font-medium whitespace-nowrap ${
                        isActive ? 'text-white' : 'text-slate-400'
                      }`}>
                        {section.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mobile Navigation - Compact Scrollable */}
            <div className="md:hidden">
              <div className="flex items-center gap-2 overflow-x-auto pb-4 px-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800/50">
                {sections.map((section) => {
                  const isActive = section.id === activeSection;
                  
                  return (
                    <button
                      key={section.id}
                      onClick={() => handleSectionChange(section.id)}
                      className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 ${
                        isActive 
                          ? 'bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 border-2 border-cyan-500/50 shadow-lg shadow-cyan-500/20' 
                          : 'bg-slate-800/50 border-2 border-slate-700/50'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                        isActive 
                          ? 'bg-gradient-to-br from-cyan-500 to-emerald-500 text-white' 
                          : 'bg-slate-700 text-slate-400'
                      }`}>
                        {section.number}
                      </div>
                      <span className={`text-xs font-medium whitespace-nowrap ${
                        isActive ? 'text-white' : 'text-slate-400'
                      }`}>
                        {section.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Dynamic Content */}
          <div className="text-slate-300">
            {renderSectionContent()}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-800/60 backdrop-blur-sm relative z-10 mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 text-center">
          <Link 
            to="/terms" 
            className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 text-slate-300 hover:text-white transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 hover:-translate-y-1"
          >
            📄
            <span>Xem Điều khoản sử dụng</span>
            <span className="text-xs opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
