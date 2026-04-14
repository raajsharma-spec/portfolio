import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const links = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/planner", label: "Planner" },
  { to: "/analytics", label: "Analytics" },
  { to: "/notes", label: "Notes" },
  { to: "/focus", label: "Focus" },
  { to: "/settings", label: "Settings" },
];

const navClass = ({ isActive }) =>
  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
    isActive
      ? "bg-accent text-white shadow-lg shadow-indigo-500/25"
      : "text-ink-muted hover:bg-surface-muted hover:text-ink"
  }`;

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 shrink-0 border-r border-slate-200 dark:border-slate-700 bg-surface-muted/80 dark:bg-slate-900/50 backdrop-blur-sm min-h-screen p-4 flex flex-col">
      <div className="px-2 mb-8">
        <p className="font-display font-bold text-lg text-ink tracking-tight">Smart Study</p>
        <p className="text-xs text-ink-muted mt-0.5">AI learning assistant</p>
      </div>
      <nav className="flex flex-col gap-1 flex-1">
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.end} className={navClass}>
            {l.label}
          </NavLink>
        ))}
        {user?.role === "admin" && (
          <NavLink to="/admin" className={navClass}>
            Admin
          </NavLink>
        )}
      </nav>
      <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
        <p className="text-xs text-ink-muted px-2 truncate">{user?.email}</p>
        <div className="flex items-center gap-2 mt-2 px-2 text-xs">
          <span className="rounded-full bg-accent/15 text-accent px-2 py-0.5 font-semibold">
            {user?.points ?? 0} pts
          </span>
          <span className="text-ink-muted">{user?.streakDays ?? 0} day streak</span>
        </div>
        <button
          type="button"
          onClick={logout}
          className="mt-3 w-full text-left text-sm text-ink-muted hover:text-rose-500 px-2 py-2 rounded-lg hover:bg-rose-500/10 transition-colors"
        >
          Log out
        </button>
      </div>
    </aside>
  );
}
