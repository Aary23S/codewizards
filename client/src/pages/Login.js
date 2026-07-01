import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../services/api";
import { useAuth } from "../context/AuthContext";
import FormInput from "../components/FormInput";
import { getDashboardPath } from "../utils/getDashboardPath";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, login } = useAuth();
  const navigate = useNavigate();
  if (user) {
  navigate(getDashboardPath(user.role), { replace: true });
  return null;
}

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await loginUser(form);
      const { token, ...userData } = res.data.data;
      login(token, userData);
      navigate(getDashboardPath(userData.role), { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050816] px-4 py-12 text-white md:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10%] top-0 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute right-[-10%] top-[18%] h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto grid min-h-[calc(100vh-6rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-8 shadow-[0_12px_36px_rgba(0,0,0,0.18)] md:p-10">
          <p className="text-[11px] uppercase tracking-[0.4em] text-cyan-200/70">Welcome back</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">Login</h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-white/65 md:text-base">
            Sign in to access your role-specific dashboard, mentorship tools, and community features.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              "Mentor tracking",
              "Event access",
              "Profile sync",
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm text-white/70">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6 shadow-[0_12px_36px_rgba(0,0,0,0.18)] md:p-8">
          <p className="text-[11px] uppercase tracking-[0.4em] text-cyan-200/70">Sign in</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Use your account</h2>
          <p className="mt-3 text-sm leading-6 text-white/60">
            The login flow is unchanged. Only the presentation has been updated.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
            <FormInput
              label="Email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
            <FormInput
              label="Password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
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
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-white/55">
            Don't have an account?{" "}
            <Link className="font-semibold text-cyan-200 transition hover:text-cyan-100" to="/register">
              Register
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
};

export default Login;
