import React from 'react';
import type { AnalysisRunData, Candidate } from '../../types';

// Mock data for testing
const mockAnalysisData: AnalysisRunData = {
  timestamp: Date.now(),
  job: {
    position: 'Senior Frontend Developer',
    locationRequirement: 'Hà Nội hoặc Remote',
  },
  candidates: [
    {
      id: 'cand_1',
      candidateName: 'Nguyễn Văn A',
      fileName: 'cv_nguyen_van_a.pdf',
      phone: '0912345678',
      email: 'nguyenvana@example.com',
      jobTitle: 'Frontend Developer',
      industry: 'Công nghệ thông tin',
      department: 'Engineering',
      experienceLevel: 'Senior',
      detectedLocation: 'Hà Nội',
      status: 'SUCCESS' as const,
      analysis: {
        'Tổng điểm': 85,
        'Hạng': 'A' as const,
        'Chi tiết': [
          {
            'Tiêu chí': 'Phù hợp JD',
            'Điểm': '14/15',
            'Công thức': 'subscore 14/15% = 14 points',
            'Dẫn chứng': 'Có 5+ năm kinh nghiệm React, TypeScript',
            'Giải thích': 'Rất phù hợp với yêu cầu kỹ thuật'
          },
          {
            'Tiêu chí': 'Kinh nghiệm',
            'Điểm': '18/20',
            'Công thức': 'subscore 18/20% = 18 points',
            'Dẫn chứng': '6 năm kinh nghiệm frontend, từng làm ở startup và enterprise',
            'Giải thích': 'Kinh nghiệm đa dạng và phong phú'
          }
        ],
        'Điểm mạnh CV': [
          'Thành thạo React, TypeScript, Next.js',
          'Kinh nghiệm làm việc với team lớn',
          'Có portfolio ấn tượng trên GitHub',
          'Tham gia open source projects'
        ],
        'Điểm yếu CV': [
          'Thiếu kinh nghiệm testing (Jest, Cypress)',
          'Chưa có experience với backend technologies',
          'Thiếu chứng chỉ hoặc course chính thức'
        ]
      }
    },
    {
      id: 'cand_2',
      candidateName: 'Trần Thị B',
      fileName: 'cv_tran_thi_b.pdf',
      phone: '0987654321',
      email: 'tranthib@example.com',
      jobTitle: 'Full Stack Developer',
      industry: 'Công nghệ thông tin',
      department: 'Engineering',
      experienceLevel: 'Mid-level',
      detectedLocation: 'TP.HCM',
      status: 'SUCCESS' as const,
      analysis: {
        'Tổng điểm': 78,
        'Hạng': 'A' as const,
        'Chi tiết': [
          {
            'Tiêu chí': 'Phù hợp JD',
            'Điểm': '12/15',
            'Công thức': 'subscore 12/15% = 12 points',
            'Dẫn chứng': 'Có kinh nghiệm Vue.js, đang học React',
            'Giải thích': 'Cần thời gian transition từ Vue sang React'
          }
        ],
        'Điểm mạnh CV': [
          'Full-stack experience (Vue + Node.js)',
          'Kinh nghiệm với databases (MySQL, MongoDB)',
          'Có kinh nghiệm deploy và DevOps cơ bản',
          'Communication skills tốt'
        ],
        'Điểm yếu CV': [
          'Chưa thành thạo React ecosystem',
          'Thiếu kinh nghiệm với TypeScript',
          'Portfolio chưa đa dạng'
        ]
      }
    }
  ]
};

const InterviewQuestionDemo: React.FC = () => {
  const [selectedDemo, setSelectedDemo] = React.useState<'general' | 'specific' | 'comparative'>('general');

  const demoQuestions = {
    general: [
      {
        category: 'Câu hỏi kỹ thuật cốt lõi',
        icon: 'fa-solid fa-code',
        color: 'text-blue-400',
        questions: [
          'Bạn approach một dự án React mới với yêu cầu phức tạp như thế nào?',
          'Mô tả một performance issue trong React app mà bạn đã optimize.',
          'Kinh nghiệm của bạn với state management (Redux, Context, Zustand)?',
          'Cách bạn handle async operations và error boundaries?',
          'Component architecture và design patterns bạn thường sử dụng?'
        ]
      },
      {
        category: 'Điểm yếu phổ biến cần kiểm tra',
        icon: 'fa-solid fa-exclamation-triangle',
        color: 'text-orange-400',
        questions: [
          'Nhiều ứng viên yếu về testing. Bạn test React components như thế nào?',
          'Backend experience hạn chế. Bạn làm việc với APIs ra sao?',
          'Thiếu chứng chỉ. Bạn update kiến thức qua kênh nào?',
          'Deployment experience. Bạn đã deploy app lên production chưa?'
        ]
      },
      {
        category: 'Tình huống thực tế',
        icon: 'fa-solid fa-users',
        color: 'text-green-400',
        questions: [
          'Client yêu cầu thay đổi major feature 1 tuần trước deadline. Bạn xử lý sao?',
          'Conflict trong team về technical approach. Bạn giải quyết như thế nào?',
          'Legacy codebase khó maintain. Strategy của bạn để refactor?',
          'Onboard junior developer mới. Bạn mentor họ ra sao?'
        ]
      }
    ],
    specific: [
      {
        category: 'Xác nhận điểm mạnh - Nguyễn Văn A',
        icon: 'fa-solid fa-star',
        color: 'text-yellow-400',
        questions: [
          'Bạn đã build React app phức tạp nào với TypeScript? Challenges gì?',
          'GitHub portfolio của bạn: Dự án nào bạn tự hào nhất và tại sao?',
          'Open source contributions: Motivations và benefits bạn nhận được?',
          'Experience với Next.js: SSR/SSG nào fit cho use cases nào?',
          'Team collaboration: Bạn handle code review và knowledge sharing sao?'
        ]
      },
      {
        category: 'Thách thức điểm yếu - Testing & Backend',
        icon: 'fa-solid fa-bug',
        color: 'text-red-400',
        questions: [
          'Bạn approach testing cho React components ra sao? Unit vs Integration?',
          'Experience với Jest, React Testing Library? Ví dụ test case phức tạp?',
          'E2E testing: Bạn có dùng Cypress hay Playwright không?',
          'Backend APIs: Bạn làm việc với REST/GraphQL như thế nào?',
          'Learning plan: Bạn có kế hoạch improve backend skills không?'
        ]
      }
    ],
    comparative: [
      {
        category: 'So sánh technical depth',
        icon: 'fa-solid fa-balance-scale',
        color: 'text-purple-400',
        questions: [
          'Ứng viên A strong về React, B strong về full-stack. Vị trí này cần gì hơn?',
          'A có GitHub portfolio, B có real-world products. Đâu valuable hơn?',
          'A Senior experience, B Mid-level nhưng versatile. Trade-off gì?',
          'Testing: A yếu nhưng có thể học, B có foundation. Ưu tiên sao?'
        ]
      },
      {
        category: 'Đánh giá cultural fit',
        icon: 'fa-solid fa-heart',
        color: 'text-pink-400',
        questions: [
          'A từ startup, B từ enterprise. Culture nào fit team hiện tại?',
          'A open source contributor, B product-focused. Mindset nào phù hợp?',
          'Remote work: A ở Hà Nội, B ở TPHCM. Communication style khác gì?',
          'Growth potential: A deep specialist, B broad generalist. Team cần gì?'
        ]
      }
    ]
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-slate-900 text-white min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-center mb-4 bg-gradient-to-r from-purple-400 to-blue-400 text-transparent bg-clip-text">
          🎯 Demo: Gợi ý Câu hỏi Phỏng vấn AI
        </h1>
        <p className="text-slate-400 text-center max-w-2xl mx-auto">
          Xem trước các câu hỏi thông minh được tạo dựa trên JD và dữ liệu lọc CV thực tế
        </p>
      </div>

      {/* Mock Job Info */}
      <div className="bg-slate-800/50 rounded-xl p-6 mb-8 border border-slate-700">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <i className="fa-solid fa-briefcase text-blue-400"></i>
          Thông tin tuyển dụng (Demo)
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <div className="text-slate-400 text-sm">Vị trí</div>
            <div className="font-semibold">{mockAnalysisData.job.position}</div>
          </div>
          <div>
            <div className="text-slate-400 text-sm">Địa điểm</div>
            <div className="font-semibold">{mockAnalysisData.job.locationRequirement}</div>
          </div>
          <div>
            <div className="text-slate-400 text-sm">Ứng viên hạng A</div>
            <div className="font-semibold text-green-400">2 ứng viên</div>
          </div>
        </div>
      </div>

      {/* Type Selection */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Chọn loại câu hỏi demo:</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setSelectedDemo('general')}
            className={`p-4 rounded-xl border transition-all ${
              selectedDemo === 'general'
                ? 'border-purple-500 bg-purple-900/20 text-purple-300'
                : 'border-slate-600 bg-slate-700/30 text-slate-300 hover:border-slate-500'
            }`}
          >
            <i className="fa-solid fa-users text-xl mb-2 block"></i>
            <div className="font-semibold">Câu hỏi chung</div>
            <div className="text-sm opacity-80">Dựa trên JD và xu hướng</div>
          </button>

          <button
            onClick={() => setSelectedDemo('specific')}
            className={`p-4 rounded-xl border transition-all ${
              selectedDemo === 'specific'
                ? 'border-green-500 bg-green-900/20 text-green-300'
                : 'border-slate-600 bg-slate-700/30 text-slate-300 hover:border-slate-500'
            }`}
          >
            <i className="fa-solid fa-user text-xl mb-2 block"></i>
            <div className="font-semibold">Câu hỏi cụ thể</div>
            <div className="text-sm opacity-80">Cho Nguyễn Văn A</div>
          </button>

          <button
            onClick={() => setSelectedDemo('comparative')}
            className={`p-4 rounded-xl border transition-all ${
              selectedDemo === 'comparative'
                ? 'border-orange-500 bg-orange-900/20 text-orange-300'
                : 'border-slate-600 bg-slate-700/30 text-slate-300 hover:border-slate-500'
            }`}
          >
            <i className="fa-solid fa-balance-scale text-xl mb-2 block"></i>
            <div className="font-semibold">So sánh ứng viên</div>
            <div className="text-sm opacity-80">A vs B comparison</div>
          </button>
        </div>
      </div>

      {/* Demo Questions */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <i className="fa-solid fa-magic text-yellow-400"></i>
          Câu hỏi được tạo bởi AI
        </h2>
        
        {demoQuestions[selectedDemo].map((set, index) => (
          <div key={index} className="bg-slate-800/60 rounded-xl border border-slate-700">
            <div className="p-4 border-b border-slate-700">
              <h3 className={`text-lg font-semibold ${set.color} flex items-center gap-2`}>
                <i className={set.icon}></i>
                {set.category}
              </h3>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {set.questions.map((question, qIndex) => (
                  <div key={qIndex} className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors">
                    <div className={`w-6 h-6 rounded-full ${set.color.replace('text-', 'bg-').replace('400', '500')} flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5`}>
                      {qIndex + 1}
                    </div>
                    <p className="text-slate-200 leading-relaxed">{question}</p>
                    <button
                      onClick={() => navigator.clipboard.writeText(question)}
                      className="text-slate-400 hover:text-white transition-colors p-1 flex-shrink-0"
                      title="Copy câu hỏi"
                    >
                      <i className="fa-solid fa-copy"></i>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Usage Info */}
      <div className="mt-12 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl p-6 border border-blue-700/30">
        <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
          <i className="fa-solid fa-info-circle text-blue-400"></i>
          Cách sử dụng trong ứng dụng thực tế
        </h3>
        <div className="grid md:grid-cols-2 gap-6 text-sm">
          <div>
            <h4 className="font-semibold text-blue-300 mb-2">Từ Dashboard:</h4>
            <ul className="space-y-1 text-slate-300">
              <li>• Click nút "Gợi ý câu hỏi PV" (màu tím)</li>
              <li>• Chọn loại câu hỏi phù hợp</li>
              <li>• AI tạo câu hỏi dựa trên dữ liệu thực</li>
              <li>• Copy và sử dụng trong phỏng vấn</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-purple-300 mb-2">Từ Chatbot:</h4>
            <ul className="space-y-1 text-slate-300">
              <li>• Sử dụng quick buttons cho câu hỏi nhanh</li>
              <li>• Chat tự do: "Gợi ý câu hỏi cho Developer"</li>
              <li>• AI phân tích context và đưa ra gợi ý</li>
              <li>• Tương tác linh hoạt theo nhu cầu</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewQuestionDemo;