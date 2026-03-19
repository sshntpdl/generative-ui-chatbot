import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import type { TodoItem, Priority } from "@/types";

// ─── Weather Tool ─────────────────────────────────────────────────────────────

export const weatherTool = new DynamicStructuredTool({
  name: "get_weather",
  description:
    "Get current weather and forecast for a city. Use when user asks about weather.",
  schema: z.object({
    city: z.string().describe("The city name to get weather for"),
    country: z.string().optional().describe("Optional country code (e.g., US, UK)"),
  }),
  func: async ({ city, country }) => {
    // Simulated weather data (replace with real API like OpenWeatherMap)
    const conditions = [
      "Sunny", "Partly Cloudy", "Cloudy", "Light Rain", "Thunderstorm", "Snow", "Foggy",
    ];
    const icons = ["☀️", "⛅", "☁️", "🌧️", "⛈️", "🌨️", "🌫️"];
    const condIdx = Math.floor(Math.random() * conditions.length);

    const data = {
      city,
      country: country ?? "US",
      temperature: Math.round(15 + Math.random() * 20),
      feelsLike: Math.round(13 + Math.random() * 20),
      humidity: Math.round(40 + Math.random() * 50),
      windSpeed: Math.round(5 + Math.random() * 30),
      condition: conditions[condIdx],
      icon: icons[condIdx],
      forecast: Array.from({ length: 5 }, (_, i) => {
        const idx = Math.floor(Math.random() * conditions.length);
        return {
          date: new Date(Date.now() + (i + 1) * 86400000).toISOString().split("T")[0],
          high: Math.round(18 + Math.random() * 15),
          low: Math.round(8 + Math.random() * 10),
          condition: conditions[idx],
          icon: icons[idx],
        };
      }),
    };

    return JSON.stringify(data);
  },
});

// ─── Calculator Tool ──────────────────────────────────────────────────────────

export const calculatorTool = new DynamicStructuredTool({
  name: "calculate",
  description:
    "Evaluate mathematical expressions. Supports +, -, *, /, **, sqrt, etc.",
  schema: z.object({
    expression: z.string().describe("Mathematical expression to evaluate"),
    context: z
      .string()
      .optional()
      .describe("Context about what the calculation is for"),
  }),
  func: async ({ expression, context }) => {
    try {
      // Safe eval using Function constructor (sandboxed)
      const sanitized = expression
        .replace(/[^0-9+\-*/().\s^%]/g, "")
        .replace(/\^/g, "**");

      const result = new Function(`"use strict"; return (${sanitized})`)();

      const history = [];
      if (context) {
        history.push({ expression: `${context}: ${expression}`, result });
      } else {
        history.push({ expression, result });
      }

      return JSON.stringify({
        expression,
        result: typeof result === "number" ? result : parseFloat(result),
        history,
        formatted: new Intl.NumberFormat("en-US").format(result),
      });
    } catch {
      return JSON.stringify({ error: "Invalid expression", expression });
    }
  },
});

// ─── AI Prioritization Tool ───────────────────────────────────────────────────

export const prioritizationTool = new DynamicStructuredTool({
  name: "prioritize_todos",
  description:
    "AI-powered todo prioritization using urgency/impact matrix. Assigns priority levels and orders tasks.",
  schema: z.object({
    todos: z
      .array(
        z.object({
          id: z.string(),
          text: z.string(),
          deadline: z.string().optional(),
          tags: z.array(z.string()).optional(),
        })
      )
      .describe("List of todo items to prioritize"),
  }),
  func: async ({ todos }) => {
    const priorityMap: Record<string, Priority> = {};
    const now = new Date();

    todos.forEach((todo, index) => {
      let score = 0;

      // Deadline urgency
      if (todo.deadline) {
        const deadline = new Date(todo.deadline);
        const daysUntil = Math.ceil(
          (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysUntil <= 1) score += 40;
        else if (daysUntil <= 3) score += 30;
        else if (daysUntil <= 7) score += 20;
        else score += 5;
      }

      // Keyword analysis
      const text = todo.text.toLowerCase();
      const urgentKeywords = ["urgent", "asap", "critical", "immediately", "emergency", "deadline"];
      const highKeywords = ["important", "priority", "must", "need", "required", "fix"];
      const lowKeywords = ["maybe", "someday", "nice to have", "optional", "consider", "explore"];

      if (urgentKeywords.some((k) => text.includes(k))) score += 35;
      else if (highKeywords.some((k) => text.includes(k))) score += 25;
      else if (lowKeywords.some((k) => text.includes(k))) score -= 15;

      // Tag analysis
      if (todo.tags) {
        if (todo.tags.includes("bug") || todo.tags.includes("security")) score += 30;
        if (todo.tags.includes("feature")) score += 10;
        if (todo.tags.includes("chore") || todo.tags.includes("refactor")) score += 5;
      }

      // Position bias (earlier items slightly higher)
      score += Math.max(0, 10 - index);

      if (score >= 50) priorityMap[todo.id] = "critical";
      else if (score >= 30) priorityMap[todo.id] = "high";
      else if (score >= 15) priorityMap[todo.id] = "medium";
      else priorityMap[todo.id] = "low";
    });

    return JSON.stringify(priorityMap);
  },
});

// ─── Date/Time Tool ───────────────────────────────────────────────────────────

export const dateTimeTool = new DynamicStructuredTool({
  name: "get_datetime_info",
  description:
    "Get current date/time, parse relative dates, calculate deadlines.",
  schema: z.object({
    query: z
      .string()
      .describe(
        "Date/time query like 'next friday', 'in 3 days', 'end of month'"
      ),
    timezone: z.string().optional().describe("Timezone like 'America/New_York'"),
  }),
  func: async ({ query, timezone: _ }) => {
    const now = new Date();
    const q = query.toLowerCase();

    let targetDate = new Date(now);

    if (q.includes("tomorrow")) {
      targetDate.setDate(now.getDate() + 1);
    } else if (q.includes("next week")) {
      targetDate.setDate(now.getDate() + 7);
    } else if (q.includes("next month")) {
      targetDate.setMonth(now.getMonth() + 1);
    } else if (q.includes("end of month")) {
      targetDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else if (q.match(/in (\d+) days?/)) {
      const match = q.match(/in (\d+) days?/);
      if (match) targetDate.setDate(now.getDate() + parseInt(match[1]));
    } else if (q.match(/in (\d+) weeks?/)) {
      const match = q.match(/in (\d+) weeks?/);
      if (match) targetDate.setDate(now.getDate() + parseInt(match[1]) * 7);
    } else if (q.includes("next friday")) {
      const day = now.getDay();
      const daysUntilFriday = (5 - day + 7) % 7 || 7;
      targetDate.setDate(now.getDate() + daysUntilFriday);
    } else if (q.includes("next monday")) {
      const day = now.getDay();
      const daysUntilMonday = (1 - day + 7) % 7 || 7;
      targetDate.setDate(now.getDate() + daysUntilMonday);
    }

    return JSON.stringify({
      now: now.toISOString(),
      target: targetDate.toISOString(),
      formatted: targetDate.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      relative: `${Math.ceil((targetDate.getTime() - now.getTime()) / 86400000)} days from now`,
    });
  },
});

// ─── Export all tools ─────────────────────────────────────────────────────────

export const allTools = [
  weatherTool,
  calculatorTool,
  prioritizationTool,
  dateTimeTool,
];

export const toolsByName: Record<string, (typeof allTools)[number]> = {
  get_weather: weatherTool,
  calculate: calculatorTool,
  prioritize_todos: prioritizationTool,
  get_datetime_info: dateTimeTool,
};
