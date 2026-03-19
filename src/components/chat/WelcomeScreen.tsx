"use client";

import { Sparkles } from "lucide-react";

interface Props {
  prompts: { cat: string; text: string }[];
  onSelect: (text: string) => void;
}

const CATEGORIES = ["🛍️ Shop", "📋 Tasks", "🌤️ Utility", "📊 Data", "🧮 Math", "⏱️ Focus"];

export function WelcomeScreen({ prompts, onSelect }: Props) {
  return (
    <div className="flex flex-col items-center py-10 anim-fade-in">
      {/* Logo */}
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 anim-float"
        style={{ background: "var(--accent-1)", boxShadow: "0 8px 32px var(--accent-glow)" }}
      >
        <Sparkles className="w-7 h-7 text-white" />
      </div>

      <h1 className="text-2xl font-bold font-poppins gradient-text mb-1">What can I help you with?</h1>
      <p className="text-sm mb-8 text-center max-w-xs" style={{ color: "var(--text-secondary)" }}>
        I generate live interactive UI — shop for products, manage tasks, check weather, and more.
      </p>

      {/* Prompt grid grouped by category */}
      {CATEGORIES.map(cat => {
        const items = prompts.filter(p => p.cat === cat);
        if (!items.length) return null;
        return (
          <div key={cat} className="w-full max-w-2xl mb-4">
            <p className="text-xs font-medium mb-2 px-1" style={{ color: "var(--text-muted)" }}>{cat}</p>
            <div className="flex flex-col gap-1.5">
              {items.map(p => (
                <button
                  key={p.text}
                  onClick={() => onSelect(p.text)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-left transition-all group"
                  style={{
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border-subtle)",
                    color: "var(--text-secondary)",
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = "var(--accent-1)";
                    el.style.color = "var(--text-primary)";
                    el.style.background = "var(--accent-subtle)";
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = "var(--border-subtle)";
                    el.style.color = "var(--text-secondary)";
                    el.style.background = "var(--bg-surface)";
                  }}
                >
                  <span className="text-xs" style={{ color: "var(--accent-1)" }}>→</span>
                  {p.text}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
