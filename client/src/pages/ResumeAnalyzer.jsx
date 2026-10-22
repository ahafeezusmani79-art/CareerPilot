import { useState } from "react";

const API_URL = "http://localhost:5000/api/ai";

export default function ResumeAnalyzer() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  const [analysis, setAnalysis] = useState(null);
  const [improvements, setImprovements] = useState(null);

  const [error, setError] = useState("");
  const [improveError, setImproveError] = useState("");

  const [loading, setLoading] = useState(false);
  const [improveLoading, setImproveLoading] = useState(false);

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

      if (
        data.improvements === undefined ||
        data.improvements === null
      ) {
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

  function renderResult(value) {
    if (value === null || value === undefined) {
      return (
        <p className="text-base font-medium leading-7 text-slate-200">
          No result provided.
        </p>
      );
    }

    if (typeof value === "string" || typeof value === "number") {
      return (
        <p className="whitespace-pre-wrap break-words text-base font-medium leading-7 text-white">
          {String(value)}
        </p>
      );
    }

    if (typeof value === "boolean") {
      return (
        <span className="font-bold text-emerald-300">
          {value ? "Yes" : "No"}
        </span>
      );
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return (
          <p className="text-base text-slate-300">
            No items available.
          </p>
        );
      }

      return (
        <ul className="mt-3 list-disc space-y-3 pl-6 text-base leading-7 text-white marker:text-emerald-400">
          {value.map((item, index) => (
            <li key={index}>{renderResult(item)}</li>
          ))}
        </ul>
      );
    }

    if (typeof value === "object") {
      return (
        <div className="mt-3 space-y-4">
          {Object.entries(value).map(([key, item]) => (
            <div
              key={key}
              className="rounded-xl border border-slate-700 bg-slate-950 p-4 sm:p-5"
            >
              <h4 className="mb-3 text-lg font-bold capitalize text-emerald-300">
                {key.replace(/_/g, " ")}
              </h4>

              <div className="break-words text-white">
                {renderResult(item)}
              </div>
            </div>
          ))}
        </div>
      );
    }

    return <span className="text-white">{String(value)}</span>;
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-white sm:px-6">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8">
          <p className="mb-3 text-sm font-bold uppercase tracking-widest text-emerald-400">
            CareerPilot AI
          </p>

          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Resume Analyzer
          </h1>

          <p className="mt-3 text-base leading-7 text-slate-300">
            Analyze your resume for free, then use AI-powered suggestions
            to strengthen your content and target a specific job.
          </p>
        </header>

        <form
          onSubmit={handleAnalyze}
          className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl sm:p-8"
        >
          <div>
            <label
              htmlFor="resumeText"
              className="mb-2 block text-base font-bold text-white"
            >
              Resume text{" "}
              <span className="text-emerald-400">*</span>
            </label>

            <textarea
              id="resumeText"
              value={resumeText}
              onChange={(event) => setResumeText(event.target.value)}
              placeholder="Paste your resume here, including your skills, education, projects, and experience..."
              rows={10}
              maxLength={15000}
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-4 text-base leading-7 text-white placeholder:text-slate-400 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
            />

            <p className="mt-2 text-right text-sm font-medium text-slate-300">
              {resumeText.length}/15000 characters
            </p>
          </div>

          <div>
            <label
              htmlFor="jobDescription"
              className="mb-2 block text-base font-bold text-white"
            >
              Job description{" "}
              <span className="font-normal text-slate-300">
                (optional)
              </span>
            </label>

            <textarea
              id="jobDescription"
              value={jobDescription}
              onChange={(event) =>
                setJobDescription(event.target.value)
              }
              placeholder="Paste the job description to compare it with your resume..."
              rows={5}
              maxLength={10000}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-4 text-base leading-7 text-white placeholder:text-slate-400 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
            />

            <p className="mt-2 text-right text-sm font-medium text-slate-300">
              {jobDescription.length}/10000 characters
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-400/40 bg-red-500/10 p-4 text-base font-semibold leading-7 text-red-200"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-emerald-400 px-6 py-3.5 text-base font-extrabold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Analyzing your resume..." : "Analyze Resume — Free"}
          </button>

          <div className="relative flex items-center gap-4">
            <div className="h-px flex-1 bg-slate-700" />
            <span className="text-sm font-semibold text-slate-400">
              OR
            </span>
            <div className="h-px flex-1 bg-slate-700" />
          </div>

          {improveError && (
            <div
              role="alert"
              className="rounded-xl border border-red-400/40 bg-red-500/10 p-4 text-base font-semibold leading-7 text-red-200"
            >
              {improveError}
            </div>
          )}

          <button
            type="button"
            onClick={handleImproveResume}
            disabled={improveLoading}
            className="w-full rounded-xl border border-cyan-400 bg-cyan-400/10 px-6 py-3.5 text-base font-extrabold text-cyan-200 transition hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {improveLoading
              ? "AI is improving your resume..."
              : "✨ Improve My Resume with AI"}
          </button>

          <p className="text-center text-sm font-medium leading-6 text-slate-300">
            Free analysis uses your Python service. AI improvement uses
            your configured Gemini API and may be subject to its usage
            limits. No OpenAI API is used by this page.
          </p>
        </form>

        {analysis !== null && analysis !== undefined && (
          <section
            aria-live="polite"
            className="mt-8 rounded-2xl border border-emerald-400/40 bg-slate-900 p-5 shadow-xl sm:p-8"
          >
            <div className="mb-6 border-b border-slate-700 pb-5">
              <p className="mb-2 text-sm font-bold uppercase tracking-widest text-emerald-400">
                Free analysis complete
              </p>

              <h2 className="text-3xl font-extrabold tracking-tight text-emerald-300">
                Your Resume Analysis
              </h2>

              <p className="mt-2 text-base leading-7 text-slate-300">
                Review the feedback below to identify areas for improvement.
              </p>
            </div>

            <div className="break-words text-base leading-7 text-white">
              {renderResult(analysis)}
            </div>

            <button
              type="button"
              onClick={() => {
                setAnalysis(null);
                setError("");
              }}
              className="mt-7 rounded-xl border border-slate-600 px-5 py-3 text-base font-bold text-white transition hover:border-emerald-400 hover:bg-slate-800"
            >
              Clear Free Analysis
            </button>
          </section>
        )}

        {improvements !== null && improvements !== undefined && (
          <section
            aria-live="polite"
            className="mt-8 rounded-2xl border border-cyan-400/40 bg-slate-900 p-5 shadow-xl sm:p-8"
          >
            <div className="mb-6 border-b border-slate-700 pb-5">
              <p className="mb-2 text-sm font-bold uppercase tracking-widest text-cyan-300">
                AI improvement complete
              </p>

              <h2 className="text-3xl font-extrabold tracking-tight text-cyan-200">
                Your Improved Resume Suggestions
              </h2>

              <p className="mt-2 text-base leading-7 text-slate-300">
                Review these suggestions and choose what you want to use.
                Your saved Resume Builder content has not been changed.
              </p>
            </div>

            <div className="break-words text-base leading-7 text-white">
              {renderResult(improvements)}
            </div>

            <button
              type="button"
              onClick={() => {
                setImprovements(null);
                setImproveError("");
              }}
              className="mt-7 rounded-xl border border-slate-600 px-5 py-3 text-base font-bold text-white transition hover:border-cyan-400 hover:bg-slate-800"
            >
              Clear AI Suggestions
            </button>
          </section>
        )}
      </div>
    </main>
  );
}