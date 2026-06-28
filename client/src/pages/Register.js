import { useState } from "react";
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
  const { login } = useAuth();
  const navigate = useNavigate();

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
    <div className="max-w-md mx-auto px-4 py-24">
      <p className="text-xs uppercase tracking-widest text-gray-500 mb-4">Join Us</p>
      <h1 className="text-3xl font-bold text-white mb-10">Register</h1>

      <div className="flex gap-3 mb-8">
        {[
          { value: "student", label: "Student" },
          { value: "senior_alumni", label: "Senior / Alumni" },
        ].map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setAccountType(opt.value)}
            className={`flex-1 text-sm px-4 py-3 rounded-lg border transition-colors ${
              accountType === opt.value
                ? "bg-white text-black border-white font-semibold"
                : "border-gray-700 text-gray-400 hover:border-gray-500"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <FormInput label="Full Name" type="text" name="name" value={form.name} onChange={handleChange} required />
        <FormInput label="Email" type="email" name="email" value={form.email} onChange={handleChange} required />
        <FormInput label="Password" type="password" name="password" value={form.password} onChange={handleChange} minLength={6} required />
        <FormInput
          label={accountType === "student" ? "Expected Graduation Year" : "Graduation Batch Year"}
          type="number" name="batch" value={form.batch} onChange={handleChange}
          placeholder={String(currentYear)} min={2000} max={currentYear + 10} required
        />

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button type="submit" disabled={loading}
          className="bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50">
          {loading ? "Creating account..." : "Register"}
        </button>
      </form>

      <p className="text-gray-500 text-sm mt-6 text-center">
        Already have an account?{" "}
        <Link to="/login" className="text-white hover:underline">Login</Link>
      </p>
    </div>
  );
};

export default Register;
