"use client";

import dynamic from "next/dynamic";
import { GeneratedUIType } from "@/types";
import { Loader2 } from "lucide-react";

const TodoList = dynamic(() => import("@/components/generated/TodoList").then(m => ({ default: m.TodoList })), {
  loading: () => <ComponentLoader label="Todo List" />,
  ssr: false,
});
const WeatherWidget = dynamic(() => import("@/components/generated/WeatherWidget").then(m => ({ default: m.WeatherWidget })), {
  loading: () => <ComponentLoader label="Weather" />,
  ssr: false,
});
const CalculatorWidget = dynamic(() => import("@/components/generated/CalculatorWidget").then(m => ({ default: m.CalculatorWidget })), {
  loading: () => <ComponentLoader label="Calculator" />,
  ssr: false,
});
const KanbanBoard = dynamic(() => import("@/components/generated/KanbanBoard").then(m => ({ default: m.KanbanBoard })), {
  loading: () => <ComponentLoader label="Kanban Board" />,
  ssr: false,
});
const ChartWidget = dynamic(() => import("@/components/generated/ChartWidget").then(m => ({ default: m.ChartWidget })), {
  loading: () => <ComponentLoader label="Chart" />,
  ssr: false,
});
const CalendarWidget = dynamic(() => import("@/components/generated/CalendarWidget").then(m => ({ default: m.CalendarWidget })), {
  loading: () => <ComponentLoader label="Calendar" />,
  ssr: false,
});
const TimerWidget = dynamic(() => import("@/components/generated/TimerWidget").then(m => ({ default: m.TimerWidget })), {
  loading: () => <ComponentLoader label="Timer" />,
  ssr: false,
});
const DataTable = dynamic(() => import("@/components/generated/DataTable").then(m => ({ default: m.DataTable })), {
  loading: () => <ComponentLoader label="Data Table" />,
  ssr: false,
});

function ComponentLoader({ label }: { label: string }) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-6 rounded-2xl"
      style={{
        background: "hsl(var(--surface-elevated))",
        border: "1px solid hsl(var(--border))",
      }}
    >
      <Loader2
        className="w-4 h-4 animate-spin"
        style={{ color: "hsl(var(--brand))" }}
      />
      <span className="text-sm" style={{ color: "hsl(var(--ink-muted))" }}>
        Generating {label}…
      </span>
    </div>
  );
}

interface GeneratedUIRendererProps {
  type: GeneratedUIType;
  data: unknown;
  isLatest?: boolean;
}

export function GeneratedUIRenderer({ type, data, isLatest: _ }: GeneratedUIRendererProps) {
  if (!data) return null;

  switch (type) {
    case "todo-list":
      return <TodoList {...(data as Parameters<typeof TodoList>[0])} id={`todo-${Date.now()}`} />;
    case "weather-widget":
      return <WeatherWidget data={data as Parameters<typeof WeatherWidget>[0]["data"]} id={`weather-${Date.now()}`} />;
    case "calculator":
      return <CalculatorWidget {...(data as Parameters<typeof CalculatorWidget>[0])} id={`calc-${Date.now()}`} />;
    case "kanban-board":
      return <KanbanBoard {...(data as Parameters<typeof KanbanBoard>[0])} id={`kanban-${Date.now()}`} />;
    case "chart":
      return <ChartWidget {...(data as Parameters<typeof ChartWidget>[0])} id={`chart-${Date.now()}`} />;
    case "calendar":
      return <CalendarWidget {...(data as Parameters<typeof CalendarWidget>[0])} id={`cal-${Date.now()}`} />;
    case "timer":
      return <TimerWidget {...(data as Parameters<typeof TimerWidget>[0])} id={`timer-${Date.now()}`} />;
    case "data-table":
      return <DataTable {...(data as Parameters<typeof DataTable>[0])} id={`table-${Date.now()}`} />;
    default:
      return null;
  }
}
