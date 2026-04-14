import { useEffect, useRef, useState } from "react";
import { api } from "../api/client";

const WORK_DEFAULT = 25 * 60;
const BREAK_DEFAULT = 5 * 60;

function format(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function Focus() {
  const [subjects, setSubjects] = useState([]);
  const [subject, setSubject] = useState("");
  const [seconds, setSeconds] = useState(WORK_DEFAULT);
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState("work");
  const [sessionId, setSessionId] = useState(null);
  const [log, setLog] = useState("");
  const phaseRef = useRef("work");

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    api("/api/subjects")
      .then((s) => {
        setSubjects(s);
        if (s[0]?._id) setSubject(s[0]._id);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSeconds((prev) => {
        if (prev > 1) return prev - 1;
        const p = phaseRef.current;
        const next = p === "work" ? "break" : "work";
        phaseRef.current = next;
        setPhase(next);
        return next === "work" ? WORK_DEFAULT : BREAK_DEFAULT;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  async function startTracking() {
    setLog("");
    const s = await api("/api/sessions/start", {
      method: "POST",
      body: JSON.stringify({ subject: subject || null, mode: "pomodoro" }),
    });
    setSessionId(s._id);
    phaseRef.current = "work";
    setPhase("work");
    setSeconds(WORK_DEFAULT);
    setRunning(true);
  }

  async function stopTracking() {
    setRunning(false);
    if (!sessionId) return;
    try {
      const data = await api(`/api/sessions/${sessionId}/end`, { method: "POST" });
      setLog(
        `Session saved. +${data.gamification.pointsEarned} pts (total ${data.gamification.totalPoints}). Streak: ${data.gamification.streakDays} days.`
      );
    } catch (e) {
      setLog(e.message);
    }
    setSessionId(null);
  }

  return (
    <div className="space-y-8 max-w-lg">
      <header>
        <h1 className="font-display text-3xl font-bold text-ink">Focus mode</h1>
        <p className="text-ink-muted mt-1">Pomodoro timer with session tracking and gamification.</p>
      </header>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 p-8 bg-surface text-center">
        <p className="text-xs uppercase tracking-widest text-ink-muted mb-2">
          {phase === "work" ? "Focus" : "Break"}
        </p>
        <p className="font-display text-6xl font-bold text-ink tabular-nums">{format(seconds)}</p>
        <label className="block text-left text-xs text-ink-muted mt-6 mb-1">Subject (optional)</label>
        <select
          className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          disabled={running}
        >
          <option value="">—</option>
          {subjects.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
        </select>
        <div className="flex gap-3 mt-6 justify-center">
          {!running ? (
            <button
              type="button"
              onClick={() => startTracking().catch((e) => setLog(e.message))}
              className="px-6 py-2.5 rounded-lg bg-accent text-white font-medium text-sm"
            >
              Start session & timer
            </button>
          ) : (
            <button
              type="button"
              onClick={stopTracking}
              className="px-6 py-2.5 rounded-lg bg-rose-500 text-white font-medium text-sm"
            >
              Stop & save session
            </button>
          )}
        </div>
        {log && <p className="mt-4 text-sm text-emerald-600 dark:text-emerald-400">{log}</p>}
      </div>

      <p className="text-xs text-ink-muted">
        Timer alternates 25/5 minute phases. Ending a session records minutes and awards points toward your streak.
      </p>
    </div>
  );
}
