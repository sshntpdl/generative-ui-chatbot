"use client";

import { useState, useCallback, useRef } from "react";
import { nanoid } from "@/lib/utils";
import type { ChatMessage, GeneratedUIType, StreamEvent } from "@/types";

export interface UseChatOptions {
  onError?: (error: string) => void;
}

export function useChat(options?: UseChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const appendMessage = useCallback((msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const updateLastAssistantMessage = useCallback(
    (update: Partial<ChatMessage>) => {
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (!last || last.role !== "assistant") return prev;
        return [...prev.slice(0, -1), { ...last, ...update }];
      });
    },
    []
  );

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      setError(null);
      setIsLoading(true);

      const userMessage: ChatMessage = {
        id: nanoid(),
        role: "user",
        content: content.trim(),
        timestamp: new Date(),
      };

      const assistantMessage: ChatMessage = {
        id: nanoid(),
        role: "assistant",
        content: "",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage, assistantMessage]);

      const messagesForAPI = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: messagesForAPI }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const raw = line.slice(6).trim();
            if (!raw) continue;

            try {
              const event = JSON.parse(raw) as StreamEvent;

              switch (event.type) {
                case "text":
                  if (event.content) {
                    updateLastAssistantMessage({ content: event.content });
                  }
                  break;

                case "ui-component":
                  updateLastAssistantMessage({
                    uiComponent: event.componentType as GeneratedUIType,
                    metadata: { componentData: event.componentData },
                    content: "",
                  });
                  break;

                case "error":
                  setError(event.error ?? "Unknown error");
                  updateLastAssistantMessage({
                    content: `⚠️ ${event.error ?? "An error occurred"}`,
                  });
                  options?.onError?.(event.error ?? "Unknown error");
                  break;

                case "done":
                  break;
              }
            } catch {
              // Skip malformed events
            }
          }
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        const msg = err instanceof Error ? err.message : "Network error";
        setError(msg);
        updateLastAssistantMessage({
          content: `⚠️ ${msg}. Please try again.`,
        });
        options?.onError?.(msg);
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [messages, isLoading, updateLastAssistantMessage, options]
  );

  const stopGeneration = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsLoading(false);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    stopGeneration,
    clearMessages,
    appendMessage,
  };
}
