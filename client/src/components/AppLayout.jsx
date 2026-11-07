
import { NavLink, Outlet, useLocation } from "react-router-dom";
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
        <div className="absolute inset-0 rounded-full bg-violet-500/20 blur-xl" />

        <svg
          viewBox="0 0 64 64"
          className="relative z-10 h-full w-full overflow-visible"
          role="img"
          aria-label="CareerPilot launching rocket"
        >
          <defs>
            <linearGradient id="cpRocketBody" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#A78BFA" />
              <stop offset="100%" stopColor="#38BDF8" />
            </linearGradient>
            <linearGradient id="cpRocketFire" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#7C3AED" />
              <stop offset="100%" stopColor="#67E8F9" />
            </linearGradient>
          </defs>

          <path d="M8 53 22 39" stroke="#A78BFA" strokeWidth="2.5" strokeLinecap="round" opacity=".85" />
          <path d="M8 43 15 36" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" opacity=".7" />

          <g transform="rotate(42 32 32)">
            <path
              d="M32 7C40 15 45 25 43 39L32 50 21 39C19 25 24 15 32 7Z"
              fill="#151B32"
              stroke="url(#cpRocketBody)"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <circle cx="32" cy="25" r="5" fill="#0B1020" stroke="#67E8F9" strokeWidth="2.5" />
            <path d="M21 32 12 41 14 27 23 24" fill="#8B5CF6" stroke="#A78BFA" strokeWidth="2" strokeLinejoin="round" />
            <path d="M43 32 52 41 50 27 41 24" fill="#8B5CF6" stroke="#A78BFA" strokeWidth="2" strokeLinejoin="round" />
            <path d="M27 49 32 61 37 49" fill="url(#cpRocketFire)" stroke="#67E8F9" strokeWidth="1.5" strokeLinejoin="round" />
          </g>
        </svg>
      </div>

      <div className="min-w-0">
        <div className={`whitespace-nowrap font-extrabold tracking-tight ${compact ? "text-base" : "text-lg sm:text-2xl"}`}>
          <span className="text-white">Career</span>
          <span className="bg-gradient-to-r from-violet-300 via-purple-400 to-cyan-300 bg-clip-text text-transparent">
            Pilot
          </span>
        </div>

        {!compact && (
          <p className="mt-1 hidden whitespace-nowrap text-[9px] font-semibold tracking-[0.17em] text-slate-500 sm:block">
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
  const location = useLocation();

  const currentPage =
    navigation.find((item) => item.path === location.pathname)?.name ||
    "Workspace";

  function closeSidebar() {
    setSidebarOpen(false);
  }

  function toggleDesktopSidebar() {
    setDesktopSidebarOpen((open) => !open);
  }

  return (
    <div className="min-h-screen min-w-0 overflow-x-clip bg-[#090a12] text-[#f1f0ff]">

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar backdrop"
          onClick={closeSidebar}
          className="fixed inset-0 z-40 bg-black/75 backdrop-blur-md lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(85vw,280px)] flex-col border-r border-violet-300/[0.08] bg-[#10111c] shadow-[12px_0_40px_rgba(0,0,0,0.45)] transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } ${
          desktopSidebarOpen ? "lg:translate-x-0" : "lg:-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex h-[76px] shrink-0 items-center justify-between border-b border-white/[0.06] px-5 sm:h-[84px]">
          <BrandLogo compact />

          <button
            type="button"
            onClick={closeSidebar}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.07] bg-[#181927] text-slate-400 transition hover:border-violet-400/40 hover:bg-violet-500/10 hover:text-white lg:hidden"
            aria-label="Close sidebar"
            title="Close sidebar"
          >
            <Icon name="close" size={19} />
          </button>

          <button
            type="button"
            onClick={toggleDesktopSidebar}
            className="hidden h-9 w-9 items-center justify-center rounded-xl border border-white/[0.07] bg-[#181927] text-slate-400 transition hover:border-violet-400/40 hover:bg-violet-500/10 hover:text-white lg:flex"
            aria-label="Collapse sidebar"
            title="Collapse sidebar"
          >
            <Icon name="close" size={19} />
          </button>
        </div>

        {/* Navigation heading */}
        <div className="shrink-0 px-5 pb-3 pt-8">
          <p className="px-3 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-600">
            Main Workspace
          </p>
        </div>

        {/* Navigation */}
        <nav className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain px-4">
          {navigation.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={closeSidebar}
              className={({ isActive }) =>
                `group relative flex min-h-12 items-center gap-3 overflow-hidden rounded-2xl border px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "border-violet-400/20 bg-gradient-to-r from-violet-500/20 to-indigo-500/[0.08] text-white shadow-[inset_3px_0_0_#a78bfa,0_5px_20px_rgba(124,58,237,0.10)]"
                    : "border-transparent text-slate-500 hover:border-white/[0.06] hover:bg-[#191a29] hover:text-slate-100"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-violet-400/15 text-violet-300 shadow-[0_0_18px_rgba(139,92,246,0.16)]"
                        : "bg-[#191a28] text-slate-500 group-hover:text-violet-300"
                    }`}
                  >
                    <Icon name={item.icon} size={19} />
                  </span>

                  <span className="min-w-0 flex-1">{item.name}</span>

                  {isActive && (
                    <span className="h-2 w-2 shrink-0 rounded-full bg-violet-300 shadow-[0_0_12px_#a78bfa]" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Career growth card */}
        <div className="mx-4 mb-4 mt-5 shrink-0 rounded-2xl border border-violet-400/[0.12] bg-gradient-to-br from-[#211936] via-[#191729] to-[#111521] p-4 shadow-[8px_8px_22px_rgba(0,0,0,0.35)]">
          <div className="mb-3 flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet-300/10 bg-violet-400/10 text-violet-300">
              <Icon name="sparkles" size={18} />
            </span>
            <span className="text-sm font-semibold text-white">
              Career growth
            </span>
          </div>

          <p className="text-xs leading-5 text-slate-400">
            Build your skills. Track your progress. Land your next opportunity.
          </p>

          <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/[0.06]">
            <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-violet-500 to-cyan-400" />
          </div>
        </div>

        {/* Sidebar footer */}
        <div className="shrink-0 border-t border-white/[0.06] px-5 py-4">
          <p className="text-xs font-semibold text-slate-400">CareerPilot</p>
          <p className="mt-1 text-[10px] text-slate-600">
            Your personal career companion
          </p>
        </div>
      </aside>

      {/* Main content */}
      <div
        className={`min-h-screen min-w-0 transition-[padding] duration-300 ${
          desktopSidebarOpen ? "lg:pl-[280px]" : "lg:pl-0"
        }`}
      >
        {/* Topbar */}
        <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#090a12]/85 backdrop-blur-2xl">
          <div className="flex h-16 min-w-0 items-center justify-between gap-2 px-3 sm:h-[84px] sm:gap-4 sm:px-7 lg:px-10">

            <div className="flex min-w-0 items-center gap-3">
              {/* Mobile menu */}
              <button
                type="button"
                onClick={() => setSidebarOpen((open) => !open)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-[#171825] text-slate-300 transition hover:border-violet-400/30 hover:text-violet-300 lg:hidden"
                aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
                aria-expanded={sidebarOpen}
              >
                <Icon name={sidebarOpen ? "close" : "menu"} />
              </button>

              {/* Desktop menu */}
              <button
                type="button"
                onClick={toggleDesktopSidebar}
                className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-[#171825] text-slate-300 transition hover:border-violet-400/30 hover:text-violet-300 lg:flex"
                aria-label={
                  desktopSidebarOpen ? "Collapse sidebar" : "Expand sidebar"
                }
                title={desktopSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
              >
                <Icon name="menu" />
              </button>

              <div className="hidden sm:block">
                <BrandLogo />
              </div>

              <div className="min-w-0 sm:hidden">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  CareerPilot
                </p>
                <p className="truncate text-sm font-bold text-white">
                  {currentPage}
                </p>
              </div>
            </div>

            {/* Topbar right */}
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <div className="hidden items-center gap-2 rounded-full border border-emerald-400/10 bg-emerald-400/[0.05] px-3 py-2 sm:flex">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34D399]" />
                <span className="text-[11px] font-medium text-emerald-300">
                  Workspace active
                </span>
              </div>

              <div
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-violet-400/20 bg-gradient-to-br from-[#30234b] to-[#151a2c] text-sm font-bold text-violet-200 shadow-[0_0_18px_rgba(139,92,246,0.12)]"
                aria-label="CareerPilot profile"
                title="CareerPilot profile"
              >
                CP
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="mx-auto min-w-0 w-full max-w-[1600px] overflow-x-clip p-3 sm:p-5 md:p-7 lg:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
