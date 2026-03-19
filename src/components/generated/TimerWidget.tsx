"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { TimerProps } from "@/types";
import { Play, Pause, RotateCcw, Bell } from "lucide-react";
import { formatDuration } from "@/lib/utils";

export function TimerWidget({ title, duration, label, type }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState<"work" | "break">("work");
  const [sessions, setSessions] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isPomodoro = type === "pomodoro";
  const isStopwatch = type === "stopwatch";

  const POMODORO_WORK = 25 * 60;
  const POMODORO_BREAK = 5 * 60;

  const total = isStopwatch ? Infinity : isPomodoro ? (phase === "work" ? POMODORO_WORK : POMODORO_BREAK) : duration;
  const current = isStopwatch ? elapsed : timeLeft;
  const progress = isStopwatch ? 0 : total === Infinity ? 0 : ((total - timeLeft) / total) * 100;

  const handleTick = useCallback(() => {
    if (isStopwatch) {
      setElapsed((p) => p + 1);
    } else {
      setTimeLeft((p) => {
        if (p <= 1) {
          setIsRunning(false);
          if (isPomodoro) {
            const nextPhaseTime = phase === "work" ? POMODORO_BREAK : POMODORO_WORK;
            setSessions((s) => s + (phase === "work" ? 1 : 0));
            setPhase((ph) => (ph === "work" ? "break" : "work"));
            return nextPhaseTime;
          }
          return 0;
        }
        return p - 1;
      });
    }
  }, [isStopwatch, isPomodoro, phase]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(handleTick, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, handleTick]);

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(isPomodoro ? POMODORO_WORK : duration);
    setElapsed(0);
    setPhase("work");
  };

  const SIZE = 160;
  const STROKE = 8;
  const R = (SIZE - STROKE) / 2;
  const CIRC = 2 * Math.PI * R;
  const dashOffset = CIRC * (1 - progress / 100);

  const phaseColor =
    isPomodoro
      ? phase === "work"
        ? "#8b5cf6"
        : "#34d399"
      : timeLeft <= 10 && !isStopwatch
      ? "#f87171"
      : "#8b5cf6";

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-base)",
        width: "280px",
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
          {title ?? (isPomodoro ? "Pomodoro Timer" : isStopwatch ? "Stopwatch" : "Timer")}
        </h3>
        {isPomodoro && (
          <div
            className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs"
            style={{
              background: phase === "work" ? "rgba(139,92,246,0.15)" : "rgba(52,211,153,0.15)",
              color: phase === "work" ? "#a78bfa" : "#34d399",
            }}
          >
            <Bell className="w-3 h-3" />
            {phase === "work" ? "Focus" : "Break"}
          </div>
        )}
      </div>

      {/* Circular progress */}
      <div className="flex flex-col items-center py-6">
        <div className="relative" style={{ width: SIZE, height: SIZE }}>
          <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
            <circle
              cx={SIZE / 2} cy={SIZE / 2} r={R}
              fill="none"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth={STROKE}
            />
            {!isStopwatch && (
              <circle
                cx={SIZE / 2} cy={SIZE / 2} r={R}
                fill="none"
                stroke={phaseColor}
                strokeWidth={STROKE}
                strokeLinecap="round"
                strokeDasharray={CIRC}
                strokeDashoffset={dashOffset}
                style={{ transformOrigin: "center", transform: "rotate(-90deg)", transition: "stroke-dashoffset 0.5s ease" }}
              />
            )}
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="text-4xl font-bold"
              style={{
                fontFamily: "'Geist Mono', monospace",
                color: phaseColor,
                transition: "color 0.3s",
              }}
            >
              {formatDuration(current)}
            </span>
            {label && (
              <span className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                {label}
              </span>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={handleReset}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:opacity-70"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid var(--border-base)",
              color: "var(--text-secondary)",
            }}
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsRunning(!isRunning)}
            className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all hover:scale-105"
            style={{
              background: `linear-gradient(135deg, ${phaseColor} 0%, ${phaseColor}cc 100%)`,
              boxShadow: `0 4px 20px ${phaseColor}40`,
            }}
          >
            {isRunning ? (
              <Pause className="w-6 h-6 text-white" />
            ) : (
              <Play className="w-6 h-6 text-white ml-0.5" />
            )}
          </button>
        </div>
      </div>

      {/* Pomodoro session count */}
      {isPomodoro && (
        <div
          className="flex items-center justify-center gap-2 px-5 py-3"
          style={{ borderTop: "1px solid var(--border-base)" }}
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-full"
              style={{
                background: i < (sessions % 4) ? "#8b5cf6" : "rgba(255,255,255,0.1)",
                transition: "background 0.3s",
              }}
            />
          ))}
          <span className="text-xs ml-2" style={{ color: "var(--text-muted)" }}>
            {sessions} session{sessions !== 1 ? "s" : ""}
          </span>
        </div>
      )}
    </div>
  );
}
