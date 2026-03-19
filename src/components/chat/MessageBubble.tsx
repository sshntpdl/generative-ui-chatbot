"use client";

import { ChatMessage } from "@/types";
import { GeneratedUIRenderer } from "./GeneratedUIRenderer";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Bot, User } from "lucide-react";

interface MessageBubbleProps {
  message: ChatMessage;
  isLatest: boolean;
  isLoading: boolean;
}

export function MessageBubble({ message, isLatest, isLoading }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";
  const hasUI = isAssistant && message.uiComponent && message.uiComponent !== "text";
  const isEmpty = isAssistant && !message.content && !hasUI;

  return (
    <div className={`flex gap-3 animate-slide-up ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
        style={{
          background: isUser
            ? "linear-gradient(135deg, hsl(var(--brand-dim)) 0%, hsl(var(--brand)) 100%)"
            : "hsl(var(--surface-elevated))",
          border: isUser ? "none" : "1px solid hsl(var(--border))",
        }}
      >
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4" style={{ color: "hsl(var(--brand))" }} />
        )}
      </div>

      <div className={`flex-1 min-w-0 ${isUser ? "flex justify-end" : ""}`}>
        {isUser && (
          <div
            className="inline-block max-w-[85%] px-4 py-3 rounded-2xl rounded-tr-sm text-sm leading-relaxed"
            style={{
              background: "linear-gradient(135deg, hsl(var(--brand-dim)) 0%, hsl(var(--brand)) 100%)",
              color: "white",
            }}
          >
            {message.content}
          </div>
        )}

        {isAssistant && (
          <>
            {isEmpty && isLoading && (
              <div
                className="inline-flex items-center gap-1 px-4 py-3 rounded-2xl rounded-tl-sm"
                style={{ background: "hsl(var(--surface-elevated))", border: "1px solid hsl(var(--border))" }}
              >
                <span className="typing-dot w-1.5 h-1.5 rounded-full" style={{ background: "hsl(var(--brand))" }} />
                <span className="typing-dot w-1.5 h-1.5 rounded-full" style={{ background: "hsl(var(--brand))" }} />
                <span className="typing-dot w-1.5 h-1.5 rounded-full" style={{ background: "hsl(var(--brand))" }} />
              </div>
            )}

            {message.content && !hasUI && (
              <div
                className="max-w-[90%] px-4 py-3 rounded-2xl rounded-tl-sm prose-chat"
                style={{ background: "hsl(var(--surface-elevated))", border: "1px solid hsl(var(--border))" }}
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
              </div>
            )}

            {hasUI && message.metadata?.componentData && (
              <div className="w-full max-w-[95%]">
                <GeneratedUIRenderer
                  type={message.uiComponent!}
                  data={message.metadata.componentData}
                  isLatest={isLatest}
                />
              </div>
            )}
          </>
        )}

        <div
          className={`mt-1 text-xs ${isUser ? "text-right" : "text-left"}`}
          style={{ color: "hsl(var(--ink-faint))" }}
        >
          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
    </div>
  );
}
