"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Theme = "midnight" | "arctic" | "forest" | "sunset" | "rose";

export const THEMES: { id: Theme; label: string; preview: string; dark: boolean }[] = [
  { id: "midnight", label: "Midnight",  preview: "#7c6bff", dark: true  },
  { id: "arctic",   label: "Arctic",    preview: "#4f46e5", dark: false },
  { id: "forest",   label: "Forest",    preview: "#22c55e", dark: true  },
  { id: "sunset",   label: "Sunset",    preview: "#f97316", dark: true  },
  { id: "rose",     label: "Rose",      preview: "#ec4899", dark: false },
];

interface ThemeCtx {
  theme: Theme;
  setTheme: (t: Theme) => void;
  isDark: boolean;
}

const Ctx = createContext<ThemeCtx>({
  theme: "midnight",
  setTheme: () => {},
  isDark: true,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("midnight");

  useEffect(() => {
    const saved = localStorage.getItem("ui-theme") as Theme | null;
    if (saved && THEMES.find(t => t.id === saved)) setThemeState(saved);
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem("ui-theme", t);
    document.documentElement.setAttribute("data-theme", t);
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const isDark = THEMES.find(t => t.id === theme)?.dark ?? true;

  return <Ctx.Provider value={{ theme, setTheme, isDark }}>{children}</Ctx.Provider>;
}

export const useTheme = () => useContext(Ctx);
