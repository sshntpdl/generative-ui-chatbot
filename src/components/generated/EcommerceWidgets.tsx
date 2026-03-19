"use client";

import { useState } from "react";
import type { CartProps, OrderTrackingProps } from "@/types";
import { Minus, Plus, Trash2, Tag, ShoppingBag, Package, Truck, Home, CheckCircle } from "lucide-react";

/* ─── Cart ─────────────────────────────────────────── */

export function Cart({ title, items: initialItems, couponCode, discount = 0 }: CartProps) {
  const [items, setItems] = useState(initialItems);
  const [coupon, setCoupon] = useState(couponCode ?? "");
  const [couponApplied, setCouponApplied] = useState(!!couponCode);
  const [couponInput, setCouponInput] = useState("");

  const updateQty = (productId: string, delta: number) => {
    setItems(prev =>
      prev
        .map(item =>
          item.product.id === productId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter(item => item.quantity > 0)
    );
  };

  const removeItem = (productId: string) => {
    setItems(prev => prev.filter(i => i.product.id !== productId));
  };

  const subtotal   = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const discountAmt = couponApplied ? Math.round(subtotal * (discount || 0.1)) : 0;
  const shipping   = subtotal > 50 ? 0 : 5.99;
  const total      = subtotal - discountAmt + shipping;

  return (
    <div className="w-full rounded-2xl overflow-hidden" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", maxWidth: 560 }}>
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        <ShoppingBag className="w-4 h-4" style={{ color: "var(--accent-1)" }} />
        <h3 className="text-sm font-semibold font-poppins" style={{ color: "var(--text-primary)" }}>
          {title ?? "Shopping Cart"}
        </h3>
        <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-medium"
          style={{ background: "var(--accent-subtle)", color: "var(--accent-1)" }}>
          {items.reduce((s, i) => s + i.quantity, 0)} items
        </span>
      </div>

      {/* Items */}
      <div className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
        {items.length === 0 ? (
          <div className="py-10 text-center text-sm" style={{ color: "var(--text-muted)" }}>
            Your cart is empty
          </div>
        ) : items.map(item => (
          <div key={item.product.id} className="flex items-center gap-3 px-4 py-3">
            {/* Emoji image */}
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ background: "var(--bg-hover)" }}>
              {item.product.image}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs truncate font-medium" style={{ color: "var(--text-primary)" }}>{item.product.name}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{item.product.brand}</p>
              {item.selectedVariants && Object.entries(item.selectedVariants).map(([k,v]) => (
                <span key={k} className="text-xs" style={{ color: "var(--text-muted)" }}>{k}: {v}</span>
              ))}
            </div>

            {/* Qty controls */}
            <div className="flex items-center gap-1 rounded-lg overflow-hidden"
              style={{ border: "1px solid var(--border-base)", background: "var(--bg-elevated)" }}>
              <button onClick={() => updateQty(item.product.id, -1)}
                className="w-7 h-7 flex items-center justify-center text-sm"
                style={{ color: "var(--text-secondary)" }}>
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-6 text-center text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                {item.quantity}
              </span>
              <button onClick={() => updateQty(item.product.id, 1)}
                className="w-7 h-7 flex items-center justify-center text-sm"
                style={{ color: "var(--text-secondary)" }}>
                <Plus className="w-3 h-3" />
              </button>
            </div>

            <div className="text-right ml-1 flex-shrink-0">
              <p className="text-sm font-bold font-poppins" style={{ color: "var(--text-primary)" }}>
                {item.product.currency}{(item.product.price * item.quantity).toFixed(2)}
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {item.product.currency}{item.product.price} each
              </p>
            </div>

            <button onClick={() => removeItem(item.product.id)}
              className="ml-1 w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = "var(--danger)"}
              onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)"}>
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Coupon */}
      <div className="px-4 py-3" style={{ borderTop: "1px solid var(--border-subtle)" }}>
        {couponApplied ? (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: "rgba(52,211,153,0.10)", border: "1px solid rgba(52,211,153,0.3)" }}>
            <Tag className="w-3.5 h-3.5" style={{ color: "var(--success)" }} />
            <span className="text-xs font-medium" style={{ color: "var(--success)" }}>
              Coupon "{coupon}" applied — saving {items[0]?.product.currency ?? "$"}{discountAmt.toFixed(2)}
            </span>
            <button onClick={() => { setCouponApplied(false); setCoupon(""); }}
              className="ml-auto text-xs" style={{ color: "var(--text-muted)" }}>✕</button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              value={couponInput}
              onChange={e => setCouponInput(e.target.value)}
              placeholder="Coupon code"
              className="flex-1 px-3 py-2 rounded-xl text-xs outline-none"
              style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-base)", color: "var(--text-primary)" }}
            />
            <button
              onClick={() => { if (couponInput) { setCoupon(couponInput); setCouponApplied(true); } }}
              className="px-3 py-2 rounded-xl text-xs font-medium"
              style={{ background: "var(--accent-subtle)", color: "var(--accent-1)", border: "1px solid var(--accent-1)" }}>
              Apply
            </button>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="px-4 py-3 space-y-2" style={{ borderTop: "1px solid var(--border-subtle)", background: "var(--bg-elevated)" }}>
        {[
          { label: "Subtotal",  value: `$${subtotal.toFixed(2)}`, muted: false },
          ...(discountAmt > 0 ? [{ label: "Discount", value: `-$${discountAmt.toFixed(2)}`, muted: false, green: true }] : []),
          { label: "Shipping",  value: shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`, muted: true },
        ].map(row => (
          <div key={row.label} className="flex justify-between items-center text-xs">
            <span style={{ color: "var(--text-muted)" }}>{row.label}</span>
            <span className="font-medium" style={{ color: (row as any).green ? "var(--success)" : "var(--text-primary)" }}>
              {row.value}
            </span>
          </div>
        ))}
        <div className="flex justify-between items-center pt-2" style={{ borderTop: "1px solid var(--border-base)" }}>
          <span className="text-sm font-semibold font-poppins" style={{ color: "var(--text-primary)" }}>Total</span>
          <span className="text-lg font-bold font-poppins" style={{ color: "var(--text-primary)" }}>
            ${total.toFixed(2)}
          </span>
        </div>
        <button
          className="w-full py-3 rounded-xl text-sm font-semibold font-poppins mt-1 transition-all"
          style={{
            background: "var(--accent-1)",
            color: "#fff",
            boxShadow: "0 4px 16px var(--accent-glow)",
          }}
        >
          Checkout →
        </button>
        {shipping > 0 && (
          <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>
            Add ${(50 - subtotal).toFixed(2)} more for free shipping
          </p>
        )}
      </div>
    </div>
  );
}

/* ─── Order Tracking ────────────────────────────────── */

const STATUS_ICONS: Record<string, React.ReactNode> = {
  "placed":           <Package className="w-4 h-4" />,
  "confirmed":        <CheckCircle className="w-4 h-4" />,
  "shipped":          <Truck className="w-4 h-4" />,
  "out-for-delivery": <Truck className="w-4 h-4" />,
  "delivered":        <Home className="w-4 h-4" />,
};

export function OrderTracking({ title, orderId, product, status, estimatedDelivery, trackingNumber, steps }: OrderTrackingProps) {
  const completedSteps = steps.filter(s => s.completed).length;
  const progress = Math.round((completedSteps / steps.length) * 100);

  return (
    <div className="w-full rounded-2xl overflow-hidden" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", maxWidth: 480 }}>
      {/* Header */}
      <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--border-subtle)", background: "var(--accent-subtle)" }}>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-semibold font-poppins" style={{ color: "var(--accent-1)" }}>
              {title ?? "Order Tracking"}
            </h3>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>Order #{orderId}</p>
          </div>
          <span
            className="text-xs px-2 py-1 rounded-full font-medium capitalize"
            style={{
              background: status === "delivered" ? "rgba(52,211,153,0.15)" : "var(--accent-subtle)",
              color: status === "delivered" ? "var(--success)" : "var(--accent-1)",
              border: `1px solid ${status === "delivered" ? "rgba(52,211,153,0.4)" : "var(--accent-1)"}`,
            }}
          >
            {status.replace(/-/g, " ")}
          </span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Product info */}
        <div className="flex items-center gap-3 rounded-xl p-3" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
          <div className="text-2xl">{steps[0] ? "📦" : "🛍️"}</div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate" style={{ color: "var(--text-primary)" }}>{product}</p>
            {trackingNumber && (
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                Tracking: <span style={{ fontFamily: "Geist Mono, monospace", color: "var(--accent-2)" }}>{trackingNumber}</span>
              </p>
            )}
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Est. delivery</p>
            <p className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>{estimatedDelivery}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex justify-between text-xs mb-1.5" style={{ color: "var(--text-muted)" }}>
            <span>Progress</span>
            <span>{completedSteps}/{steps.length} steps</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg-hover)" }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${progress}%`,
                background: `linear-gradient(90deg, var(--accent-1), var(--accent-2))`,
              }}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-1">
          {steps.map((step, idx) => (
            <div key={step.id} className="flex gap-3">
              {/* Icon column */}
              <div className="flex flex-col items-center">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                  style={{
                    background: step.completed
                      ? "var(--accent-1)"
                      : step.active
                      ? "var(--accent-subtle)"
                      : "var(--bg-elevated)",
                    border: `2px solid ${step.completed ? "var(--accent-1)" : step.active ? "var(--accent-1)" : "var(--border-base)"}`,
                    color: step.completed ? "#fff" : step.active ? "var(--accent-1)" : "var(--text-muted)",
                  }}
                >
                  {STATUS_ICONS[step.id] ?? <span className="text-xs">{idx + 1}</span>}
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className="w-0.5 h-5 mt-1"
                    style={{ background: step.completed ? "var(--accent-1)" : "var(--border-subtle)" }}
                  />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pb-3">
                <div className="flex items-center justify-between">
                  <p
                    className="text-xs font-medium"
                    style={{ color: step.completed || step.active ? "var(--text-primary)" : "var(--text-muted)" }}
                  >
                    {step.label}
                  </p>
                  {step.timestamp && (
                    <span className="text-xs" style={{ color: "var(--text-muted)", fontFamily: "Geist Mono, monospace" }}>
                      {step.timestamp}
                    </span>
                  )}
                </div>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
