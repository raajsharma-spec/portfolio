import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { user, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  if (user) return <Navigate to="/" replace />;

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setPending(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-100 to-indigo-100 dark:from-slate-900 dark:to-indigo-950">
      <div className="w-full max-w-md rounded-2xl bg-surface border border-slate-200 dark:border-slate-700 shadow-xl p-8">
        <h1 className="font-display text-2xl font-bold text-ink">Welcome back</h1>
        <p className="text-sm text-ink-muted mt-1">Sign in to your study workspace</p>
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          {error && (
            <div className="text-sm text-rose-600 dark:text-rose-400 bg-rose-500/10 px-3 py-2 rounded-lg">
              {error}
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-ink-muted mb-1">Email</label>
            <input
              className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-muted mb-1">Password</label>
            <input
              className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="w-full py-2.5 rounded-lg bg-accent text-white font-medium text-sm hover:bg-indigo-600 disabled:opacity-60 transition-colors"
          >
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="text-center text-sm text-ink-muted mt-6">
          No account?{" "}
          <Link to="/register" className="text-accent font-medium hover:underline">
            Register
          </Link>
        </p>
        <p className="text-xs text-ink-muted text-center mt-4">
          Demo: student@demo.com / demo123
        </p>
      </div>
    </div>
  );
}
