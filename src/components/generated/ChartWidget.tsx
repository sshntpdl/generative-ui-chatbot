"use client";

import { useState } from "react";
import type { ChartProps, ChartType } from "@/types";

const COLORS = [
  "#8b5cf6", "#38bdf8", "#4ade80", "#fb923c", "#f87171", "#a78bfa", "#34d399",
];

function BarChart({ labels, datasets }: Pick<ChartProps, "labels" | "datasets">) {
  const allValues = datasets.flatMap((d) => d.data);
  const maxVal = Math.max(...allValues, 1);
  const BAR_HEIGHT = 180;

  return (
    <svg viewBox={`0 0 ${Math.max(labels.length * 60, 320)} ${BAR_HEIGHT + 60}`} className="w-full">
      {/* Grid lines */}
      {[0.25, 0.5, 0.75, 1].map((pct) => (
        <line
          key={pct}
          x1="40" x2="100%"
          y1={BAR_HEIGHT * (1 - pct)}
          y2={BAR_HEIGHT * (1 - pct)}
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="1"
        />
      ))}

      {labels.map((label, i) => {
        const barWidth = Math.min(40, 50 / datasets.length);
        const groupX = 50 + i * 60;

        return (
          <g key={label}>
            {datasets.map((ds, di) => {
              const h = (ds.data[i] / maxVal) * BAR_HEIGHT;
              const x = groupX + di * (barWidth + 2);
              const color = ds.color ?? COLORS[di % COLORS.length];
              return (
                <g key={di}>
                  <rect
                    x={x}
                    y={BAR_HEIGHT - h}
                    width={barWidth}
                    height={h}
                    fill={color}
                    opacity={0.85}
                    rx={4}
                  />
                  <text
                    x={x + barWidth / 2}
                    y={BAR_HEIGHT - h - 4}
                    textAnchor="middle"
                    fill="rgba(255,255,255,0.5)"
                    fontSize="9"
                  >
                    {ds.data[i]}
                  </text>
                </g>
              );
            })}
            <text
              x={groupX + (datasets.length * (barWidth + 2)) / 2}
              y={BAR_HEIGHT + 16}
              textAnchor="middle"
              fill="rgba(255,255,255,0.4)"
              fontSize="10"
            >
              {label.length > 8 ? label.slice(0, 8) + "…" : label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function LineChart({ labels, datasets }: Pick<ChartProps, "labels" | "datasets">) {
  const allValues = datasets.flatMap((d) => d.data);
  const maxVal = Math.max(...allValues, 1);
  const minVal = Math.min(...allValues, 0);
  const range = maxVal - minVal || 1;
  const W = 320;
  const H = 180;
  const PAD = 40;
  const innerW = W - PAD * 2;
  const innerH = H - PAD;

  const toX = (i: number) => PAD + (i / (labels.length - 1)) * innerW;
  const toY = (v: number) => PAD / 2 + ((maxVal - v) / range) * innerH;

  return (
    <svg viewBox={`0 0 ${W} ${H + 20}`} className="w-full">
      {[0.25, 0.5, 0.75, 1].map((pct) => (
        <line
          key={pct}
          x1={PAD} x2={W - PAD}
          y1={PAD / 2 + (1 - pct) * innerH}
          y2={PAD / 2 + (1 - pct) * innerH}
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="1"
        />
      ))}

      {datasets.map((ds, di) => {
        const color = ds.color ?? COLORS[di % COLORS.length];
        const pts = ds.data.map((v, i) => `${toX(i)},${toY(v)}`).join(" ");
        const areaPath = `M${toX(0)},${toY(ds.data[0])} ${ds.data.map((v, i) => `L${toX(i)},${toY(v)}`).join(" ")} L${toX(ds.data.length - 1)},${H} L${toX(0)},${H} Z`;

        return (
          <g key={di}>
            <path d={areaPath} fill={color} opacity="0.08" />
            <polyline
              points={pts}
              fill="none"
              stroke={color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {ds.data.map((v, i) => (
              <circle key={i} cx={toX(i)} cy={toY(v)} r="3.5" fill={color} />
            ))}
          </g>
        );
      })}

      {labels.map((label, i) => (
        <text
          key={i}
          x={toX(i)}
          y={H + 16}
          textAnchor="middle"
          fill="rgba(255,255,255,0.4)"
          fontSize="10"
        >
          {label.length > 6 ? label.slice(0, 6) + "…" : label}
        </text>
      ))}
    </svg>
  );
}

function PieChart({ labels, datasets }: Pick<ChartProps, "labels" | "datasets">) {
  const data = datasets[0]?.data ?? [];
  const total = data.reduce((a, b) => a + b, 0) || 1;
  const CX = 100;
  const CY = 100;
  const R = 80;

  let cumulative = 0;
  const slices = data.map((v, i) => {
    const start = (cumulative / total) * 2 * Math.PI - Math.PI / 2;
    cumulative += v;
    const end = (cumulative / total) * 2 * Math.PI - Math.PI / 2;
    const x1 = CX + R * Math.cos(start);
    const y1 = CY + R * Math.sin(start);
    const x2 = CX + R * Math.cos(end);
    const y2 = CY + R * Math.sin(end);
    const large = end - start > Math.PI ? 1 : 0;
    const midAngle = (start + end) / 2;
    const lx = CX + (R * 0.65) * Math.cos(midAngle);
    const ly = CY + (R * 0.65) * Math.sin(midAngle);
    const pct = Math.round((v / total) * 100);
    return { path: `M${CX},${CY} L${x1},${y1} A${R},${R} 0 ${large} 1 ${x2},${y2} Z`, lx, ly, pct, color: COLORS[i % COLORS.length], label: labels[i] };
  });

  return (
    <svg viewBox="0 0 280 210" className="w-full">
      {slices.map((s, i) => (
        <g key={i}>
          <path d={s.path} fill={s.color} opacity={0.85} />
          {s.pct > 5 && (
            <text x={s.lx} y={s.ly} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="10" fontWeight="600">
              {s.pct}%
            </text>
          )}
        </g>
      ))}
      {slices.map((s, i) => (
        <g key={`legend-${i}`}>
          <rect x={210} y={20 + i * 22} width={10} height={10} rx={2} fill={s.color} />
          <text x={225} y={29 + i * 22} fill="rgba(255,255,255,0.6)" fontSize="10">
            {s.label?.length > 10 ? s.label.slice(0, 10) + "…" : s.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function ChartWidget({ title, chartType, labels, datasets, description }: ChartProps) {
  const [activeType, setActiveType] = useState<ChartType>(chartType ?? "bar");

  return (
    <div
      className="rounded-2xl overflow-hidden w-full"
      style={{
        background: "hsl(var(--surface-elevated))",
        border: "1px solid hsl(var(--border))",
        maxWidth: "520px",
      }}
    >
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: "1px solid hsl(var(--border))" }}
      >
        <div>
          <h3
            className="text-base font-semibold"
            style={{ fontFamily: "var(--font-display)", color: "hsl(var(--ink))" }}
          >
            {title}
          </h3>
          {description && (
            <p className="text-xs mt-0.5" style={{ color: "hsl(var(--ink-muted))" }}>
              {description}
            </p>
          )}
        </div>
        <div className="flex gap-1">
          {(["bar", "line", "pie"] as ChartType[]).map((t) => (
            <button
              key={t}
              onClick={() => setActiveType(t)}
              className="px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-all"
              style={{
                background: activeType === t ? "hsl(var(--brand-subtle))" : "transparent",
                color: activeType === t ? "hsl(var(--brand))" : "hsl(var(--ink-faint))",
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4">
        {activeType === "bar" && <BarChart labels={labels} datasets={datasets} />}
        {activeType === "line" && <LineChart labels={labels} datasets={datasets} />}
        {activeType === "pie" && <PieChart labels={labels} datasets={datasets} />}
      </div>

      {/* Legend */}
      {datasets.length > 1 && (
        <div
          className="flex flex-wrap gap-3 px-5 pb-4"
        >
          {datasets.map((ds, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ background: ds.color ?? COLORS[i % COLORS.length] }}
              />
              <span className="text-xs" style={{ color: "hsl(var(--ink-muted))" }}>
                {ds.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
