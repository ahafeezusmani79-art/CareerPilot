
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000";

const featureCards = [
  {
    title: "Resume Builder",
    description:
      "Create a professional resume and preview it instantly.",
    action: "Build your resume",
    to: "/resume-builder",
    color: "teal",
    icon: "▤",
  },
  {
    title: "Job Tracker",
    description:
      "Manage applications, update statuses, and monitor your job search.",
    action: "Track your jobs",
    to: "/job-tracker",
    color: "blue",
    icon: "▣",
  },
  {
    title: "Resume Analyzer",
    description:
      "Identify missing skills and get free feedback to improve your resume.",
    action: "Analyze your resume",
    to: "/resume-analyzer",
    color: "emerald",
    icon: "✦",
  },
  {
    title: "AI Career Assistant",
    description:
      "Get career advice, explore learning paths, and prepare for interviews.",
    action: "Talk to your assistant",
    to: "/career-assistant",
    color: "purple",
    icon: "✧",
  },
];

function getItems(data, keys) {
  if (Array.isArray(data)) return data;

  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
  }

  if (Array.isArray(data?.data)) return data.data;
  return [];
}

async function fetchJson(url) {
  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Could not load data.");
  }

  return data;
}

function getStatus(item) {
  return String(item?.status || item?.applicationStatus || "")
    .toLowerCase()
    .trim();
}

function getAnalyticsStatus(job) {
  const status = getStatus(job);

  if (status.includes("reject")) return "Rejected";

  if (["offer", "offered", "hired", "accepted"].includes(status)) {
    return "Offers";
  }

  if (status.includes("interview")) return "Interviews";
  if (status.includes("applied")) return "Applied";

  return "Other";
}

function formatDate(date) {
  if (!date) return "Date unavailable";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Date unavailable";
  }

  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [jobs, setJobs] = useState([]);
  const [recentChats, setRecentChats] = useState([]);
  const [hasResume, setHasResume] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        // Authentication remains mandatory.
        const profileData = await fetchJson(
          `${API_URL}/api/users/profile`
        );

        if (cancelled) return;

        setUser(profileData.user || profileData);
        setLoading(false);

        // Load optional dashboard information independently.
        const results = await Promise.allSettled([
          fetchJson(`${API_URL}/api/jobs`),
          fetchJson(`${API_URL}/api/chats`),
          fetchJson(`${API_URL}/api/resumes`),
        ]);

        if (cancelled) return;

        if (results[0].status === "fulfilled") {
          setJobs(
            getItems(results[0].value, ["jobs", "applications"])
          );
        }

        if (results[1].status === "fulfilled") {
          const chats = getItems(results[1].value, ["chats"]);

          setRecentChats(
            [...chats]
              .sort(
                (a, b) =>
                  new Date(b.updatedAt || 0).getTime() -
                  new Date(a.updatedAt || 0).getTime()
              )
              .slice(0, 4)
          );
        }

        if (results[2].status === "fulfilled") {
          const data = results[2].value;
          const resume =
            data.resume ||
            data.data?.resume ||
            (data._id ? data : null);

          setHasResume(Boolean(resume));
        }
      } catch (err) {
        if (cancelled) return;

        if (
          err.message?.toLowerCase().includes("unauthorized") ||
          err.message?.toLowerCase().includes("login") ||
          err.message?.toLowerCase().includes("token")
        ) {
          navigate("/login", { replace: true });
          return;
        }

        setError(
          "Could not connect to the server. Please try again."
        );
        setLoading(false);
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
      const response = await fetch(
        `${API_URL}/api/auth/logout`,
        {
          method: "POST",
          credentials: "include",
        }
      );

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
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        Loading your dashboard...
      </div>
    );
  }

  const totalJobs = jobs.length;
  const interviews = jobs.filter((job) =>
    getStatus(job).includes("interview")
  ).length;
  const offers = jobs.filter((job) =>
    ["offer", "offered", "hired", "accepted"].includes(getStatus(job))
  ).length;

  const analyticsCategories = [
    { label: "Applied", color: "bg-blue-400" },
    { label: "Interviews", color: "bg-purple-400" },
    { label: "Offers", color: "bg-emerald-400" },
    { label: "Rejected", color: "bg-red-400" },
    { label: "Other", color: "bg-slate-400" },
  ];

  const analyticsData = analyticsCategories.map((category) => ({
    ...category,
    count: jobs.filter(
      (job) => getAnalyticsStatus(job) === category.label
    ).length,
  }));

  const interviewRate =
    totalJobs > 0 ? Math.round((interviews / totalJobs) * 100) : 0;

  const careerInsight =
    totalJobs === 0
      ? "Add your first job application to start tracking your career progress."
      : interviews === 0
        ? "Keep applying and tailor your resume to the requirements of each role."
        : offers === 0
          ? "Great progress! Prepare for interviews and practice explaining your projects."
          : "Excellent progress! Review your offers carefully and keep tracking your opportunities.";

  const completedSteps =
    Number(hasResume) + Number(totalJobs > 0) + Number(recentChats.length > 0);

  const progress = Math.round((completedSteps / 3) * 100);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-950/90 px-5 py-5 sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link to="/dashboard" className="text-2xl font-bold">
            Career<span className="text-teal-400">Pilot</span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-400 sm:inline">
              {user?.name || "CareerPilot user"}
            </span>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm transition hover:bg-slate-800"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-6 sm:py-12">
        <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950/40 p-6 sm:p-10">
          <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-teal-400/10 blur-3xl" />

          <div className="relative">
            <p className="text-sm font-semibold uppercase tracking-wider text-teal-400">
              Your career workspace
            </p>

            <h1 className="mt-3 text-3xl font-bold sm:text-4xl lg:text-5xl">
              Welcome, {user?.name || "CareerPilot user"}! 👋
            </h1>

            <p className="mt-4 max-w-2xl leading-7 text-slate-400">
              Build your resume, organize your job applications, and
              take your next step toward your dream career.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/career-assistant"
                className="rounded-xl bg-teal-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-teal-300"
              >
                Ask AI Career Assistant →
              </Link>

              <Link
                to="/resume-builder"
                className="rounded-xl border border-slate-700 px-5 py-3 font-semibold transition hover:bg-slate-800"
              >
                Build my resume
              </Link>
            </div>
          </div>
        </section>

        {error && (
          <p
            role="alert"
            className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-400"
          >
            {error}
          </p>
        )}

        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Job Applications"
            value={dataLoading ? "..." : totalJobs}
            description="Applications in your tracker"
            color="teal"
          />

          <StatCard
            label="Interviews"
            value={dataLoading ? "..." : interviews}
            description="Applications with interview status"
            color="purple"
          />

          <StatCard
            label="Offers & Hires"
            value={dataLoading ? "..." : offers}
            description="Offers, accepted, or hired"
            color="emerald"
          />

          <StatCard
            label="Saved AI Chats"
            value={dataLoading ? "..." : recentChats.length}
            description="Recent conversations shown below"
            color="blue"
          />
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-7">
            <p className="text-sm font-medium uppercase tracking-wider text-teal-400">
              APPLICATION INSIGHTS
            </p>

            <h2 className="mt-2 text-xl font-bold">
              Your job search analytics
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              See how your tracked applications are progressing.
            </p>

            <div className="mt-7 space-y-5">
              {analyticsData.map((item) => {
                const percentage =
                  totalJobs > 0
                    ? Math.round((item.count / totalJobs) * 100)
                    : 0;

                return (
                  <div key={item.label}>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className="text-sm text-slate-300">
                        {item.label}
                      </span>

                      <span className="text-sm font-semibold text-white">
                        {item.count}
                        <span className="ml-2 font-normal text-slate-500">
                          {percentage}%
                        </span>
                      </span>
                    </div>

                    <div
                      className="h-2 overflow-hidden rounded-full bg-slate-800"
                      role="progressbar"
                      aria-label={`${item.label} applications`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={percentage}
                    >
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${item.color}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {totalJobs === 0 && (
              <p className="mt-5 text-sm text-slate-500">
                Your analytics will appear after you add jobs to your tracker.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-teal-950/30 p-6 sm:p-7">
            <p className="text-sm font-medium uppercase tracking-wider text-purple-400">
              CAREER PERFORMANCE
            </p>

            <h2 className="mt-2 text-xl font-bold">
              Interview progress
            </h2>

            <div className="mt-7 flex items-center gap-5">
              <div className="flex h-28 w-28 shrink-0 flex-col items-center justify-center rounded-full border-4 border-purple-400/60">
                <span className="text-3xl font-bold">{interviewRate}%</span>
                <span className="text-xs text-slate-400">Interview rate</span>
              </div>

              <div>
                <p className="font-semibold">
                  {interviews} interview{interviews === 1 ? "" : "s"}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {interviews} of your {totalJobs} tracked applications
                  {totalJobs === 1 ? " has" : " have"} an interview status.
                </p>
              </div>
            </div>

            <div className="mt-7 rounded-xl border border-slate-700/70 bg-slate-950/50 p-4">
              <p className="font-semibold text-teal-300">Your next step</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                {careerInsight}
              </p>
            </div>

            <Link
              to="/job-tracker"
              className="mt-5 inline-block font-semibold text-teal-400 hover:text-teal-300"
            >
              Update your job tracker →
            </Link>
          </div>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-teal-400">
                  YOUR NEXT STEPS
                </p>
                <h2 className="mt-2 text-xl font-bold">
                  Career progress checklist
                </h2>
              </div>

              <span className="rounded-full border border-slate-700 px-3 py-1 text-sm text-slate-300">
                {dataLoading ? "Loading..." : `${progress}% complete`}
              </span>
            </div>

            <div
              className="mt-5 h-2 overflow-hidden rounded-full bg-slate-800"
              role="progressbar"
              aria-label="Career progress checklist"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={dataLoading ? 0 : progress}
            >
              <div
                className="h-full rounded-full bg-teal-400 transition-all duration-500"
                style={{ width: `${dataLoading ? 0 : progress}%` }}
              />
            </div>

            <div className="mt-6 space-y-4">
              <ChecklistItem
                done={hasResume}
                title="Create your resume"
                description={
                  hasResume
                    ? "Your saved resume is available."
                    : "Build and save your professional resume."
                }
                to="/resume-builder"
              />

              <ChecklistItem
                done={totalJobs > 0}
                title="Track your job applications"
                description={
                  totalJobs > 0
                    ? `${totalJobs} application${totalJobs === 1 ? "" : "s"} in your tracker.`
                    : "Add the first job you're interested in."
                }
                to="/job-tracker"
              />

              <ChecklistItem
                done={recentChats.length > 0}
                title="Plan your career with AI"
                description={
                  recentChats.length > 0
                    ? "You've started a saved career conversation."
                    : "Ask the AI assistant for a learning roadmap."
                }
                to="/career-assistant"
              />
            </div>

            <p className="mt-5 text-xs leading-5 text-slate-500">
              This checklist measures completed activities, not a
              prediction of your job-search success.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-7">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-purple-400">
                  YOUR AI WORKSPACE
                </p>
                <h2 className="mt-2 text-xl font-bold">
                  Recent conversations
                </h2>
              </div>

              <span className="text-2xl text-purple-400">✧</span>
            </div>

            {dataLoading ? (
              <p className="mt-6 text-sm text-slate-400">
                Loading conversations...
              </p>
            ) : recentChats.length === 0 ? (
              <div className="mt-6 rounded-xl border border-dashed border-slate-700 p-5">
                <p className="font-medium">Ready to plan your future?</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Your saved AI conversations will appear here after
                  you start chatting.
                </p>
                <Link
                  to="/career-assistant"
                  className="mt-4 inline-block font-semibold text-purple-400 hover:text-purple-300"
                >
                  Start a conversation →
                </Link>
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {recentChats.map((chat) => (
                  <div
                    key={chat._id}
                    className="rounded-xl border border-slate-800 bg-slate-950/60 p-4"
                  >
                    <p className="break-words font-medium text-slate-200">
                      {chat.title || "New Career Chat"}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      Updated {formatDate(chat.updatedAt)}
                    </p>
                  </div>
                ))}

                <Link
                  to="/career-assistant"
                  className="inline-block pt-2 font-semibold text-purple-400 hover:text-purple-300"
                >
                  Open AI Career Assistant →
                </Link>
              </div>
            )}
          </div>
        </section>

        <section className="mt-12">
          <div className="mb-6">
            <p className="text-sm font-medium uppercase tracking-wider text-teal-400">
              Everything you need
            </p>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
              Your career tools
            </h2>
            <p className="mt-2 text-slate-400">
              Pick a tool and keep making progress.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {featureCards.map((card) => {
              const cardColors = {
                teal: {
                  border: "hover:border-teal-400",
                  icon: "bg-teal-400/10 text-teal-400",
                  title: "group-hover:text-teal-400",
                  action: "text-teal-400",
                },
                blue: {
                  border: "hover:border-blue-400",
                  icon: "bg-blue-400/10 text-blue-400",
                  title: "group-hover:text-blue-400",
                  action: "text-blue-400",
                },
                emerald: {
                  border: "hover:border-emerald-400",
                  icon: "bg-emerald-400/10 text-emerald-400",
                  title: "group-hover:text-emerald-400",
                  action: "text-emerald-400",
                },
                purple: {
                  border: "hover:border-purple-400",
                  icon: "bg-purple-400/10 text-purple-400",
                  title: "group-hover:text-purple-400",
                  action: "text-purple-400",
                },
              };

              const colors = cardColors[card.color] || cardColors.teal;

              return (
                <Link
                  key={card.title}
                  to={card.to}
                  className={`group rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:-translate-y-1 ${colors.border}`}
                >
                  <div
                    className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl text-2xl ${colors.icon}`}
                  >
                    {card.icon}
                  </div>

                  <h3 className={`text-lg font-semibold ${colors.title}`}>
                    {card.title}
                  </h3>

                  <p className="mt-3 min-h-20 text-sm leading-6 text-slate-400">
                    {card.description}
                  </p>

                  <span
                    className={`mt-4 inline-block text-sm font-semibold ${colors.action}`}
                  >
                    {card.action} →
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        <footer className="mt-12 border-t border-slate-800 py-6 text-center text-sm text-slate-500">
          CareerPilot · Your next opportunity starts with your next step.
        </footer>
      </main>
    </div>
  );
}

function StatCard({ label, value, description, color }) {
  const colors = {
    teal: "text-teal-400",
    purple: "text-purple-400",
    emerald: "text-emerald-400",
    blue: "text-blue-400",
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:border-slate-700">
      <p className="text-sm text-slate-400">{label}</p>
      <p className={`mt-3 text-3xl font-bold ${colors[color]}`}>
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
      className="flex items-start gap-3 rounded-xl border border-slate-800 p-4 transition hover:bg-slate-800/60"
    >
      <span
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm ${
          done
            ? "bg-teal-400 text-slate-950"
            : "border border-slate-600 text-slate-500"
        }`}
      >
        {done ? "✓" : "→"}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block font-medium">{title}</span>
        <span className="mt-1 block text-sm leading-6 text-slate-400">
          {description}
        </span>
      </span>
    </Link>
  );
}
