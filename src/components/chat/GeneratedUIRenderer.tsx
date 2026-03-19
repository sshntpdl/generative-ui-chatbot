"use client";

import dynamic from "next/dynamic";
import type { GeneratedUIType } from "@/types";
import { Loader2 } from "lucide-react";

function Loader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-5 rounded-2xl"
      style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
      <Loader2 className="w-4 h-4 animate-spin" style={{ color: "var(--accent-1)" }} />
      <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Generating {label}…</span>
    </div>
  );
}

const ld = (imp: () => Promise<any>, label: string) =>
  dynamic(imp, { loading: () => <Loader label={label} />, ssr: false });

const TodoList         = ld(() => import("../generated/TodoList").then(m => ({ default: m.TodoList })), "Todo List");
const WeatherWidget    = ld(() => import("../generated/WeatherWidget").then(m => ({ default: m.WeatherWidget })), "Weather");
const CalculatorWidget = ld(() => import("../generated/CalculatorWidget").then(m => ({ default: m.CalculatorWidget })), "Calculator");
const KanbanBoard      = ld(() => import("../generated/KanbanBoard").then(m => ({ default: m.KanbanBoard })), "Kanban Board");
const ChartWidget      = ld(() => import("../generated/ChartWidget").then(m => ({ default: m.ChartWidget })), "Chart");
const CalendarWidget   = ld(() => import("../generated/CalendarWidget").then(m => ({ default: m.CalendarWidget })), "Calendar");
const TimerWidget      = ld(() => import("../generated/TimerWidget").then(m => ({ default: m.TimerWidget })), "Timer");
const DataTable        = ld(() => import("../generated/DataTable").then(m => ({ default: m.DataTable })), "Table");
const ProductGrid      = ld(() => import("../generated/ProductGrid").then(m => ({ default: m.ProductGrid })), "Products");
const ProductDetail    = ld(() => import("../generated/ProductDetail").then(m => ({ default: m.ProductDetail })), "Product");
const Cart             = ld(() => import("../generated/EcommerceWidgets").then(m => ({ default: m.Cart })), "Cart");
const OrderTracking    = ld(() => import("../generated/EcommerceWidgets").then(m => ({ default: m.OrderTracking })), "Order Tracking");

interface Props { type: GeneratedUIType; data: unknown; isLatest?: boolean }

export function GeneratedUIRenderer({ type, data }: Props) {
  if (!data) return null;
  const d = data as any;
  const id = `${type}-${Date.now()}`;
  switch (type) {
    case "todo-list":       return <TodoList         {...d} id={id} />;
    case "weather-widget":  return <WeatherWidget    data={d.data ?? d} id={id} />;
    case "calculator":      return <CalculatorWidget {...d} id={id} />;
    case "kanban-board":    return <KanbanBoard      {...d} id={id} />;
    case "chart":           return <ChartWidget      {...d} id={id} />;
    case "calendar":        return <CalendarWidget   {...d} id={id} />;
    case "timer":           return <TimerWidget      {...d} id={id} />;
    case "data-table":      return <DataTable        {...d} id={id} />;
    case "product-grid":    return <ProductGrid      {...d} id={id} />;
    case "product-detail":  return <ProductDetail    product={d.product ?? d} id={id} />;
    case "cart":            return <Cart             {...d} id={id} />;
    case "order-tracking":  return <OrderTracking    {...d} id={id} />;
    default: return null;
  }
}
