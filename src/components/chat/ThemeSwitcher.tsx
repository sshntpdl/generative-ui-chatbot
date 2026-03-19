"use client";

import { useTheme, THEMES } from "@/lib/theme";
import { useState } from "react";
import { Palette, Check } from "lucide-react";

export function ThemeSwitcher({ compact = false }: { compact?: boolean }) {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {THEMES.map(t => (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            title={t.label}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all"
            style={{
              background: theme === t.id ? "var(--accent-subtle)" : "var(--bg-elevated)",
              border: `1px solid ${theme === t.id ? "var(--accent-1)" : "var(--border-base)"}`,
              color: theme === t.id ? "var(--accent-1)" : "var(--text-muted)",
            }}
          >
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ background: t.preview }}
            />
            {t.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
        style={{
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-subtle)",
          color: "var(--text-muted)",
        }}
        title="Change theme"
      >
        <Palette className="w-3.5 h-3.5" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-full mt-2 z-50 rounded-2xl overflow-hidden py-2 w-44"
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-base)",
              boxShadow: "var(--shadow-md)",
            }}
          >
            <p className="text-xs font-medium px-3 pb-2" style={{ color: "var(--text-muted)" }}>Theme</p>
            {THEMES.map(t => (
              <button
                key={t.id}
                onClick={() => { setTheme(t.id); setOpen(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs transition-all"
                style={{ color: theme === t.id ? "var(--accent-1)" : "var(--text-secondary)" }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--bg-hover)"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
              >
                <span className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ background: t.preview }} />
                <span className="flex-1 text-left">{t.label}</span>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {t.dark ? "🌙" : "☀️"}
                </span>
                {theme === t.id && <Check className="w-3 h-3 flex-shrink-0" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
