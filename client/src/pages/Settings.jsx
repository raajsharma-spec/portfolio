import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

export default function Settings() {
  const { user, updateMe } = useAuth();
  const { mode, setTheme } = useTheme();
  const [subjects, setSubjects] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [subForm, setSubForm] = useState({ name: "", difficulty: "medium", color: "#6366f1" });
  const [remForm, setRemForm] = useState({
    title: "",
    type: "study",
    dueAt: "",
    subject: "",
  });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  async function load() {
    const [s, r] = await Promise.all([api("/api/subjects"), api("/api/reminders")]);
    setSubjects(s);
    setReminders(r);
    if (!remForm.subject && s[0]?._id) setRemForm((f) => ({ ...f, subject: s[0]._id }));
  }

  useEffect(() => {
    load().catch((e) => setErr(e.message));
  }, []);

  async function addSubject(e) {
    e.preventDefault();
    setErr("");
    await api("/api/subjects", {
      method: "POST",
      body: JSON.stringify(subForm),
    });
    setSubForm({ name: "", difficulty: "medium", color: "#6366f1" });
    setMsg("Subject added");
    await load();
  }

  async function deleteSubject(id) {
    await api(`/api/subjects/${id}`, { method: "DELETE" });
    await load();
  }

  async function addReminder(e) {
    e.preventDefault();
    setErr("");
    if (!remForm.dueAt) return;
    await api("/api/reminders", {
      method: "POST",
      body: JSON.stringify({
        title: remForm.title,
        type: remForm.type,
        dueAt: remForm.dueAt,
        subject: remForm.subject || null,
      }),
    });
    setRemForm((f) => ({ ...f, title: "", dueAt: "" }));
    setMsg("Reminder created (email simulated on server)");
    await load();
  }

  async function toggleReminderDone(r) {
    await api(`/api/reminders/${r._id}`, {
      method: "PATCH",
      body: JSON.stringify({ completed: !r.completed }),
    });
    await load();
  }

  async function deleteReminder(id) {
    await api(`/api/reminders/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div className="space-y-10">
      <header>
        <h1 className="font-display text-3xl font-bold text-ink">Settings</h1>
        <p className="text-ink-muted mt-1">Profile, appearance, subjects, and reminders.</p>
      </header>

      {msg && (
        <div className="text-sm text-emerald-600 bg-emerald-500/10 px-4 py-2 rounded-lg">{msg}</div>
      )}
      {err && (
        <div className="text-sm text-rose-600 bg-rose-500/10 px-4 py-2 rounded-lg">{err}</div>
      )}

      <section className="rounded-2xl border border-slate-200 dark:border-slate-700 p-6 bg-surface space-y-4">
        <h2 className="font-semibold text-ink">Appearance & notifications</h2>
        <div className="flex flex-wrap gap-4 items-center">
          <label className="text-sm text-ink-muted">
            Theme
            <select
              className="ml-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1.5 text-sm"
              value={mode}
              onChange={(e) => setTheme(e.target.value)}
            >
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm text-ink cursor-pointer">
            <input
              type="checkbox"
              checked={!!user?.voiceRemindersEnabled}
              onChange={(e) =>
                updateMe({ voiceRemindersEnabled: e.target.checked }).catch(() => {})
              }
            />
            Voice reminders (browser speech on dashboard)
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 dark:border-slate-700 p-6 bg-surface">
        <h2 className="font-semibold text-ink mb-4">Subjects</h2>
        <form onSubmit={addSubject} className="flex flex-wrap gap-3 items-end mb-6">
          <input
            placeholder="Name"
            className="rounded-lg border border-slate-200 dark:border-slate-600 px-3 py-2 text-sm"
            value={subForm.name}
            onChange={(e) => setSubForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
          <select
            className="rounded-lg border border-slate-200 dark:border-slate-600 px-3 py-2 text-sm"
            value={subForm.difficulty}
            onChange={(e) => setSubForm((f) => ({ ...f, difficulty: e.target.value }))}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          <input
            type="color"
            className="h-9 w-12 rounded border border-slate-200 dark:border-slate-600 bg-transparent"
            value={subForm.color}
            onChange={(e) => setSubForm((f) => ({ ...f, color: e.target.value }))}
          />
          <button type="submit" className="px-4 py-2 rounded-lg bg-accent text-white text-sm">
            Add subject
          </button>
        </form>
        <ul className="space-y-2">
          {subjects.map((s) => (
            <li
              key={s._id}
              className="flex justify-between items-center text-sm border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2"
            >
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ background: s.color }} />
                {s.name} · {s.difficulty}
              </span>
              <button type="button" className="text-rose-500 text-xs" onClick={() => deleteSubject(s._id)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-slate-200 dark:border-slate-700 p-6 bg-surface">
        <h2 className="font-semibold text-ink mb-4">Smart reminders</h2>
        <form onSubmit={addReminder} className="grid sm:grid-cols-2 gap-3 mb-6">
          <input
            className="rounded-lg border border-slate-200 dark:border-slate-600 px-3 py-2 text-sm"
            placeholder="Title"
            value={remForm.title}
            onChange={(e) => setRemForm((f) => ({ ...f, title: e.target.value }))}
            required
          />
          <select
            className="rounded-lg border border-slate-200 dark:border-slate-600 px-3 py-2 text-sm"
            value={remForm.type}
            onChange={(e) => setRemForm((f) => ({ ...f, type: e.target.value }))}
          >
            <option value="study">Study</option>
            <option value="assignment">Assignment</option>
            <option value="exam">Exam</option>
            <option value="other">Other</option>
          </select>
          <input
            type="datetime-local"
            className="rounded-lg border border-slate-200 dark:border-slate-600 px-3 py-2 text-sm"
            value={remForm.dueAt}
            onChange={(e) => setRemForm((f) => ({ ...f, dueAt: e.target.value }))}
            required
          />
          <select
            className="rounded-lg border border-slate-200 dark:border-slate-600 px-3 py-2 text-sm"
            value={remForm.subject}
            onChange={(e) => setRemForm((f) => ({ ...f, subject: e.target.value }))}
          >
            <option value="">No subject</option>
            {subjects.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
          <button type="submit" className="sm:col-span-2 px-4 py-2 rounded-lg bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 text-sm w-fit">
            Add reminder
          </button>
        </form>
        <ul className="space-y-2">
          {reminders.map((r) => (
            <li
              key={r._id}
              className="flex flex-wrap justify-between gap-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2"
            >
              <div>
                <p className={r.completed ? "line-through text-ink-muted" : "font-medium"}>{r.title}</p>
                <p className="text-xs text-ink-muted">
                  {new Date(r.dueAt).toLocaleString()} · {r.type}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="text-xs text-accent"
                  onClick={() => toggleReminderDone(r).catch((e) => setErr(e.message))}
                >
                  {r.completed ? "Undo" : "Done"}
                </button>
                <button
                  type="button"
                  className="text-xs text-rose-500"
                  onClick={() => deleteReminder(r._id)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
