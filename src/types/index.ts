export type Role = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  timestamp: Date;
  uiComponent?: GeneratedUIType;
  metadata?: Record<string, unknown>;
}

export type GeneratedUIType =
  | "todo-list" | "weather-widget" | "calculator" | "calendar"
  | "data-table" | "chart" | "kanban-board" | "timer"
  | "product-grid" | "product-detail" | "cart" | "order-tracking"
  | "text";

export type Priority = "critical" | "high" | "medium" | "low";
export type TodoStatus = "pending" | "in-progress" | "completed";

export interface BaseUIProps { id: string; title?: string }

export interface TodoItem {
  id: string; text: string; completed: boolean; priority: Priority;
  deadline?: string; tags?: string[]; estimatedMinutes?: number;
  status: TodoStatus; order: number;
}
export interface TodoListProps extends BaseUIProps { todos: TodoItem[]; description?: string }

export interface WeatherData {
  city: string; country: string; temperature: number; feelsLike: number;
  humidity: number; windSpeed: number; condition: string; icon: string;
  forecast?: WeatherForecastDay[];
}
export interface WeatherForecastDay { date: string; high: number; low: number; condition: string; icon: string }
export interface WeatherWidgetProps extends BaseUIProps { data: WeatherData }

export interface CalculatorProps extends BaseUIProps { expression?: string; result?: number; history?: Array<{expression:string;result:number}> }

export type ChartType = "bar" | "line" | "pie" | "area";
export interface ChartDataset { label: string; data: number[]; color?: string }
export interface ChartProps extends BaseUIProps { chartType: ChartType; labels: string[]; datasets: ChartDataset[]; description?: string }

export interface KanbanCard { id: string; title: string; description?: string; priority: Priority; assignee?: string; dueDate?: string; tags?: string[] }
export interface KanbanColumn { id: string; title: string; color: string; cards: KanbanCard[] }
export interface KanbanBoardProps extends BaseUIProps { columns: KanbanColumn[]; description?: string }

export interface CalendarEvent { id: string; title: string; date: string; time?: string; duration?: number; color?: string; description?: string }
export interface CalendarProps extends BaseUIProps { events: CalendarEvent[]; initialDate?: string }

export interface TimerProps extends BaseUIProps { duration: number; label?: string; type: "countdown" | "stopwatch" | "pomodoro" }

export interface DataTableProps extends BaseUIProps { headers: string[]; rows: (string|number)[][]; description?: string }

/* ─── E-Commerce Types ─────────────────────────────── */

export interface ProductReview { author: string; rating: number; comment: string; date: string }

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  currency: string;
  rating: number;
  reviewCount: number;
  image: string;       // emoji or placeholder url
  category: string;
  tags: string[];
  inStock: boolean;
  stockCount?: number;
  description: string;
  features?: string[];
  badge?: string;      // "Best Seller" | "New" | "Sale" | "Hot"
  reviews?: ProductReview[];
  variants?: ProductVariant[];
}

export interface ProductVariant { id: string; label: string; value: string; inStock: boolean }

export interface ProductGridProps extends BaseUIProps {
  products: Product[];
  query?: string;
  category?: string;
  description?: string;
}

export interface ProductDetailProps extends BaseUIProps {
  product: Product;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariants?: Record<string, string>;
}

export interface CartProps extends BaseUIProps {
  items: CartItem[];
  couponCode?: string;
  discount?: number;
}

export interface OrderTrackingProps extends BaseUIProps {
  orderId: string;
  product: string;
  status: "placed" | "confirmed" | "shipped" | "out-for-delivery" | "delivered";
  estimatedDelivery: string;
  trackingNumber?: string;
  steps: OrderStep[];
}

export interface OrderStep {
  id: string;
  label: string;
  description: string;
  timestamp?: string;
  completed: boolean;
  active: boolean;
}

/* ─── LangGraph ─────────────────────────────────────── */
export interface GraphState {
  messages: ChatMessage[];
  currentQuery: string;
  detectedIntent: GeneratedUIType | null;
  toolResults: Record<string, unknown>;
  uiData: unknown;
  streamingText: string;
  error?: string;
}

export interface StreamEvent {
  type: "text" | "ui-component" | "tool-call" | "tool-result" | "error" | "done";
  content?: string;
  componentType?: GeneratedUIType;
  componentData?: unknown;
  toolName?: string;
  toolResult?: unknown;
  error?: string;
}
