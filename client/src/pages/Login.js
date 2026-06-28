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
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);
  try {
    const res = await loginUser(form);
    const { token, ...userData } = res.data.data;
    login(token, userData);

    navigate(getDashboardPath(userData.role));
  } catch (err) {
    setError(err.response?.data?.message || "Login failed");
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="max-w-md mx-auto px-4 py-24">
      <p className="text-xs uppercase tracking-widest text-gray-500 mb-4">Welcome Back</p>
      <h1 className="text-3xl font-bold text-white mb-10">Login</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p className="text-gray-500 text-sm mt-6 text-center">
        Don't have an account?{" "}
        <Link to="/register" className="text-white hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
};

export default Login;
