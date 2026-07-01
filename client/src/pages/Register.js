import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../services/api";
import { useAuth } from "../context/AuthContext";
import FormInput from "../components/FormInput";
import { getDashboardPath } from "../utils/getDashboardPath";

const currentYear = new Date().getFullYear();

const Register = () => {
  const [accountType, setAccountType] = useState("student");
  const [form, setForm] = useState({ name: "", email: "", password: "", batch: "" });
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
      const res = await registerUser({ ...form, batch: Number(form.batch), accountType });
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
            Create a role-based account and join the community in the same interface used across the site.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {["Students", "Seniors", "Alumni"].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm text-white/70">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6 shadow-[0_12px_36px_rgba(0,0,0,0.18)] md:p-8">
          <p className="text-[11px] uppercase tracking-[0.4em] text-cyan-200/70">Create account</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Choose your path</h2>
          <p className="mt-3 text-sm leading-6 text-white/60">
            Select the account type that matches your role, then continue with the existing registration flow.
          </p>

          <div className="mt-8 flex gap-3">
            {[
              { value: "student", label: "Student" },
              { value: "senior_alumni", label: "Senior / Alumni" },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setAccountType(opt.value)}
                className={`flex-1 rounded-full border px-4 py-3 text-sm font-semibold transition ${
                  accountType === opt.value
                    ? "border-white bg-white text-black"
                    : "border-white/10 bg-white/5 text-white/65 hover:border-white/20 hover:bg-white/10 hover:text-white"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
            <FormInput label="Full Name" type="text" name="name" value={form.name} onChange={handleChange} required />
            <FormInput label="Email" type="email" name="email" value={form.email} onChange={handleChange} required />
            <FormInput label="Password" type="password" name="password" value={form.password} onChange={handleChange} minLength={6} required />
            <FormInput
              label={accountType === "student" ? "Expected Graduation Year" : "Graduation Batch Year"}
              type="number"
              name="batch"
              value={form.batch}
              onChange={handleChange}
              placeholder={String(currentYear)}
              min={2000}
              max={currentYear + 10}
              required
            />

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
