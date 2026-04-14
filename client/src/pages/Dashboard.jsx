import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext.jsx";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function Dashboard() {
  const { user } = useAuth();
  const [rec, setRec] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [reminders, setReminders] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [r, s, rem, a] = await Promise.all([
          api("/api/recommendations"),
          api("/api/schedule"),
          api("/api/reminders"),
          api("/api/performance/analytics"),
        ]);
        if (!cancelled) {
          setRec(r);
          setSchedule(s);
          setReminders(rem.slice(0, 5));
          setAnalytics(a);
        }
      } catch (e) {
        if (!cancelled) setErr(e.message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const today = new Date().getDay();
  const todayItems =
    schedule?.items?.filter((i) => i.dayOfWeek === today) || [];

  function speakReminder(text) {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const u = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(u);
    }
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl font-bold text-ink">
          Hello, {user?.name?.split(" ")[0] || "there"}
        </h1>
        <p className="text-ink-muted mt-1">
          Here is your study snapshot and AI suggestions for today.
        </p>
      </header>

      {err && (
        <div className="rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 text-sm px-4 py-3">
          {err}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-surface-muted/50 p-5">
          <p className="text-xs font-medium text-ink-muted uppercase tracking-wide">Points</p>
          <p className="text-3xl font-display font-bold text-ink mt-1">{user?.points ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-surface-muted/50 p-5">
          <p className="text-xs font-medium text-ink-muted uppercase tracking-wide">Streak</p>
          <p className="text-3xl font-display font-bold text-ink mt-1">{user?.streakDays ?? 0} days</p>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-surface-muted/50 p-5">
          <p className="text-xs font-medium text-ink-muted uppercase tracking-wide">Weak areas</p>
          <p className="text-lg font-semibold text-ink mt-1">
            {analytics?.weakSubjects?.length
              ? analytics.weakSubjects.map((w) => w.name).join(", ")
              : "None flagged"}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <section className="rounded-2xl border border-slate-200 dark:border-slate-700 p-6 bg-surface">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-lg text-ink">AI recommendations</h2>
            <span className="text-xs text-ink-muted capitalize">{rec?.source || "—"}</span>
          </div>
          {rec ? (
            <div className="space-y-3 text-sm">
              <p className="text-ink">{rec.summary}</p>
              <p>
                <span className="text-ink-muted">Next focus:</span>{" "}
                <strong>{rec.studyNext}</strong> (~{rec.suggestedMinutes} min)
              </p>
              {rec.tips?.length > 0 && (
                <ul className="list-disc list-inside text-ink-muted space-y-1">
                  {rec.tips.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <p className="text-ink-muted text-sm">Loading…</p>
          )}
          <Link
            to="/analytics"
            className="inline-block mt-4 text-sm font-medium text-accent hover:underline"
          >
            View analytics →
          </Link>
        </section>

        <section className="rounded-2xl border border-slate-200 dark:border-slate-700 p-6 bg-surface">
          <h2 className="font-display font-semibold text-lg text-ink mb-4">
            Today ({days[today]})
          </h2>
          {todayItems.length === 0 ? (
            <p className="text-sm text-ink-muted">No blocks today. Plan in the planner.</p>
          ) : (
            <ul className="space-y-2">
              {todayItems.map((item) => (
                <li
                  key={item._id}
                  className="flex justify-between text-sm border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2"
                >
                  <span>
                    {item.startTime}–{item.endTime}{" "}
                    {item.subject?.name || item.label || "Block"}
                  </span>
                  <span className="text-ink-muted">P{item.priority}</span>
                </li>
              ))}
            </ul>
          )}
          <Link to="/planner" className="inline-block mt-4 text-sm font-medium text-accent hover:underline">
            Open planner →
          </Link>
        </section>
      </div>

      <section className="rounded-2xl border border-slate-200 dark:border-slate-700 p-6 bg-surface">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <h2 className="font-display font-semibold text-lg text-ink">Upcoming reminders</h2>
          {user?.voiceRemindersEnabled && (
            <span className="text-xs text-emerald-600 dark:text-emerald-400">Voice enabled in settings</span>
          )}
        </div>
        <ul className="divide-y divide-slate-200 dark:divide-slate-700">
          {reminders.length === 0 ? (
            <li className="py-3 text-sm text-ink-muted">No reminders.</li>
          ) : (
            reminders.map((r) => (
              <li key={r._id} className="py-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium text-ink">{r.title}</p>
                  <p className="text-xs text-ink-muted">
                    {new Date(r.dueAt).toLocaleString()} · {r.type}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => speakReminder(`Reminder: ${r.title}`)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-surface-muted border border-slate-200 dark:border-slate-600 hover:border-accent text-ink"
                >
                  Voice (simulated)
                </button>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
