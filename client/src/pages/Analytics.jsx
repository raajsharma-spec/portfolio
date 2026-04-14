import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { api } from "../api/client";

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ subject: "", score: 75, title: "Quiz" });
  const [subjects, setSubjects] = useState([]);
  const [err, setErr] = useState("");

  async function load() {
    const [a, rows, subs] = await Promise.all([
      api("/api/performance/analytics"),
      api("/api/performance"),
      api("/api/subjects"),
    ]);
    setAnalytics(a);
    setList(rows);
    setSubjects(subs);
    if (!form.subject && subs[0]?._id) setForm((f) => ({ ...f, subject: subs[0]._id }));
  }

  useEffect(() => {
    load().catch((e) => setErr(e.message));
  }, []);

  async function addScore(e) {
    e.preventDefault();
    setErr("");
    await api("/api/performance", {
      method: "POST",
      body: JSON.stringify({
        subject: form.subject,
        score: Number(form.score),
        title: form.title,
      }),
    });
    await load();
  }

  const barData =
    analytics?.summary?.map((s) => ({
      name: s.name.length > 12 ? `${s.name.slice(0, 12)}…` : s.name,
      average: s.average,
    })) || [];

  const lineData = [...list]
    .reverse()
    .slice(-12)
    .map((p, i) => ({
      n: i + 1,
      score: p.score,
      label: p.subject?.name || "—",
    }));

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl font-bold text-ink">Performance analytics</h1>
        <p className="text-ink-muted mt-1">Track scores, spot weak subjects, and visualize trends.</p>
      </header>

      {err && (
        <div className="text-sm text-rose-600 bg-rose-500/10 px-4 py-2 rounded-lg">{err}</div>
      )}

      <section className="rounded-2xl border border-slate-200 dark:border-slate-700 p-6 bg-surface">
        <h2 className="font-semibold text-ink mb-4">Log score</h2>
        <form onSubmit={addScore} className="flex flex-wrap gap-3 items-end">
          <label className="text-xs">
            <span className="text-ink-muted">Subject</span>
            <select
              className="mt-1 block rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-2 text-sm min-w-[160px]"
              value={form.subject}
              onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
              required
            >
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs">
            <span className="text-ink-muted">Score (0–100)</span>
            <input
              type="number"
              min={0}
              max={100}
              className="mt-1 block rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-2 text-sm w-24"
              value={form.score}
              onChange={(e) => setForm((f) => ({ ...f, score: e.target.value }))}
            />
          </label>
          <label className="text-xs">
            <span className="text-ink-muted">Label</span>
            <input
              className="mt-1 block rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-2 text-sm"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </label>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium"
          >
            Save
          </button>
        </form>
      </section>

      <div className="grid lg:grid-cols-2 gap-6">
        <section className="rounded-2xl border border-slate-200 dark:border-slate-700 p-6 bg-surface h-[360px]">
          <h2 className="font-semibold text-ink mb-4">Average by subject</h2>
          {barData.length === 0 ? (
            <p className="text-sm text-ink-muted">Add performance data to see the chart.</p>
          ) : (
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-600" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    background: "var(--tw-bg-opacity)",
                    border: "1px solid rgb(51 65 85)",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="average" fill="#6366f1" radius={[4, 4, 0, 0]} name="Avg score" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 dark:border-slate-700 p-6 bg-surface h-[360px]">
          <h2 className="font-semibold text-ink mb-4">Recent assessments (trend)</h2>
          {lineData.length === 0 ? (
            <p className="text-sm text-ink-muted">No entries yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height="85%">
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-600" />
                <XAxis dataKey="n" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="score" stroke="#22c55e" strokeWidth={2} dot name="Score" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </section>
      </div>

      <section className="rounded-2xl border border-slate-200 dark:border-slate-700 p-6 bg-surface">
        <h2 className="font-semibold text-ink mb-4">Weak subjects</h2>
        {analytics?.weakSubjects?.length ? (
          <ul className="space-y-2">
            {analytics.weakSubjects.map((w) => (
              <li key={w.subjectId} className="flex justify-between text-sm border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2">
                <span>{w.name}</span>
                <span className="text-ink-muted">Avg {w.average}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ink-muted">No subject averages below 70 yet.</p>
        )}
      </section>
    </div>
  );
}
