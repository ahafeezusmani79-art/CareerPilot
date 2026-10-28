import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? "" : "http://localhost:5000");

const tools = [
  {
    title: "Resume Builder",
    description: "Create and update your professional resume.",
    action: "Build your resume",
    to: "/resume-builder",
    icon: "▤",
    tag: "ESSENTIAL",
    color: "violet",
  },
  {
    title: "Job Tracker",
    description: "Organize job applications and track your progress.",
    action: "Track your jobs",
    to: "/job-tracker",
    icon: "▣",
    tag: "STAY ORGANIZED",
    color: "blue",
  },
  {
    title: "Resume Analyzer",
    description: "Find opportunities to improve your resume for free.",
    action: "Analyze resume",
    to: "/resume-analyzer",
    icon: "✦",
    tag: "FREE TOOL",
    color: "emerald",
  },
  {
    title: "AI Career Assistant",
    description: "Explore career paths, skills, and interview preparation.",
    action: "Open assistant",
    to: "/career-assistant",
    icon: "✧",
    tag: "AI POWERED",
    color: "purple",
  },
];

async function getJson(url) {
  const response = await fetch(url, {
    credentials: "include",
  });

  let data = {};

  try {
    data = await response.json();
  } catch {
    // Handle non-JSON server responses below.
  }

  if (!response.ok) {
    const error = new Error(
      data.message || data.detail || `Request failed (${response.status})`
    );

    error.status = response.status;
    throw error;
  }

  return data;
}

function getArray(data, key) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.[key])) return data[key];
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function jobStatus(job) {
  return String(job?.status || job?.applicationStatus || "")
    .toLowerCase()
    .trim();
}

function isInterview(job) {
  return jobStatus(job).includes("interview");
}

function isOffer(job) {
  const status = jobStatus(job);
  return (
    status.includes("offer") ||
    status === "hired" ||
    status === "accepted"
  );
}

function isRejected(job) {
  return jobStatus(job).includes("reject");
}

function isApplied(job) {
  return jobStatus(job).includes("applied");
}

function isActiveApplication(job) {
  return !isOffer(job) && !isRejected(job);
}

function prettyDate(value) {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [chats, setChats] = useState([]);
  const [hasResume, setHasResume] = useState(false);

  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState("");
  const [dataError, setDataError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      setLoading(true);
      setDataLoading(true);
      setError("");
      setDataError("");

      try {
        const profile = await getJson(`${API_URL}/api/users/profile`);

        if (cancelled) return;

        setUser(profile.user || profile);
        setLoading(false);

        const results = await Promise.allSettled([
          getJson(`${API_URL}/api/jobs`),
          getJson(`${API_URL}/api/chats`),
          getJson(`${API_URL}/api/resumes`),
        ]);

        if (cancelled) return;

        const failedRequests = [];

        if (results[0].status === "fulfilled") {
          const data = results[0].value;
          const returnedJobs = getArray(data, "jobs");
          const returnedApplications = getArray(data, "applications");

          setJobs(
            returnedJobs.length > 0
              ? returnedJobs
              : returnedApplications
          );
        } else {
          setJobs([]);
          failedRequests.push("job applications");
        }

        if (results[1].status === "fulfilled") {
          const list = getArray(results[1].value, "chats");

          setChats(
            [...list]
              .sort(
                (a, b) =>
                  new Date(b.updatedAt || b.createdAt || 0) -
                  new Date(a.updatedAt || a.createdAt || 0)
              )
              .slice(0, 4)
          );
        } else {
          setChats([]);
          failedRequests.push("AI conversations");
        }

        if (results[2].status === "fulfilled") {
          const data = results[2].value;

          setHasResume(
            Boolean(data.resume || data.data?.resume || data._id)
          );
        } else {
          setHasResume(false);
          failedRequests.push("saved resume");
        }

        if (failedRequests.length > 0) {
          setDataError(
            `Some dashboard data could not be loaded: ${failedRequests.join(
              ", "
            )}. Other features remain available.`
          );
        }
      } catch (err) {
        if (cancelled) return;

        if (err.status === 401) {
          navigate("/login", { replace: true });
          return;
        }

        const message = String(err.message || "").toLowerCase();

        if (
          message.includes("unauthorized") ||
          message.includes("token") ||
          message.includes("login")
        ) {
          navigate("/login", { replace: true });
          return;
        }

        setError(
          "Could not load your profile. Check that the backend is running."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
          setDataLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  async function handleLogout() {
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        navigate("/login", { replace: true });
      } else {
        setError("Logout failed. Please try again.");
      }
    } catch {
      setError("Could not connect to the server. Please try again.");
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b0e17] text-slate-200">
        <div className="text-center">
          <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-2 border-violet-400/25 border-t-violet-400" />
          Loading your workspace...
        </div>
      </div>
    );
  }

  const totalJobs = jobs.length;
  const interviews = jobs.filter(isInterview).length;
  const offers = jobs.filter(isOffer).length;
  const applied = jobs.filter(isApplied).length;
  const rejected = jobs.filter(isRejected).length;
  const activeJobs = jobs.filter(isActiveApplication).length;

  // Interview rate measures applications with interview status.
  const interviewRate = totalJobs
    ? Math.round((interviews / totalJobs) * 100)
    : 0;

  // Response rate includes applications with interviews, offers, or rejections.
  const respondedJobs = jobs.filter(
    (job) => isInterview(job) || isOffer(job) || isRejected(job)
  ).length;

  const responseRate = totalJobs
    ? Math.round((respondedJobs / totalJobs) * 100)
    : 0;

  const progress =
    ((Number(hasResume) +
      Number(totalJobs > 0) +
      Number(chats.length > 0)) /
      3) *
    100;

  const analyticsItems = [
    {
      label: "Applied",
      count: applied,
      color: "bg-blue-400",
    },
    {
      label: "Interviews",
      count: interviews,
      color: "bg-violet-400",
    },
    {
      label: "Offers",
      count: offers,
      color: "bg-emerald-400",
    },
    {
      label: "Rejected",
      count: rejected,
      color: "bg-rose-400",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0b0e17] text-slate-100">
      <main className="mx-auto max-w-7xl space-y-8 px-4 py-7 sm:px-6 sm:py-9 lg:px-8">
        {/* Dashboard header */}
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
          <div>
            <p className="text-sm text-slate-400">
              Your personal career workspace
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
              Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2 rounded-full border border-emerald-300/15 bg-emerald-400/[0.07] px-3 py-2 text-xs font-medium text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Workspace active
            </span>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-indigo-600 font-bold text-white">
              {(user?.name || "C").charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-400/20 bg-red-400/[0.07] p-4 text-sm text-red-300"
          >
            {error}
          </div>
        )}

        {dataError && (
          <div
            role="status"
            className="rounded-xl border border-amber-400/20 bg-amber-400/[0.06] p-4 text-sm leading-6 text-amber-200"
          >
            {dataError}
          </div>
        )}

        {/* Welcome section */}
        <section className="relative overflow-hidden rounded-3xl border border-white/[0.09] bg-gradient-to-br from-[#1b2435] via-[#171b2c] to-[#292044] p-6 sm:p-9">
          <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-violet-500/15 blur-3xl" />

          <div className="relative">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-300">
              Your AI workspace
            </p>

            <h2 className="mt-3 max-w-3xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              Welcome back, {user?.name || "CareerPilot user"}
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              Your next opportunity starts with your next step. Keep your
              resume ready, stay organized, and build the career you want.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/career-assistant"
                className="rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-950/30 transition hover:-translate-y-0.5 hover:brightness-110"
              >
                Open AI Career Assistant →
              </Link>

              <Link
                to="/resume-builder"
                className="rounded-xl border border-white/[0.15] bg-white/[0.04] px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/[0.09]"
              >
                Build my resume
              </Link>
            </div>
          </div>
        </section>

        {/* Overview statistics */}
        <section>
          <div className="mb-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-300">
              CAREER OVERVIEW
            </p>

            <h2 className="mt-2 text-xl font-bold">
              Your progress at a glance
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Job Applications"
              value={dataLoading ? "—" : totalJobs}
              description="Applications in your tracker"
              icon="▤"
              color="blue"
            />

            <StatCard
              label="Interviews"
              value={dataLoading ? "—" : interviews}
              description="Applications at interview stage"
              icon="✧"
              color="purple"
            />

            <StatCard
              label="Offers & Hires"
              value={dataLoading ? "—" : offers}
              description="Offers and accepted positions"
              icon="↗"
              color="emerald"
            />

            <StatCard
              label="Active Applications"
              value={dataLoading ? "—" : activeJobs}
              description="Applications not rejected or offered"
              icon="◷"
              color="violet"
            />
          </div>
        </section>

        {/* Main analytics */}
        <section className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#171d2c] to-[#111522] p-5 sm:p-7">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-300">
              APPLICATION INSIGHTS
            </p>

            <h2 className="mt-2 text-xl font-bold">
              Your job search analytics
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              See how your tracked applications are progressing.
            </p>

            <div className="mt-7 space-y-5">
              {analyticsItems.map((item) => {
                const percent = totalJobs
                  ? Math.round((item.count / totalJobs) * 100)
                  : 0;

                return (
                  <div key={item.label}>
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="text-slate-300">{item.label}</span>

                      <span className="font-semibold text-slate-100">
                        {item.count}
                        <span className="ml-2 font-normal text-slate-500">
                          {percent}%
                        </span>
                      </span>
                    </div>

                    <div
                      className="h-2 overflow-hidden rounded-full bg-white/[0.06]"
                      role="progressbar"
                      aria-label={`${item.label} percentage`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={percent}
                    >
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${item.color}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {totalJobs === 0 && (
              <p className="mt-5 text-sm text-slate-500">
                Add a job application to start building your analytics.
              </p>
            )}

            <Link
              to="/job-tracker"
              className="mt-6 inline-block text-sm font-semibold text-violet-300 transition hover:text-violet-200"
            >
              Open Job Tracker →
            </Link>
          </div>

          {/* Career performance */}
          <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#1c1b32] to-[#111725] p-5 sm:p-7">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-purple-300">
              CAREER PERFORMANCE
            </p>

            <h2 className="mt-2 text-xl font-bold">
              Interview progress
            </h2>

            <div className="mt-7 flex flex-wrap items-center gap-5">
              <div
                className="flex h-28 w-28 shrink-0 flex-col items-center justify-center rounded-full border-4 border-violet-400/60 bg-violet-400/[0.05]"
                aria-label={`Interview rate ${interviewRate}%`}
              >
                <span className="text-3xl font-bold">
                  {dataLoading ? "—" : `${interviewRate}%`}
                </span>

                <span className="mt-1 text-[11px] text-slate-400">
                  Interview rate
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-semibold">
                  {interviews} interview{interviews === 1 ? "" : "s"}
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {totalJobs
                    ? `${interviews} of ${totalJobs} tracked applications have an interview status.`
                    : "Start tracking applications to measure your interview progress."}
                </p>
              </div>
            </div>

            <div className="mt-7 rounded-xl border border-white/[0.08] bg-black/20 p-4">
              <p className="font-semibold text-violet-200">
                Application response rate
              </p>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 transition-all duration-700"
                  style={{
                    width: `${dataLoading ? 0 : responseRate}%`,
                  }}
                />
              </div>

              <div className="mt-2 flex items-center justify-between gap-3 text-sm">
                <span className="text-slate-400">
                  Applications with a recorded outcome
                </span>

                <span className="font-bold text-violet-200">
                  {dataLoading ? "—" : `${responseRate}%`}
                </span>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-white/[0.08] bg-black/20 p-4">
              <p className="font-semibold text-violet-200">
                Your next step
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-300">
                {totalJobs === 0
                  ? "Add your first application and start organizing your search."
                  : interviews === 0
                    ? "Tailor your resume to each role and keep applying consistently."
                    : offers === 0
                      ? "Prepare for interviews and practice explaining your projects."
                      : "Review your offers carefully and keep your opportunities organized."}
              </p>
            </div>
          </div>
        </section>

        {/* Career checklist */}
        <section className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#171d2c] to-[#111522] p-5 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-300">
                YOUR NEXT STEPS
              </p>

              <h2 className="mt-2 text-xl font-bold">
                Career progress checklist
              </h2>
            </div>

            <span className="rounded-full border border-white/[0.10] bg-white/[0.03] px-3 py-1.5 text-sm text-slate-300">
              {dataLoading
                ? "Loading..."
                : `${Math.round(progress)}% complete`}
            </span>
          </div>

          <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 transition-all duration-700"
              style={{ width: `${dataLoading ? 0 : progress}%` }}
            />
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <ChecklistItem
              done={hasResume}
              title="Create your resume"
              description="Build and save your professional resume."
              to="/resume-builder"
            />

            <ChecklistItem
              done={totalJobs > 0}
              title="Track applications"
              description="Keep your job search organized."
              to="/job-tracker"
            />

            <ChecklistItem
              done={chats.length > 0}
              title="Get career guidance"
              description="Plan your next step with your AI assistant."
              to="/career-assistant"
            />
          </div>
        </section>

        {/* Recent AI conversations */}
        <section>
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-300">
              YOUR AI WORKSPACE
            </p>

            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              Recent conversations
            </h2>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#1b2432] to-[#171b29] p-5 sm:p-7">
            {dataLoading ? (
              <p className="py-6 text-sm text-slate-400">
                Loading your conversations...
              </p>
            ) : chats.length > 0 ? (
              <div className="space-y-3">
                {chats.map((chat, index) => (
                  <Link
                    key={chat._id || chat.id || index}
                    to="/career-assistant"
                    className={`group flex items-center gap-4 rounded-xl border border-white/[0.10] p-4 transition duration-200 hover:-translate-y-0.5 hover:border-violet-300/40 hover:shadow-lg hover:shadow-violet-950/20 sm:p-5 ${
                      index % 2 === 0
                        ? "bg-gradient-to-r from-blue-500/20 to-violet-500/20"
                        : "bg-gradient-to-r from-cyan-500/15 to-purple-500/20"
                    }`}
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/[0.10] bg-white/[0.05] text-2xl text-violet-200">
                      {index % 2 === 0 ? "☼" : "⚙"}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold text-white transition group-hover:text-violet-200">
                        {chat.title || "Career conversation"}
                      </span>

                      <span className="mt-2 block text-sm text-slate-400">
                        Updated{" "}
                        {prettyDate(chat.updatedAt || chat.createdAt)}
                      </span>
                    </span>

                    <span className="text-lg text-slate-400 transition group-hover:translate-x-1 group-hover:text-violet-300">
                      →
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-white/[0.12] px-5 py-9 text-center">
                <span className="text-3xl text-violet-300">✧</span>

                <h3 className="mt-3 font-semibold">
                  Your next great idea starts here
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
                  Ask about resume improvements, interview preparation, or
                  your full-stack development roadmap.
                </p>
              </div>
            )}

            <Link
              to="/career-assistant"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-950/20 transition hover:-translate-y-0.5 hover:brightness-110"
            >
              Open AI Career Assistant →
            </Link>
          </div>
        </section>

        {/* Career tools */}
        <section className="pb-4">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-300">
              EVERYTHING YOU NEED
            </p>

            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              Your career tools
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Pick a tool and keep making progress.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {tools.map((tool) => (
              <ToolCard key={tool.title} tool={tool} />
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.08] py-6 text-sm text-slate-500">
          <p>CareerPilot · Your personal career workspace</p>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg px-3 py-2 font-medium transition hover:bg-white/[0.05] hover:text-white"
          >
            Log out
          </button>
        </footer>
      </main>
    </div>
  );
}

function StatCard({ label, value, description, icon, color }) {
  const styles = {
    blue: {
      icon: "bg-blue-400/10 text-blue-300",
      number: "text-blue-200",
    },
    purple: {
      icon: "bg-purple-400/10 text-purple-300",
      number: "text-purple-200",
    },
    emerald: {
      icon: "bg-emerald-400/10 text-emerald-300",
      number: "text-emerald-200",
    },
    violet: {
      icon: "bg-violet-400/10 text-violet-300",
      number: "text-violet-200",
    },
  };

  const style = styles[color] || styles.violet;

  return (
    <div className="group rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#192031] to-[#111522] p-5 transition duration-200 hover:-translate-y-1 hover:border-white/[0.16] hover:shadow-xl hover:shadow-black/20">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-400">{label}</p>

        <span
          className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl ${style.icon}`}
        >
          {icon}
        </span>
      </div>

      <p
        className={`mt-5 text-4xl font-bold tracking-tight tabular-nums ${style.number}`}
      >
        {value}
      </p>

      <p className="mt-2 text-xs leading-5 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function ChecklistItem({ done, title, description, to }) {
  return (
    <Link
      to={to}
      className="flex items-start gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 transition hover:border-violet-300/30 hover:bg-white/[0.04]"
    >
      <span
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm ${
          done
            ? "bg-violet-400 text-slate-950"
            : "border border-white/[0.15] text-slate-500"
        }`}
      >
        {done ? "✓" : "→"}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block font-medium text-slate-100">{title}</span>

        <span className="mt-1 block text-sm leading-6 text-slate-400">
          {description}
        </span>
      </span>
    </Link>
  );
}

function ToolCard({ tool }) {
  const styles = {
    violet: {
      icon: "bg-violet-400/10 text-violet-300",
      hover: "hover:border-violet-400/50",
      title: "group-hover:text-violet-200",
      action: "text-violet-300",
    },
    blue: {
      icon: "bg-blue-400/10 text-blue-300",
      hover: "hover:border-blue-400/50",
      title: "group-hover:text-blue-200",
      action: "text-blue-300",
    },
    emerald: {
      icon: "bg-emerald-400/10 text-emerald-300",
      hover: "hover:border-emerald-400/50",
      title: "group-hover:text-emerald-200",
      action: "text-emerald-300",
    },
    purple: {
      icon: "bg-purple-400/10 text-purple-300",
      hover: "hover:border-purple-400/50",
      title: "group-hover:text-purple-200",
      action: "text-purple-300",
    },
  };

  const style = styles[tool.color] || styles.violet;

  return (
    <Link
      to={tool.to}
      className={`group rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#192031] to-[#111522] p-5 shadow-lg shadow-black/10 transition duration-200 hover:-translate-y-1 hover:shadow-xl ${style.hover}`}
    >
      <div className="mb-5 flex items-start justify-between gap-3">
        <span
          className={`flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.06] text-2xl ${style.icon}`}
        >
          {tool.icon}
        </span>

        <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2 py-1 text-[9px] font-bold tracking-wider text-slate-400">
          {tool.tag}
        </span>
      </div>

      <h3
        className={`text-lg font-semibold text-slate-100 transition ${style.title}`}
      >
        {tool.title}
      </h3>

      <p className="mt-3 min-h-[4.5rem] text-sm leading-6 text-slate-400">
        {tool.description}
      </p>

      <span className={`mt-4 inline-block text-sm font-semibold ${style.action}`}>
        {tool.action} →
      </span>
    </Link>
  );
}