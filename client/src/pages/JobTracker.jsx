
import { useCallback, useEffect, useMemo, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

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
  Applied: "bg-blue-50 text-blue-700 ring-blue-200",
  Interview: "bg-amber-50 text-amber-700 ring-amber-200",
  Offer: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Rejected: "bg-rose-50 text-rose-700 ring-rose-200",
};

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
      <span className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10";

function StatCard({ label, value, description, accent }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span
          className={`h-2.5 w-2.5 rounded-full ${accent}`}
          aria-hidden="true"
        />
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
        {value}
      </p>
      <p className="mt-1 text-xs text-slate-500">{description}</p>
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
    document.getElementById("job-form")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
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
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 ring-1 ring-teal-100">
              <span className="h-2 w-2 rounded-full bg-teal-500" />
              CAREERPILOT WORKSPACE
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Job Tracker
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
              Keep your applications organized, track your progress, and stay
              ready for your next opportunity.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              resetForm();
              setError("");
              setNotice("");
              document.getElementById("job-form")?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-600/20 transition hover:bg-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-500/20"
          >
            <span className="text-lg leading-none">+</span>
            Add application
          </button>
        </header>

        {error && (
          <div
            role="alert"
            className="flex items-start justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
          >
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setError("")}
              className="font-semibold"
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        )}

        {notice && (
          <div
            role="status"
            className="flex items-start justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
          >
            <span>{notice}</span>
            <button
              type="button"
              onClick={() => setNotice("")}
              className="font-semibold"
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </div>
        )}

        <section
          aria-label="Application statistics"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          <StatCard
            label="Total applications"
            value={loading ? "—" : stats.total}
            description="All tracked opportunities"
            accent="bg-teal-500"
          />
          <StatCard
            label="Interviews"
            value={loading ? "—" : stats.interviews}
            description="Opportunities to shine"
            accent="bg-amber-500"
          />
          <StatCard
            label="Offers"
            value={loading ? "—" : stats.offers}
            description="Potential next steps"
            accent="bg-emerald-500"
          />
          <StatCard
            label="Rejected"
            value={loading ? "—" : stats.rejected}
            description="Keep moving forward"
            accent="bg-rose-500"
          />
        </section>

        <section
          id="job-form"
          className="scroll-mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
        >
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">
              {editingId ? "Edit application" : "Add a job application"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {editingId
                ? "Update the details of this opportunity."
                : "Record a new opportunity to keep everything in one place."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

              <Field label="Job type">
                <select
                  className={inputClass}
                  name="jobType"
                  value={form.jobType}
                  onChange={updateField}
                >
                  <option value="">Select job type</option>
                  {JOB_TYPES.map((type) => (
                    <option key={type} value={type}>
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
                    <option key={status} value={status}>
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

              <Field label="Job posting URL">
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

            <Field label="Notes">
              <textarea
                className={`${inputClass} min-h-24 resize-y`}
                name="notes"
                value={form.notes}
                onChange={updateField}
                placeholder="Recruiter details, interview preparation, follow-up reminders..."
                maxLength={2000}
                rows={3}
              />
            </Field>

            <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel edit
                </button>
              )}

              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Save changes"
                    : "Save application"}
              </button>
            </div>
          </form>
        </section>

        <section className="space-y-5">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Your applications
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Review and manage every opportunity in your pipeline.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_200px_200px]">
            <div className="relative">
              <span
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              >
                ⌕
              </span>
              <input
                className={`${inputClass} pl-10`}
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
              <option value="All">All statuses</option>
              {STATUSES.map((status) => (
                <option key={status} value={status}>
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
              <option value="All">All job types</option>
              {JOB_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
              <option value="">Unspecified type</option>
            </select>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
              <p className="mt-4 text-sm text-slate-500">
                Loading your applications...
              </p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-2xl text-teal-700">
                ↗
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-900">
                {jobs.length === 0
                  ? "Your journey starts here"
                  : "No matching applications"}
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                {jobs.length === 0
                  ? "Add your first job application above. CareerPilot will help you keep its details and progress organized."
                  : "Try another search term or change your filters to find an application."}
              </p>
              {jobs.length === 0 && (
                <button
                  type="button"
                  onClick={() =>
                    document.getElementById("job-form")?.scrollIntoView({
                      behavior: "smooth",
                    })
                  }
                  className="mt-5 rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
                >
                  Add your first application
                </button>
              )}
            </div>
          ) : (
            <>
              <p className="text-sm text-slate-500">
                Showing {filteredJobs.length} of {jobs.length} application
                {jobs.length === 1 ? "" : "s"}
              </p>

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                {filteredJobs.map((job) => (
                  <article
                    key={job._id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-teal-200 hover:shadow-md sm:p-6"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-lg font-bold text-teal-700">
                        {(job.company || "?").charAt(0).toUpperCase()}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="break-words text-lg font-bold text-slate-900">
                          {job.position}
                        </h3>
                        <p className="mt-0.5 break-words text-sm font-medium text-slate-500">
                          {job.company}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
                          STATUS_STYLES[job.status] ||
                          "bg-slate-100 text-slate-700 ring-slate-200"
                        }`}
                      >
                        {job.status}
                      </span>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-xs text-slate-500">Location</p>
                        <p className="mt-1 break-words text-sm font-medium text-slate-800">
                          {job.location || "Not specified"}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-xs text-slate-500">Job type</p>
                        <p className="mt-1 break-words text-sm font-medium text-slate-800">
                          {job.jobType || "Not specified"}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-xs text-slate-500">Salary</p>
                        <p className="mt-1 break-words text-sm font-medium text-slate-800">
                          {job.salary || "Not specified"}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-xs text-slate-500">Applied on</p>
                        <p className="mt-1 text-sm font-medium text-slate-800">
                          {formatDate(job.appliedDate)}
                        </p>
                      </div>
                    </div>

                    {job.notes && (
                      <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">
                        {job.notes}
                      </p>
                    )}

                    {job.jobUrl && (
                      <a
                        href={job.jobUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-4 inline-flex text-sm font-semibold text-teal-700 hover:text-teal-900 hover:underline"
                      >
                        View job posting ↗
                      </a>
                    )}

                    <div className="mt-5 border-t border-slate-100 pt-4">
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Update status
                      </label>
                      <select
                        className={inputClass}
                        value={job.status}
                        disabled={
                          updatingId === job._id || deletingId === job._id
                        }
                        onChange={(event) =>
                          handleStatusChange(job, event.target.value)
                        }
                        aria-label={`Update status for ${job.position} at ${job.company}`}
                      >
                        {STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>

                      {updatingId === job._id && (
                        <p className="mt-2 text-xs text-slate-500">
                          Updating status...
                        </p>
                      )}

                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => startEditing(job)}
                          disabled={deletingId === job._id}
                          className="rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:border-teal-300 hover:bg-teal-50 disabled:opacity-50"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(job)}
                          disabled={
                            deletingId === job._id ||
                            updatingId === job._id
                          }
                          className="rounded-lg border border-rose-200 px-3.5 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
                        >
                          {deletingId === job._id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </section>

        <footer className="border-t border-slate-200 py-5 text-center text-xs text-slate-400">
          CareerPilot · Every application is a step forward.
        </footer>
      </div>
    </main>
  );
}
