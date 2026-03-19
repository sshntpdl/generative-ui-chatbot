"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { Send, Square, Mic } from "lucide-react";

interface Props { onSend: (text: string) => void; onStop: () => void; isLoading: boolean }

export function ChatInput({ onSend, onStop, isLoading }: Props) {
  const [value, setValue] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  const send = () => {
    if (!value.trim() || isLoading) return;
    onSend(value.trim());
    setValue("");
    if (ref.current) ref.current.style.height = "auto";
  };

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const autoResize = () => {
    if (!ref.current) return;
    ref.current.style.height = "auto";
    ref.current.style.height = `${Math.min(ref.current.scrollHeight, 180)}px`;
  };

  return (
    <div
      className="flex items-end gap-2 p-2 rounded-2xl transition-all"
      style={{
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-base)",
      }}
      onFocusCapture={e => (e.currentTarget as HTMLDivElement).style.borderColor = "var(--accent-1)"}
      onBlurCapture={e  => (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border-base)"}
    >
      <textarea
        ref={ref}
        value={value}
        onChange={e => { setValue(e.target.value); autoResize(); }}
        onKeyDown={onKey}
        placeholder="Ask anything — I'll build the UI for you…"
        rows={1}
        className="flex-1 resize-none bg-transparent outline-none text-sm leading-relaxed px-2 py-1.5"
        style={{
          color: "var(--text-primary)",
          fontFamily: "'Inter', sans-serif",
          minHeight: "24px",
          maxHeight: "180px",
          caretColor: "var(--accent-1)",
        }}
      />

      <div className="flex items-center gap-1 pb-0.5 flex-shrink-0">
        <button
          className="w-8 h-8 rounded-xl flex items-center justify-center transition-all opacity-40 hover:opacity-60"
          style={{ color: "var(--text-muted)" }}
          title="Voice input (coming soon)"
          disabled
        >
          <Mic className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={isLoading ? onStop : send}
          disabled={!isLoading && !value.trim()}
          className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
          style={{
            background: isLoading
              ? "rgba(248,113,113,0.15)"
              : value.trim()
              ? "var(--accent-1)"
              : "var(--bg-hover)",
            border: isLoading ? "1px solid rgba(248,113,113,0.5)" : "none",
            color: isLoading ? "var(--danger)" : "#fff",
          }}
        >
          {isLoading ? <Square className="w-3 h-3" fill="currentColor" /> : <Send className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
}
