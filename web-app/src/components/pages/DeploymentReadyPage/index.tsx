import React from 'react';

const DeploymentReadyPage: React.FC = () => {
  const socialLinks = [
    {
      name: 'Facebook',
      icon: 'fa-brands fa-facebook',
      url: 'https://www.facebook.com/profile.php?id=61577736765345&locale=vi_VN',
      color: 'hover:border-blue-400 hover:text-blue-200',
    },
    {
      name: 'LinkedIn',
      icon: 'fa-brands fa-linkedin',
      url: 'https://www.linkedin.com/in/truong-minh-hoang-phuc-5ba70532b/',
      color: 'hover:border-sky-400 hover:text-sky-100',
    },
    {
      name: 'GitHub',
      icon: 'fa-brands fa-github',
      url: 'https://github.com/orgs/TechFutureAIFPT/dashboard',
      color: 'hover:border-slate-400 hover:text-white',
    },
    {
      name: 'Discord',
      icon: 'fa-brands fa-discord',
      url: 'https://discord.gg/supporthr',
      color: 'hover:border-indigo-400 hover:text-indigo-100',
    },
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-emerald-400/90 via-cyan-500/90 to-slate-900 text-slate-50 flex flex-col">
      <div className="mx-auto w-full max-w-5xl px-5 sm:px-8 py-16 md:py-24 flex-1 flex flex-col justify-center">
        <div className="space-y-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-1 text-xs uppercase tracking-[0.35em] text-slate-100">
            <span>Liên hệ</span>
          </div>
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 drop-shadow-[0_12px_30px_rgba(15,118,110,0.25)]">
              Sẵn sàng triển khai tại doanh nghiệp của bạn
            </h1>
            <p className="text-base md:text-lg text-slate-900/80">
              Liên hệ để nhận tài liệu triển khai, demo hệ thống và hỗ trợ đào tạo đội ngũ tuyển dụng.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="tel:0899280108"
              className="inline-flex items-center gap-2 rounded-full bg-white text-slate-900 font-semibold px-6 py-3 shadow-xl shadow-emerald-500/30 transition hover:-translate-y-0.5"
            >
              <i className="fa-solid fa-phone text-emerald-600"></i>
              Liên hệ ngay
            </a>
            <a
              href="mailto:support@supporthr.vn"
              className="inline-flex items-center gap-2 rounded-full border border-white/60 text-white font-semibold px-6 py-3 hover:bg-white/10 transition"
            >
              <i className="fa-solid fa-envelope"></i>
              Gửi email
            </a>
          </div>
        </div>

        <div className="mt-14">
          <p className="text-center text-sm uppercase tracking-[0.3em] text-slate-900/80 mb-6">Kết nối với SupportHR</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`group rounded-2xl border border-white/30 bg-white/10 backdrop-blur-sm px-4 py-5 flex flex-col items-center gap-3 text-sm font-medium text-slate-900 transition ${social.color}`}
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/80 text-slate-900 shadow-inner group-hover:scale-105 transition">
                  <i className={`${social.icon} text-xl`}></i>
                </span>
                {social.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeploymentReadyPage;
