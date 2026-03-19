"use client";

import { useRef, useEffect, useState } from "react";
import { useChat } from "@/hooks/useChat";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { WelcomeScreen } from "./WelcomeScreen";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { Sparkles, Trash2, Zap, Menu, X, MessageSquare, Plus } from "lucide-react";

const PROMPTS = [
  { cat: "🛍️ Shop",    text: "Show me the best wireless headphones under $150" },
  { cat: "🛍️ Shop",    text: "Search for gaming laptops and compare them" },
  { cat: "🛍️ Shop",    text: "Show my cart with 3 items" },
  { cat: "🛍️ Shop",    text: "Track my order #ORD-2891" },
  { cat: "📋 Tasks",   text: "Create a todo list for launching a startup" },
  { cat: "📋 Tasks",   text: "Build a kanban board for my mobile app project" },
  { cat: "🌤️ Utility", text: "Show the weather in Tokyo for this week" },
  { cat: "📊 Data",    text: "Show a chart of monthly revenue growth" },
  { cat: "🧮 Math",    text: "Calculate compound interest: $10k at 7% for 10 years" },
  { cat: "⏱️ Focus",   text: "Set a 25-minute Pomodoro timer" },
];

interface ConvoItem { id: string; title: string; ts: Date }

export function ChatInterface() {
  const { messages, isLoading, sendMessage, stopGeneration, clearMessages } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [history] = useState<ConvoItem[]>([
    { id: "1", title: "Wireless headphones search", ts: new Date(Date.now() - 3600000) },
    { id: "2", title: "Startup todo list", ts: new Date(Date.now() - 86400000) },
    { id: "3", title: "Tokyo weather check", ts: new Date(Date.now() - 172800000) },
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (text: string) => sendMessage(text);

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ background: "var(--bg-base)" }}>

      {/* ── Sidebar ── */}
      <aside
        className="flex-shrink-0 flex flex-col transition-all duration-300 overflow-hidden"
        style={{
          width: sidebarOpen ? 240 : 0,
          background: "var(--bg-surface)",
          borderRight: `1px solid var(--border-subtle)`,
        }}
      >
        <div className="flex flex-col h-full" style={{ width: 240 }}>
          {/* Sidebar header */}
          <div className="flex items-center justify-between px-4 py-4 flex-shrink-0"
            style={{ borderBottom: "1px solid var(--border-subtle)" }}>
            <span className="text-sm font-semibold font-poppins gradient-text">GenUI</span>
            <button onClick={() => setSidebarOpen(false)}
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ color: "var(--text-muted)" }}>
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* New chat */}
          <div className="px-3 py-3 flex-shrink-0">
            <button
              onClick={() => { clearMessages(); setSidebarOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{ background: "var(--accent-subtle)", color: "var(--accent-1)", border: "1px solid var(--accent-1)" }}>
              <Plus className="w-3.5 h-3.5" /> New Chat
            </button>
          </div>

          {/* History */}
          <div className="flex-1 overflow-y-auto px-3 pb-3">
            <p className="text-xs font-medium px-1 mb-2" style={{ color: "var(--text-muted)" }}>Recent</p>
            {history.map(c => (
              <button key={c.id}
                className="w-full flex items-start gap-2 px-3 py-2 rounded-xl text-left transition-all mb-1 group"
                style={{ color: "var(--text-secondary)" }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--bg-hover)"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
              >
                <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: "var(--text-muted)" }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate" style={{ color: "var(--text-primary)" }}>{c.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                    {c.ts.toLocaleDateString([], { month: "short", day: "numeric" })}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Theme switcher in sidebar */}
          <div className="px-4 py-4 flex-shrink-0" style={{ borderTop: "1px solid var(--border-subtle)" }}>
            <p className="text-xs font-medium mb-2" style={{ color: "var(--text-muted)" }}>Theme</p>
            <ThemeSwitcher compact />
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex flex-col flex-1 min-w-0">

        {/* Header */}
        <header
          className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
          style={{
            background: "var(--bg-surface)",
            borderBottom: "1px solid var(--border-subtle)",
            backdropFilter: "blur(20px)",
          }}
        >
          <button
            onClick={() => setSidebarOpen(s => !s)}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors flex-shrink-0"
            style={{ color: "var(--text-muted)", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}
          >
            <Menu className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div
              className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "var(--accent-1)" }}
            >
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-semibold font-poppins gradient-text leading-none">GenUI Chat</h1>
              <p className="text-xs leading-none mt-0.5" style={{ color: "var(--text-muted)" }}>
                AI · Groq · LangGraph
              </p>
            </div>
          </div>

          {/* Header controls */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Status */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full"
              style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: isLoading ? "var(--warning)" : "var(--success)",
                  animation: isLoading ? "pulse-dot 1s ease-in-out infinite" : "none",
                }}
              />
              <span className="text-xs" style={{ color: "var(--text-muted)", fontFamily: "Geist Mono, monospace" }}>
                {isLoading ? "thinking" : "ready"}
              </span>
            </div>

            {/* Model badge */}
            <div className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-full"
              style={{ background: "var(--accent-subtle)", border: "1px solid var(--accent-1)" }}>
              <Zap className="w-3 h-3" style={{ color: "var(--accent-1)" }} />
              <span className="text-xs font-medium" style={{ color: "var(--accent-1)" }}>llama-3.3-70b</span>
            </div>

            {/* Theme (header, not in sidebar) */}
            <div className="hidden sm:block">
              <ThemeSwitcher />
            </div>

            {/* Clear */}
            {messages.length > 0 && (
              <button onClick={clearMessages}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:opacity-70"
                style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", color: "var(--text-muted)" }}
                title="Clear chat"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto w-full px-4 py-6">
            {messages.length === 0 ? (
              <WelcomeScreen prompts={PROMPTS} onSelect={handleSend} />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {messages.map((msg, idx) => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    isLatest={idx === messages.length - 1}
                    isLoading={isLoading && idx === messages.length - 1 && msg.role === "assistant"}
                  />
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div
          className="flex-shrink-0 px-4 py-3"
          style={{ background: "var(--bg-surface)", borderTop: "1px solid var(--border-subtle)" }}
        >
          <div className="max-w-3xl mx-auto">
            {messages.length === 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {PROMPTS.slice(0, 4).map(p => (
                  <button key={p.text}
                    onClick={() => handleSend(p.text)}
                    className="text-xs px-3 py-1.5 rounded-full transition-all hover:opacity-80"
                    style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-base)", color: "var(--text-secondary)" }}>
                    {p.text.length > 38 ? p.text.slice(0, 38) + "…" : p.text}
                  </button>
                ))}
              </div>
            )}
            <ChatInput onSend={handleSend} onStop={stopGeneration} isLoading={isLoading} />
            <p className="text-center mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
              AI can make mistakes · Verify important information
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
