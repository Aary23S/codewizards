// codewizards/client/src/pages/ForgotPassword.js
import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../services/api";
import FormInput from "../components/FormInput";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await forgotPassword(email);
      setMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
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

      <div className="relative mx-auto flex min-h-[calc(100vh-6rem)] max-w-xl items-center">
        <section className="w-full rounded-[28px] border border-white/10 bg-white/[0.03] p-6 shadow-[0_12px_36px_rgba(0,0,0,0.18)] md:p-8">
          <p className="text-[11px] uppercase tracking-[0.4em] text-cyan-200/70">Account recovery</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Forgot password?</h2>
          <p className="mt-3 text-sm leading-6 text-white/60">
            Enter the email you registered with and we'll send you a link to reset your password.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
            <FormInput
              label="Email"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {message && (
              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
                {message}
              </div>
            )}

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
              {loading ? "Sending..." : "Send reset link"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-white/55">
            Remembered your password?{" "}
            <Link className="font-semibold text-cyan-200 transition hover:text-cyan-100" to="/login">
              Back to login
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
};

export default ForgotPassword;
