import { useEffect, useState } from "react";
import { api } from "../api/client";

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    api("/api/admin/stats")
      .then(setStats)
      .catch((e) => setErr(e.message));
  }, []);

  if (err) {
    return (
      <div className="text-rose-600 text-sm bg-rose-500/10 px-4 py-3 rounded-lg">
        {err}
      </div>
    );
  }

  if (!stats) return <p className="text-ink-muted">Loading…</p>;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl font-bold text-ink">Admin dashboard</h1>
        <p className="text-ink-muted mt-1">High-level usage metrics for the platform.</p>
      </header>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          ["Users", stats.userCount],
          ["Study sessions", stats.sessionCount],
          ["Performance rows", stats.performanceCount],
          ["Admins", stats.adminCount],
        ].map(([label, val]) => (
          <div
            key={label}
            className="rounded-2xl border border-slate-200 dark:border-slate-700 p-5 bg-surface-muted/50"
          >
            <p className="text-xs text-ink-muted uppercase">{label}</p>
            <p className="text-2xl font-display font-bold mt-1">{val}</p>
          </div>
        ))}
      </div>

      <section className="rounded-2xl border border-slate-200 dark:border-slate-700 p-6 bg-surface">
        <h2 className="font-semibold text-ink mb-4">Recent users</h2>
        <ul className="divide-y divide-slate-200 dark:divide-slate-700 text-sm">
          {stats.recentUsers?.map((u) => (
            <li key={u._id} className="py-3 flex justify-between flex-wrap gap-2">
              <span>
                <span className="font-medium text-ink">{u.name}</span>{" "}
                <span className="text-ink-muted">{u.email}</span>
              </span>
              <span className="text-ink-muted">
                {u.role} · {u.points} pts · streak {u.streakDays}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
