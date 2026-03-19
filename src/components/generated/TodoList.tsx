"use client";

import { useState, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { TodoItem, TodoListProps, Priority } from "@/types";
import {
  GripVertical,
  Check,
  Calendar,
  Tag,
  Clock,
  Sparkles,
  Plus,
  Trash2,
  ChevronDown,
  AlertTriangle,
  Flame,
} from "lucide-react";
import { formatDate, getDaysUntil, nanoid } from "@/lib/utils";

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  critical: {
    label: "Critical",
    color: "#f87171",
    bg: "rgba(248,113,113,0.1)",
    icon: <AlertTriangle className="w-3 h-3" />,
  },
  high: {
    label: "High",
    color: "#fb923c",
    bg: "rgba(251,146,60,0.1)",
    icon: <Flame className="w-3 h-3" />,
  },
  medium: {
    label: "Medium",
    color: "#facc15",
    bg: "rgba(250,204,21,0.1)",
    icon: <span className="text-xs">◆</span>,
  },
  low: {
    label: "Low",
    color: "#4ade80",
    bg: "rgba(74,222,128,0.1)",
    icon: <span className="text-xs">◇</span>,
  },
};

interface SortableTodoItemProps {
  item: TodoItem;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onPriorityChange: (id: string, priority: Priority) => void;
}

function SortableTodoItem({ item, onToggle, onDelete, onPriorityChange }: SortableTodoItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : "auto",
  };

  const p = PRIORITY_CONFIG[item.priority];
  const daysUntil = getDaysUntil(item.deadline);
  const isOverdue = daysUntil !== null && daysUntil < 0;
  const isDueSoon = daysUntil !== null && daysUntil >= 0 && daysUntil <= 2;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group flex items-start gap-3 px-3 py-3 rounded-xl transition-all"
      onMouseEnter={(e) => {
        if (!isDragging) {
          (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.04)";
        }
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.background = "transparent";
      }}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="mt-0.5 shrink-0 opacity-0 group-hover:opacity-40 hover:!opacity-80 transition-opacity drag-handle-cursor"
        style={{ color: "var(--text-muted)", touchAction: "none" }}
      >
        <GripVertical className="w-4 h-4" />
      </button>

      {/* Checkbox */}
      <button
        onClick={() => onToggle(item.id)}
        className="mt-0.5 shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all"
        style={{
          borderColor: item.completed ? p.color : "var(--border-base)",
          background: item.completed ? p.color : "transparent",
          transition: "all 0.2s",
        }}
      >
        {item.completed && <Check className="w-3 h-3 text-black" strokeWidth={3} />}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className="text-sm leading-relaxed"
          style={{
            color: item.completed ? "var(--text-muted)" : "var(--text-primary)",
            textDecoration: item.completed ? "line-through" : "none",
            transition: "all 0.2s",
          }}
        >
          {item.text}
        </p>

        <div className="flex flex-wrap items-center gap-2 mt-1.5">
          {/* Priority badge */}
          <div className="relative">
            <button
              onClick={() => setShowPriorityMenu(!showPriorityMenu)}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-all hover:opacity-80"
              style={{ background: p.bg, color: p.color }}
            >
              {p.icon}
              {p.label}
              <ChevronDown className="w-2.5 h-2.5" />
            </button>

            {showPriorityMenu && (
              <div
                className="absolute top-full mt-1 left-0 z-50 rounded-xl overflow-hidden shadow-lg"
                style={{
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-base)",
                  minWidth: "120px",
                }}
              >
                {(Object.keys(PRIORITY_CONFIG) as Priority[]).map((p) => {
                  const cfg = PRIORITY_CONFIG[p];
                  return (
                    <button
                      key={p}
                      onClick={() => {
                        onPriorityChange(item.id, p);
                        setShowPriorityMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs transition-all text-left"
                      style={{ color: cfg.color }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLButtonElement).style.background = cfg.bg)
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLButtonElement).style.background = "transparent")
                      }
                    >
                      {cfg.icon}
                      {cfg.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Deadline */}
          {item.deadline && (
            <div
              className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
              style={{
                background: isOverdue
                  ? "rgba(248,113,113,0.1)"
                  : isDueSoon
                  ? "rgba(251,146,60,0.1)"
                  : "rgba(255,255,255,0.05)",
                color: isOverdue ? "#f87171" : isDueSoon ? "#fb923c" : "var(--text-muted)",
              }}
            >
              <Calendar className="w-3 h-3" />
              {isOverdue ? `Overdue · ` : ""}
              {formatDate(item.deadline)}
              {!isOverdue && daysUntil !== null && daysUntil <= 7 && (
                <span className="ml-0.5">({daysUntil}d)</span>
              )}
            </div>
          )}

          {/* Tags */}
          {item.tags?.slice(0, 2).map((tag) => (
            <div
              key={tag}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
              style={{
                background: "var(--accent-subtle)",
                color: "var(--accent-1)",
              }}
            >
              <Tag className="w-2.5 h-2.5" />
              {tag}
            </div>
          ))}

          {/* Estimated time */}
          {item.estimatedMinutes && (
            <div
              className="flex items-center gap-1 text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              <Clock className="w-3 h-3" />
              {item.estimatedMinutes}m
            </div>
          )}
        </div>
      </div>

      {/* Delete */}
      <button
        onClick={() => onDelete(item.id)}
        className="mt-0.5 shrink-0 opacity-0 group-hover:opacity-40 hover:!opacity-80 transition-all"
        style={{ color: "#f87171" }}
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

export function TodoList({ title, description, todos: initialTodos }: TodoListProps) {
  const [todos, setTodos] = useState<TodoItem[]>(initialTodos ?? []);
  const [newTask, setNewTask] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");
  const [isReprioritizing, setIsReprioritizing] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setTodos((items) => {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      return arrayMove(items, oldIndex, newIndex).map((item, idx) => ({
        ...item,
        order: idx,
      }));
    });
  }, []);

  const handleToggle = useCallback((id: string) => {
    setTodos((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, completed: !t.completed, status: t.completed ? "pending" : "completed" }
          : t
      )
    );
  }, []);

  const handleDelete = useCallback((id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const handlePriorityChange = useCallback((id: string, priority: Priority) => {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, priority } : t)));
  }, []);

  const handleAddTodo = useCallback(() => {
    const text = newTask.trim();
    if (!text) return;
    const newTodo: TodoItem = {
      id: nanoid(),
      text,
      completed: false,
      priority: "medium",
      status: "pending",
      order: todos.length,
    };
    setTodos((prev) => [...prev, newTodo]);
    setNewTask("");
  }, [newTask, todos.length]);

  const handleReprioritize = useCallback(async () => {
    setIsReprioritizing(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `Re-prioritize these todos using AI: ${JSON.stringify(
                todos.map((t) => ({ id: t.id, text: t.text, deadline: t.deadline, tags: t.tags }))
              )}`,
            },
          ],
        }),
      });

      if (!res.ok) return;

      // Read SSE stream for UI component response
      const reader = res.body?.getReader();
      if (!reader) return;
      const decoder = new TextDecoder();
      let buf = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const evt = JSON.parse(line.slice(6));
            if (evt.type === "ui-component" && evt.componentData?.todos) {
              const newPriorities: Record<string, Priority> = {};
              (evt.componentData.todos as TodoItem[]).forEach((t) => {
                newPriorities[t.id] = t.priority;
              });
              setTodos((prev) =>
                prev.map((t) => ({
                  ...t,
                  priority: newPriorities[t.id] ?? t.priority,
                }))
              );
            }
          } catch {}
        }
      }
    } finally {
      setIsReprioritizing(false);
    }
  }, [todos]);

  const filteredTodos = todos.filter((t) => {
    if (filter === "pending") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  const completedCount = todos.filter((t) => t.completed).length;
  const progress = todos.length > 0 ? (completedCount / todos.length) * 100 : 0;

  return (
    <div
      className="rounded-2xl overflow-hidden w-full"
      style={{
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-base)",
        maxWidth: "640px",
      }}
    >
      {/* Header */}
      <div
        className="px-5 pt-5 pb-4"
        style={{ borderBottom: "1px solid var(--border-base)" }}
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3
              className="text-base font-semibold"
              style={{
                fontFamily: "'Poppins', sans-serif",
                color: "var(--text-primary)",
              }}
            >
              {title ?? "Task List"}
            </h3>
            {description && (
              <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                {description}
              </p>
            )}
          </div>
          <button
            onClick={handleReprioritize}
            disabled={isReprioritizing || todos.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105 disabled:opacity-50"
            style={{
              background: "var(--accent-subtle)",
              border: "1px solid var(--accent-1)",
              color: "var(--accent-1)",
            }}
          >
            <Sparkles className={`w-3 h-3 ${isReprioritizing ? "animate-spin" : ""}`} />
            {isReprioritizing ? "Analyzing…" : "AI Re-prioritize"}
          </button>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-3">
          <div
            className="flex-1 h-1.5 rounded-full overflow-hidden"
            style={{ background: "var(--bg-base)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progress}%`,
                background:
                  "linear-gradient(90deg, var(--accent-1) 0%, var(--info) 100%)",
              }}
            />
          </div>
          <span
            className="text-xs shrink-0"
            style={{
              color: "var(--text-muted)",
              fontFamily: "'Geist Mono', monospace",
            }}
          >
            {completedCount}/{todos.length}
          </span>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 px-5 py-2" style={{ borderBottom: "1px solid var(--border-base)" }}>
        {(["all", "pending", "completed"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all"
            style={{
              background: filter === f ? "var(--accent-subtle)" : "transparent",
              color: filter === f ? "var(--accent-1)" : "var(--text-muted)",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Todo Items */}
      <div className="px-2 py-2 max-h-96 overflow-y-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={filteredTodos.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            {filteredTodos.length === 0 ? (
              <div
                className="py-8 text-center text-sm"
                style={{ color: "var(--text-muted)" }}
              >
                {filter === "completed" ? "No completed tasks yet" : "No tasks here"}
              </div>
            ) : (
              filteredTodos.map((item) => (
                <SortableTodoItem
                  key={item.id}
                  item={item}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                  onPriorityChange={handlePriorityChange}
                />
              ))
            )}
          </SortableContext>
        </DndContext>
      </div>

      {/* Add new task */}
      <div
        className="flex items-center gap-2 px-4 py-3"
        style={{ borderTop: "1px solid var(--border-base)" }}
      >
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddTodo()}
          placeholder="Add a new task…"
          className="flex-1 bg-transparent text-sm outline-none"
          style={{
            color: "var(--text-primary)",
            caretColor: "var(--accent-1)",
          }}
        />
        <button
          onClick={handleAddTodo}
          disabled={!newTask.trim()}
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-all disabled:opacity-30"
          style={{
            background: "var(--accent-subtle)",
            color: "var(--accent-1)",
          }}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
