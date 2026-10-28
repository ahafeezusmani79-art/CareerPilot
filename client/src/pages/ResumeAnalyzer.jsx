import { useState } from "react";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? "" : "http://localhost:5000");

const API_URL = `${API_BASE_URL}/api/ai`;
const RESUME_API_URL = `${API_BASE_URL}/api/resumes`;

function ResultContent({ value }) {
  if (value === null || value === undefined) {
    return <p className="text-slate-400">No result provided.</p>;
  }

  if (typeof value === "boolean") {
    return (
      <span
        className={
          value
            ? "font-semibold text-emerald-300"
            : "font-semibold text-amber-300"
        }
      >
        {value ? "Yes" : "No"}
      </span>
    );
  }

  if (typeof value === "string" || typeof value === "number") {
    return (
      <p className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-200 sm:text-base">
        {String(value)}
      </p>
    );
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <p className="text-sm text-slate-400">No items available.</p>;
    }

    return (
      <ul className="list-disc space-y-3 pl-5 text-slate-200 marker:text-violet-400">
        {value.map((item, index) => (
          <li key={index} className="break-words pl-1 leading-7">
            <ResultContent value={item} />
          </li>
        ))}
      </ul>
    );
  }

  if (typeof value === "object") {
    return (
      <div className="space-y-4">
        {Object.entries(value).map(([key, item]) => (
          <div
            key={key}
            className="rounded-xl border border-white/[0.08] bg-[#0b1020] p-4 sm:p-5"
          >
            <h4 className="mb-3 text-sm font-bold capitalize tracking-wide text-violet-300 sm:text-base">
              {key.replace(/_/g, " ")}
            </h4>

            <ResultContent value={item} />
          </div>
        ))}
      </div>
    );
  }

  return <p className="break-words text-slate-200">{String(value)}</p>;
}

function SectionHeading({ eyebrow, title, description }) {
  return (
    <div>
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-violet-300">
        {eyebrow}
      </p>

      <h2 className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">
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

function ErrorMessage({ children }) {
  if (!children) return null;

  return (
    <div
      role="alert"
      className="rounded-xl border border-rose-400/20 bg-rose-400/[0.08] px-4 py-3 text-sm leading-6 text-rose-200"
    >
      {children}
    </div>
  );
}

// Convert saved Resume Builder fields into readable text.
// Handles strings, arrays, and objects without displaying [object Object].
function formatResumeValue(value) {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "string" || typeof value === "number") {
    return String(value).trim();
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => formatResumeValue(item))
      .filter(Boolean)
      .join("\n");
  }

  if (typeof value === "object") {
    return Object.entries(value)
      .map(([key, item]) => {
        const formattedValue = formatResumeValue(item);

        if (!formattedValue) {
          return "";
        }

        return `${key.replace(/_/g, " ")}: ${formattedValue}`;
      })
      .filter(Boolean)
      .join("\n");
  }

  return "";
}

function buildResumeText(resume) {
  const sections = [
    { label: "Full Name", value: resume.name },
    { label: "Email", value: resume.email },
    { label: "Phone", value: resume.phone },
    { label: "Professional Title", value: resume.title },
    { label: "Professional Summary", value: resume.summary },
    { label: "Education", value: resume.education },
    { label: "Skills", value: resume.skills },
    { label: "Work Experience", value: resume.experience },
    { label: "Projects", value: resume.projects },
  ];

  return sections
    .map(({ label, value }) => {
      const formattedValue = formatResumeValue(value);

      if (!formattedValue) {
        return "";
      }

      return `${label}\n${formattedValue}`;
    })
    .filter(Boolean)
    .join("\n\n");
}

export default function ResumeAnalyzer() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  const [analysis, setAnalysis] = useState(null);
  const [improvements, setImprovements] = useState(null);

  const [error, setError] = useState("");
  const [improveError, setImproveError] = useState("");

  const [loading, setLoading] = useState(false);
  const [improveLoading, setImproveLoading] = useState(false);

  // Saved Resume Builder integration states
  const [savedResumeLoading, setSavedResumeLoading] = useState(false);
  const [savedResumeMessage, setSavedResumeMessage] = useState("");
  const [savedResumeError, setSavedResumeError] = useState("");

  // Load the logged-in user's saved resume from MongoDB.
  async function handleLoadSavedResume() {
    setSavedResumeLoading(true);
    setSavedResumeMessage("");
    setSavedResumeError("");

    try {
      const response = await fetch(RESUME_API_URL, {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(
            "Your session has expired. Please log in again and retry."
          );
        }

        throw new Error(
          data.message ||
            data.detail ||
            "Could not load your saved resume. Please try again."
        );
      }

      const savedResume = data.resume ?? data.data?.resume ?? null;

      if (!savedResume) {
        setSavedResumeMessage(
          "No saved resume was found. Open Resume Builder, save your resume, and try again."
        );
        return;
      }

      const formattedResume = buildResumeText(savedResume);

      if (!formattedResume.trim()) {
        setSavedResumeMessage(
          "Your saved resume is empty. Add some details in Resume Builder and save it first."
        );
        return;
      }

      const wasTruncated = formattedResume.length > 15000;
      const resumeToLoad = formattedResume.slice(0, 15000);

      setResumeText(resumeToLoad);

      // Clear old results so they are not confused with the newly loaded resume.
      setAnalysis(null);
      setImprovements(null);
      setError("");
      setImproveError("");

      setSavedResumeMessage(
        wasTruncated
          ? "Your saved resume was loaded. It was shortened to the 15,000-character limit; review it before analyzing."
          : "Your saved resume was loaded successfully! You can edit it before analyzing."
      );
    } catch (err) {
      setSavedResumeError(
        err.message ||
          "Could not connect to CareerPilot. Make sure the backend is running."
      );
    } finally {
      setSavedResumeLoading(false);
    }
  }

  function validateInput() {
    if (resumeText.trim().length < 50) {
      return "Please enter at least 50 characters of resume text.";
    }

    if (resumeText.length > 15000) {
      return "Resume text cannot exceed 15000 characters.";
    }

    if (jobDescription.length > 10000) {
      return "Job description cannot exceed 10000 characters.";
    }

    return "";
  }

  async function handleAnalyze(event) {
    event.preventDefault();

    setError("");
    setAnalysis(null);

    const validationError = validateInput();

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/analyze`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resume_text: resumeText.trim(),
          job_description: jobDescription.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.detail ||
            "Resume analysis failed. Please try again."
        );
      }

      setAnalysis(data.analysis);
    } catch (err) {
      setError(
        err.message ||
          "Could not connect to CareerPilot. Check that your backend and Python service are running."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleImproveResume() {
    setImproveError("");
    setImprovements(null);

    const validationError = validateInput();

    if (validationError) {
      setImproveError(validationError);
      return;
    }

    setImproveLoading(true);

    try {
      const response = await fetch(`${API_URL}/improve-resume`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resume_text: resumeText.trim(),
          job_description: jobDescription.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.detail ||
            data.error ||
            "AI resume improvement failed. Please try again."
        );
      }

      if (data.improvements === undefined || data.improvements === null) {
        throw new Error(
          "The AI service returned no improvement suggestions. Please try again."
        );
      }

      setImprovements(data.improvements);
    } catch (err) {
      setImproveError(
        err.message ||
          "Could not connect to the AI service. Check your backend and Gemini API configuration."
      );
    } finally {
      setImproveLoading(false);
    }
  }

  const resumeLength = resumeText.length;
  const jobLength = jobDescription.length;
  const resumeValid = resumeText.trim().length >= 50;

  return (
    <main className="min-h-screen bg-[#080b16] px-4 py-7 text-white sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="relative mb-8 overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#19172f] via-[#111629] to-[#101321] p-6 shadow-2xl shadow-black/20 sm:p-9 lg:p-10">
          <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-violet-600/15 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-24 right-1/4 h-48 w-48 rounded-full bg-sky-500/10 blur-3xl" />

          <div className="relative">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-violet-200">
              <span className="h-2 w-2 rounded-full bg-violet-400" />
              CareerPilot AI
            </div>

            <h1 className="max-w-3xl text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
              Make your resume
              <span className="block bg-gradient-to-r from-violet-300 via-purple-300 to-sky-300 bg-clip-text text-transparent">
                stand out.
              </span>
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              Discover your resume&apos;s strengths, identify gaps, and get
              practical suggestions to better match your target role.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-300">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-4 w-4"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      d="m5 12 4 4L19 6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>

                <div>
                  <p className="text-sm font-bold text-white">Free analysis</p>
                  <p className="text-xs text-slate-400">Python powered</p>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-400/10 text-violet-300">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-4 w-4"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path
                      d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-2-5.8L4 11l6-2.2L12 3Z"
                      strokeLinejoin="round"
                    />
                    <path
                      d="m19 15 .9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15Z"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>

                <div>
                  <p className="text-sm font-bold text-white">AI suggestions</p>
                  <p className="text-xs text-slate-400">Gemini endpoint</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <form
          onSubmit={handleAnalyze}
          className="rounded-3xl border border-white/[0.08] bg-gradient-to-b from-[#151a2b] to-[#101422] p-5 shadow-xl shadow-black/20 sm:p-8 lg:p-9"
        >
          <SectionHeading
            eyebrow="Step 01 · Your information"
            title="Let's review your resume"
            description="Load your saved Resume Builder content or paste a resume below. Add a job description for role-specific feedback."
          />

          {/* Load Saved Resume */}
          <div className="mt-6 rounded-2xl border border-violet-400/20 bg-violet-400/[0.05] p-4 sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-bold text-white">
                  Use your saved resume
                </h3>

                <p className="mt-1 text-sm leading-6 text-slate-400">
                  Load your resume from Resume Builder without copying and
                  pasting it manually.
                </p>
              </div>

              <button
                type="button"
                onClick={handleLoadSavedResume}
                disabled={savedResumeLoading || loading || improveLoading}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-violet-400/30 bg-violet-500/15 px-4 py-3 text-sm font-bold text-violet-200 transition hover:border-violet-300/60 hover:bg-violet-500/25 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savedResumeLoading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-violet-200/30 border-t-violet-200" />
                    Loading resume...
                  </>
                ) : (
                  <>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className="h-5 w-5"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path
                        d="M12 16V4m0 0L7 9m5-5 5 5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M5 14v5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Load My Saved Resume
                  </>
                )}
              </button>
            </div>

            {savedResumeMessage && (
              <p
                role="status"
                className="mt-3 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06] px-3 py-2 text-sm leading-6 text-emerald-200"
              >
                {savedResumeMessage}
              </p>
            )}

            <ErrorMessage>{savedResumeError}</ErrorMessage>
          </div>

          <div className="mt-7 space-y-6">
            <div>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <label
                  htmlFor="resumeText"
                  className="text-sm font-bold text-slate-100 sm:text-base"
                >
                  Resume text <span className="text-violet-300">*</span>
                </label>

                <span
                  className={`text-xs font-semibold ${
                    resumeLength > 15000
                      ? "text-rose-300"
                      : resumeValid
                        ? "text-emerald-300"
                        : "text-slate-400"
                  }`}
                >
                  {resumeLength.toLocaleString()}/15,000
                </span>
              </div>

              <textarea
                id="resumeText"
                value={resumeText}
                onChange={(event) => setResumeText(event.target.value)}
                placeholder="Paste your resume here, including your professional summary, skills, education, projects, and experience..."
                rows={10}
                maxLength={15000}
                required
                className="w-full resize-y rounded-2xl border border-white/10 bg-[#090d19] p-4 text-sm leading-7 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-violet-400/70 focus:ring-4 focus:ring-violet-500/10 sm:p-5 sm:text-base"
              />

              <div className="mt-2 flex items-center justify-between gap-3">
                <p className="text-xs leading-5 text-slate-400">
                  Minimum 50 characters required.
                </p>

                <div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/[0.08]">
                  <div
                    className={`h-full rounded-full transition-all ${
                      resumeValid ? "bg-emerald-400" : "bg-violet-400"
                    }`}
                    style={{
                      width: `${Math.min(100, (resumeLength / 15000) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <label
                  htmlFor="jobDescription"
                  className="text-sm font-bold text-slate-100 sm:text-base"
                >
                  Target job description
                  <span className="ml-2 text-xs font-medium text-slate-400">
                    Optional
                  </span>
                </label>

                <span className="text-xs font-semibold text-slate-400">
                  {jobLength.toLocaleString()}/10,000
                </span>
              </div>

              <textarea
                id="jobDescription"
                value={jobDescription}
                onChange={(event) => setJobDescription(event.target.value)}
                placeholder="Paste the job requirements here to help compare your resume with the role..."
                rows={5}
                maxLength={10000}
                className="w-full resize-y rounded-2xl border border-white/10 bg-[#090d19] p-4 text-sm leading-7 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-sky-400/70 focus:ring-4 focus:ring-sky-500/10 sm:p-5 sm:text-base"
              />

              <p className="mt-2 text-xs leading-5 text-slate-400">
                Including the job description can help you focus your
                improvement efforts.
              </p>
            </div>

            <ErrorMessage>{error}</ErrorMessage>

            <button
              type="submit"
              disabled={loading || improveLoading}
              className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-4 text-sm font-extrabold text-white shadow-lg shadow-violet-950/30 transition hover:from-violet-500 hover:to-indigo-500 focus:outline-none focus:ring-4 focus:ring-violet-400/20 disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
            >
              {loading ? (
                <>
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Analyzing your resume...
                </>
              ) : (
                <>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-5 w-5"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      d="M9 3h6l1 3h3v14H5V6h3l1-3Z"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M9 12h6M9 16h6M9 8h2"
                      strokeLinecap="round"
                    />
                  </svg>
                  Analyze Resume — Free
                  <span className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </>
              )}
            </button>

            <div className="flex items-center gap-4 py-1">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                Or go further
              </span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <ErrorMessage>{improveError}</ErrorMessage>

            <button
              type="button"
              onClick={handleImproveResume}
              disabled={improveLoading || loading}
              className="group flex w-full items-center justify-center gap-3 rounded-2xl border border-sky-400/25 bg-gradient-to-r from-sky-400/[0.09] to-violet-400/[0.09] px-6 py-4 text-sm font-extrabold text-sky-200 transition hover:border-sky-300/50 hover:from-sky-400/[0.15] hover:to-violet-400/[0.15] focus:outline-none focus:ring-4 focus:ring-sky-400/10 disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
            >
              {improveLoading ? (
                <>
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-sky-200/30 border-t-sky-200" />
                  Generating improvement suggestions...
                </>
              ) : (
                <>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-5 w-5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path
                      d="m12 3 2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4L12 3Z"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Improve My Resume with AI
                  <span className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </>
              )}
            </button>

            <p className="text-center text-xs leading-6 text-slate-400">
              Free analysis runs through your Python service. AI improvement
              uses your configured Gemini API and may be subject to its usage
              limits. No OpenAI API is used by this page.
            </p>
          </div>
        </form>

        {analysis !== null && analysis !== undefined && (
          <section
            aria-live="polite"
            className="mt-8 rounded-3xl border border-emerald-400/20 bg-gradient-to-b from-[#121e25] to-[#101522] p-5 shadow-xl sm:p-8 lg:p-9"
          >
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4 border-b border-white/[0.08] pb-6">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
                  Analysis complete
                </p>

                <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                  Your Resume Analysis
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Review your results and identify your next improvements.
                </p>
              </div>

              <span className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs font-bold text-emerald-200">
                FREE REPORT
              </span>
            </div>

            <ResultContent value={analysis} />

            <button
              type="button"
              onClick={() => {
                setAnalysis(null);
                setError("");
              }}
              className="mt-7 rounded-xl border border-white/10 px-4 py-3 text-sm font-bold text-slate-300 transition hover:border-emerald-300/40 hover:bg-white/[0.04] hover:text-white"
            >
              Clear Free Analysis
            </button>
          </section>
        )}

        {improvements !== null && improvements !== undefined && (
          <section
            aria-live="polite"
            className="mt-8 rounded-3xl border border-sky-400/20 bg-gradient-to-b from-[#121b2b] to-[#101522] p-5 shadow-xl sm:p-8 lg:p-9"
          >
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4 border-b border-white/[0.08] pb-6">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-sky-300">
                  AI suggestions ready
                </p>

                <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                  Your Resume Improvement Plan
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Use the suggestions that fit your real experience and
                  achievements. Your saved Resume Builder content has not been
                  changed.
                </p>
              </div>

              <span className="rounded-xl border border-sky-400/20 bg-sky-400/10 px-3 py-2 text-xs font-bold text-sky-200">
                AI REPORT
              </span>
            </div>

            <ResultContent value={improvements} />

            <button
              type="button"
              onClick={() => {
                setImprovements(null);
                setImproveError("");
              }}
              className="mt-7 rounded-xl border border-white/10 px-4 py-3 text-sm font-bold text-slate-300 transition hover:border-sky-300/40 hover:bg-white/[0.04] hover:text-white"
            >
              Clear AI Suggestions
            </button>
          </section>
        )}

        <footer className="pb-4 pt-8 text-center">
          <p className="text-xs leading-6 text-slate-500">
            CareerPilot · Build a stronger resume, one step at a time.
          </p>
        </footer>
      </div>
    </main>
  );
}