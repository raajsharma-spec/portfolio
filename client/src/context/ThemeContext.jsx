import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext.jsx";

const ThemeContext = createContext(null);

function applyClass(mode) {
  const root = document.documentElement;
  if (mode === "dark") root.classList.add("dark");
  else if (mode === "light") root.classList.remove("dark");
  else {
    const prefers = window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.classList.toggle("dark", prefers);
  }
}

export function ThemeProvider({ children }) {
  const { user, updateMe } = useAuth();
  const [localMode, setLocalMode] = useState(() => localStorage.getItem("theme") || "system");

  const mode = user?.themePreference && user.themePreference !== "system" ? user.themePreference : localMode;

  useEffect(() => {
    applyClass(mode);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (mode === "system") applyClass("system");
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [mode]);

  const setTheme = async (next) => {
    setLocalMode(next);
    localStorage.setItem("theme", next);
    applyClass(next === "system" ? "system" : next);
    if (user) {
      try {
        await updateMe({ themePreference: next });
      } catch {
        /* offline */
      }
    }
  };

  const value = useMemo(() => ({ mode, setTheme }), [mode, setTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme outside provider");
  return ctx;
}
