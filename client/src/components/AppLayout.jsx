

import { NavLink, Outlet } from "react-router-dom";
import { useState } from "react";

const navigation = [
  { name: "Dashboard", path: "/dashboard", icon: "grid" },
  { name: "Resume Builder", path: "/resume-builder", icon: "file" },
  { name: "Job Tracker", path: "/job-tracker", icon: "briefcase" },
  { name: "Resume Analyzer", path: "/resume-analyzer", icon: "chart" },
  { name: "Career Assistant", path: "/career-assistant", icon: "sparkles" },
];

const icons = {
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="2" />
      <rect x="14" y="3" width="7" height="7" rx="2" />
      <rect x="3" y="14" width="7" height="7" rx="2" />
      <rect x="14" y="14" width="7" height="7" rx="2" />
    </>
  ),
  file: (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M8 13h8M8 17h8" />
    </>
  ),
  briefcase: (
    <>
      <rect x="3" y="7" width="18" height="14" rx="2" />
      <path d="M8 7V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v3M3 12h18M10 12v2h4v-2" />
    </>
  ),
  chart: (
    <>
      <path d="M3 3v18h18M8 15l4-4 4 3 5-7" />
      <path d="M16 7h5v5" />
    </>
  ),
  sparkles: (
    <>
      <path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-2-5.8L4 11l6-2.2L12 3Z" />
      <path d="m19 14 1.2 2.8L23 18l-2.8 1.2L19 22l-1.2-2.8L15 18l2.8-1.2L19 14Z" />
    </>
  ),
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  close: <path d="m18 6-12 12M6 6l12 12" />,
};

function Icon({ name, size = 20 }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
      aria-hidden="true"
    >
      {icons[name]}
    </svg>
  );
}

function BrandLogo({ compact = false }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <div
        className={`relative flex shrink-0 items-center justify-center ${
          compact ? "h-9 w-9" : "h-10 w-10 sm:h-14 sm:w-14"
        }`}
      >
        <div className="absolute bottom-0 left-0 h-8 w-8 rounded-full bg-violet-500/20 blur-xl" />

        <svg
          viewBox="0 0 64 64"
          className="relative z-10 h-full w-full overflow-visible"
          role="img"
          aria-label="CareerPilot launching rocket"
        >
          <defs>
            <linearGradient
              id="cpRocketBody"
              x1="0%"
              y1="100%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#A78BFA" />
              <stop offset="100%" stopColor="#38BDF8" />
            </linearGradient>
            <linearGradient
              id="cpRocketFire"
              x1="0%"
              y1="100%"
              x2="0%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#7C3AED" />
              <stop offset="100%" stopColor="#67E8F9" />
            </linearGradient>
          </defs>

          <path
            d="M8 53 22 39"
            stroke="#A78BFA"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity=".85"
          />
          <path
            d="M8 43 15 36"
            stroke="#38BDF8"
            strokeWidth="2"
            strokeLinecap="round"
            opacity=".7"
          />

          <g transform="rotate(42 32 32)">
            <path
              d="M32 7C40 15 45 25 43 39L32 50 21 39C19 25 24 15 32 7Z"
              fill="#151B32"
              stroke="url(#cpRocketBody)"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <circle
              cx="32"
              cy="25"
              r="5"
              fill="#0B1020"
              stroke="#67E8F9"
              strokeWidth="2.5"
            />
            <path
              d="M21 32 12 41 14 27 23 24"
              fill="#8B5CF6"
              stroke="#A78BFA"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path
              d="M43 32 52 41 50 27 41 24"
              fill="#8B5CF6"
              stroke="#A78BFA"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path
              d="M27 49 32 61 37 49"
              fill="url(#cpRocketFire)"
              stroke="#67E8F9"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </g>
        </svg>
      </div>

      <div className="min-w-0">
        <div
          className={`whitespace-nowrap font-extrabold tracking-tight ${
            compact ? "text-base" : "text-lg sm:text-2xl"
          }`}
        >
          <span className="text-white">Career</span>
          <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-sky-400 bg-clip-text text-transparent">
            Pilot
          </span>
        </div>

        {!compact && (
          <p className="mt-1 hidden whitespace-nowrap text-[9px] font-semibold tracking-[0.17em] text-slate-400 sm:block">
            YOUR CAREER. YOUR NEXT LEVEL.
          </p>
        )}
      </div>
    </div>
  );
}

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);

  function closeSidebar() {
    setSidebarOpen(false);
  }

  function toggleDesktopSidebar() {
    setDesktopSidebarOpen((open) => !open);
  }

  return (
    <div className="min-h-screen min-w-0 overflow-x-clip bg-[#080B16] text-slate-100">
      {/* Mobile and tablet backdrop */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar backdrop"
          onClick={closeSidebar}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(85vw,270px)] flex-col border-r border-white/[0.07] bg-[#0C1020] transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } ${
          desktopSidebarOpen
            ? "lg:translate-x-0"
            : "lg:-translate-x-full"
        }`}
      >
        <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-white/[0.07] px-4 sm:h-[84px] sm:px-5">
          <BrandLogo compact />

          {/* Close button for mobile and tablet */}
          <button
            type="button"
            onClick={closeSidebar}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:border-violet-400/40 hover:bg-violet-500/15 hover:text-white lg:hidden"
            aria-label="Close sidebar"
            title="Close sidebar"
          >
            <Icon name="close" size={20} />
          </button>

          {/* Collapse button for desktop */}
          <button
            type="button"
            onClick={toggleDesktopSidebar}
            className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:border-violet-400/40 hover:bg-violet-500/15 hover:text-white lg:flex"
            aria-label="Collapse sidebar"
            title="Collapse sidebar"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        <div className="shrink-0 px-5 pb-3 pt-7">
          <p className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
            Workspace
          </p>
        </div>

        <nav className="min-h-0 flex-1 space-y-1.5 overflow-y-auto overscroll-contain px-3 sm:px-4">
          {navigation.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={closeSidebar}
              className={({ isActive }) =>
                `group flex min-h-11 items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "border border-violet-400/15 bg-gradient-to-r from-violet-500/20 to-indigo-500/10 text-white shadow-[inset_3px_0_0_#A78BFA]"
                    : "border border-transparent text-slate-400 hover:bg-white/[0.04] hover:text-slate-100"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={
                      isActive
                        ? "text-violet-300"
                        : "text-slate-500 transition-colors group-hover:text-violet-300"
                    }
                  >
                    <Icon name={item.icon} size={19} />
                  </span>

                  <span className="min-w-0 flex-1">{item.name}</span>

                  {isActive && (
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-violet-300 shadow-[0_0_8px_#A78BFA]" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="m-3 shrink-0 rounded-2xl border border-violet-400/10 bg-gradient-to-br from-violet-500/[0.10] to-sky-500/[0.04] p-3 sm:m-4 sm:p-4">
          <div className="mb-2 flex items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-violet-400/10 text-violet-300">
              <Icon name="sparkles" size={17} />
            </span>
            <span className="text-sm font-semibold text-white">
              Career growth
            </span>
          </div>
          <p className="text-xs leading-5 text-slate-400">
            Build your skills. Track your progress. Land your next opportunity.
          </p>
        </div>

        <div className="shrink-0 border-t border-white/[0.07] px-5 py-3 sm:py-4">
          <p className="text-xs text-slate-500">CareerPilot</p>
          <p className="mt-1 text-[10px] text-slate-600">
            Your personal career companion
          </p>
        </div>
      </aside>

      {/* Main area */}
      <div
        className={`min-h-screen min-w-0 transition-[padding] duration-300 ${
          desktopSidebarOpen ? "lg:pl-[270px]" : "lg:pl-0"
        }`}
      >
        <header className="sticky top-0 z-30 border-b border-white/[0.07] bg-[#080B16]/90 backdrop-blur-2xl">
          <div className="flex h-16 min-w-0 items-center justify-between gap-2 px-3 sm:h-[84px] sm:gap-4 sm:px-7 lg:px-10">
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              {/* Mobile and tablet menu button */}
              <button
                type="button"
                onClick={() => setSidebarOpen((open) => !open)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-300 transition hover:border-violet-400/30 hover:bg-violet-400/10 lg:hidden"
                aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
                aria-expanded={sidebarOpen}
              >
                <Icon name={sidebarOpen ? "close" : "menu"} />
              </button>

              {/* Desktop sidebar toggle */}
              <button
                type="button"
                onClick={toggleDesktopSidebar}
                className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-300 transition hover:border-violet-400/30 hover:bg-violet-400/10 lg:flex"
                aria-label={
                  desktopSidebarOpen ? "Collapse sidebar" : "Expand sidebar"
                }
                title={desktopSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
              >
                <Icon name="menu" />
              </button>

              <BrandLogo />
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <div className="hidden items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/[0.06] px-3 py-2 sm:flex">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_7px_#34D399]" />
                <span className="text-[11px] font-medium text-emerald-300">
                  Workspace active
                </span>
              </div>

              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-violet-400/20 bg-gradient-to-br from-violet-500/20 to-sky-500/10 text-sm font-bold text-violet-200 sm:h-10 sm:w-10 sm:rounded-2xl"
                aria-label="CareerPilot profile"
                title="CareerPilot profile"
              >
                CP
              </div>
            </div>
          </div>
        </header>

        {/* <main className="mx-auto min-w-0 w-full max-w-[1600px] p-3 sm:p-5 md:p-7 lg:p-10"> */}
        <main className="mx-auto min-w-0 w-full max-w-[1600px] overflow-x-clip p-3 sm:p-5 md:p-7 lg:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
