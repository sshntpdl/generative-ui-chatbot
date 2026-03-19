"use client";

import { useState } from "react";
import type { CalendarProps, CalendarEvent } from "@/types";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { nanoid } from "@/lib/utils";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function CalendarWidget({ title, events: initialEvents, initialDate }: CalendarProps) {
  const seed = initialDate ? new Date(initialDate) : new Date();
  const [current, setCurrent] = useState(new Date(seed.getFullYear(), seed.getMonth(), 1));
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents ?? []);
  const [selected, setSelected] = useState<Date | null>(null);
  const [newEventTitle, setNewEventTitle] = useState("");

  const daysInMonth = new Date(current.getFullYear(), current.getMonth() + 1, 0).getDate();
  const firstDay = current.getDay();

  const prevMonth = () => setCurrent(new Date(current.getFullYear(), current.getMonth() - 1, 1));
  const nextMonth = () => setCurrent(new Date(current.getFullYear(), current.getMonth() + 1, 1));

  const getEventsForDay = (day: number) => {
    const dateStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.filter((e) => e.date === dateStr);
  };

  const today = new Date();
  const isToday = (day: number) =>
    today.getFullYear() === current.getFullYear() &&
    today.getMonth() === current.getMonth() &&
    today.getDate() === day;

  const isSelected = (day: number) =>
    selected?.getFullYear() === current.getFullYear() &&
    selected?.getMonth() === current.getMonth() &&
    selected?.getDate() === day;

  const handleAddEvent = () => {
    if (!selected || !newEventTitle.trim()) return;
    const dateStr = `${selected.getFullYear()}-${String(selected.getMonth() + 1).padStart(2, "0")}-${String(selected.getDate()).padStart(2, "0")}`;
    setEvents((prev) => [...prev, { id: nanoid(), title: newEventTitle.trim(), date: dateStr }]);
    setNewEventTitle("");
  };

  const selectedDayEvents = selected
    ? getEventsForDay(selected.getDate())
    : [];

  return (
    <div
      className="rounded-2xl overflow-hidden w-full"
      style={{
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-base)",
        maxWidth: "420px",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: "1px solid var(--border-base)" }}
      >
        <h3
          className="text-base font-semibold"
          style={{ fontFamily: "'Poppins', sans-serif", color: "var(--text-primary)" }}
        >
          {title ?? "Calendar"}
        </h3>
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="p-1.5 rounded-lg transition-all hover:opacity-70"
            style={{ color: "var(--text-secondary)" }}>
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium w-32 text-center"
            style={{ color: "var(--text-primary)", fontFamily: "'Poppins', sans-serif" }}>
            {MONTHS[current.getMonth()]} {current.getFullYear()}
          </span>
          <button onClick={nextMonth} className="p-1.5 rounded-lg transition-all hover:opacity-70"
            style={{ color: "var(--text-secondary)" }}>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-3">
        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {DAYS.map((d) => (
            <div key={d} className="text-center text-xs py-1 font-medium"
              style={{ color: "var(--text-muted)" }}>
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-0.5">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
            const dayEvents = getEventsForDay(day);
            const sel = isSelected(day);
            const tod = isToday(day);
            return (
              <button
                key={day}
                onClick={() => setSelected(new Date(current.getFullYear(), current.getMonth(), day))}
                className="relative aspect-square flex flex-col items-center justify-start pt-1 rounded-lg text-sm transition-all"
                style={{
                  background: sel
                    ? "linear-gradient(135deg, var(--accent-1) 0%, var(--info) 100%)"
                    : tod
                    ? "var(--accent-subtle)"
                    : "transparent",
                  color: sel ? "white" : tod ? "var(--accent-1)" : "var(--text-primary)",
                  fontWeight: tod || sel ? "700" : "400",
                }}
                onMouseEnter={(e) => {
                  if (!sel) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)";
                }}
                onMouseLeave={(e) => {
                  if (!sel) (e.currentTarget as HTMLButtonElement).style.background = tod ? "var(--accent-subtle)" : "transparent";
                }}
              >
                {day}
                {dayEvents.length > 0 && (
                  <div className="flex gap-0.5 mt-0.5">
                    {dayEvents.slice(0, 3).map((_, di) => (
                      <div
                        key={di}
                        className="w-1 h-1 rounded-full"
                        style={{ background: sel ? "rgba(255,255,255,0.7)" : "var(--accent-1)" }}
                      />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected day events */}
      {selected && (
        <div
          className="px-4 py-3"
          style={{ borderTop: "1px solid var(--border-base)" }}
        >
          <p className="text-xs font-medium mb-2"
            style={{ color: "var(--text-muted)", fontFamily: "'Geist Mono', monospace" }}>
            {selected.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }).toUpperCase()}
          </p>
          {selectedDayEvents.length === 0 ? (
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              No events
            </p>
          ) : (
            selectedDayEvents.map((ev) => (
              <div key={ev.id} className="flex items-center gap-2 py-1">
                <div className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: ev.color ?? "var(--accent-1)" }} />
                <span className="text-sm" style={{ color: "var(--text-primary)" }}>{ev.title}</span>
                {ev.time && (
                  <span className="text-xs ml-auto" style={{ color: "var(--text-muted)" }}>
                    {ev.time}
                  </span>
                )}
              </div>
            ))
          )}

          <div className="flex gap-2 mt-2">
            <input
              value={newEventTitle}
              onChange={(e) => setNewEventTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddEvent()}
              placeholder="Add event…"
              className="flex-1 text-xs bg-transparent outline-none px-2 py-1.5 rounded-lg"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid var(--border-base)",
                color: "var(--text-primary)",
              }}
            />
            <button
              onClick={handleAddEvent}
              disabled={!newEventTitle.trim()}
              className="p-1.5 rounded-lg disabled:opacity-30"
              style={{ background: "var(--accent-subtle)", color: "var(--accent-1)" }}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
