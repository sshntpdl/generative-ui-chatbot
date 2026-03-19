"use client";

import { WeatherWidgetProps } from "@/types";
import { Wind, Droplets, Thermometer, Eye } from "lucide-react";

export function WeatherWidget({ data }: WeatherWidgetProps) {
  if (!data) return null;

  const tempColor =
    data.temperature >= 30 ? "#f87171" : data.temperature >= 20 ? "#fb923c" : data.temperature >= 10 ? "#38bdf8" : "#818cf8";

  return (
    <div
      className="rounded-2xl overflow-hidden w-full"
      style={{
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-base)",
        maxWidth: "480px",
      }}
    >
      {/* Main weather */}
      <div
        className="px-6 py-5"
        style={{
          background: "linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(56,189,248,0.08) 100%)",
          borderBottom: "1px solid var(--border-base)",
        }}
      >
        <div className="flex items-start justify-between">
          <div>
            <h3
              className="text-lg font-bold"
              style={{ fontFamily: "'Poppins', sans-serif", color: "var(--text-primary)" }}
            >
              {data.city}
              {data.country && (
                <span className="text-sm font-normal ml-2" style={{ color: "var(--text-secondary)" }}>
                  {data.country}
                </span>
              )}
            </h3>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              {data.condition}
            </p>
          </div>
          <div className="text-5xl">{data.icon}</div>
        </div>

        <div className="flex items-end gap-2 mt-3">
          <span
            className="text-6xl font-bold leading-none"
            style={{ fontFamily: "'Poppins', sans-serif", color: tempColor }}
          >
            {data.temperature}°
          </span>
          <span className="text-base pb-2" style={{ color: "var(--text-secondary)" }}>
            Feels {data.feelsLike}°
          </span>
        </div>
      </div>

      {/* Stats */}
      <div
        className="grid grid-cols-3 divide-x"
        style={{
          borderBottom: "1px solid var(--border-base)",
          borderColor: "var(--border-base)",
        }}
      >
        {[
          { icon: <Droplets className="w-4 h-4" />, label: "Humidity", value: `${data.humidity}%`, color: "#38bdf8" },
          { icon: <Wind className="w-4 h-4" />, label: "Wind", value: `${data.windSpeed} km/h`, color: "#a78bfa" },
          { icon: <Thermometer className="w-4 h-4" />, label: "Feels Like", value: `${data.feelsLike}°`, color: tempColor },
        ].map(({ icon, label, value, color }) => (
          <div key={label} className="flex flex-col items-center py-3 px-2">
            <div style={{ color }}>{icon}</div>
            <span className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              {label}
            </span>
            <span className="text-sm font-semibold mt-0.5" style={{ color: "var(--text-primary)" }}>
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* Forecast */}
      {data.forecast && data.forecast.length > 0 && (
        <div className="px-4 py-3">
          <p
            className="text-xs font-medium mb-2"
            style={{ color: "var(--text-muted)", fontFamily: "'Geist Mono', monospace" }}
          >
            5-DAY FORECAST
          </p>
          <div className="flex gap-2">
            {data.forecast.map((day) => (
              <div
                key={day.date}
                className="flex-1 flex flex-col items-center gap-1 p-2 rounded-xl"
                style={{ background: "rgba(255,255,255,0.03)" }}
              >
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {new Date(day.date).toLocaleDateString("en-US", { weekday: "short" })}
                </span>
                <span className="text-lg">{day.icon}</span>
                <span className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>
                  {day.high}°
                </span>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {day.low}°
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
