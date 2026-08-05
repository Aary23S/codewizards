// codewizards/client/src/pages/Register.js
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../services/api";
import { useAuth } from "../context/AuthContext";
import FormInput from "../components/FormInput";
import { getDashboardPath } from "../utils/getDashboardPath";

const currentYear = new Date().getFullYear();

const deriveRolePreview = (batch, programDurationYears) => {
  const batchYear = Number(batch);
  if (!Number.isFinite(batchYear)) return "student";

  const duration = Number(programDurationYears) > 0 ? Number(programDurationYears) : 4;
  const diff = currentYear - batchYear;
  if (diff < duration) return "student";
  if (diff === duration) return "senior";
  return "alumni";
};

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    batch: "",
    programName: "Engineering",
    programDurationYears: 4,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate(getDashboardPath(user.role), { replace: true });
    }
  }, [navigate, user]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.batch) {
      setError("Batch year is required");
      return;
    }

    setLoading(true);
    try {
      const res = await registerUser({
        ...form,
        batch: Number(form.batch),
        programDurationYears: Number(form.programDurationYears),
      });
      const { token, ...userData } = res.data.data;
      login(token, userData);
      navigate(getDashboardPath(userData.role));
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050816] px-4 py-12 text-white md:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10%] top-0 h-72 w-72 rounded-full bg-fuchsia-500/10 blur-3xl" />
        <div className="absolute right-[-10%] top-[18%] h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto grid min-h-[calc(100vh-6rem)] max-w-6xl items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-8 shadow-[0_12px_36px_rgba(0,0,0,0.18)] md:p-10">
          <p className="text-[11px] uppercase tracking-[0.4em] text-cyan-200/70">Join us</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">Register</h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-white/65 md:text-base">
            Create an account with the same role rules used across the mobile app and backend.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              { title: "Program", value: form.programName || "Engineering" },
              { title: "Duration", value: `${form.programDurationYears || 4} years` },
              { title: "Role preview", value: deriveRolePreview(form.batch, form.programDurationYears) },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
                <div className="text-[10px] uppercase tracking-[0.28em] text-white/40">{item.title}</div>
                <div className="mt-2 text-sm font-semibold text-white/80">{item.value}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6 shadow-[0_12px_36px_rgba(0,0,0,0.18)] md:p-8">
          <p className="text-[11px] uppercase tracking-[0.4em] text-cyan-200/70">Create account</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Enter your academic track</h2>
          <p className="mt-3 text-sm leading-6 text-white/60">
            Role is derived automatically from your batch year and program duration. No manual role selection.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
            <FormInput label="Full Name" type="text" name="name" value={form.name} onChange={handleChange} required />
            <FormInput label="Email" type="email" name="email" value={form.email} onChange={handleChange} required />
            <FormInput label="Password" type="password" name="password" value={form.password} onChange={handleChange} minLength={6} required />
            <FormInput
              label="Batch / joining year"
              type="number"
              name="batch"
              value={form.batch}
              onChange={handleChange}
              placeholder={String(currentYear)}
              min={2000}
              max={currentYear + 10}
              required
            />
            <FormInput
              label="Program name"
              type="text"
              name="programName"
              value={form.programName}
              onChange={handleChange}
              required
            />
            <div>
              <label className="mb-2 block text-[11px] uppercase tracking-[0.3em] text-white/45">
                Program duration
              </label>
              <select
                name="programDurationYears"
                value={form.programDurationYears}
                onChange={handleChange}
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-white/30"
              >
                <option value={2}>2 years</option>
                <option value={3}>3 years</option>
                <option value={4}>4 years</option>
              </select>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/70">
              Auto role preview:{" "}
              <span className="font-semibold text-white">{deriveRolePreview(form.batch, form.programDurationYears).toUpperCase()}</span>
            </div>

            {error && (
              <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-cyan-100 disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Register"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-white/55">
            Already have an account?{" "}
            <Link className="font-semibold text-cyan-200 transition hover:text-cyan-100" to="/login">
              Login
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
};

export default Register;
