
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? "" : "http://localhost:5000");

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Registration failed. Please try again."
        );
      }

      setSuccess("Account created successfully!");
      setFormData({ name: "", email: "", password: "" });

      setTimeout(() => navigate("/login"), 1000);
    } catch (err) {
      setError(err.message || "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#070916] px-4 py-10 sm:px-6">

      {/* Background atmosphere */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-violet-600/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-32 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px]" />

      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-[28px] border border-white/[0.09] bg-[#101426]/90 shadow-[0_30px_100px_rgba(0,0,0,0.55)] backdrop-blur-2xl lg:grid-cols-2">

        {/* Left showcase panel */}
        <section className="relative hidden min-h-[700px] flex-col justify-between overflow-hidden border-r border-white/[0.07] bg-gradient-to-br from-[#17172f] via-[#11162b] to-[#101426] p-12 lg:flex">

          <div className="pointer-events-none absolute -right-24 top-20 h-72 w-72 rounded-full border border-violet-400/10" />
          <div className="pointer-events-none absolute -right-12 top-32 h-48 w-48 rounded-full border border-violet-400/10" />
          <div className="pointer-events-none absolute bottom-20 left-10 h-64 w-64 rounded-full bg-violet-600/10 blur-[80px]" />

          <div className="relative z-10">
            <Link to="/register" className="inline-flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/15 shadow-[0_0_30px_rgba(139,92,246,0.18)]">
                <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-violet-300">
                  <path
                    d="M12 2.5C8.2 5.4 6.4 9.2 6.4 14.2L12 18l5.6-3.8c0-5-1.8-8.8-5.6-11.7Z"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinejoin="round"
                  />
                  <circle cx="12" cy="10" r="2" stroke="currentColor" strokeWidth="1.7" />
                  <path
                    d="m8 16-2.5 3.5 4-.8M16 16l2.5 3.5-4-.8M12 18v3"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <span className="text-2xl font-bold tracking-tight text-white">
                Career<span className="text-violet-400">Pilot</span>
              </span>
            </Link>
          </div>

          <div className="relative z-10 -mt-8">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-4 py-2 text-xs font-semibold tracking-wide text-violet-300">
              <span className="h-2 w-2 animate-pulse rounded-full bg-violet-400" />
              START YOUR JOURNEY
            </div>

            <h2 className="max-w-md text-4xl font-bold leading-[1.2] tracking-tight text-white xl:text-5xl">
              Your next chapter
              <span className="mt-2 block bg-gradient-to-r from-violet-400 via-purple-300 to-cyan-300 bg-clip-text text-transparent">
                begins today.
              </span>
            </h2>

            <p className="mt-6 max-w-md text-base leading-8 text-slate-400">
              Create your free account and bring your career goals,
              opportunities, and professional growth together in one place.
            </p>

            <div className="mt-10 grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 shadow-[inset_2px_2px_8px_rgba(0,0,0,0.2)]">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                    <path d="M7 3h7l5 5v13H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                    <path d="M14 3v5h5M9 13h6M9 17h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </div>
                <h3 className="font-semibold text-white">Smart Resumes</h3>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Build and improve your profile.
                </p>
              </div>

              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 shadow-[inset_2px_2px_8px_rgba(0,0,0,0.2)]">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-300">
                  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                    <path d="M4 19V5m0 14h17M8 15l4-4 3 2 5-6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h3 className="font-semibold text-white">Career Growth</h3>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Track progress and opportunities.
                </p>
              </div>
            </div>
          </div>

          <p className="relative z-10 text-xs text-slate-600">
            © {new Date().getFullYear()} CareerPilot. Navigate your future.
          </p>
        </section>

        {/* Registration form */}
        <section className="flex items-center justify-center px-6 py-12 sm:px-10 lg:px-12">

          <div className="w-full max-w-md">

            {/* Mobile brand */}
            <div className="mb-9 text-center lg:hidden">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10">
                <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7 text-violet-300">
                  <path
                    d="M12 2.5C8.2 5.4 6.4 9.2 6.4 14.2L12 18l5.6-3.8c0-5-1.8-8.8-5.6-11.7Z"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinejoin="round"
                  />
                  <circle cx="12" cy="10" r="2" stroke="currentColor" strokeWidth="1.7" />
                  <path
                    d="m8 16-2.5 3.5 4-.8M16 16l2.5 3.5-4-.8M12 18v3"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <h1 className="text-3xl font-bold text-white">
                Career<span className="text-violet-400">Pilot</span>
              </h1>
            </div>

            <div className="mb-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10 text-violet-300 shadow-[0_0_25px_rgba(139,92,246,0.12)]">
                <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM19 8v6m3-3h-6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                </svg>
              </div>

              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-violet-400">
                Get started
              </p>

              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Create your account
              </h1>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                Join CareerPilot and take control of your career journey.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Full name */}
              <div>
                <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-300">
                  Full name
                </label>

                <div className="group relative">
                  <svg viewBox="0 0 24 24" fill="none" className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-violet-400">
                    <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M4 21a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    maxLength={80}
                    className="w-full rounded-xl border border-white/[0.09] bg-[#0b1020] py-3.5 pl-12 pr-4 text-sm text-white shadow-[inset_3px_3px_8px_rgba(0,0,0,0.25),inset_-2px_-2px_6px_rgba(255,255,255,0.02)] outline-none transition-all duration-300 placeholder:text-slate-600 hover:border-white/15 focus:border-violet-400/60 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.10)]"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-300">
                  Email address
                </label>

                <div className="group relative">
                  <svg viewBox="0 0 24 24" fill="none" className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-violet-400">
                    <rect x="3" y="5" width="18" height="14" rx="3" stroke="currentColor" strokeWidth="1.6" />
                    <path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-white/[0.09] bg-[#0b1020] py-3.5 pl-12 pr-4 text-sm text-white shadow-[inset_3px_3px_8px_rgba(0,0,0,0.25),inset_-2px_-2px_6px_rgba(255,255,255,0.02)] outline-none transition-all duration-300 placeholder:text-slate-600 hover:border-white/15 focus:border-violet-400/60 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.10)]"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-300">
                  Password
                </label>

                <div className="group relative">
                  <svg viewBox="0 0 24 24" fill="none" className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-violet-400">
                    <rect x="4" y="10" width="16" height="11" rx="3" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M8 10V7a4 4 0 1 1 8 0v3M12 14v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>

                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={8}
                    maxLength={72}
                    className="w-full rounded-xl border border-white/[0.09] bg-[#0b1020] py-3.5 pl-12 pr-4 text-sm text-white shadow-[inset_3px_3px_8px_rgba(0,0,0,0.25),inset_-2px_-2px_6px_rgba(255,255,255,0.02)] outline-none transition-all duration-300 placeholder:text-slate-600 hover:border-white/15 focus:border-violet-400/60 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.10)]"
                  />
                </div>

                <p className="mt-2 text-xs text-slate-600">
                  Use at least 8 characters.
                </p>
              </div>

              {error && (
                <div role="alert" className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5">⚠</span>
                    <p>{error}</p>
                  </div>
                </div>
              )}

              {success && (
                <div role="status" className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-300">
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5">✓</span>
                    <p>{success} Redirecting you to login...</p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-3.5 font-semibold text-white shadow-[0_8px_25px_rgba(124,58,237,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:from-violet-500 hover:to-purple-500 hover:shadow-[0_12px_35px_rgba(124,58,237,0.35)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity=".25" />
                        <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                      </svg>
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create account
                      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1">
                        <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </>
                  )}
                </span>
              </button>
            </form>

            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-white/[0.08]" />
              <span className="text-xs text-slate-600">CAREERPILOT</span>
              <div className="h-px flex-1 bg-white/[0.08]" />
            </div>

            <p className="text-center text-sm text-slate-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-violet-400 transition-colors hover:text-violet-300"
              >
                Log in
              </Link>
            </p>

            <p className="mt-7 text-center text-xs text-slate-600">
              Your future is worth investing in.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
