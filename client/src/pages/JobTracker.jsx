
import { useCallback, useEffect, useMemo, useState } from "react";

const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? "" : "http://localhost:5000");

const STATUSES = ["Applied", "Interview", "Offer", "Rejected"];

const JOB_TYPES = [
  "Full-time",
  "Part-time",
  "Internship",
  "Contract",
  "Remote",
];

const EMPTY_FORM = {
  company: "",
  position: "",
  location: "",
  jobType: "",
  status: "Applied",
  jobUrl: "",
  salary: "",
  notes: "",
  appliedDate: new Date().toLocaleDateString("en-CA"),
};

const STATUS_STYLES = {
  Applied: "border-blue-400/20 bg-blue-400/[0.08] text-blue-300",
  Interview: "border-amber-400/20 bg-amber-400/[0.08] text-amber-300",
  Offer: "border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300",
  Rejected: "border-rose-400/20 bg-rose-400/[0.08] text-rose-300",
};

const inputClass =
  "w-full rounded-xl border border-white/[0.09] bg-[#090E1B] px-4 py-3.5 text-sm text-slate-100 outline-none shadow-inner shadow-black/20 transition duration-200 placeholder:text-slate-600 hover:border-violet-400/25 focus:border-violet-400/60 focus:ring-2 focus:ring-violet-400/10 disabled:cursor-not-allowed disabled:opacity-50";

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message ||
        (response.status === 401
          ? "Your session has expired. Please log in again."
          : "Something went wrong. Please try again.")
    );
  }

  return data;
}

function formatDate(date) {
  if (!date) return "Not specified";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "Not specified";

  return parsedDate.toLocaleDateString("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function Field({ label, children, className = "" }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-sm font-medium text-slate-300">
        {label}
      </span>
      {children}
    </label>
  );
}

function Panel({ children, className = "", id }) {
  return (
    <section
      id={id}
      className={`rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#151C2D] to-[#0D1321] p-5 shadow-xl shadow-black/20 sm:p-7 ${className}`}
    >
      {children}
    </section>
  );
}

function StatCard({ label, value, description, color, icon }) {
  const styles = {
    blue: {
      icon: "border-blue-400/15 bg-blue-400/[0.08] text-blue-300",
      number: "text-blue-200",
      glow: "group-hover:border-blue-400/30",
      light: "bg-blue-500/[0.08]",
    },
    violet: {
      icon: "border-violet-400/15 bg-violet-400/[0.08] text-violet-300",
      number: "text-violet-200",
      glow: "group-hover:border-violet-400/30",
      light: "bg-violet-500/[0.10]",
    },
    emerald: {
      icon: "border-emerald-400/15 bg-emerald-400/[0.08] text-emerald-300",
      number: "text-emerald-200",
      glow: "group-hover:border-emerald-400/30",
      light: "bg-emerald-500/[0.08]",
    },
    rose: {
      icon: "border-rose-400/15 bg-rose-400/[0.08] text-rose-300",
      number: "text-rose-200",
      glow: "group-hover:border-rose-400/30",
      light: "bg-rose-500/[0.08]",
    },
  };

  const style = styles[color] || styles.violet;

  return (
    <div
      className={`group relative isolate overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#192236] to-[#101625] p-5 shadow-lg shadow-black/10 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/25 ${style.glow}`}
    >
      <div
        className={`pointer-events-none absolute -right-10 -top-10 -z-10 h-32 w-32 rounded-full blur-3xl ${style.light}`}
      />

      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-400">{label}</p>
        <span
          className={`flex h-11 w-11 items-center justify-center rounded-xl border text-xl shadow-inner shadow-white/[0.02] ${style.icon}`}
          aria-hidden="true"
        >
          {icon}
        </span>
      </div>

      <p
        className={`mt-5 text-4xl font-extrabold tracking-tight tabular-nums ${style.number}`}
      >
        {value}
      </p>

      <p className="mt-2 text-xs leading-5 text-slate-500">{description}</p>
    </div>
  );
}

function SectionTitle({ eyebrow, title, description }) {
  return (
    <div>
      {eyebrow && (
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-violet-300">
          {eyebrow}
        </p>
      )}
      <h2 className="mt-2 text-xl font-bold tracking-tight text-white sm:text-2xl">
        {title}
      </h2>
      {description && (
        <p className="mt-2 text-sm leading-6 text-slate-400">
          {description}
        </p>
      )}
    </div>
  );
}

export default function JobTracker() {
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await apiRequest("/api/jobs");
      setJobs(Array.isArray(data.jobs) ? data.jobs : []);
    } catch (err) {
      setError(err.message || "Could not load your applications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const stats = useMemo(
    () => ({
      total: jobs.length,
      interviews: jobs.filter((job) => job.status === "Interview").length,
      offers: jobs.filter((job) => job.status === "Offer").length,
      rejected: jobs.filter((job) => job.status === "Rejected").length,
    }),
    [jobs]
  );

  const filteredJobs = useMemo(() => {
    const term = search.trim().toLowerCase();

    return jobs
      .filter((job) => {
        const matchesSearch =
          !term ||
          [job.company, job.position, job.location, job.notes]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(term));

        const matchesStatus =
          statusFilter === "All" || job.status === statusFilter;

        const matchesType =
          typeFilter === "All" || job.jobType === typeFilter;

        return matchesSearch && matchesStatus && matchesType;
      })
      .sort(
        (a, b) =>
          new Date(b.appliedDate || b.createdAt || 0) -
          new Date(a.appliedDate || a.createdAt || 0)
      );
  }, [jobs, search, statusFilter, typeFilter]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function resetForm() {
    setForm({ ...EMPTY_FORM });
    setEditingId(null);
  }

  function scrollToForm() {
    document.getElementById("job-form")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function startEditing(job) {
    setEditingId(job._id);
    setForm({
      company: job.company || "",
      position: job.position || "",
      location: job.location || "",
      jobType: job.jobType || "",
      status: job.status || "Applied",
      jobUrl: job.jobUrl || "",
      salary: job.salary || "",
      notes: job.notes || "",
      appliedDate: job.appliedDate
        ? new Date(job.appliedDate).toLocaleDateString("en-CA")
        : new Date().toLocaleDateString("en-CA"),
    });

    setError("");
    setNotice("");
    scrollToForm();
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    try {
      const payload = {
        ...form,
        company: form.company.trim(),
        position: form.position.trim(),
      };

      const data = await apiRequest(
        editingId ? `/api/jobs/${editingId}` : "/api/jobs",
        {
          method: editingId ? "PUT" : "POST",
          body: JSON.stringify(payload),
        }
      );

      if (editingId) {
        setJobs((current) =>
          current.map((job) => (job._id === editingId ? data.job : job))
        );
        setNotice("Job application updated successfully.");
      } else {
        setJobs((current) => [data.job, ...current]);
        setNotice("Job application added successfully.");
      }

      resetForm();
    } catch (err) {
      setError(err.message || "Could not save the application.");
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(job, newStatus) {
    if (job.status === newStatus) return;

    setUpdatingId(job._id);
    setError("");
    setNotice("");

    try {
      const data = await apiRequest(`/api/jobs/${job._id}`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus }),
      });

      setJobs((current) =>
        current.map((item) => (item._id === job._id ? data.job : item))
      );

      setNotice("Application status updated.");
    } catch (err) {
      setError(err.message || "Could not update the status.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDelete(job) {
    const confirmed = window.confirm(
      `Delete your application for ${job.position} at ${job.company}?`
    );

    if (!confirmed) return;

    setDeletingId(job._id);
    setError("");
    setNotice("");

    try {
      await apiRequest(`/api/jobs/${job._id}`, { method: "DELETE" });

      setJobs((current) => current.filter((item) => item._id !== job._id));

      if (editingId === job._id) resetForm();

      setNotice("Job application deleted.");
    } catch (err) {
      setError(err.message || "Could not delete the application.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#080B16] text-slate-100">
      <main className="mx-auto max-w-7xl space-y-8 px-4 py-7 sm:px-6 sm:py-9 lg:px-8">
        {/* Hero */}
        <header className="relative isolate overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#19172F] via-[#111729] to-[#0C1423] p-6 shadow-2xl shadow-black/20 sm:p-8 lg:p-9">
          <div className="pointer-events-none absolute -right-20 -top-28 -z-10 h-80 w-80 rounded-full bg-violet-600/[0.14] blur-[90px]" />
          <div className="pointer-events-none absolute -bottom-32 right-1/3 -z-10 h-64 w-64 rounded-full bg-sky-500/[0.09] blur-[80px]" />

          <div className="relative flex flex-col justify-between gap-7 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/[0.08] px-3.5 py-2 text-[11px] font-bold tracking-[0.16em] text-violet-300">
                <span aria-hidden="true">✦</span>
                CAREERPILOT CAREER WORKSPACE
              </div>

              <p className="text-sm font-medium text-slate-400">
                Your personal career workspace
              </p>

              <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Job{" "}
                <span className="bg-gradient-to-r from-violet-400 via-purple-300 to-sky-400 bg-clip-text text-transparent">
                  Tracker.
                </span>
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
                Organize your applications, follow your progress, and stay
                ready for your next opportunity.
              </p>

              <div className="mt-6 flex flex-wrap gap-3 text-xs text-slate-400">
                <span className="rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 py-2">
                  <span className="mr-2 text-violet-300">✦</span>
                  Track progress
                </span>
                <span className="rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 py-2">
                  <span className="mr-2 text-sky-300">⌕</span>
                  Find applications
                </span>
                <span className="rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 py-2">
                  <span className="mr-2 text-emerald-300">✓</span>
                  Stay organized
                </span>
              </div>
            </div>

            <div className="flex w-full flex-col gap-3 lg:max-w-[220px]">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setError("");
                  setNotice("");
                  scrollToForm();
                }}
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-violet-500 to-indigo-500 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-violet-950/30 transition duration-300 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-xl hover:shadow-violet-900/30 focus:outline-none focus:ring-2 focus:ring-violet-400/40"
              >
                <span className="text-xl leading-none">+</span>
                Add application
                <span className="ml-1 transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </button>

              <p className="text-center text-xs leading-5 text-slate-500">
                Keep every opportunity in one place.
              </p>
            </div>
          </div>
        </header>

        {/* Notifications */}
        {error && (
          <div
            role="alert"
            className="flex items-start justify-between gap-3 rounded-xl border border-rose-400/20 bg-rose-400/[0.07] p-4 text-sm text-rose-300"
          >
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setError("")}
              className="font-semibold text-rose-200"
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        )}

        {notice && (
          <div
            role="status"
            className="flex items-start justify-between gap-3 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.07] p-4 text-sm text-emerald-300"
          >
            <span>{notice}</span>
            <button
              type="button"
              onClick={() => setNotice("")}
              className="font-semibold text-emerald-200"
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </div>
        )}

        {/* Statistics */}
        <section aria-label="Application statistics">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-violet-300">
                YOUR OVERVIEW
              </p>
              <h2 className="mt-1 text-lg font-bold text-white">
                Application statistics
              </h2>
            </div>
            <span className="rounded-lg border border-white/[0.07] bg-white/[0.025] px-3 py-2 text-xs text-slate-500">
              Live overview
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total applications"
              value={loading ? "—" : stats.total}
              description="All tracked opportunities"
              icon="▤"
              color="blue"
            />
            <StatCard
              label="Interviews"
              value={loading ? "—" : stats.interviews}
              description="Opportunities to shine"
              icon="✧"
              color="violet"
            />
            <StatCard
              label="Offers"
              value={loading ? "—" : stats.offers}
              description="Potential next steps"
              icon="↗"
              color="emerald"
            />
            <StatCard
              label="Rejected"
              value={loading ? "—" : stats.rejected}
              description="Keep moving forward"
              icon="×"
              color="rose"
            />
          </div>
        </section>

        {/* Application form */}
        <Panel id="job-form" className="scroll-mt-6">
          <div className="mb-7 flex items-center gap-4 border-b border-white/[0.07] pb-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-400/[0.08] text-xl text-violet-300">
              ✎
            </div>
            <SectionTitle
              eyebrow="APPLICATION DETAILS"
              title={editingId ? "Edit application" : "Add a job application"}
              description={
                editingId
                  ? "Update the details of this opportunity."
                  : "Record a new opportunity and keep everything organized."
              }
            />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Company information
              </p>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <Field label="Company name *">
                  <input
                    className={inputClass}
                    name="company"
                    value={form.company}
                    onChange={updateField}
                    placeholder="e.g. Google"
                    maxLength={100}
                    required
                  />
                </Field>

                <Field label="Job position *">
                  <input
                    className={inputClass}
                    name="position"
                    value={form.position}
                    onChange={updateField}
                    placeholder="e.g. Frontend Developer"
                    maxLength={100}
                    required
                  />
                </Field>

                <Field label="Location">
                  <input
                    className={inputClass}
                    name="location"
                    value={form.location}
                    onChange={updateField}
                    placeholder="e.g. Karachi or Remote"
                    maxLength={150}
                  />
                </Field>
              </div>
            </div>

            <div className="border-t border-white/[0.06] pt-6">
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Application information
              </p>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <Field label="Job type">
                  <select
                    className={inputClass}
                    name="jobType"
                    value={form.jobType}
                    onChange={updateField}
                  >
                    <option className="bg-[#111522]" value="">
                      Select job type
                    </option>
                    {JOB_TYPES.map((type) => (
                      <option className="bg-[#111522]" key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Application status">
                  <select
                    className={inputClass}
                    name="status"
                    value={form.status}
                    onChange={updateField}
                  >
                    {STATUSES.map((status) => (
                      <option
                        className="bg-[#111522]"
                        key={status}
                        value={status}
                      >
                        {status}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Application date">
                  <input
                    className={inputClass}
                    type="date"
                    name="appliedDate"
                    value={form.appliedDate}
                    onChange={updateField}
                    required
                  />
                </Field>

                <Field label="Salary">
                  <input
                    className={inputClass}
                    name="salary"
                    value={form.salary}
                    onChange={updateField}
                    placeholder="e.g. PKR 80,000/month"
                    maxLength={100}
                  />
                </Field>

                <Field label="Job posting URL" className="sm:col-span-2">
                  <input
                    className={inputClass}
                    type="url"
                    name="jobUrl"
                    value={form.jobUrl}
                    onChange={updateField}
                    placeholder="https://..."
                    maxLength={500}
                  />
                </Field>
              </div>
            </div>

            <div className="border-t border-white/[0.06] pt-6">
              <Field label="Notes">
                <textarea
                  className={`${inputClass} min-h-28 resize-y`}
                  name="notes"
                  value={form.notes}
                  onChange={updateField}
                  placeholder="Recruiter details, interview preparation, follow-up reminders..."
                  maxLength={2000}
                  rows={3}
                />
              </Field>
            </div>

            <div className="flex flex-col gap-3 border-t border-white/[0.08] pt-6 sm:flex-row sm:justify-end">
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                  className="rounded-xl border border-white/[0.12] bg-white/[0.02] px-5 py-3 text-sm font-semibold text-slate-300 transition duration-200 hover:border-white/20 hover:bg-white/[0.05] disabled:opacity-50"
                >
                  Cancel edit
                </button>
              )}

              <button
                type="submit"
                disabled={saving}
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-950/25 transition duration-300 hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Save changes"
                    : "Save application"}
                {!saving && <span aria-hidden="true">→</span>}
              </button>
            </div>
          </form>
        </Panel>

        {/* Application pipeline */}
        <section className="space-y-5">
          <SectionTitle
            eyebrow="YOUR PIPELINE"
            title="Your applications"
            description="Review and manage every opportunity in your pipeline."
          />

          {/* Search and filters */}
          <Panel className="!p-4 sm:!p-5">
            <div className="mb-4 flex items-center gap-2">
              <span className="text-violet-300" aria-hidden="true">
                ⌕
              </span>
              <h3 className="text-sm font-semibold text-slate-200">
                Find an application
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_200px_200px]">
              <div className="relative">
                <span
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-500"
                  aria-hidden="true"
                >
                  ⌕
                </span>
                <input
                  className={`${inputClass} pl-11`}
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search company, position, location..."
                  aria-label="Search job applications"
                />
              </div>

              <select
                className={inputClass}
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                aria-label="Filter by status"
              >
                <option className="bg-[#111522]" value="All">
                  All statuses
                </option>
                {STATUSES.map((status) => (
                  <option
                    className="bg-[#111522]"
                    key={status}
                    value={status}
                  >
                    {status}
                  </option>
                ))}
              </select>

              <select
                className={inputClass}
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value)}
                aria-label="Filter by job type"
              >
                <option className="bg-[#111522]" value="All">
                  All job types
                </option>
                {JOB_TYPES.map((type) => (
                  <option className="bg-[#111522]" key={type} value={type}>
                    {type}
                  </option>
                ))}
                <option className="bg-[#111522]" value="">
                  Unspecified type
                </option>
              </select>
            </div>
          </Panel>

          {loading ? (
            <Panel className="py-16 text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-violet-400/15 border-t-violet-400 shadow-lg shadow-violet-500/10" />
              <p className="mt-4 text-sm text-slate-400">
                Loading your applications...
              </p>
            </Panel>
          ) : filteredJobs.length === 0 ? (
            <Panel className="border-dashed !bg-[#111522]/80 py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-400/15 bg-violet-400/[0.08] text-3xl text-violet-300 shadow-inner shadow-violet-400/[0.04]">
                ↗
              </div>
              <h3 className="mt-5 text-lg font-bold text-white">
                {jobs.length === 0
                  ? "Your journey starts here"
                  : "No matching applications"}
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
                {jobs.length === 0
                  ? "Add your first job application above. CareerPilot will help you keep its details and progress organized."
                  : "Try another search term or change your filters to find an application."}
              </p>
              {jobs.length === 0 && (
                <button
                  type="button"
                  onClick={scrollToForm}
                  className="mt-6 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-950/20 transition hover:-translate-y-0.5 hover:brightness-110"
                >
                  + Add your first application
                </button>
              )}
            </Panel>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-slate-400">
                  Showing{" "}
                  <span className="font-semibold text-slate-200">
                    {filteredJobs.length}
                  </span>{" "}
                  of {jobs.length} application{jobs.length === 1 ? "" : "s"}
                </p>

                {(search || statusFilter !== "All" || typeFilter !== "All") && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setStatusFilter("All");
                      setTypeFilter("All");
                    }}
                    className="text-xs font-semibold text-violet-300 transition hover:text-violet-200"
                  >
                    Clear filters
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                {filteredJobs.map((job) => (
                  <article
                    key={job._id}
                    className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#192236] to-[#101625] p-5 shadow-lg shadow-black/10 transition duration-300 hover:-translate-y-1 hover:border-violet-400/25 hover:shadow-xl hover:shadow-black/25 sm:p-6"
                  >
                    <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-violet-500/[0.05] blur-3xl transition duration-300 group-hover:bg-violet-500/[0.10]" />

                    <div className="relative flex items-start gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-violet-400/15 bg-gradient-to-br from-violet-400/15 to-sky-400/[0.06] text-lg font-bold text-violet-200 shadow-inner shadow-violet-300/[0.04]">
                        {(job.company || "?").charAt(0).toUpperCase()}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="break-words text-lg font-bold text-white transition group-hover:text-violet-200">
                          {job.position}
                        </h3>
                        <p className="mt-1 break-words text-sm font-medium text-slate-400">
                          {job.company}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full border px-2.5 py-1.5 text-[11px] font-bold ${STATUS_STYLES[job.status] || "border-white/10 bg-white/5 text-slate-300"}`}
                      >
                        {job.status}
                      </span>
                    </div>

                    <div className="relative mt-5 grid grid-cols-2 gap-3">
                      {[
                        {
                          label: "Location",
                          value: job.location || "Not specified",
                        },
                        {
                          label: "Job type",
                          value: job.jobType || "Not specified",
                        },
                        {
                          label: "Salary",
                          value: job.salary || "Not specified",
                        },
                        {
                          label: "Applied on",
                          value: formatDate(job.appliedDate),
                        },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="rounded-xl border border-white/[0.06] bg-[#090E1B]/55 p-3.5 shadow-inner shadow-black/10"
                        >
                          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                            {item.label}
                          </p>
                          <p className="mt-2 break-words text-sm font-semibold text-slate-200">
                            {item.value}
                          </p>
                        </div>
                      ))}
                    </div>

                    {job.notes && (
                      <div className="relative mt-4 rounded-xl border border-white/[0.06] bg-[#090E1B]/40 p-3.5">
                        <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          Notes
                        </p>
                        <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-300">
                          {job.notes}
                        </p>
                      </div>
                    )}

                    {job.jobUrl && (
                      <a
                        href={job.jobUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="relative mt-4 inline-flex items-center gap-2 text-sm font-semibold text-violet-300 transition hover:text-violet-200 hover:underline"
                      >
                        View job posting <span aria-hidden="true">↗</span>
                      </a>
                    )}

                    <div className="relative mt-5 border-t border-white/[0.07] pt-5">
                      <label
                        className="mb-2 block text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500"
                        htmlFor={`status-${job._id}`}
                      >
                        Update status
                      </label>

                      <select
                        id={`status-${job._id}`}
                        className={inputClass}
                        value={job.status}
                        disabled={
                          updatingId === job._id || deletingId === job._id
                        }
                        onChange={(event) =>
                          handleStatusChange(job, event.target.value)
                        }
                      >
                        {STATUSES.map((status) => (
                          <option
                            className="bg-[#111522]"
                            key={status}
                            value={status}
                          >
                            {status}
                          </option>
                        ))}
                      </select>

                      {updatingId === job._id && (
                        <p className="mt-2 text-xs text-violet-300">
                          Updating status...
                        </p>
                      )}

                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => startEditing(job)}
                          disabled={deletingId === job._id}
                          className="rounded-xl border border-white/[0.10] bg-white/[0.02] px-4 py-2.5 text-sm font-semibold text-slate-300 transition duration-200 hover:border-violet-400/30 hover:bg-violet-400/[0.08] hover:text-violet-200 disabled:opacity-50"
                        >
                          Edit application
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(job)}
                          disabled={
                            deletingId === job._id ||
                            updatingId === job._id
                          }
                          className="rounded-xl border border-rose-400/20 bg-rose-400/[0.025] px-4 py-2.5 text-sm font-semibold text-rose-300 transition duration-200 hover:bg-rose-400/[0.09] disabled:opacity-50"
                        >
                          {deletingId === job._id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </section>

        {/* Footer */}
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.08] py-6 text-sm text-slate-500">
          <p>CareerPilot · Every application is a step forward.</p>
          <span className="text-xs text-slate-600">
            {loading ? "Syncing applications..." : "Your workspace is up to date"}
          </span>
        </footer>
      </main>
    </div>
  );
}
