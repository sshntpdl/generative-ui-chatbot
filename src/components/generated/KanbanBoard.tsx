"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { KanbanBoardProps, KanbanCard, KanbanColumn, Priority } from "@/types";
import { GripVertical, Plus, Calendar, Tag } from "lucide-react";
import { nanoid, formatDate } from "@/lib/utils";

const PRIORITY_DOTS: Record<Priority, string> = {
  critical: "#f87171",
  high: "#fb923c",
  medium: "#facc15",
  low: "#4ade80",
};

function KanbanCardComponent({ card }: { card: KanbanCard }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group p-3 rounded-xl cursor-default"
      {...attributes}
    >
      <div className="flex items-start gap-2">
        <button
          {...listeners}
          className="mt-0.5 shrink-0 opacity-0 group-hover:opacity-40 drag-handle-cursor"
          style={{ color: "hsl(var(--ink-faint))", touchAction: "none" }}
        >
          <GripVertical className="w-3 h-3" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-2 h-2 rounded-full shrink-0"
              style={{ background: PRIORITY_DOTS[card.priority] ?? "#facc15" }}
            />
            <p className="text-sm leading-snug" style={{ color: "hsl(var(--ink))" }}>
              {card.title}
            </p>
          </div>
          {card.description && (
            <p className="text-xs mb-2 ml-4" style={{ color: "hsl(var(--ink-muted))" }}>
              {card.description}
            </p>
          )}
          <div className="flex flex-wrap gap-1.5 ml-4">
            {card.dueDate && (
              <div
                className="flex items-center gap-1 px-1.5 py-0.5 rounded text-xs"
                style={{ background: "rgba(255,255,255,0.05)", color: "hsl(var(--ink-faint))" }}
              >
                <Calendar className="w-2.5 h-2.5" />
                {formatDate(card.dueDate)}
              </div>
            )}
            {card.tags?.map((tag) => (
              <div
                key={tag}
                className="flex items-center gap-1 px-1.5 py-0.5 rounded text-xs"
                style={{
                  background: "hsl(var(--brand-subtle))",
                  color: "hsl(var(--brand))",
                }}
              >
                {tag}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function KanbanBoard({ title, description, columns: initialColumns }: KanbanBoardProps) {
  const [columns, setColumns] = useState<KanbanColumn[]>(initialColumns ?? []);
  const [activeCard, setActiveCard] = useState<KanbanCard | null>(null);
  const [newCardText, setNewCardText] = useState<Record<string, string>>({});
  const [addingTo, setAddingTo] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const findColumnByCard = (cardId: string) =>
    columns.find((col) => col.cards.some((c) => c.id === cardId));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);
    if (!over) return;

    const srcCol = findColumnByCard(String(active.id));
    const dstCol =
      findColumnByCard(String(over.id)) ??
      columns.find((c) => c.id === String(over.id));

    if (!srcCol || !dstCol) return;

    if (srcCol.id === dstCol.id) {
      // Same column reorder
      const oldIdx = srcCol.cards.findIndex((c) => c.id === active.id);
      const newIdx = srcCol.cards.findIndex((c) => c.id === over.id);
      if (oldIdx === newIdx) return;
      setColumns((prev) =>
        prev.map((col) =>
          col.id === srcCol.id
            ? { ...col, cards: arrayMove(col.cards, oldIdx, newIdx) }
            : col
        )
      );
    } else {
      // Cross-column move
      const card = srcCol.cards.find((c) => c.id === active.id)!;
      setColumns((prev) =>
        prev.map((col) => {
          if (col.id === srcCol.id)
            return { ...col, cards: col.cards.filter((c) => c.id !== active.id) };
          if (col.id === dstCol.id)
            return { ...col, cards: [...col.cards, card] };
          return col;
        })
      );
    }
  };

  const handleAddCard = (colId: string) => {
    const text = newCardText[colId]?.trim();
    if (!text) return;
    const card: KanbanCard = {
      id: nanoid(),
      title: text,
      priority: "medium",
    };
    setColumns((prev) =>
      prev.map((col) =>
        col.id === colId ? { ...col, cards: [...col.cards, card] } : col
      )
    );
    setNewCardText((prev) => ({ ...prev, [colId]: "" }));
    setAddingTo(null);
  };

  return (
    <div
      className="rounded-2xl overflow-hidden w-full"
      style={{
        background: "hsl(var(--surface-elevated))",
        border: "1px solid hsl(var(--border))",
        maxWidth: "800px",
      }}
    >
      <div
        className="px-5 py-4"
        style={{ borderBottom: "1px solid hsl(var(--border))" }}
      >
        <h3
          className="text-base font-semibold"
          style={{ fontFamily: "var(--font-display)", color: "hsl(var(--ink))" }}
        >
          {title ?? "Kanban Board"}
        </h3>
        {description && (
          <p className="text-xs mt-0.5" style={{ color: "hsl(var(--ink-muted))" }}>
            {description}
          </p>
        )}
      </div>

      <div className="overflow-x-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={({ active }) => {
            const col = findColumnByCard(String(active.id));
            setActiveCard(col?.cards.find((c) => c.id === active.id) ?? null);
          }}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-3 p-4" style={{ minWidth: `${columns.length * 220}px` }}>
            {columns.map((col) => (
              <div
                key={col.id}
                className="flex-1 rounded-xl flex flex-col"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid hsl(var(--border))",
                  minWidth: "200px",
                }}
              >
                {/* Column header */}
                <div
                  className="flex items-center justify-between px-3 py-2.5"
                  style={{ borderBottom: "1px solid hsl(var(--border))" }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ background: col.color ?? "hsl(var(--brand))" }}
                    />
                    <span
                      className="text-sm font-medium"
                      style={{ color: "hsl(var(--ink))" }}
                    >
                      {col.title}
                    </span>
                    <span
                      className="text-xs px-1.5 py-0.5 rounded-full"
                      style={{
                        background: "rgba(255,255,255,0.06)",
                        color: "hsl(var(--ink-faint))",
                      }}
                    >
                      {col.cards.length}
                    </span>
                  </div>
                </div>

                {/* Cards */}
                <div className="flex-1 p-2 min-h-[80px]">
                  <SortableContext
                    items={col.cards.map((c) => c.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {col.cards.map((card) => (
                      <div
                        key={card.id}
                        className="mb-2 rounded-xl"
                        style={{
                          background: "hsl(var(--surface-elevated))",
                          border: "1px solid hsl(var(--border))",
                        }}
                      >
                        <KanbanCardComponent card={card} />
                      </div>
                    ))}
                  </SortableContext>
                </div>

                {/* Add card */}
                <div className="p-2">
                  {addingTo === col.id ? (
                    <div className="flex gap-1">
                      <input
                        autoFocus
                        value={newCardText[col.id] ?? ""}
                        onChange={(e) =>
                          setNewCardText((p) => ({ ...p, [col.id]: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAddCard(col.id);
                          if (e.key === "Escape") setAddingTo(null);
                        }}
                        placeholder="Card title…"
                        className="flex-1 text-xs px-2 py-1.5 rounded-lg bg-transparent outline-none"
                        style={{
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid hsl(var(--border))",
                          color: "hsl(var(--ink))",
                        }}
                      />
                      <button
                        onClick={() => handleAddCard(col.id)}
                        className="px-2 py-1 rounded-lg text-xs font-medium"
                        style={{
                          background: "hsl(var(--brand-subtle))",
                          color: "hsl(var(--brand))",
                        }}
                      >
                        Add
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAddingTo(col.id)}
                      className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs transition-all"
                      style={{ color: "hsl(var(--ink-faint))" }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)")
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLButtonElement).style.background = "transparent")
                      }
                    >
                      <Plus className="w-3 h-3" />
                      Add card
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <DragOverlay>
            {activeCard && (
              <div
                className="rounded-xl p-3 shadow-lg"
                style={{
                  background: "hsl(var(--surface-elevated))",
                  border: "1px solid hsl(var(--brand-dim))",
                  width: "200px",
                  transform: "rotate(3deg)",
                }}
              >
                <p className="text-sm" style={{ color: "hsl(var(--ink))" }}>
                  {activeCard.title}
                </p>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
