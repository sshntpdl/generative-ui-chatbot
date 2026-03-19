"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown, Search } from "lucide-react";

interface DataTableProps {
  id: string;
  title?: string;
  description?: string;
  headers: string[];
  rows: (string | number)[][];
}

type SortDir = "asc" | "desc" | null;

export function DataTable({ title, description, headers, rows }: DataTableProps) {
  const [sortCol, setSortCol] = useState<number | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 8;

  const handleSort = (idx: number) => {
    if (sortCol === idx) {
      setSortDir((d) => (d === "asc" ? "desc" : d === "desc" ? null : "asc"));
      if (sortDir === "desc") setSortCol(null);
    } else {
      setSortCol(idx);
      setSortDir("asc");
    }
  };

  const filtered = rows.filter((row) =>
    row.some((cell) => String(cell).toLowerCase().includes(query.toLowerCase()))
  );

  const sorted = sortCol !== null && sortDir
    ? [...filtered].sort((a, b) => {
        const av = a[sortCol];
        const bv = b[sortCol];
        const cmp = typeof av === "number" && typeof bv === "number"
          ? av - bv
          : String(av).localeCompare(String(bv));
        return sortDir === "asc" ? cmp : -cmp;
      })
    : filtered;

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paged = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div
      className="rounded-2xl overflow-hidden w-full"
      style={{
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-base)",
        maxWidth: "720px",
      }}
    >
      {/* Header */}
      <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border-base)" }}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3
              className="text-base font-semibold"
              style={{ fontFamily: "'Poppins', sans-serif", color: "var(--text-primary)" }}
            >
              {title ?? "Data Table"}
            </h3>
            {description && (
              <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                {description}
              </p>
            )}
          </div>
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
            style={{
              background: "var(--bg-base)",
              border: "1px solid var(--border-base)",
            }}
          >
            <Search className="w-3.5 h-3.5" style={{ color: "var(--text-muted)" }} />
            <input
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(0); }}
              placeholder="Search..."
              className="bg-transparent text-sm outline-none w-32"
              style={{ color: "var(--text-primary)" }}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "var(--bg-base)" }}>
              {headers.map((h, i) => (
                <th
                  key={i}
                  onClick={() => handleSort(i)}
                  className="px-4 py-2.5 text-left font-medium cursor-pointer select-none"
                  style={{
                    color: sortCol === i ? "var(--accent-1)" : "var(--text-secondary)",
                    borderBottom: "1px solid var(--border-base)",
                    fontFamily: "'Geist Mono', monospace",
                    fontSize: "0.75rem",
                    letterSpacing: "0.05em",
                  }}
                >
                  <div className="flex items-center gap-1">
                    {h.toUpperCase()}
                    {sortCol === i && sortDir === "asc" && <ChevronUp className="w-3 h-3" />}
                    {sortCol === i && sortDir === "desc" && <ChevronDown className="w-3 h-3" />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td
                  colSpan={headers.length}
                  className="px-4 py-8 text-center"
                  style={{ color: "var(--text-muted)" }}
                >
                  No results found
                </td>
              </tr>
            ) : (
              paged.map((row, ri) => (
                <tr
                  key={ri}
                  style={{ borderBottom: "1px solid var(--border-base)" }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLTableRowElement).style.background = "rgba(255,255,255,0.02)")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLTableRowElement).style.background = "transparent")
                  }
                >
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      className="px-4 py-2.5"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {String(cell)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ borderTop: "1px solid var(--border-base)" }}
        >
          <span className="text-xs" style={{ color: "var(--text-muted)", fontFamily: "'Geist Mono', monospace" }}>
            {filtered.length} rows · Page {page + 1}/{totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1 rounded-lg text-xs transition-all disabled:opacity-30"
              style={{ background: "var(--bg-base)", color: "var(--text-secondary)" }}
            >
              ← Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1 rounded-lg text-xs transition-all disabled:opacity-30"
              style={{ background: "var(--bg-base)", color: "var(--text-secondary)" }}
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
