// ─── Message & Chat Types ────────────────────────────────────────────────────

export type Role = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  timestamp: Date;
  uiComponent?: GeneratedUIType;
  metadata?: Record<string, unknown>;
}

// ─── Generated UI Component Types ────────────────────────────────────────────

export type GeneratedUIType =
  | "todo-list"
  | "weather-widget"
  | "calculator"
  | "calendar"
  | "data-table"
  | "chart"
  | "kanban-board"
  | "timer"
  | "text";

export interface BaseUIProps {
  id: string;
  title?: string;
}

// ─── Todo Types ───────────────────────────────────────────────────────────────

export type Priority = "critical" | "high" | "medium" | "low";
export type TodoStatus = "pending" | "in-progress" | "completed";

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  priority: Priority;
  deadline?: string; // ISO date string
  tags?: string[];
  estimatedMinutes?: number;
  status: TodoStatus;
  order: number;
}

export interface TodoListProps extends BaseUIProps {
  todos: TodoItem[];
  description?: string;
}

// ─── Weather Types ────────────────────────────────────────────────────────────

export interface WeatherData {
  city: string;
  country: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  icon: string;
  forecast?: WeatherForecastDay[];
}

export interface WeatherForecastDay {
  date: string;
  high: number;
  low: number;
  condition: string;
  icon: string;
}

export interface WeatherWidgetProps extends BaseUIProps {
  data: WeatherData;
}

// ─── Calculator Types ─────────────────────────────────────────────────────────

export interface CalculatorProps extends BaseUIProps {
  expression?: string;
  result?: number;
  history?: Array<{ expression: string; result: number }>;
}

// ─── Chart Types ──────────────────────────────────────────────────────────────

export type ChartType = "bar" | "line" | "pie" | "area";

export interface ChartDataset {
  label: string;
  data: number[];
  color?: string;
}

export interface ChartProps extends BaseUIProps {
  chartType: ChartType;
  labels: string[];
  datasets: ChartDataset[];
  description?: string;
}

// ─── Kanban Types ─────────────────────────────────────────────────────────────

export interface KanbanCard {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  assignee?: string;
  dueDate?: string;
  tags?: string[];
}

export interface KanbanColumn {
  id: string;
  title: string;
  color: string;
  cards: KanbanCard[];
}

export interface KanbanBoardProps extends BaseUIProps {
  columns: KanbanColumn[];
  description?: string;
}

// ─── Calendar Types ───────────────────────────────────────────────────────────

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  duration?: number; // minutes
  color?: string;
  description?: string;
}

export interface CalendarProps extends BaseUIProps {
  events: CalendarEvent[];
  initialDate?: string;
}

// ─── Timer Types ──────────────────────────────────────────────────────────────

export interface TimerProps extends BaseUIProps {
  duration: number; // seconds
  label?: string;
  type: "countdown" | "stopwatch" | "pomodoro";
}

// ─── LangGraph State ──────────────────────────────────────────────────────────

export interface GraphState {
  messages: ChatMessage[];
  currentQuery: string;
  detectedIntent: GeneratedUIType | null;
  toolResults: Record<string, unknown>;
  uiData: unknown;
  streamingText: string;
  error?: string;
}

// ─── Tool Result Types ────────────────────────────────────────────────────────

export interface ToolResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// ─── Stream / API Types ───────────────────────────────────────────────────────

export interface StreamEvent {
  type: "text" | "ui-component" | "tool-call" | "tool-result" | "error" | "done";
  content?: string;
  componentType?: GeneratedUIType;
  componentData?: unknown;
  toolName?: string;
  toolResult?: unknown;
  error?: string;
}
