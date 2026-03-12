import React, { useState } from "react";

interface AppLayoutProps {
  headerIcon: React.ReactNode;
  headerTitle: string;
  headerSubtitle: string;
  headerRight?: React.ReactNode;
  leftPanel?: React.ReactNode;
  rightPanel?: React.ReactNode;
  children: React.ReactNode;
  bottomBar?: React.ReactNode;
  sidebarCollapsed?: boolean;
  reversePanels?: boolean;
  mainNoScroll?: boolean;
  /** Truyền vào để AppLayout render mobile top bar với hamburger */
  onOpenSidebar?: () => void;
  /** Brand info cho mobile top bar */
  brandTitle?: string;
}

const AppLayout: React.FC<AppLayoutProps> = ({
  headerIcon,
  headerTitle,
  headerSubtitle,
  headerRight,
  leftPanel,
  rightPanel,
  children,
  bottomBar,
  sidebarCollapsed = false,
  reversePanels = false,
  mainNoScroll = false,
  onOpenSidebar,
  brandTitle = "Support HR",
}) => {
  const sidebarWidth = sidebarCollapsed ? "md:left-[72px]" : "md:left-64";

  // ── Mobile top bar (hamburger + brand) ─────────────────────────────────
  const MobileTopBar = (
    <div className="md:hidden fixed top-0 left-0 right-0 z-30 h-14 bg-slate-950/95 backdrop-blur-sm border-b border-white/5 flex items-center px-4 gap-3">
      <button
        onClick={onOpenSidebar}
        className="w-8 h-8 rounded-lg bg-slate-800/80 border border-white/8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex-shrink-0"
        aria-label="Mở sidebar"
      >
        <i className="fa-solid fa-bars text-sm" />
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold text-white leading-tight truncate">
          {brandTitle}
        </p>
        <p className="text-[9px] text-slate-500 uppercase tracking-widest">
          AI Recruitment
        </p>
      </div>
    </div>
  );

  // ── Step header (desktop: offset by sidebar, mobile: below top bar) ────
  const StepHeader = (
    <header
      className={`fixed left-0 right-0 z-20 ${sidebarWidth} transition-[left] duration-300 top-14`}
    >
      <div className="h-14 bg-slate-950/95 backdrop-blur-sm border-b border-white/5 flex items-center gap-3 px-5">
        <div className="flex-shrink-0">{headerIcon}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white leading-tight truncate">
            {headerTitle}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5 truncate">
            {headerSubtitle}
          </p>
        </div>
        {headerRight && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {headerRight}
          </div>
        )}
      </div>
    </header>
  );

  const LeftAside = leftPanel ? (
    <aside className="w-64 flex-shrink-0 border-r border-white/5 bg-slate-950/60 overflow-y-auto custom-scrollbar hidden md:flex flex-col">
      {leftPanel}
    </aside>
  ) : null;

  const RightAside = rightPanel ? (
    <aside className="hidden lg:flex w-56 flex-shrink-0 flex-col border-l border-white/5 bg-slate-950/60">
      {rightPanel}
    </aside>
  ) : null;

  return (
    <section className="w-full h-screen flex flex-col bg-slate-950 overflow-hidden">
      {/* Mobile top bar — only visible on mobile */}
      {MobileTopBar}

      {/* Step header — sits below mobile top bar on mobile, at top on desktop */}
      {StepHeader}

      {/* Body — pt accounts for: mobile(topbar 56px + stepheader 56px) / desktop(stepheader 56px) */}
      <div className="flex flex-1 min-h-0 pt-28 md:pt-14">
        {reversePanels ? RightAside : LeftAside}

        <main
          className={`flex-1 min-w-0 min-h-0 bg-slate-950 flex flex-col ${mainNoScroll ? "overflow-hidden" : "overflow-y-auto custom-scrollbar"}`}
        >
          {children}
        </main>

        {reversePanels ? LeftAside : RightAside}
      </div>

      {/* Mobile bottom bar */}
      {bottomBar && (
        <div className="lg:hidden flex-shrink-0 border-t border-white/5 bg-slate-900/90 backdrop-blur-sm px-4 py-3">
          {bottomBar}
        </div>
      )}
    </section>
  );
};

export default AppLayout;
