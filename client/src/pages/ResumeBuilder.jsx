
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? "" : "http://localhost:5000");

const initialData = {
  name: "",
  email: "",
  phone: "",
  title: "",
  summary: "",
  education: "",
  skills: "",
  experience: "",
  projects: "",
};

const resumeFields = Object.keys(initialData);

// Keep Field outside ResumeBuilder to preserve input focus while typing.
function Field({
  label,
  name,
  value,
  onChange,
  textarea = false,
  placeholder = "",
}) {
  const commonClasses =
    "mt-2 w-full rounded-xl border border-white/10 bg-[#0B1020] px-4 py-3 text-sm text-white outline-none transition duration-200 placeholder:text-slate-600 hover:border-white/20 focus:border-violet-400/60 focus:ring-2 focus:ring-violet-400/10";

  return (
    <div className="min-w-0">
      <label
        htmlFor={name}
        className="block text-sm font-medium text-slate-300"
      >
        {label}
      </label>

      {textarea ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={4}
          className={`${commonClasses} resize-y leading-6`}
        />
      ) : (
        <input
          id={name}
          name={name}
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={commonClasses}
        />
      )}
    </div>
  );
}

function SectionHeading({ children }) {
  return (
    <h2 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-300">
      <span className="h-4 w-1 rounded-full bg-gradient-to-b from-violet-400 to-sky-400" />
      {children}
    </h2>
  );
}

export default function ResumeBuilder() {
  const navigate = useNavigate();

  const [resume, setResume] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  // Load the logged-in user's saved resume.
  useEffect(() => {
    let cancelled = false;

    async function loadResume() {
      try {
        const response = await fetch(`${API_URL}/api/resumes`, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          if (response.status === 401) {
            navigate("/login", { replace: true });
            return;
          }

          throw new Error(data.message || "Could not load your resume.");
        }

        if (cancelled) return;

        if (data.resume) {
          const savedResume = {};

          resumeFields.forEach((field) => {
            savedResume[field] = data.resume[field] ?? "";
          });

          setResume(savedResume);
        } else {
          setResume(initialData);
        }
      } catch (error) {
        if (!cancelled) {
          setMessage(error.message || "Could not connect to the server.");
          setMessageType("error");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadResume();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  function handleChange(event) {
    const { name, value } = event.target;

    setResume((previousResume) => ({
      ...previousResume,
      [name]: value,
    }));

    setMessage("");
  }

  async function handleSave() {
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/api/resumes`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(resume),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          navigate("/login", { replace: true });
          return;
        }

        throw new Error(data.message || "Failed to save your resume.");
      }

      if (data.resume) {
        const savedResume = {};

        resumeFields.forEach((field) => {
          savedResume[field] = data.resume[field] ?? "";
        });

        setResume(savedResume);
      }

      setMessage(data.message || "Resume saved successfully!");
      setMessageType("success");
    } catch (error) {
      setMessage(error.message || "Could not connect to the server.");
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  const skills = resume.skills
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);

  const completedSections = [
    resume.name,
    resume.title,
    resume.email,
    resume.phone,
    resume.summary,
    resume.education,
    resume.skills,
    resume.experience,
    resume.projects,
  ].filter((value) => value.trim()).length;

  const completion = Math.round((completedSections / 9) * 100);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 bg-[#080B16] text-white">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-violet-400/20 border-t-violet-400" />
        <p className="text-sm text-slate-400">
          Loading your saved resume...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080B16] text-slate-100">
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }

          html, body {
            background: white !important;
            color: #111827 !important;
          }

          body * {
            visibility: hidden !important;
          }

          #resume-preview,
          #resume-preview * {
            visibility: visible !important;
          }

          #resume-preview {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            min-height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            background: white !important;
            color: #111827 !important;
            overflow: visible !important;
          }

          #resume-preview h1,
          #resume-preview h2,
          #resume-preview h3,
          #resume-preview p,
          #resume-preview span {
            color: #111827 !important;
          }

          #resume-preview .resume-divider {
            border-color: #d1d5db !important;
          }

          #resume-preview .resume-skill {
            border: 1px solid #d1d5db !important;
            background: white !important;
            color: #374151 !important;
          }

          #resume-preview .resume-title {
            color: #374151 !important;
          }

          #resume-preview .resume-accent {
            border-color: #6b7280 !important;
          }
        }
      `}</style>

      {/* Page heading */}
      <div className="mb-8 print:hidden">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-slate-300 transition hover:border-violet-400/30 hover:bg-violet-400/[0.06] hover:text-white"
          >
            <span aria-hidden="true">←</span>
            Back to Dashboard
          </Link>

          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/[0.06] px-3 py-2 text-xs font-medium text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Resume workspace
          </span>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#17172C] via-[#111526] to-[#0D1525] p-6 sm:p-8 lg:p-9">
          <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-violet-500/[0.10] blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 right-1/3 h-48 w-48 rounded-full bg-sky-500/[0.07] blur-3xl" />

          <div className="relative flex flex-col justify-between gap-7 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/[0.08] px-3 py-1.5 text-xs font-semibold text-violet-300">
                <span aria-hidden="true">✦</span>
                CAREERPILOT RESUME BUILDER
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Build your next{" "}
                <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-sky-400 bg-clip-text text-transparent">
                  opportunity.
                </span>
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">
                Create a professional resume, see your changes live, and
                save your progress securely to your account.
              </p>
            </div>

            <div className="relative w-full rounded-2xl border border-white/[0.08] bg-black/20 p-5 lg:max-w-[220px]">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-slate-300">
                  Profile details
                </span>
                <span className="text-lg font-bold text-violet-300">
                  {completion}%
                </span>
              </div>

              <div
                className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.08]"
                role="progressbar"
                aria-label="Resume details completed"
                aria-valuenow={completion}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-sky-400 transition-all duration-300"
                  style={{ width: `${completion}%` }}
                />
              </div>

              <p className="mt-3 text-xs leading-5 text-slate-500">
                Fill in your details to build your resume.
              </p>
            </div>
          </div>
        </div>

        {message && (
          <div
            role={messageType === "error" ? "alert" : "status"}
            className={`mt-5 flex items-start gap-3 rounded-xl border p-4 text-sm ${
              messageType === "error"
                ? "border-rose-400/20 bg-rose-400/[0.06] text-rose-300"
                : "border-emerald-400/20 bg-emerald-400/[0.06] text-emerald-300"
            }`}
          >
            <span className="text-base" aria-hidden="true">
              {messageType === "error" ? "!" : "✓"}
            </span>
            <p>{message}</p>
          </div>
        )}
      </div>

      {/* Editor and live preview */}
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        {/* Resume form */}
        <section className="min-w-0 overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-[#121827] to-[#0E1320] print:hidden">
          <div className="border-b border-white/[0.07] px-5 py-5 sm:px-7">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-violet-400/15 bg-violet-400/[0.08] text-xl text-violet-300">
                <span aria-hidden="true">✎</span>
              </div>

              <div>
                <h2 className="font-bold text-white">
                  Your Information
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Add your details below
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-7 p-5 sm:p-7">
            <div>
              <SectionHeading>Personal Details</SectionHeading>
              <div className="space-y-5">
                <Field
                  label="Full Name"
                  name="name"
                  value={resume.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                />

                <Field
                  label="Professional Title"
                  name="title"
                  value={resume.title}
                  onChange={handleChange}
                  placeholder="e.g. MERN Stack Developer"
                />

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    label="Email Address"
                    name="email"
                    value={resume.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                  />

                  <Field
                    label="Phone Number"
                    name="phone"
                    value={resume.phone}
                    onChange={handleChange}
                    placeholder="Your phone number"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-white/[0.06] pt-6">
              <SectionHeading>Professional Profile</SectionHeading>
              <Field
                label="Professional Summary"
                name="summary"
                value={resume.summary}
                onChange={handleChange}
                textarea
                placeholder="Introduce yourself, your strengths, and your career goals..."
              />
            </div>

            <div className="border-t border-white/[0.06] pt-6">
              <SectionHeading>Education & Skills</SectionHeading>
              <div className="space-y-5">
                <Field
                  label="Education"
                  name="education"
                  value={resume.education}
                  onChange={handleChange}
                  textarea
                  placeholder={"Degree or qualification\nUniversity name\nGraduation year"}
                />

                <Field
                  label="Skills"
                  name="skills"
                  value={resume.skills}
                  onChange={handleChange}
                  textarea
                  placeholder="React, JavaScript, Node.js, Express, MongoDB"
                />
                <p className="-mt-3 text-xs text-slate-500">
                  Separate skills with commas to display them as individual tags.
                </p>
              </div>
            </div>

            <div className="border-t border-white/[0.06] pt-6">
              <SectionHeading>Experience & Projects</SectionHeading>
              <div className="space-y-5">
                <Field
                  label="Work Experience"
                  name="experience"
                  value={resume.experience}
                  onChange={handleChange}
                  textarea
                  placeholder="Role, organization, dates, and responsibilities. Leave blank if you have no experience."
                />

                <Field
                  label="Projects"
                  name="projects"
                  value={resume.projects}
                  onChange={handleChange}
                  textarea
                  placeholder="Project name — describe what you built and the technologies used."
                />
              </div>
            </div>

            <div className="border-t border-white/[0.06] pt-6">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 px-5 py-3.5 font-bold text-white shadow-lg shadow-violet-950/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Saving Resume...
                  </>
                ) : (
                  <>
                    <span aria-hidden="true">✓</span>
                    Save Resume
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3.5 font-semibold text-slate-200 transition hover:border-sky-400/30 hover:bg-sky-400/[0.05]"
              >
                <span aria-hidden="true">↓</span>
                Print / Save as PDF
              </button>

              <p className="mt-3 text-center text-xs text-slate-500">
                Your resume is saved to your account when you select Save Resume.
              </p>
            </div>
          </div>
        </section>

        {/* Live resume preview */}
        <section className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
            <div>
              <h2 className="font-bold text-white">Live Preview</h2>
              <p className="mt-1 text-xs text-slate-500">
                Your resume updates as you type.
              </p>
            </div>

            <span className="inline-flex items-center gap-2 rounded-full border border-sky-400/15 bg-sky-400/[0.05] px-3 py-1.5 text-xs text-sky-300">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
              A4 document
            </span>
          </div>

          <div
            id="resume-preview"
            className="min-h-[700px] overflow-wrap-anywhere rounded-xl border border-white/10 bg-white p-6 text-slate-900 shadow-2xl shadow-black/20 sm:p-10 lg:p-11"
          >
            <div className="resume-accent border-b-2 border-violet-500 pb-5">
              <h1 className="break-words text-3xl font-extrabold tracking-tight sm:text-4xl">
                {resume.name || "Your Name"}
              </h1>

              <p className="resume-title mt-2 break-words text-lg font-semibold text-violet-700">
                {resume.title || "Your Professional Title"}
              </p>

              {(resume.email || resume.phone) && (
                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-600">
                  {resume.email && (
                    <span className="break-all">{resume.email}</span>
                  )}
                  {resume.phone && <span>{resume.phone}</span>}
                </div>
              )}
            </div>

            {resume.summary && (
              <section className="mt-7">
                <h2 className="resume-divider mb-3 border-b border-slate-200 pb-2 text-sm font-bold uppercase tracking-[0.12em]">
                  Professional Summary
                </h2>
                <p className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">
                  {resume.summary}
                </p>
              </section>
            )}

            {resume.education && (
              <section className="mt-7">
                <h2 className="resume-divider mb-3 border-b border-slate-200 pb-2 text-sm font-bold uppercase tracking-[0.12em]">
                  Education
                </h2>
                <p className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">
                  {resume.education}
                </p>
              </section>
            )}

            {skills.length > 0 && (
              <section className="mt-7">
                <h2 className="resume-divider mb-3 border-b border-slate-200 pb-2 text-sm font-bold uppercase tracking-[0.12em]">
                  Skills
                </h2>

                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <span
                      key={`${skill}-${index}`}
                      className="resume-skill break-words rounded-md border border-violet-100 bg-violet-50 px-2.5 py-1.5 text-xs font-medium text-violet-800"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {resume.experience && (
              <section className="mt-7">
                <h2 className="resume-divider mb-3 border-b border-slate-200 pb-2 text-sm font-bold uppercase tracking-[0.12em]">
                  Experience
                </h2>
                <p className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">
                  {resume.experience}
                </p>
              </section>
            )}

            {resume.projects && (
              <section className="mt-7">
                <h2 className="resume-divider mb-3 border-b border-slate-200 pb-2 text-sm font-bold uppercase tracking-[0.12em]">
                  Projects
                </h2>
                <p className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">
                  {resume.projects}
                </p>
              </section>
            )}

            {!resume.summary &&
              !resume.education &&
              skills.length === 0 &&
              !resume.experience &&
              !resume.projects && (
                <p className="mt-12 text-center text-sm leading-6 text-slate-400">
                  Your resume sections will appear here as you fill in your
                  information.
                </p>
              )}
          </div>

          <p className="mt-4 text-center text-xs leading-5 text-slate-500 print:hidden">
            This preview uses a clean, print-friendly resume layout.
          </p>
        </section>
      </div>
    </div>
  );
}
