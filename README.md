#  Support HR - AI Powered CV Screening System

<div align="center">

[![React](https://img.shields.io/badge/React-19.1.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-blue.svg)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-12.3.0-orange.svg)](https://firebase.google.com/)
[![Vite](https://img.shields.io/badge/Vite-6.2.0-646CFF.svg)](https://vitejs.dev/)
[![Gemini AI](https://img.shields.io/badge/Gemini-1.5%20Flash-FF6F00.svg)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-Private-red.svg)](LICENSE)

**Hệ thống AI hỗ trợ HR sàng lọc CV thông minh với khả năng phân tích đa định dạng, tự động trích xuất tiêu chí, và gợi ý câu hỏi phỏng vấn**

<br>

| [ Features](#-tính-năng-nổi-bật) | [ Installation](#-cài-đặt) | [ Deploy](#-deployment) | [ Docs](#-tài-liệu) | [ SEO](#-seo-optimization) |
|:---:|:---:|:---:|:---:|:---:|

</div>

---

##  Tài liệu chi tiết

Dự án được chia thành 3 phần tài liệu chính để dễ dàng theo dõi:

<div align="center">

|  **TỔNG QUAN** |  **KIẾN TRÚC** |  **THUẬT TOÁN** |
|:---:|:---:|:---:|
| [**Xem README.md**](./README.md) | [**Xem ARCHITECTURE.md**](./docs/ARCHITECTURE.md) | [**Xem ALGORITHMS.md**](./docs/ALGORITHMS.md) |
| *Giới thiệu, Cài đặt, Deploy* | *Structure, System Flow* | *AI Core, Scoring, OCR* |

</div>

---

##  Tính năng nổi bật

###  **AI-Powered CV Analysis**
-   **Phân tích thông minh**: Sử dụng Google Gemini AI để đánh giá CV theo 8+ tiêu chí
-   **Đa định dạng**: Hỗ trợ PDF, Word, Excel và hình ảnh (OCR)
-   **Chấm điểm deterministic**: Kết quả nhất quán 100% với cùng input
-   **Trọng số tùy chỉnh**: Điều chỉnh tiêu chí đánh giá theo từng vị trí

###  **Advanced Comparison Tools**
-   **Side-by-side Compare**: So sánh chi tiết giữa ứng viên
-   **Strengths Analysis**: Phân tích điểm mạnh/yếu của từng ứng viên
-   **Ranking Dashboard**: Bảng xếp hạng trực quan với filters
-   **Export Comparison**: Xuất báo cáo so sánh dạng Excel/PDF

###  **Cross-Device Data Sync**
-   **Firebase Integration**: Đồng bộ dữ liệu qua Gmail account
-   **Multi-device Access**: Truy cập mọi lúc, mọi nơi
-   **Auto-sync**: Tự động đồng bộ khi có dữ liệu mới
-   **Local + Cloud Caching**: Hiệu suất tối ưu

###  **Salary Analysis & Market Comparison**
-   **Real-time Market Data**: So sánh lương với thị trường Việt Nam
-   **RapidAPI Integration**: Dữ liệu từ job-salary-data API
-   **Smart Extraction**: Tự động trích xuất thông tin lương từ CV/JD
-   **Negotiation Tips**: Gợi ý thương lượng dựa trên vị thế
-   **Fallback Estimation**: Ước tính thông minh khi API không khả dụng

###  **Advanced Analytics**
-   **Dashboard trực quan**: Thống kê chi tiết với biểu đồ
-   **Lịch sử đầy đủ**: Theo dõi tất cả lần phân tích
-   **Export dữ liệu**: Xuất kết quả dạng Excel/PDF
-   **Performance Metrics**: Cache hit rate, sync status

###  **Smart Auto-Fill & Auto-Tick** (NEW!)
-   ** Tự Động Trích Xuất Tiêu Chí từ JD**:
    -   AI tự động đọc Job Description và điền sẵn các Hard Filters
    -   **Smart Language Conversion**: Tự động chuyển đổi IELTS/TOEIC  CEFR
    -   **Vietnamese Recognition**: Hiểu tiếng Việt (VD: "Tốt nghiệp Đại học"  Bachelor)
    -   **Location Normalization**: HN/HCM/SG  Hà Nội/Thành phố Hồ Chí Minh
    -   **Education Mapping**: Kỹ sư/Cao đẳng/Thạc sĩ  Bachelor/Associate/Master
-   ** Auto-Tick Mandatory Checkboxes**:
    -   Tự động tích "Bắt buộc" khi phát hiện tiêu chí trong JD
    -   Áp dụng cho: Địa điểm, Ngôn ngữ, Học vấn, Seniority, Chứng chỉ, Định dạng làm việc, Loại hợp đồng, Ngành nghề

###  **SEO Optimization** (NEW!)
-   **Comprehensive Meta Tags**: Title, description, keywords tối ưu cho "support hr"
-   **Open Graph & Twitter Cards**: Share preview với branding đầy đủ
-   **Search Engine Ready**: robots.txt, sitemap.xml, canonical URLs
-   **Vietnamese Keywords**: "tuyển dụng AI", "sàng lọc cv", "phân tích cv tự động"
-   **Real-time Performance**: Web Vitals monitoring với Vercel Speed Insights
-   **Structured Data**: JSON-LD cho Organization và SoftwareApplication

###  **PWA Support** (NEW!)
-   **Installable**: Cài đặt như ứng dụng native trên mobile/desktop
-   **Offline Mode**: Hoạt động khi mất mạng với trang offline tùy chỉnh
-   **Caching Strategy**: Cache-first cho assets, Stale-while-revalidate cho nội dung
-   **App-like Experience**: Standalone mode, splash screen, icons đầy đủ
-   **Performance**: Service Worker cache giúp tải trang cực nhanh

---

##  Công nghệ sử dụng

### **Frontend**
-   **React 19.1.1** - UI Framework hiện đại
-   **TypeScript 5.8.2** - Type safety và developer experience
-   **Tailwind CSS 4.0** - Utility-first CSS framework
-   **Vite 6.2.0** - Lightning fast build tool

### **Backend & AI**
-   **Google Gemini AI 1.5 Flash** - Phân tích CV và tạo câu hỏi (4 API keys for load balancing)
-   **Firebase 12.3.0** - Authentication (Gmail) & Firestore database
-   **Tesseract.js 5.1.1** - OCR cho hình ảnh
-   **PDF.js** - Xử lý file PDF
-   **Mammoth.js** - Word document parsing

### **Additional Services**
-   **React Router 7.1.1** - Navigation
-   **Recharts 2.15.0** - Data visualization
-   **Vercel Analytics** - Performance monitoring
-   **Vercel Speed Insights** - Real-time speed tracking
-   **Web Vitals** - Core Web Vitals tracking
-   **RapidAPI job-salary-data** - Salary market data integration
-   **Wikipedia API** - Knowledge enrichment
-   **Google Cloud Vision API** - Advanced OCR (Optional)

---

##  Cài đặt

### **Yêu cầu hệ thống**
-   **Node.js**: >= 20.x < 21.x
-   **npm**: >= 10.9.0
-   **Modern Browser**: Chrome, Firefox, Safari, Edge

### **Clone & Setup**
`ash
# Clone repository
git clone https://github.com/your-username/hr-support-system.git
cd hr-support-system

# Cài đặt dependencies
npm install

cp .env.example .env.local
# Nếu đang ở gốc thư mục, hãy cd vào web-app trước:
cd web-app
cp .env.example .env.local
`

### **Environment Configuration**
Tạo file .env.local với các biến môi trường:

`env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef

# Google Gemini AI (Multi-key support for load balancing)
# System sử dụng 4 keys và tự động rotate để tránh rate limit
VITE_GEMINI_API_KEY_1=your_gemini_key_1
VITE_GEMINI_API_KEY_2=your_gemini_key_2
VITE_GEMINI_API_KEY_3=your_gemini_key_3
VITE_GEMINI_API_KEY_4=your_gemini_key_4
# (Optional) CLI embedding scripts ưu tiên biến này nếu được set
GEMINI_API_KEY=your_backend_gemini_key

# RapidAPI (Salary Analysis - Optional)
VITE_RAPIDAPI_KEY=your_rapidapi_key

# App Configuration
VITE_APP_NAME="Support HR"
VITE_APP_VERSION="1.0.0"
`

### **Khởi chạy**
`ash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
`

Ứng dụng sẽ chạy tại: http://localhost:3000

### **Tăng cường dữ liệu AI (Data Embedding)**
Công cụ CLI scripts/embedData.ts giúp tạo vector embedding cho toàn bộ thư mục data/ để phục vụ các tác vụ truy vấn ngữ nghĩa hoặc huấn luyện nội bộ.

`ash
# Tạo embedding cho toàn bộ data (yêu cầu GEMINI_API_KEY hoặc VITE_GEMINI_API_KEY_x)
npm run embed:data

# Chạy theo subset (ví dụ chỉ lấy 10 file đầu tiên hoặc lọc theo tên thư mục)
npm run embed:data -- --limit 10 --filter marketing

# Dry-run/simulation (không gọi API, hữu ích khi test CI)
npx tsx scripts/embedData.ts --simulate --limit 2
`

---

##  Deployment

### **Vercel Deployment (Recommended)**

1.  **Push to GitHub:**
    `ash
    git init
    git add .
    git commit -m "Initial commit"
    git remote add origin https://github.com/your-username/hr-support-system.git
    git push -u origin main
    `

2.  **Deploy to Vercel:**
    -   Truy cập [vercel.com](https://vercel.com/)
    -   Import GitHub repository
    -   Vercel tự động detect Vite project

3.  **Set Environment Variables:**
    `
    Settings  Environment Variables  Add:

    VITE_FIREBASE_API_KEY=...
    VITE_FIREBASE_AUTH_DOMAIN=...
    VITE_FIREBASE_PROJECT_ID=...
    VITE_FIREBASE_STORAGE_BUCKET=...
    VITE_FIREBASE_MESSAGING_SENDER_ID=...
    VITE_FIREBASE_APP_ID=...

    VITE_GEMINI_API_KEY_1=...
    VITE_GEMINI_API_KEY_2=...
    VITE_GEMINI_API_KEY_3=...
    VITE_GEMINI_API_KEY_4=...

    VITE_RAPIDAPI_KEY=...  (optional)
    `

---

##  Contributing

Chúng tôi hoan nghênh mọi đóng góp!

1.  Fork repository
2.  Create feature branch: git checkout -b feature/amazing-feature
3.  Commit changes: git commit -m 'Add amazing feature'
4.  Push to branch: git push origin feature/amazing-feature
5.  Open Pull Request

---

##  License

**Private License** - Phần mềm độc quyền

 2025 HR Support System. All rights reserved.

---

<div align="center">

[**Tiếp theo: Kiến Trúc Hệ Thống **](./docs/ARCHITECTURE.md)

<br>

** Nếu project hữu ích, đừng quên star repo nhé!**

Made with  by [TechFuture-Supporhr]

</div>
