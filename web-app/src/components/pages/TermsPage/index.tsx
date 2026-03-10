import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const TermsPage: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [activeSection, setActiveSection] = useState('definitions');

  const sections = [
    { id: 'definitions', title: 'Định nghĩa thuật ngữ', number: 1 },
    { id: 'intellectual-property', title: 'Quyền sở hữu trí tuệ', number: 2 },
    { id: 'ai-disclaimer', title: 'Công nghệ AI & Miễn trừ', number: 3 },
    { id: 'responsibility', title: 'Trách nhiệm & Tuân thủ', number: 4 },
    { id: 'limitation', title: 'Giới hạn trách nhiệm', number: 5 },
    { id: 'sla-bcp', title: 'SLA & Dự phòng', number: 6 },
  ];

  useEffect(() => {
    setIsVisible(true);
    
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
      case 'definitions':
        return (
          <section className="group hover:bg-slate-800/20 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5 border border-transparent hover:border-slate-700/30">
            <h2 className="text-2xl font-bold text-white mb-6">
              <span className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">1. Định nghĩa thuật ngữ</span>
            </h2>
            <p className="leading-relaxed text-slate-300 mb-6">
              Trong Thỏa thuận này, các từ ngữ dưới đây được hiểu như sau:
            </p>
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/30 rounded-xl p-5 border border-slate-700/40 hover:border-blue-500/30 transition-all duration-300">
                <h3 className="font-semibold text-cyan-400 mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
                  "Dịch vụ" (Service)
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  Là nền tảng phần mềm Support HR, bao gồm mọi tính năng liên quan như chuẩn hóa JD, trích xuất OCR, chấm điểm AI, API, giao diện người dùng và các tài liệu hướng dẫn liên quan.
                </p>
              </div>
              <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/30 rounded-xl p-5 border border-slate-700/40 hover:border-emerald-500/30 transition-all duration-300">
                <h3 className="font-semibold text-emerald-400 mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                  "Khách hàng" (Customer/You)
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  Là cá nhân hoặc tổ chức đăng ký tài khoản và sử dụng Dịch vụ.
                </p>
              </div>
              <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/30 rounded-xl p-5 border border-slate-700/40 hover:border-purple-500/30 transition-all duration-300">
                <h3 className="font-semibold text-purple-400 mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                  "Dữ liệu Khách hàng" (Customer Data)
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  Bao gồm tất cả thông tin, văn bản (JD, CV), hình ảnh hoặc tài liệu khác mà Khách hàng tải lên, nhập vào hoặc gửi qua Dịch vụ.
                </p>
              </div>
              <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/30 rounded-xl p-5 border border-slate-700/40 hover:border-orange-500/30 transition-all duration-300">
                <h3 className="font-semibold text-orange-400 mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                  "Đầu ra AI" (AI Output)
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  Là bất kỳ dữ liệu, văn bản, bảng điểm, xếp hạng hoặc nội dung nào được tạo ra bởi Dịch vụ thông qua việc xử lý Dữ liệu Khách hàng bằng các mô hình trí tuệ nhân tạo.
                </p>
              </div>
            </div>
          </section>
        );
      
      case 'intellectual-property':
        return (
          <section className="group hover:bg-slate-800/20 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/5 border border-transparent hover:border-slate-700/30">
            <h2 className="text-2xl font-bold text-white mb-6">
              <span className="bg-gradient-to-r from-white to-emerald-200 bg-clip-text text-transparent">2. Quyền sở hữu trí tuệ và cấp phép</span>
            </h2>
            
            {/* 2.1 */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm">2.1</span>
                Quyền sở hữu của Khách hàng
              </h3>
              <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-xl p-5 border border-emerald-500/20">
                <p className="text-slate-300 leading-relaxed">
                  Khách hàng giữ toàn quyền sở hữu, quyền tác giả và quyền lợi đối với Dữ liệu Khách hàng. 
                  Support HR không yêu cầu bất kỳ quyền sở hữu nào đối với các tài liệu tuyển dụng hoặc hồ sơ ứng viên mà Khách hàng cung cấp.
                </p>
                <p className="text-slate-500 text-sm mt-3 italic">
                  (Tham chiếu chuẩn mực: OpenAI Terms of Use - Section 3a)
                </p>
              </div>
            </div>

            {/* 2.2 */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm">2.2</span>
                Quyền sở hữu của Support HR
              </h3>
              <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-xl p-5 border border-blue-500/20">
                <p className="text-slate-300 leading-relaxed">
                  Support HR (và các bên cấp phép của chúng tôi) sở hữu độc quyền mọi quyền, danh nghĩa và lợi ích đối với Dịch vụ, bao gồm nhưng không giới hạn ở:
                </p>
                <ul className="mt-3 space-y-2">
                  <li className="flex items-center gap-2 text-slate-300">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                    Mã nguồn, giao diện
                  </li>
                  <li className="flex items-center gap-2 text-slate-300">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                    Thuật toán chấm điểm WSM (Weighted Sum Model)
                  </li>
                  <li className="flex items-center gap-2 text-slate-300">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                    Quy trình xử lý 2 lớp
                  </li>
                  <li className="flex items-center gap-2 text-slate-300">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                    Tài liệu kỹ thuật và nhãn hiệu thương mại
                  </li>
                </ul>
              </div>
            </div>

            {/* 2.3 */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center text-sm">2.3</span>
                Cấp phép sử dụng dữ liệu
              </h3>
              <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-5 border border-purple-500/20">
                <p className="text-slate-300 leading-relaxed">
                  Bằng việc sử dụng Dịch vụ, Khách hàng cấp cho Support HR một giấy phép <strong className="text-white">toàn cầu, không độc quyền, miễn phí bản quyền</strong> để truy cập, sao chép, lưu trữ và xử lý Dữ liệu Khách hàng duy nhất cho mục đích cung cấp và duy trì Dịch vụ.
                </p>
                <p className="text-slate-400 text-sm mt-3">
                  Ví dụ: gửi dữ liệu đến Gemini AI để phân tích, lưu trữ trên Firebase.
                </p>
              </div>
            </div>
          </section>
        );

      case 'ai-disclaimer':
        return (
          <section className="group hover:bg-slate-800/20 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/5 border border-transparent hover:border-slate-700/30">
            <h2 className="text-2xl font-bold text-white mb-6">
              <span className="bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">3. Công nghệ trí tuệ nhân tạo & Tuyên bố miễn trừ</span>
            </h2>
            
            <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl p-5 border border-cyan-500/20 mb-6">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🤖</span>
                <p className="text-slate-300 leading-relaxed">
                  Dịch vụ tích hợp các mô hình ngôn ngữ lớn (LLM) từ bên thứ ba (Google Gemini). 
                  Do tính chất xác suất và phát sinh của công nghệ này, Khách hàng đồng ý các điều khoản sau:
                </p>
              </div>
            </div>

            {/* 3.1 */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-sm">3.1</span>
                Tính chính xác (Accuracy)
              </h3>
              <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-xl p-5 border border-amber-500/20">
                <p className="text-slate-300 leading-relaxed mb-3">
                  Các tính năng AI có thể tạo ra kết quả không chính xác, sai lệch hoặc không đầy đủ (<strong className="text-amber-400">"Ảo giác AI"</strong>).
                </p>
                <div className="bg-amber-500/10 rounded-lg p-4 border border-amber-500/30">
                  <p className="text-amber-200 text-sm leading-relaxed">
                    ⚠️ Support HR <strong>không cam kết, bảo đảm hoặc tuyên bố</strong> rằng Đầu ra AI là chính xác, trung thực hoặc phù hợp cho bất kỳ mục đích cụ thể nào. 
                    Khách hàng có trách nhiệm độc lập trong việc xác minh độ chính xác của mọi Đầu ra AI trước khi sử dụng.
                  </p>
                </div>
                <p className="text-slate-500 text-sm mt-3 italic">
                  (Tham chiếu chuẩn mực: Google Generative AI Additional Terms of Service)
                </p>
              </div>
            </div>

            {/* 3.2 */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-green-500/20 text-green-400 flex items-center justify-center text-sm">3.2</span>
                Không thay thế con người (Human-in-the-loop)
              </h3>
              <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl p-5 border border-green-500/20">
                <p className="text-slate-300 leading-relaxed mb-3">
                  Dịch vụ được thiết kế như một <strong className="text-green-400">công cụ hỗ trợ ra quyết định</strong> (Decision Support System), không phải là hệ thống ra quyết định tự động hoàn toàn.
                </p>
                <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/30">
                  <p className="text-green-200 text-sm leading-relaxed">
                    👤 Khách hàng cam kết duy trì sự giám sát của con người trong toàn bộ quy trình tuyển dụng và chịu trách nhiệm duy nhất đối với mọi quyết định tuyển dụng, phỏng vấn hoặc từ chối ứng viên dựa trên Đầu ra AI.
                  </p>
                </div>
              </div>
            </div>

            {/* 3.3 */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-sm">3.3</span>
                Tính nhất quán
              </h3>
              <div className="bg-gradient-to-r from-indigo-500/10 to-violet-500/10 rounded-xl p-5 border border-indigo-500/20">
                <p className="text-slate-300 leading-relaxed">
                  Do bản chất của mô hình máy học, <strong className="text-indigo-400">cùng một dữ liệu đầu vào có thể tạo ra các Đầu ra AI khác nhau</strong> ở các thời điểm khác nhau.
                </p>
              </div>
            </div>
          </section>
        );

      case 'responsibility':
        return (
          <section className="group hover:bg-slate-800/20 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/5 border border-transparent hover:border-slate-700/30">
            <h2 className="text-2xl font-bold text-white mb-6">
              <span className="bg-gradient-to-r from-white to-pink-200 bg-clip-text text-transparent">4. Trách nhiệm và tuân thủ pháp luật</span>
            </h2>

            {/* 4.1 */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm">4.1</span>
                Tuân thủ Luật Lao động
              </h3>
              <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-xl p-5 border border-blue-500/20">
                <p className="text-slate-300 leading-relaxed mb-4">
                  Khách hàng chịu trách nhiệm đảm bảo việc sử dụng Dịch vụ, bao gồm việc thiết lập các tiêu chí lọc (Hard Filters) và trọng số chấm điểm, tuân thủ nghiêm ngặt:
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/30 flex items-center gap-2">
                    <span className="text-blue-400">📜</span>
                    <span className="text-blue-200 text-sm">Bộ luật Lao động Việt Nam</span>
                  </div>
                  <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/30 flex items-center gap-2">
                    <span className="text-blue-400">⚖️</span>
                    <span className="text-blue-200 text-sm">Quy định chống phân biệt đối xử</span>
                  </div>
                </div>
                <p className="text-slate-400 text-sm mt-3">
                  (về giới tính, tôn giáo, dân tộc, v.v.)
                </p>
              </div>
            </div>

            {/* 4.2 */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center text-sm">4.2</span>
                Dữ liệu cấm
              </h3>
              <div className="bg-gradient-to-r from-red-500/10 to-rose-500/10 rounded-xl p-5 border border-red-500/20">
                <p className="text-slate-300 leading-relaxed mb-4">
                  Khách hàng cam kết <strong className="text-red-400">KHÔNG</strong> tải lên Dịch vụ các dữ liệu sau:
                </p>
                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center flex-shrink-0 mt-0.5">✗</span>
                    <span className="text-slate-300">Dữ liệu thuộc danh mục bí mật nhà nước</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center flex-shrink-0 mt-0.5">✗</span>
                    <span className="text-slate-300">Dữ liệu vi phạm thuần phong mỹ tục</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center flex-shrink-0 mt-0.5">✗</span>
                    <span className="text-slate-300">Phần mềm độc hại, virus, mã nguồn tấn công hạ tầng của Support HR</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );

      case 'limitation':
        return (
          <section className="group hover:bg-slate-800/20 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/5 border border-transparent hover:border-slate-700/30">
            <h2 className="text-2xl font-bold text-white mb-6">
              <span className="bg-gradient-to-r from-white to-orange-200 bg-clip-text text-transparent">5. Giới hạn trách nhiệm pháp lý</span>
            </h2>
            
            <div className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 rounded-xl p-5 border border-orange-500/20 mb-6">
              <p className="text-orange-200 font-semibold text-center">
                TRONG PHẠM VI TỐI ĐA MÀ PHÁP LUẬT CHO PHÉP:
              </p>
            </div>

            {/* Điều khoản A */}
            <div className="mb-6">
              <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/30 rounded-xl p-5 border border-slate-700/40">
                <div className="flex items-start gap-4">
                  <span className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold flex-shrink-0">A</span>
                  <div>
                    <p className="text-slate-300 leading-relaxed">
                      Support HR <strong className="text-orange-400">SẼ KHÔNG CHỊU TRÁCH NHIỆM</strong> về bất kỳ thiệt hại gián tiếp, ngẫu nhiên, đặc biệt, hậu quả hoặc trừng phạt nào, bao gồm:
                    </p>
                    <ul className="mt-3 space-y-2">
                      <li className="flex items-center gap-2 text-slate-400">
                        <span className="w-1.5 h-1.5 bg-orange-400 rounded-full"></span>
                        Mất lợi nhuận
                      </li>
                      <li className="flex items-center gap-2 text-slate-400">
                        <span className="w-1.5 h-1.5 bg-orange-400 rounded-full"></span>
                        Mất dữ liệu
                      </li>
                      <li className="flex items-center gap-2 text-slate-400">
                        <span className="w-1.5 h-1.5 bg-orange-400 rounded-full"></span>
                        Gián đoạn kinh doanh
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Điều khoản B */}
            <div>
              <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/30 rounded-xl p-5 border border-slate-700/40">
                <div className="flex items-start gap-4">
                  <span className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold flex-shrink-0">B</span>
                  <div>
                    <p className="text-slate-300 leading-relaxed">
                      Tổng trách nhiệm pháp lý của Support HR đối với bất kỳ khiếu nại nào liên quan đến Dịch vụ <strong className="text-amber-400">SẼ KHÔNG VƯỢT QUÁ</strong> số tiền Khách hàng đã thanh toán cho chúng tôi trong vòng:
                    </p>
                    <div className="mt-4 bg-amber-500/10 rounded-lg p-4 border border-amber-500/30 text-center">
                      <span className="text-3xl font-bold text-amber-400">03</span>
                      <span className="text-amber-200 ml-2">(BA) THÁNG</span>
                      <p className="text-slate-400 text-sm mt-1">trước khi sự kiện dẫn đến khiếu nại xảy ra</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );

      case 'sla-bcp':
        return (
          <section className="group hover:bg-slate-800/20 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/5 border border-transparent hover:border-slate-700/30">
            <h2 className="text-2xl font-bold text-white mb-6">
              <span className="bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">6. Cam kết mức độ dịch vụ và Kế hoạch kinh doanh liên tục</span>
            </h2>
            
            <p className="text-slate-400 mb-6 text-sm">(SLA & BCP)</p>

            {/* 6.1 */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-green-500/20 text-green-400 flex items-center justify-center text-sm">6.1</span>
                Tính sẵn sàng của hệ thống (Uptime)
              </h3>
              <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl p-5 border border-green-500/20">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-slate-300">Mục tiêu SLA:</span>
                  <span className="text-3xl font-bold text-green-400">99.0%</span>
                </div>
                <p className="text-slate-300 leading-relaxed mb-3">
                  Support HR cam kết nỗ lực hợp lý về mặt thương mại để duy trì Dịch vụ hoạt động ổn định và liên tục.
                </p>
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                  <p className="text-slate-400 text-sm leading-relaxed">
                    ⚠️ Khách hàng thừa nhận rằng các trường hợp gián đoạn do bảo trì định kỳ, sự cố bất khả kháng hoặc lỗi từ nhà cung cấp hạ tầng (Google Cloud, Vercel) nằm ngoài phạm vi kiểm soát của chúng tôi.
                  </p>
                </div>
              </div>
            </div>

            {/* 6.2 */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center text-sm">6.2</span>
                Kế hoạch dự phòng đối tác (Vendor Continuity)
              </h3>
              <div className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rounded-xl p-5 border border-purple-500/20">
                <p className="text-slate-300 leading-relaxed mb-4">
                  Hệ thống được xây dựng trên kiến trúc linh hoạt, giảm thiểu sự phụ thuộc độc quyền vào một nhà cung cấp duy nhất.
                </p>
                <p className="text-slate-300 leading-relaxed mb-4">
                  Trong trường hợp các đối tác công nghệ cốt lõi (như Google Gemini API, Firebase) thay đổi chính sách nghiêm trọng hoặc ngừng cung cấp dịch vụ:
                </p>
                <div className="space-y-3">
                  <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/30 flex items-start gap-3">
                    <span className="text-purple-400 mt-0.5">📢</span>
                    <p className="text-purple-200 text-sm leading-relaxed">
                      Chúng tôi cam kết <strong>thông báo cho Khách hàng trước ít nhất 30 ngày</strong> (trừ trường hợp khẩn cấp).
                    </p>
                  </div>
                  <div className="bg-indigo-500/10 rounded-lg p-4 border border-indigo-500/30 flex items-start gap-3">
                    <span className="text-indigo-400 mt-0.5">🔄</span>
                    <p className="text-indigo-200 text-sm leading-relaxed">
                      Chúng tôi cam kết <strong>nỗ lực kỹ thuật để chuyển đổi sang các giải pháp thay thế tương đương</strong> (ví dụ: chuyển từ Gemini sang OpenAI hoặc các mô hình mã nguồn mở khác) nhằm đảm bảo dữ liệu và quy trình tuyển dụng của Khách hàng không bị gián đoạn vĩnh viễn.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );

      default:
        return (
          <section className="group hover:bg-slate-800/20 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5 border border-transparent hover:border-slate-700/30">
            <h2 className="text-2xl font-bold text-white mb-6">
              <span className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">1. Định nghĩa thuật ngữ</span>
            </h2>
            <p className="leading-relaxed text-slate-300">
              Vui lòng chọn một mục từ menu bên trái để xem nội dung chi tiết.
            </p>
          </section>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div 
          className="absolute top-1/3 left-1/4 w-60 h-60 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-2xl"
          style={{ transform: `translateY(${scrollY * 0.15}px)` }}
        ></div>
      </div>
      
      {/* Header */}
      <div className="bg-slate-900/90 border-b border-slate-800/60 sticky top-0 z-10 backdrop-blur-md shadow-xl">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <Link 
            to="/" 
            className="group inline-flex items-center gap-3 text-slate-400 hover:text-purple-400 transition-all duration-300 hover:gap-4"
          >
            <div className="w-8 h-8 rounded-full bg-slate-800/50 group-hover:bg-purple-500/20 flex items-center justify-center transition-all duration-300 group-hover:scale-110">
              <span className="text-sm">←</span>
            </div>
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
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent mb-4 tracking-tight">
              Điều khoản sử dụng dịch vụ
            </h1>
            <p className="text-slate-400 text-sm">
              (Terms of Service)
            </p>
          </div>

          {/* Version info */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-8 text-sm">
            <div className="bg-slate-800/50 rounded-full px-4 py-2 border border-slate-700/50">
              <span className="text-slate-400">Phiên bản:</span>
              <span className="text-white ml-2 font-medium">Chính thức</span>
            </div>
            <div className="bg-slate-800/50 rounded-full px-4 py-2 border border-slate-700/50">
              <span className="text-slate-400">Có hiệu lực từ:</span>
              <span className="text-cyan-400 ml-2 font-medium">06/01/2026</span>
            </div>
          </div>

          {/* Horizontal Navigation Stepper */}
          <div className="mb-10">
            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="relative">
                {/* Progress Line */}
                <div className="absolute top-6 left-0 right-0 h-0.5 bg-slate-700/50">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
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
                              ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/50 scale-110' 
                              : isPassed
                                ? 'bg-gradient-to-br from-blue-500/30 to-purple-500/30 text-blue-300 border-2 border-blue-400/50'
                                : 'bg-slate-800/80 text-slate-500 border-2 border-slate-700/50 group-hover:border-slate-600 group-hover:bg-slate-700/80'
                          }`}>
                            {section.number}
                          </div>
                          
                          {/* Label */}
                          <span className={`text-xs sm:text-sm text-center max-w-[120px] transition-all duration-300 ${
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

            {/* Mobile Navigation - Scrollable */}
            <div className="md:hidden">
              <div className="flex items-center gap-3 overflow-x-auto pb-4 px-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800/50">
                {sections.map((section) => {
                  const isActive = section.id === activeSection;
                  
                  return (
                    <button
                      key={section.id}
                      onClick={() => handleSectionChange(section.id)}
                      className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 ${
                        isActive 
                          ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-2 border-blue-500/50 shadow-lg shadow-blue-500/20' 
                          : 'bg-slate-800/50 border-2 border-slate-700/50'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                        isActive 
                          ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white' 
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

          {/* Content sections */}
          <div className="space-y-10 text-slate-300">
            {renderSectionContent()}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-800/60 backdrop-blur-sm relative z-10 mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 text-center">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link 
              to="/privacy-policy" 
              className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 border border-cyan-500/20 text-slate-300 hover:text-white transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20 hover:-translate-y-1"
            >
              <span className="text-cyan-400">🛡</span>
              <span>Xem Chính sách bảo mật</span>
              <span className="text-xs opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">→</span>
            </Link>
          </div>
          <p className="text-slate-500 text-sm mt-6">
            © 2026 Support HR. Tất cả quyền được bảo lưu.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
