
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000";

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

// Keep Field outside ResumeBuilder to prevent input focus loss.
function Field({
  label,
  name,
  value,
  onChange,
  textarea = false,
  placeholder = "",
}) {
  const commonClasses =
    "mt-2 w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20";

  return (
    <div>
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
          className={commonClasses}
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
          setMessage(
            error.message || "Could not connect to the server."
          );
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

    // Clear old feedback when the user edits the form.
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        Loading your saved resume...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }

          body {
            background: white !important;
          }

          body * {
            visibility: hidden;
          }

          #resume-preview,
          #resume-preview * {
            visibility: visible;
          }

          #resume-preview {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
            border: none !important;
            box-shadow: none !important;
            background: white !important;
            color: #111827 !important;
          }

          #resume-preview h1,
          #resume-preview h2,
          #resume-preview h3,
          #resume-preview p,
          #resume-preview span,
          #resume-preview li {
            color: #111827 !important;
          }

          #resume-preview .resume-divider {
            border-color: #d1d5db !important;
          }

          #resume-preview .resume-skill {
            border: 1px solid #d1d5db !important;
            background: white !important;
          }
        }
      `}</style>

      <header className="border-b border-slate-800 px-6 py-5 print:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link to="/dashboard" className="text-2xl font-bold">
            Career<span className="text-teal-400">Pilot</span>
          </Link>

          <Link
            to="/dashboard"
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm transition hover:bg-slate-800"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-6">
        <div className="mb-8 print:hidden">
          <p className="text-sm font-semibold uppercase tracking-wider text-teal-400">
            CareerPilot Resume Builder
          </p>

          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            Build your professional resume
          </h1>

          <p className="mt-3 text-slate-400">
            Your resume is connected to your account. Save your changes
            whenever you're ready.
          </p>

          {message && (
            <p
              role={messageType === "error" ? "alert" : "status"}
              className={`mt-5 rounded-xl border p-4 ${
                messageType === "error"
                  ? "border-red-500/30 bg-red-500/10 text-red-400"
                  : "border-teal-500/30 bg-teal-500/10 text-teal-300"
              }`}
            >
              {message}
            </p>
          )}
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-2">
          {/* Resume form */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 print:hidden sm:p-8">
            <h2 className="mb-6 text-xl font-bold">Your Information</h2>

            <div className="space-y-5">
              <Field
                label="Full Name"
                name="name"
                value={resume.name}
                onChange={handleChange}
                placeholder="e.g. Abdul Hafeez Usmani"
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
                  label="Email"
                  name="email"
                  value={resume.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                />

                <Field
                  label="Phone"
                  name="phone"
                  value={resume.phone}
                  onChange={handleChange}
                  placeholder="Your phone number"
                />
              </div>

              <Field
                label="Professional Summary"
                name="summary"
                value={resume.summary}
                onChange={handleChange}
                textarea
                placeholder="Write a short introduction about yourself..."
              />

              <Field
                label="Education"
                name="education"
                value={resume.education}
                onChange={handleChange}
                textarea
                placeholder={"BS Computer Science\nUniversity name\nExpected graduation: 2030"}
              />

              <Field
                label="Skills"
                name="skills"
                value={resume.skills}
                onChange={handleChange}
                textarea
                placeholder="React, JavaScript, Node.js, Express, MongoDB"
              />

              <Field
                label="Work Experience"
                name="experience"
                value={resume.experience}
                onChange={handleChange}
                textarea
                placeholder="Add your role, organization, dates, and responsibilities. Leave blank if you have no experience."
              />

              <Field
                label="Projects"
                name="projects"
                value={resume.projects}
                onChange={handleChange}
                textarea
                placeholder="Project name — describe what you built and the technologies used."
              />

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="w-full rounded-xl bg-teal-400 px-5 py-3 font-bold text-slate-950 transition hover:bg-teal-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving Resume..." : "Save Resume"}
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="w-full rounded-xl border border-slate-700 px-5 py-3 font-semibold transition hover:bg-slate-800"
              >
                Print / Save as PDF
              </button>
            </div>
          </section>

          {/* Live resume preview */}
          <section className="min-w-0">
            <div
              id="resume-preview"
              className="min-h-[700px] overflow-wrap-anywhere rounded-2xl border border-slate-700 bg-white p-6 text-slate-900 shadow-xl sm:p-10"
            >
              <div className="border-b-2 border-teal-500 pb-5">
                <h1 className="break-words text-3xl font-bold sm:text-4xl">
                  {resume.name || "Your Name"}
                </h1>

                <p className="mt-2 text-lg font-semibold text-teal-700">
                  {resume.title || "Your Professional Title"}
                </p>

                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
                  {resume.email && <span>{resume.email}</span>}
                  {resume.phone && <span>{resume.phone}</span>}
                </div>
              </div>

              {resume.summary && (
                <section className="mt-6">
                  <h2 className="mb-2 text-lg font-bold uppercase tracking-wide">
                    Professional Summary
                  </h2>
                  <p className="whitespace-pre-wrap break-words leading-7 text-slate-700">
                    {resume.summary}
                  </p>
                </section>
              )}

              {resume.education && (
                <section className="mt-6">
                  <h2 className="resume-divider mb-3 border-b border-slate-200 pb-2 text-lg font-bold uppercase tracking-wide">
                    Education
                  </h2>
                  <p className="whitespace-pre-wrap break-words leading-7 text-slate-700">
                    {resume.education}
                  </p>
                </section>
              )}

              {skills.length > 0 && (
                <section className="mt-6">
                  <h2 className="resume-divider mb-3 border-b border-slate-200 pb-2 text-lg font-bold uppercase tracking-wide">
                    Skills
                  </h2>

                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, index) => (
                      <span
                        key={`${skill}-${index}`}
                        className="resume-skill rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {resume.experience && (
                <section className="mt-6">
                  <h2 className="resume-divider mb-3 border-b border-slate-200 pb-2 text-lg font-bold uppercase tracking-wide">
                    Experience
                  </h2>
                  <p className="whitespace-pre-wrap break-words leading-7 text-slate-700">
                    {resume.experience}
                  </p>
                </section>
              )}

              {resume.projects && (
                <section className="mt-6">
                  <h2 className="resume-divider mb-3 border-b border-slate-200 pb-2 text-lg font-bold uppercase tracking-wide">
                    Projects
                  </h2>
                  <p className="whitespace-pre-wrap break-words leading-7 text-slate-700">
                    {resume.projects}
                  </p>
                </section>
              )}

              {!resume.summary &&
                !resume.education &&
                skills.length === 0 &&
                !resume.experience &&
                !resume.projects && (
                  <p className="mt-10 text-center text-slate-400">
                    Your resume sections will appear here as you fill in
                    the form.
                  </p>
                )}
            </div>

            <p className="mt-4 text-center text-sm text-slate-500 print:hidden">
              Your preview updates automatically as you type.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
