"use client";

import { useRef, useEffect, useState } from "react";
import { useChat } from "@/hooks/useChat";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { WelcomeScreen } from "./WelcomeScreen";
import { Sparkles, Trash2, Zap } from "lucide-react";

const SUGGESTION_PROMPTS = [
  "Create a todo list for launching a startup with deadlines",
  "Show me the weather in Tokyo",
  "Build a kanban board for a mobile app project",
  "Create a weekly calendar for a developer",
  "Calculate compound interest: $10,000 at 7% for 10 years",
  "Show a chart of monthly sales data",
  "Set a 25-minute Pomodoro timer",
];

export function ChatInterface() {
  const { messages, isLoading, sendMessage, stopGeneration, clearMessages } =
    useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [suggestionsVisible, setSuggestionsVisible] = useState(true);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (messages.length > 0) setSuggestionsVisible(false);
  }, [messages.length]);

  const handleSend = async (content: string) => {
    await sendMessage(content);
  };

  const handleSuggestion = (prompt: string) => {
    setSuggestionsVisible(false);
    sendMessage(prompt);
  };

  return (
    <div className="flex flex-col w-full h-screen" style={{ background: "hsl(var(--surface-sunken))" }}>
      {/* Header */}
      <header
        className="flex items-center justify-between px-6 py-4 border-b"
        style={{
          background: "rgba(255,255,255,0.02)",
          backdropFilter: "blur(20px)",
          borderColor: "hsl(var(--border))",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center animate-glow-pulse"
            style={{ background: "linear-gradient(135deg, hsl(var(--brand)) 0%, hsl(var(--accent)) 100%)" }}
          >
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1
              className="text-base font-semibold gradient-text"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Generative UI
            </h1>
            <p className="text-xs" style={{ color: "hsl(var(--ink-faint))" }}>
              Powered by Groq · LangGraph · Vercel AI SDK
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Status indicator */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{ background: "hsl(var(--surface-elevated))", border: "1px solid hsl(var(--border))" }}>
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: isLoading ? "#facc15" : "#4ade80",
                animation: isLoading ? "pulse_ring 1s ease-in-out infinite" : "none",
              }}
            />
            <span className="text-xs" style={{ color: "hsl(var(--ink-muted))", fontFamily: "var(--font-mono)" }}>
              {isLoading ? "thinking..." : "ready"}
            </span>
          </div>

          {messages.length > 0 && (
            <button
              onClick={clearMessages}
              className="p-2 rounded-lg transition-all hover:scale-105"
              style={{
                background: "hsl(var(--surface-elevated))",
                border: "1px solid hsl(var(--border))",
                color: "hsl(var(--ink-faint))",
              }}
              title="Clear conversation"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{ background: "hsl(var(--brand-subtle))", border: "1px solid hsl(var(--brand-dim))" }}>
            <Zap className="w-3 h-3" style={{ color: "hsl(var(--brand))" }} />
            <span className="text-xs font-medium" style={{ color: "hsl(var(--brand))" }}>
              llama-3.3-70b
            </span>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto w-full px-4 py-6">
          {messages.length === 0 ? (
            <WelcomeScreen
              suggestions={SUGGESTION_PROMPTS}
              onSuggestion={handleSuggestion}
              visible={suggestionsVisible}
            />
          ) : (
            <div className="space-y-6">
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

      {/* Input Area */}
      <div
        className="border-t px-4 py-4"
        style={{
          background: "rgba(255,255,255,0.02)",
          backdropFilter: "blur(20px)",
          borderColor: "hsl(var(--border))",
        }}
      >
        <div className="max-w-4xl mx-auto">
          {suggestionsVisible && messages.length === 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {SUGGESTION_PROMPTS.slice(0, 4).map((s) => (
                <button
                  key={s}
                  onClick={() => handleSuggestion(s)}
                  className="text-xs px-3 py-1.5 rounded-full transition-all hover:scale-105"
                  style={{
                    background: "hsl(var(--surface-elevated))",
                    border: "1px solid hsl(var(--border))",
                    color: "hsl(var(--ink-muted))",
                  }}
                >
                  {s.length > 40 ? s.slice(0, 40) + "…" : s}
                </button>
              ))}
            </div>
          )}
          <ChatInput
            onSend={handleSend}
            onStop={stopGeneration}
            isLoading={isLoading}
          />
          <p className="text-center mt-2 text-xs" style={{ color: "hsl(var(--ink-faint))" }}>
            AI can make mistakes. Verify important information.
          </p>
        </div>
      </div>
    </div>
  );
}
