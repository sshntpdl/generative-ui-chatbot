import { NextRequest } from "next/server";
import { runGraph } from "@/lib/langgraph/graph";
import type { StreamEvent } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Invalid messages" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const lastMessage = messages[messages.length - 1];
    const query: string =
      typeof lastMessage.content === "string"
        ? lastMessage.content
        : lastMessage.content?.[0]?.text ?? "";

    const history = messages.slice(0, -1).map((m: { role: string; content: string }) => ({
      role: m.role as string,
      content: typeof m.content === "string" ? m.content : "",
    }));

    // Create SSE stream
    const encoder = new TextEncoder();
    let controllerRef: ReadableStreamDefaultController | null = null;

    const stream = new ReadableStream({
      start(controller) {
        controllerRef = controller;
      },
    });

    const sendEvent = (event: StreamEvent) => {
      if (!controllerRef) return;
      const data = `data: ${JSON.stringify(event)}\n\n`;
      controllerRef.enqueue(encoder.encode(data));
    };

    // Run async graph and stream results
    (async () => {
      try {
        sendEvent({ type: "text", content: "" });

        const result = await runGraph(query, history);

        if (result.uiType !== "text" && result.uiData) {
          sendEvent({
            type: "ui-component",
            componentType: result.uiType,
            componentData: result.uiData,
          });
        } else {
          sendEvent({
            type: "text",
            content: result.text || "I couldn't generate a response. Please try again.",
          });
        }

        sendEvent({ type: "done" });
      } catch (err) {
        console.error("[Chat API Error]", err);
        sendEvent({
          type: "error",
          error:
            err instanceof Error ? err.message : "An unexpected error occurred",
        });
      } finally {
        controllerRef?.close();
      }
    })();

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err) {
    console.error("[Chat API]", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
