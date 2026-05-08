"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type ThemeId = "roze" | "midnight" | "workday" | "campus";

const STORAGE_KEY = "nachungi:theme";
const DEFAULT_THEME: ThemeId = "roze";

interface ThemeCtx {
  theme: ThemeId;
  setTheme: (t: ThemeId) => void;
}

const Ctx = createContext<ThemeCtx>({ theme: DEFAULT_THEME, setTheme: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(DEFAULT_THEME);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ThemeId | null;
    if (stored) applyTheme(stored);

    const handler = (e: Event) => {
      const t = (e as CustomEvent<ThemeId>).detail;
      applyTheme(t);
    };
    window.addEventListener("nachungi:set-theme", handler);
    return () => window.removeEventListener("nachungi:set-theme", handler);
  }, []);

  function applyTheme(t: ThemeId) {
    setThemeState(t);
    document.documentElement.setAttribute("data-theme", t);
    localStorage.setItem(STORAGE_KEY, t);
  }

  function setTheme(t: ThemeId) {
    applyTheme(t);
  }

  return <Ctx.Provider value={{ theme, setTheme }}>{children}</Ctx.Provider>;
}

export function useTheme() {
  return useContext(Ctx);
}

export function dispatchTheme(theme: ThemeId) {
  window.dispatchEvent(new CustomEvent("nachungi:set-theme", { detail: theme }));
}
