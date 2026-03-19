"use client";

import { ChatMessage } from "@/types";
import { GeneratedUIRenderer } from "./GeneratedUIRenderer";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Bot, User } from "lucide-react";

interface Props { message: ChatMessage; isLatest: boolean; isLoading: boolean }

export function MessageBubble({ message, isLatest, isLoading }: Props) {
  const isUser = message.role === "user";
  const hasUI  = message.role === "assistant" && message.uiComponent && message.uiComponent !== "text";
  const isEmpty = message.role === "assistant" && !message.content && !hasUI;

  const timestamp = message.timestamp.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  /* ─── Shared styles ─────────────────────────────────────── */
  const outerRow: React.CSSProperties = {
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-end",
    gap: "10px",
    width: "100%",
    marginBottom: "2px",
  };

  const avatarStyle: React.CSSProperties = {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  };

  const tsStyle: React.CSSProperties = {
    display: "block",
    fontSize: "11px",
    color: "var(--text-muted)",
    marginTop: "4px",
    lineHeight: 1,
  };

  /* ─── USER ──────────────────────────────────────────────── */
  if (isUser) {
    return (
      <div style={{ width: "100%" }}>
        {/* Row: bubble → avatar (right side) */}
        <div style={{ ...outerRow, justifyContent: "flex-end" }}>
          <div
            style={{
              background: "var(--user-bubble)",
              color: "var(--user-text)",
              padding: "10px 16px",
              borderRadius: "18px 18px 4px 18px",
              fontSize: "14px",
              lineHeight: "1.65",
              maxWidth: "72%",
              wordBreak: "break-word",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {message.content}
          </div>
          <div
            style={{
              ...avatarStyle,
              background: "var(--user-bubble)",
            }}
          >
            <User style={{ width: "14px", height: "14px", color: "var(--user-text)" }} />
          </div>
        </div>
        {/* Timestamp: right-aligned, indented to sit under bubble (not avatar) */}
        <div style={{ textAlign: "right", paddingRight: "42px" }}>
          <span style={tsStyle}>{timestamp}</span>
        </div>
      </div>
    );
  }

  /* ─── ASSISTANT ─────────────────────────────────────────── */
  return (
    <div style={{ width: "100%" }}>
      {/* Row: avatar → content */}
      <div style={{ ...outerRow, justifyContent: "flex-start" }}>
        <div
          style={{
            ...avatarStyle,
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-base)",
          }}
        >
          <Bot style={{ width: "14px", height: "14px", color: "var(--accent-1)" }} />
        </div>

        <div style={{ flex: 1, minWidth: 0, maxWidth: hasUI ? "calc(100% - 42px)" : "75%" }}>
          {/* Typing dots */}
          {isEmpty && isLoading && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                padding: "12px 16px",
                borderRadius: "18px 18px 18px 4px",
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              {[0, 1, 2].map(i => (
                <span
                  key={i}
                  className="typing-dot"
                  style={{
                    display: "block",
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    background: "var(--accent-1)",
                  }}
                />
              ))}
            </div>
          )}

          {/* Text response */}
          {message.content && !hasUI && (
            <div
              className="prose-chat"
              style={{
                padding: "10px 16px",
                borderRadius: "18px 18px 18px 4px",
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-subtle)",
                wordBreak: "break-word",
              }}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
            </div>
          )}

          {/* Generated UI component */}
          {hasUI && message.metadata?.componentData && (
            <GeneratedUIRenderer
              type={message.uiComponent!}
              data={message.metadata.componentData}
              isLatest={isLatest}
            />
          )}
        </div>
      </div>

      {/* Timestamp: left-aligned, indented past avatar */}
      <div style={{ paddingLeft: "42px" }}>
        <span style={tsStyle}>{timestamp}</span>
      </div>
    </div>
  );
}
