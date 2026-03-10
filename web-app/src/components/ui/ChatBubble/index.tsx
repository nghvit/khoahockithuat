import React, { useState } from 'react';

const faqs = [
  {
    question: 'Quy trình hoạt động của Support HR AI diễn ra như thế nào?',
    answer:
      'Bạn chỉ cần hoàn tất 4 bước: nhập JD (có thể OCR), cấu hình trọng số và hard filter, tải CV hàng loạt, sau đó hệ thống AI sẽ chấm điểm và hiển thị dashboard phân tích.'
  },
  {
    question: 'Thông tin của chúng tôi có được bảo mật không?',
    answer:
      'Dữ liệu JD và CV được mã hoá khi lưu trữ, chỉ đội ngũ được phân quyền mới truy cập được và toàn bộ file được xóa theo chính sách lưu trữ 30 ngày hoặc sớm hơn theo yêu cầu doanh nghiệp.'
  },
  {
    question: 'Tôi có phải trả phí để sử dụng không?',
    answer:
      'Bản dùng thử hiện tại miễn phí cho tối đa 50 CV/chiến dịch. Các gói doanh nghiệp với SLA và tích hợp ATS sẽ có báo giá riêng — liên hệ chúng tôi để được tư vấn.'
  },
  {
    question: 'Hệ thống có hỗ trợ gợi ý câu hỏi phỏng vấn tự động không?',
    answer:
      'Có, sau khi AI phân tích xong, bạn có thể mở module Interview Copilot để nhận bộ câu hỏi follow-up dựa trên điểm mạnh/yếu của từng ứng viên.'
  },
  {
    question: 'Tôi có thể nhận hỗ trợ triển khai và đào tạo nội bộ chứ?',
    answer:
      'Chúng tôi cung cấp workshop onboarding, tài liệu hướng dẫn và nhóm hỗ trợ riêng trên Zalo/Slack để đảm bảo đội HR quen với quy trình mới chỉ sau 1-2 buổi.'
  },
  {
    question: 'Hệ thống có thể tích hợp với phần mềm ATS hiện tại không?',
    answer:
      'Có, Support HR cung cấp Open API cho phép tích hợp dữ liệu hai chiều với các hệ thống quản trị tuyển dụng (ATS) phổ biến hoặc hệ thống nội bộ của doanh nghiệp.'
  }
];

const ChatBubble: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'faq' | 'deploy'>('faq');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50">
      <div className="relative">
        {open && (
          <div className="mb-3 w-[320px] sm:w-[380px] p-3 rounded-2xl bg-slate-900/95 border border-slate-800 shadow-xl text-slate-100">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-400 flex items-center justify-center text-slate-900 font-bold">HR</div>
                <div>
                  <div className="text-sm font-semibold">Hỗ trợ & Triển khai</div>
                  <div className="text-[11px] text-slate-400">FAQ · Demo · Liên hệ</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setOpen(false)} className="p-1 rounded-md text-slate-400 hover:text-white">
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
            </div>

            <div className="flex gap-2 mb-3">
              <button onClick={() => setTab('faq')} className={`flex-1 text-sm py-1 rounded-lg ${tab === 'faq' ? 'bg-slate-800 text-white' : 'text-slate-300 bg-transparent hover:bg-slate-800/30'}`}>
                FAQ
              </button>
              <button onClick={() => setTab('deploy')} className={`flex-1 text-sm py-1 rounded-lg ${tab === 'deploy' ? 'bg-slate-800 text-white' : 'text-slate-300 bg-transparent hover:bg-slate-800/30'}`}>
                Triển khai
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto pr-2">
              {tab === 'faq' && (
                <div className="space-y-3">
                  {faqs.map((f, idx) => (
                    <div key={f.question} className="border border-slate-800 rounded-lg p-3">
                      <button onClick={() => setOpenIndex((prev) => (prev === idx ? null : idx))} className="w-full text-left flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-white">{f.question}</div>
                        </div>
                        <div className="text-slate-400">
                          <i className={`fa-solid ${openIndex === idx ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                        </div>
                      </button>
                      {openIndex === idx && <div className="mt-2 text-sm text-slate-300">{f.answer}</div>}
                    </div>
                  ))}
                </div>
              )}

              {tab === 'deploy' && (
                <div className="space-y-4">
                  <div className="rounded-lg border border-emerald-500/30 p-4 bg-gradient-to-br from-emerald-900/10 to-slate-900/20">
                    <p className="text-xs font-semibold tracking-[0.35em] text-emerald-300 uppercase">Sẵn sàng 24/7</p>
                    <h3 className="mt-2 text-lg font-bold text-white">Sẵn sàng triển khai tại doanh nghiệp bạn</h3>
                    <p className="mt-2 text-sm text-slate-300">Nhận demo hệ thống, tài liệu triển khai và tư vấn tích hợp quy trình tuyển dụng ngay hôm nay.</p>
                    <div className="mt-3 flex flex-col gap-2">
                      <a href="tel:0899280108" className="w-full inline-flex items-center justify-center gap-2 py-2 rounded-lg bg-white text-slate-900 font-bold">
                        <i className="fa-solid fa-phone"></i>
                        Liên hệ ngay
                      </a>
                      <a href="mailto:support@supporthr.vn" className="w-full inline-flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white">
                        <i className="fa-solid fa-envelope"></i>
                        Gửi Email
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <button
          aria-label="Open chat"
          onClick={() => setOpen((s) => !s)}
          className="w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-r from-cyan-500 to-emerald-400 text-slate-950 shadow-xl ring-2 ring-white/10 hover:scale-105 transition-transform"
        >
          <i className="fa-solid fa-comment-dots"></i>
        </button>
      </div>
    </div>
  );
};

export default ChatBubble;
