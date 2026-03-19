"use client";

import { useState } from "react";
import type { ProductDetailProps } from "@/types";
import { Star, ShoppingCart, Heart, Share2, Shield, Truck, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {[1,2,3,4,5].map(s => (
          <svg key={s} width={14} height={14} viewBox="0 0 12 12" fill="none">
            <path d="M6 1l1.3 2.6 2.9.4-2.1 2 .5 2.9L6 7.6 3.4 8.9l.5-2.9L2 4l2.9-.4z"
              fill={s <= Math.round(rating) ? "var(--warning)" : "var(--border-base)"} />
          </svg>
        ))}
      </div>
      <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{rating.toFixed(1)}</span>
      <span className="text-xs" style={{ color: "var(--text-muted)" }}>({count.toLocaleString()} reviews)</span>
    </div>
  );
}

export function ProductDetail({ product }: ProductDetailProps) {
  const [qty, setQty]           = useState(1);
  const [wished, setWished]     = useState(false);
  const [added, setAdded]       = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  const handleAdd = () => {
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  // Group variants by label
  const variantGroups = (product.variants ?? []).reduce<Record<string, typeof product.variants>>((acc, v) => {
    if (!v) return acc;
    acc[v.label] = acc[v.label] ?? [];
    acc[v.label]!.push(v);
    return acc;
  }, {});

  return (
    <div className="w-full rounded-2xl overflow-hidden" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", maxWidth: 580 }}>
      {/* Image */}
      <div className="relative flex items-center justify-center h-48" style={{ background: "var(--bg-hover)" }}>
        <span className="text-7xl" role="img">{product.image}</span>
        {product.badge && (
          <span
            className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-xs font-semibold"
            style={{ background: "var(--accent-subtle)", color: "var(--accent-1)", border: "1px solid var(--accent-1)" }}
          >
            {product.badge}
          </span>
        )}
        <div className="absolute top-3 right-3 flex gap-2">
          <button
            onClick={() => setWished(w => !w)}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-base)" }}
          >
            <Heart className="w-4 h-4" fill={wished ? "var(--danger)" : "none"} stroke={wished ? "var(--danger)" : "var(--text-muted)"} />
          </button>
          <button
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-base)" }}
          >
            <Share2 className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Title + Price */}
        <div>
          <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>{product.brand} · {product.category}</p>
          <h3 className="text-lg font-semibold font-poppins leading-snug" style={{ color: "var(--text-primary)" }}>{product.name}</h3>
          <div className="mt-2">
            <StarRating rating={product.rating} count={product.reviewCount} />
          </div>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="text-2xl font-bold font-poppins" style={{ color: "var(--text-primary)" }}>
              {product.currency}{product.price.toLocaleString()}
            </span>
            {product.originalPrice && (
              <>
                <span className="text-sm line-through" style={{ color: "var(--text-muted)" }}>
                  {product.currency}{product.originalPrice.toLocaleString()}
                </span>
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded-md" style={{ background: "rgba(248,113,113,0.15)", color: "var(--danger)" }}>
                  -{discount}% OFF
                </span>
              </>
            )}
          </div>
        </div>

        {/* Variants */}
        {Object.entries(variantGroups).map(([label, variants]) => (
          <div key={label}>
            <p className="text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>{label}</p>
            <div className="flex flex-wrap gap-2">
              {(variants ?? []).map(v => v && (
                <button
                  key={v.id}
                  onClick={() => setSelectedVariants(sv => ({ ...sv, [label]: v.value }))}
                  disabled={!v.inStock}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-40"
                  style={{
                    background: selectedVariants[label] === v.value ? "var(--accent-subtle)" : "var(--bg-elevated)",
                    border: `1px solid ${selectedVariants[label] === v.value ? "var(--accent-1)" : "var(--border-base)"}`,
                    color: selectedVariants[label] === v.value ? "var(--accent-1)" : "var(--text-secondary)",
                  }}
                >
                  {v.value}
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Stock */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: product.inStock ? "var(--success)" : "var(--danger)" }} />
          <span className="text-xs" style={{ color: product.inStock ? "var(--success)" : "var(--danger)" }}>
            {product.inStock ? `In Stock${product.stockCount ? ` — ${product.stockCount} left` : ""}` : "Out of Stock"}
          </span>
        </div>

        {/* Qty + CTA */}
        <div className="flex gap-2">
          <div className="flex items-center rounded-xl overflow-hidden" style={{ border: "1px solid var(--border-base)", background: "var(--bg-elevated)" }}>
            <button
              onClick={() => setQty(q => Math.max(1, q - 1))}
              className="w-9 h-10 flex items-center justify-center text-lg transition-colors hover:text-accent"
              style={{ color: "var(--text-secondary)" }}
            >−</button>
            <span className="w-9 text-center text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{qty}</span>
            <button
              onClick={() => setQty(q => Math.min(product.stockCount ?? 99, q + 1))}
              className="w-9 h-10 flex items-center justify-center text-lg transition-colors"
              style={{ color: "var(--text-secondary)" }}
            >+</button>
          </div>
          <button
            onClick={handleAdd}
            disabled={!product.inStock}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 font-poppins"
            style={{
              background: added ? "var(--success)" : "var(--accent-1)",
              color: "#fff",
              boxShadow: added ? "none" : `0 4px 16px var(--accent-glow)`,
            }}
          >
            <ShoppingCart className="w-4 h-4" />
            {added ? "Added to Cart!" : `Add ${qty > 1 ? `${qty} ` : ""}to Cart`}
          </button>
        </div>

        {/* Trust badges */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: <Shield className="w-3.5 h-3.5" />, text: "2yr Warranty" },
            { icon: <Truck className="w-3.5 h-3.5" />,  text: "Free Shipping" },
            { icon: <RotateCcw className="w-3.5 h-3.5" />, text: "30d Returns" },
          ].map(({ icon, text }) => (
            <div key={text} className="flex flex-col items-center gap-1 py-2 rounded-xl" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
              <span style={{ color: "var(--accent-1)" }}>{icon}</span>
              <span className="text-xs text-center" style={{ color: "var(--text-muted)" }}>{text}</span>
            </div>
          ))}
        </div>

        {/* Description */}
        {product.description && (
          <div className="rounded-xl p-3" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
            <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{product.description}</p>
          </div>
        )}

        {/* Features */}
        {product.features && product.features.length > 0 && (
          <div>
            <p className="text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Key Features</p>
            <ul className="space-y-1">
              {product.features.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                  <span style={{ color: "var(--accent-1)", flexShrink: 0, marginTop: "2px" }}>✓</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Reviews toggle */}
        {product.reviews && product.reviews.length > 0 && (
          <div>
            <button
              onClick={() => setShowReviews(s => !s)}
              className="w-full flex items-center justify-between py-2 text-xs font-medium"
              style={{ color: "var(--text-secondary)", borderTop: "1px solid var(--border-subtle)" }}
            >
              Customer Reviews ({product.reviews.length})
              {showReviews ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {showReviews && (
              <div className="space-y-2 mt-2">
                {product.reviews.map((r, i) => (
                  <div key={i} className="rounded-xl p-3" style={{ background: "var(--bg-elevated)" }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>{r.author}</span>
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>{r.date}</span>
                    </div>
                    <div className="flex gap-0.5 mb-1">
                      {[1,2,3,4,5].map(s => (
                        <svg key={s} width={10} height={10} viewBox="0 0 12 12">
                          <path d="M6 1l1.3 2.6 2.9.4-2.1 2 .5 2.9L6 7.6 3.4 8.9l.5-2.9L2 4l2.9-.4z"
                            fill={s <= r.rating ? "var(--warning)" : "var(--border-base)"} />
                        </svg>
                      ))}
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{r.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
