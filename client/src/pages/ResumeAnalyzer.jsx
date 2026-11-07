
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
      <span className={value ? "font-semibold text-emerald-300" : "font-semibold text-amber-300"}>
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
            className="rounded-2xl border border-white/[0.07] bg-[#0b1020]/80 p-4 shadow-[inset_3px_3px_8px_rgba(0,0,0,0.2),inset_-2px_-2px_7px_rgba(255,255,255,0.015)] sm:p-5"
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
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
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

function formatResumeValue(value) {
  if (value === null || value === undefined) return "";

  if (typeof value === "string" || typeof value === "number") {
    return String(value).trim();
  }

  if (Array.isArray(value)) {
    return value.map(formatResumeValue).filter(Boolean).join("\n");
  }

  if (typeof value === "object") {
    return Object.entries(value)
      .map(([key, item]) => {
        const formattedValue = formatResumeValue(item);
        return formattedValue
          ? `${key.replace(/_/g, " ")}: ${formattedValue}`
          : "";
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
      return formattedValue ? `${label}\n${formattedValue}` : "";
    })
    .filter(Boolean)
    .join("\n\n");
}

function Icon({ children, className = "h-5 w-5" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function FeatureCard({ icon, title, description, color }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-[#101729]/75 p-4 shadow-[5px_5px_15px_rgba(0,0,0,0.2),-3px_-3px_12px_rgba(255,255,255,0.015)] transition duration-300 hover:-translate-y-1 hover:border-white/[0.12]">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-bold text-white">{title}</p>
        <p className="mt-1 text-xs text-slate-400">{description}</p>
      </div>
    </div>
  );
}

function ReportSection({ children, type }) {
  const styles =
    type === "analysis"
      ? "border-emerald-400/20 from-[#132322] to-[#101522]"
      : "border-sky-400/20 from-[#142033] to-[#101522]";

  return (
    <section
      aria-live="polite"
      className={`mt-8 overflow-hidden rounded-3xl border bg-gradient-to-br ${styles} p-5 shadow-[12px_12px_30px_rgba(0,0,0,0.25),-4px_-4px_20px_rgba(255,255,255,0.015)] transition duration-300 sm:p-8 lg:p-9`}
    >
      {children}
    </section>
  );
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

  const [savedResumeLoading, setSavedResumeLoading] = useState(false);
  const [savedResumeMessage, setSavedResumeMessage] = useState("");
  const [savedResumeError, setSavedResumeError] = useState("");

  async function handleLoadSavedResume() {
    setSavedResumeLoading(true);
    setSavedResumeMessage("");
    setSavedResumeError("");

    try {
      const response = await fetch(RESUME_API_URL, {
        method: "GET",
        credentials: "include",
        headers: { Accept: "application/json" },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Your session has expired. Please log in again and retry.");
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
      setResumeText(formattedResume.slice(0, 15000));

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
        headers: { "Content-Type": "application/json" },
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
        headers: { "Content-Type": "application/json" },
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

  const textareaClass =
    "w-full resize-y rounded-2xl border border-white/[0.08] bg-[#090e1c] p-4 text-sm leading-7 text-slate-100 shadow-[inset_5px_5px_12px_rgba(0,0,0,0.35),inset_-3px_-3px_10px_rgba(255,255,255,0.015)] outline-none transition duration-300 placeholder:text-slate-500 focus:border-violet-400/60 focus:ring-4 focus:ring-violet-500/10 sm:p-5 sm:text-base";

  const buttonClass =
    "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition duration-300 disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#080b16] px-4 py-7 text-white sm:px-6 sm:py-10 lg:px-8">
      <div className="pointer-events-none absolute -left-40 top-40 h-96 w-96 rounded-full bg-violet-700/[0.07] blur-[120px]" />
      <div className="pointer-events-none absolute -right-40 top-[650px] h-96 w-96 rounded-full bg-sky-600/[0.06] blur-[120px]" />

      <div className="relative mx-auto max-w-6xl">
        {/* Hero */}
        <header className="relative mb-8 overflow-hidden rounded-[2rem] border border-white/[0.08] bg-gradient-to-br from-[#1b1935] via-[#12182a] to-[#101522] p-6 shadow-[15px_15px_40px_rgba(0,0,0,0.3),-5px_-5px_25px_rgba(255,255,255,0.015)] sm:p-9 lg:p-10">
          <div className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full bg-violet-600/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 right-1/4 h-52 w-52 rounded-full bg-sky-500/10 blur-3xl" />

          <div className="relative">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-violet-200">
              <span className="h-2 w-2 animate-pulse rounded-full bg-violet-400" />
              CareerPilot AI Studio
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

            <div className="mt-7 grid max-w-xl gap-3 sm:grid-cols-2">
              <FeatureCard
                color="bg-emerald-400/10 text-emerald-300"
                title="Free analysis"
                description="Python powered"
                icon={
                  <Icon>
                    <path d="m5 12 4 4L19 6" />
                  </Icon>
                }
              />
              <FeatureCard
                color="bg-violet-400/10 text-violet-300"
                title="AI suggestions"
                description="Gemini endpoint"
                icon={
                  <Icon>
                    <path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-2-5.8L4 11l6-2.2L12 3Z" />
                    <path d="m19 15 .9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15Z" />
                  </Icon>
                }
              />
            </div>
          </div>
        </header>

        {/* Input workspace */}
        <form
          onSubmit={handleAnalyze}
          className="rounded-[2rem] border border-white/[0.08] bg-gradient-to-br from-[#151b2d] to-[#101522] p-5 shadow-[12px_12px_35px_rgba(0,0,0,0.25),-4px_-4px_20px_rgba(255,255,255,0.015)] sm:p-8 lg:p-9"
        >
          <SectionHeading
            eyebrow="Step 01 · Your information"
            title="Let's review your resume"
            description="Load your saved Resume Builder content or paste a resume below. Add a job description for role-specific feedback."
          />

          {/* Saved resume */}
          <div className="mt-7 rounded-2xl border border-violet-400/20 bg-gradient-to-r from-violet-500/[0.08] to-indigo-500/[0.04] p-4 shadow-[inset_3px_3px_10px_rgba(0,0,0,0.12)] sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-400/10 text-violet-300">
                    <Icon>
                      <path d="M12 16V4m0 0L7 9m5-5 5 5" />
                      <path d="M5 14v5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5" />
                    </Icon>
                  </span>
                  <h3 className="font-bold text-white">Use your saved resume</h3>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Load your resume from Resume Builder without copying and pasting it manually.
                </p>
              </div>

              <button
                type="button"
                onClick={handleLoadSavedResume}
                disabled={savedResumeLoading || loading || improveLoading}
                className={`${buttonClass} shrink-0 border border-violet-400/30 bg-violet-500/15 text-violet-200 hover:border-violet-300/60 hover:bg-violet-500/25`}
              >
                {savedResumeLoading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-violet-200/30 border-t-violet-200" />
                    Loading resume...
                  </>
                ) : (
                  <>
                    <Icon>
                      <path d="M12 16V4m0 0L7 9m5-5 5 5" />
                      <path d="M5 14v5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5" />
                    </Icon>
                    Load My Saved Resume
                  </>
                )}
              </button>
            </div>

            {savedResumeMessage && (
              <p
                role="status"
                className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06] px-3 py-2 text-sm leading-6 text-emerald-200"
              >
                {savedResumeMessage}
              </p>
            )}
            <div className="mt-3">
              <ErrorMessage>{savedResumeError}</ErrorMessage>
            </div>
          </div>

          <div className="mt-8 space-y-7">
            {/* Resume text */}
            <div>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <label htmlFor="resumeText" className="text-sm font-bold text-slate-100 sm:text-base">
                  Resume text <span className="text-violet-300">*</span>
                </label>
                <span className={`text-xs font-semibold ${resumeLength > 15000 ? "text-rose-300" : resumeValid ? "text-emerald-300" : "text-slate-400"}`}>
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
                className={textareaClass}
              />

              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="text-xs leading-5 text-slate-400">
                  Minimum 50 characters required.
                </p>
                <div className="h-1.5 w-28 overflow-hidden rounded-full bg-white/[0.08]">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${resumeValid ? "bg-emerald-400" : "bg-violet-400"}`}
                    style={{ width: `${Math.min(100, (resumeLength / 15000) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Job description */}
            <div>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <label htmlFor="jobDescription" className="text-sm font-bold text-slate-100 sm:text-base">
                  Target job description
                  <span className="ml-2 text-xs font-medium text-slate-400">Optional</span>
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
                className={`${textareaClass} focus:border-sky-400/60 focus:ring-sky-500/10`}
              />

              <p className="mt-3 text-xs leading-5 text-slate-400">
                Including the job description can help you focus your improvement efforts.
              </p>
            </div>

            <ErrorMessage>{error}</ErrorMessage>

            {/* Analyze button */}
            <button
              type="submit"
              disabled={loading || improveLoading}
              className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-4 text-sm font-extrabold text-white shadow-[0_8px_25px_rgba(109,40,217,0.2)] transition duration-300 hover:-translate-y-0.5 hover:from-violet-500 hover:to-indigo-500 hover:shadow-[0_12px_30px_rgba(109,40,217,0.3)] focus:outline-none focus:ring-4 focus:ring-violet-400/20 disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
            >
              {loading ? (
                <>
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Analyzing your resume...
                </>
              ) : (
                <>
                  <Icon>
                    <path d="M9 3h6l1 3h3v14H5V6h3l1-3Z" />
                    <path d="M9 12h6M9 16h6M9 8h2" />
                  </Icon>
                  Analyze Resume — Free
                  <span className="transition-transform group-hover:translate-x-1">→</span>
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

            {/* Improve button */}
            <button
              type="button"
              onClick={handleImproveResume}
              disabled={improveLoading || loading}
              className="group flex w-full items-center justify-center gap-3 rounded-2xl border border-sky-400/25 bg-gradient-to-r from-sky-400/[0.09] to-violet-400/[0.09] px-6 py-4 text-sm font-extrabold text-sky-200 transition duration-300 hover:-translate-y-0.5 hover:border-sky-300/50 hover:from-sky-400/[0.15] hover:to-violet-400/[0.15] focus:outline-none focus:ring-4 focus:ring-sky-400/10 disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
            >
              {improveLoading ? (
                <>
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-sky-200/30 border-t-sky-200" />
                  Generating improvement suggestions...
                </>
              ) : (
                <>
                  <Icon>
                    <path d="m12 3 2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4L12 3Z" />
                  </Icon>
                  Improve My Resume with AI
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </>
              )}
            </button>

            <p className="text-center text-xs leading-6 text-slate-400">
              Free analysis runs through your Python service. AI improvement uses your configured Gemini API and may be subject to its usage limits. No OpenAI API is used by this page.
            </p>
          </div>
        </form>

        {/* Free analysis report */}
        {analysis !== null && analysis !== undefined && (
          <ReportSection type="analysis">
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
              className="mt-7 rounded-xl border border-white/10 px-4 py-3 text-sm font-bold text-slate-300 transition duration-300 hover:border-emerald-300/40 hover:bg-white/[0.04] hover:text-white"
            >
              Clear Free Analysis
            </button>
          </ReportSection>
        )}

        {/* AI improvement report */}
        {improvements !== null && improvements !== undefined && (
          <ReportSection type="improvements">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4 border-b border-white/[0.08] pb-6">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-sky-300">
                  AI suggestions ready
                </p>
                <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                  Your Resume Improvement Plan
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Use the suggestions that fit your real experience and achievements. Your saved Resume Builder content has not been changed.
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
              className="mt-7 rounded-xl border border-white/10 px-4 py-3 text-sm font-bold text-slate-300 transition duration-300 hover:border-sky-300/40 hover:bg-white/[0.04] hover:text-white"
            >
              Clear AI Suggestions
            </button>
          </ReportSection>
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
