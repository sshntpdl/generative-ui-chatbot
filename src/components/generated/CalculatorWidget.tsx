"use client";

import { useState } from "react";
import type { CalculatorProps } from "@/types";
import { Delete, Equal } from "lucide-react";

const BUTTONS = [
  ["C", "±", "%", "÷"],
  ["7", "8", "9", "×"],
  ["4", "5", "6", "−"],
  ["1", "2", "3", "+"],
  ["0", ".", "⌫", "="],
];

export function CalculatorWidget({ expression: initExpr = "", result: initResult, history: initHistory = [] }: CalculatorProps) {
  const [display, setDisplay] = useState(initResult !== undefined ? String(initResult) : initExpr || "0");
  const [expression, setExpression] = useState(initExpr || "");
  const [history, setHistory] = useState(initHistory);
  const [justEvaluated, setJustEvaluated] = useState(!!initResult);

  const handleButton = (btn: string) => {
    if (btn === "C") {
      setDisplay("0");
      setExpression("");
      setJustEvaluated(false);
      return;
    }
    if (btn === "⌫") {
      if (display.length > 1) setDisplay(display.slice(0, -1));
      else setDisplay("0");
      return;
    }
    if (btn === "±") {
      setDisplay(String(parseFloat(display) * -1));
      return;
    }
    if (btn === "%") {
      setDisplay(String(parseFloat(display) / 100));
      return;
    }
    if (btn === "=") {
      try {
        const expr = expression + display;
        const sanitized = expr
          .replace(/×/g, "*")
          .replace(/÷/g, "/")
          .replace(/−/g, "-");
        const res = new Function(`"use strict"; return (${sanitized})`)();
        const resStr = String(Math.round(res * 1e10) / 1e10);
        setHistory((prev) => [{ expression: expr, result: res }, ...prev.slice(0, 9)]);
        setDisplay(resStr);
        setExpression("");
        setJustEvaluated(true);
      } catch {
        setDisplay("Error");
      }
      return;
    }

    const ops = ["+", "−", "×", "÷"];
    if (ops.includes(btn)) {
      setExpression(display + " " + btn + " ");
      setDisplay("0");
      setJustEvaluated(false);
      return;
    }

    if (btn === "." && display.includes(".")) return;

    if (justEvaluated) {
      setDisplay(btn === "." ? "0." : btn);
      setJustEvaluated(false);
    } else {
      setDisplay(display === "0" && btn !== "." ? btn : display + btn);
    }
  };

  const isOp = (btn: string) => ["+", "−", "×", "÷", "="].includes(btn);
  const isFn = (btn: string) => ["C", "±", "%"].includes(btn);

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "hsl(var(--surface-elevated))",
        border: "1px solid hsl(var(--border))",
        width: "280px",
      }}
    >
      {/* Display */}
      <div className="px-5 py-5" style={{ background: "rgba(0,0,0,0.3)" }}>
        {expression && (
          <div
            className="text-right text-sm mb-1"
            style={{ color: "hsl(var(--ink-faint))", fontFamily: "var(--font-mono)" }}
          >
            {expression}
          </div>
        )}
        <div
          className="text-right text-4xl font-bold truncate"
          style={{
            fontFamily: "var(--font-display)",
            color: justEvaluated ? "hsl(var(--brand))" : "hsl(var(--ink))",
          }}
        >
          {display}
        </div>
      </div>

      {/* Buttons */}
      <div className="p-3 grid grid-cols-4 gap-2">
        {BUTTONS.flat().map((btn, i) => (
          <button
            key={i}
            onClick={() => handleButton(btn)}
            className="h-12 rounded-xl text-sm font-semibold transition-all active:scale-95"
            style={{
              background: isOp(btn)
                ? btn === "="
                  ? "linear-gradient(135deg, hsl(var(--brand)) 0%, hsl(var(--accent)) 100%)"
                  : "hsl(var(--brand-subtle))"
                : isFn(btn)
                ? "rgba(255,255,255,0.08)"
                : "rgba(255,255,255,0.05)",
              color: isOp(btn)
                ? btn === "="
                  ? "white"
                  : "hsl(var(--brand))"
                : isFn(btn)
                ? "hsl(var(--ink-muted))"
                : "hsl(var(--ink))",
              border: "1px solid hsl(var(--border))",
              gridColumn: btn === "0" ? "span 2" : "span 1",
              fontFamily: "var(--font-mono)",
            }}
          >
            {btn}
          </button>
        ))}
      </div>

      {/* History */}
      {history.length > 0 && (
        <div
          className="px-4 py-3 max-h-32 overflow-y-auto"
          style={{ borderTop: "1px solid hsl(var(--border))" }}
        >
          <p
            className="text-xs mb-2"
            style={{ color: "hsl(var(--ink-faint))", fontFamily: "var(--font-mono)" }}
          >
            HISTORY
          </p>
          {history.map((h, i) => (
            <div key={i} className="flex justify-between items-center py-0.5">
              <span className="text-xs" style={{ color: "hsl(var(--ink-faint))", fontFamily: "var(--font-mono)" }}>
                {h.expression}
              </span>
              <span className="text-xs font-medium" style={{ color: "hsl(var(--ink))", fontFamily: "var(--font-mono)" }}>
                = {h.result}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
