"use client";

import { useState, useRef, useCallback, KeyboardEvent } from "react";
import { Send, Square, Mic } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  onStop: () => void;
  isLoading: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  onStop,
  isLoading,
  placeholder = "Describe a UI to generate… (e.g. 'Create a todo list with deadlines')",
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [value, isLoading, onSend]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  };

  const canSend = value.trim().length > 0 && !isLoading;

  return (
    <div
      className="relative flex items-end gap-3 rounded-2xl p-3"
      style={{
        background: "hsl(var(--surface-elevated))",
        border: "1px solid hsl(var(--border))",
        transition: "box-shadow 0.2s, border-color 0.2s",
      }}
      onFocusCapture={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.borderColor = "hsl(var(--brand-dim))";
        el.style.boxShadow = "0 0 0 3px hsl(var(--brand-subtle))";
      }}
      onBlurCapture={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.borderColor = "hsl(var(--border))";
        el.style.boxShadow = "none";
      }}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        placeholder={placeholder}
        rows={1}
        disabled={isLoading}
        className="flex-1 bg-transparent resize-none outline-none text-sm leading-relaxed"
        style={{
          color: "hsl(var(--ink))",
          fontFamily: "var(--font-body)",
          maxHeight: "200px",
          minHeight: "24px",
          caretColor: "hsl(var(--brand))",
        }}
      />

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          className="p-1.5 rounded-lg opacity-40 transition-opacity"
          style={{ color: "hsl(var(--ink-muted))" }}
          title="Voice input (coming soon)"
          disabled
        >
          <Mic className="w-4 h-4" />
        </button>

        {isLoading ? (
          <button
            onClick={onStop}
            className="p-2 rounded-xl transition-all hover:scale-105 flex items-center justify-center"
            style={{
              background: "rgba(248, 113, 113, 0.15)",
              border: "1px solid rgba(248, 113, 113, 0.3)",
              color: "#f87171",
            }}
            title="Stop generation"
          >
            <Square className="w-4 h-4 fill-current" />
          </button>
        ) : (
          <button
            onClick={handleSend}
            disabled={!canSend}
            className="p-2 rounded-xl transition-all"
            style={{
              background: canSend
                ? "linear-gradient(135deg, hsl(var(--brand)) 0%, hsl(var(--accent)) 100%)"
                : "hsl(var(--surface))",
              border: canSend ? "1px solid transparent" : "1px solid hsl(var(--border))",
              color: canSend ? "white" : "hsl(var(--ink-faint))",
              opacity: canSend ? 1 : 0.5,
              cursor: canSend ? "pointer" : "not-allowed",
            }}
            title="Send message (Enter)"
          >
            <Send className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
