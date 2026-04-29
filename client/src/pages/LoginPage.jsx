import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(form);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.msg || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#f8e8d8,_#f7f3ee_42%,_#f2ede5)] px-4 py-10">
      <div className="mx-auto w-full max-w-md rounded-3xl border border-amber-200/70 bg-white/80 p-8 shadow-[0_20px_60px_-30px_rgba(124,59,18,0.5)] backdrop-blur">
        <p className="text-xs uppercase tracking-[0.28em] text-amber-700">Team Task Manager</p>
        <h1 className="mt-3 font-['Space_Grotesk'] text-3xl font-bold text-stone-900">Welcome back</h1>
        <p className="mt-1 text-sm text-stone-600">Sign in to manage your team projects and tasks.</p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <input
            className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 outline-none ring-0 focus:border-amber-500"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            required
          />
          <input
            className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 outline-none ring-0 focus:border-amber-500"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            required
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            className="w-full rounded-xl bg-stone-900 px-4 py-2 font-medium text-white transition hover:bg-stone-800 disabled:opacity-60"
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="mt-4 text-sm text-stone-600">
          New here? <Link className="font-medium text-amber-700" to="/signup">Create an account</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
