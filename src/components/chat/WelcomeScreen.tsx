"use client";

import { Sparkles, Cpu, Layers, Zap } from "lucide-react";

interface WelcomeScreenProps {
  suggestions: string[];
  onSuggestion: (prompt: string) => void;
  visible: boolean;
}

const CAPABILITIES = [
  {
    icon: "📋",
    label: "Todo Lists",
    desc: "Drag-drop tasks with AI prioritization",
  },
  {
    icon: "🌤️",
    label: "Weather",
    desc: "Live forecasts via LangChain tools",
  },
  {
    icon: "📊",
    label: "Charts & Tables",
    desc: "Interactive data visualizations",
  },
  {
    icon: "🗂️",
    label: "Kanban Boards",
    desc: "Sprint planning & project workflows",
  },
  {
    icon: "🧮",
    label: "Calculator",
    desc: "Complex math & unit conversions",
  },
  {
    icon: "📅",
    label: "Calendar",
    desc: "Schedule events & reminders",
  },
];

const TECH_STACK = [
  { icon: Zap, label: "Groq", color: "#f97316" },
  { icon: Layers, label: "LangGraph", color: "#8b5cf6" },
  { icon: Cpu, label: "Vercel AI SDK", color: "#38bdf8" },
];

export function WelcomeScreen({
  suggestions,
  onSuggestion,
  visible,
}: WelcomeScreenProps) {
  if (!visible) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-12 animate-fade-scale">
      {/* Logo & Title */}
      <div className="flex flex-col items-center mb-8">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 animate-float"
          style={{
            background:
              "linear-gradient(135deg, hsl(var(--brand)) 0%, hsl(var(--accent)) 100%)",
            boxShadow: "0 8px 32px rgba(139, 92, 246, 0.4)",
          }}
        >
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h1
          className="text-4xl font-bold gradient-text mb-2"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Generative UI
        </h1>
        <p
          className="text-center max-w-sm text-sm leading-relaxed"
          style={{ color: "hsl(var(--ink-muted))" }}
        >
          Describe what you need — I&apos;ll generate an interactive UI component
          powered by AI in real-time.
        </p>
      </div>

      {/* Tech Stack Pills */}
      <div className="flex items-center gap-3 mb-10">
        {TECH_STACK.map(({ icon: Icon, label, color }) => (
          <div
            key={label}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
            style={{
              background: `${color}18`,
              border: `1px solid ${color}40`,
              color,
            }}
          >
            <Icon className="w-3 h-3" />
            {label}
          </div>
        ))}
      </div>

      {/* Capabilities Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-10 w-full max-w-2xl">
        {CAPABILITIES.map(({ icon, label, desc }) => (
          <div
            key={label}
            className="glass rounded-xl p-3 flex items-start gap-3 cursor-default"
            style={{ transition: "all 0.2s" }}
          >
            <span className="text-xl">{icon}</span>
            <div>
              <p
                className="text-sm font-medium"
                style={{ color: "hsl(var(--ink))" }}
              >
                {label}
              </p>
              <p
                className="text-xs mt-0.5"
                style={{ color: "hsl(var(--ink-faint))" }}
              >
                {desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Suggestion Prompts */}
      <div className="w-full max-w-2xl">
        <p
          className="text-xs font-medium mb-3 text-center"
          style={{
            color: "hsl(var(--ink-faint))",
            fontFamily: "var(--font-mono)",
          }}
        >
          TRY THESE PROMPTS
        </p>
        <div className="flex flex-col gap-2">
          {suggestions.slice(0, 5).map((s) => (
            <button
              key={s}
              onClick={() => onSuggestion(s)}
              className="glass text-left px-4 py-3 rounded-xl text-sm transition-all hover:scale-[1.01]"
              style={{
                color: "hsl(var(--ink-muted))",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor =
                  "hsl(var(--brand-dim))";
                (e.currentTarget as HTMLButtonElement).style.color =
                  "hsl(var(--ink))";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor =
                  "hsl(var(--border))";
                (e.currentTarget as HTMLButtonElement).style.color =
                  "hsl(var(--ink-muted))";
              }}
            >
              <span
                className="mr-2"
                style={{ color: "hsl(var(--brand))" }}
              >
                →
              </span>
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
