"use client";

import { useState } from "react";
import type { Product, ProductGridProps } from "@/types";
import { Star, ShoppingCart, Heart, SlidersHorizontal, ChevronDown } from "lucide-react";

const SORT_OPTIONS = ["Relevance", "Price: Low to High", "Price: High to Low", "Best Rated", "Most Popular"];

function StarRating({ rating, size = 12 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} width={size} height={size} viewBox="0 0 12 12" fill="none">
          <path
            d="M6 1l1.3 2.6 2.9.4-2.1 2 .5 2.9L6 7.6 3.4 8.9l.5-2.9L2 4l2.9-.4z"
            fill={s <= Math.round(rating) ? "var(--warning)" : "var(--border-base)"}
            stroke="none"
          />
        </svg>
      ))}
    </div>
  );
}

function ProductBadge({ badge }: { badge: string }) {
  const colors: Record<string, string> = {
    "Best Seller": "background:rgba(251,191,36,0.15);color:#fbbf24;border:1px solid rgba(251,191,36,0.3)",
    "New":         "background:rgba(56,189,248,0.15);color:#38bdf8;border:1px solid rgba(56,189,248,0.3)",
    "Sale":        "background:rgba(248,113,113,0.15);color:#f87171;border:1px solid rgba(248,113,113,0.3)",
    "Hot":         "background:rgba(249,115,22,0.15);color:#f97316;border:1px solid rgba(249,115,22,0.3)",
  };
  return (
    <span
      className="px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ ...(Object.fromEntries((colors[badge] ?? colors["New"]).split(";").map(s => { const [k,v] = s.split(":"); return [k.trim().replace(/-([a-z])/g, (_,l) => l.toUpperCase()), v?.trim()] }))) }}
    >
      {badge}
    </span>
  );
}

function ProductCard({ product }: { product: Product }) {
  const [wished, setWished] = useState(false);
  const [added, setAdded] = useState(false);
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  const handleAdd = () => {
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div
      className="group rounded-2xl overflow-hidden flex flex-col transition-all duration-200"
      style={{
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-subtle)",
        boxShadow: "var(--shadow-sm)",
      }}
      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border-strong)"}
      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border-subtle)"}
    >
      {/* Image area */}
      <div
        className="relative flex items-center justify-center h-36"
        style={{ background: "var(--bg-hover)" }}
      >
        <span className="text-5xl" role="img">{product.image}</span>

        {/* Wishlist */}
        <button
          onClick={() => setWished(w => !w)}
          className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
          style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-base)" }}
        >
          <Heart
            className="w-3.5 h-3.5"
            fill={wished ? "var(--danger)" : "none"}
            stroke={wished ? "var(--danger)" : "var(--text-muted)"}
          />
        </button>

        {/* Discount badge */}
        {discount > 0 && (
          <span
            className="absolute top-2.5 left-2.5 px-1.5 py-0.5 rounded-md text-xs font-semibold"
            style={{ background: "var(--danger)", color: "#fff" }}
          >
            -{discount}%
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-3 gap-1.5">
        <div className="flex items-start justify-between gap-1">
          <div className="flex-1 min-w-0">
            <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{product.brand}</p>
            <p className="text-sm font-medium leading-tight line-clamp-2 mt-0.5" style={{ color: "var(--text-primary)", fontFamily: "'Poppins', sans-serif" }}>
              {product.name}
            </p>
          </div>
          {product.badge && <ProductBadge badge={product.badge} />}
        </div>

        <div className="flex items-center gap-1.5">
          <StarRating rating={product.rating} />
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            {product.rating.toFixed(1)} ({product.reviewCount.toLocaleString()})
          </span>
        </div>

        <div className="flex items-center gap-2 mt-auto pt-1">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold" style={{ color: "var(--text-primary)", fontFamily: "'Poppins', sans-serif" }}>
              {product.currency}{product.price.toLocaleString()}
            </span>
            {product.originalPrice && (
              <span className="text-xs line-through" style={{ color: "var(--text-muted)" }}>
                {product.currency}{product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 mt-1">
          <span
            className="text-xs px-1.5 py-0.5 rounded-md"
            style={{
              background: product.inStock ? "rgba(52,211,153,0.12)" : "rgba(248,113,113,0.12)",
              color: product.inStock ? "var(--success)" : "var(--danger)",
            }}
          >
            {product.inStock ? `In Stock${product.stockCount ? ` (${product.stockCount})` : ""}` : "Out of Stock"}
          </span>
        </div>

        <button
          onClick={handleAdd}
          disabled={!product.inStock}
          className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl text-sm font-medium transition-all mt-1 disabled:opacity-40"
          style={{
            background: added ? "var(--success)" : "var(--accent-subtle)",
            color: added ? "#fff" : "var(--accent-1)",
            border: `1px solid ${added ? "transparent" : "var(--accent-1)"}`,
          }}
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          {added ? "Added!" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}

export function ProductGrid({ title, products, query, description }: ProductGridProps) {
  const [sort, setSort] = useState("Relevance");
  const [showSort, setShowSort] = useState(false);
  const [priceFilter, setPriceFilter] = useState<"all" | "under50" | "50-100" | "100-500" | "over500">("all");

  const filtered = products.filter(p => {
    if (priceFilter === "under50")  return p.price < 50;
    if (priceFilter === "50-100")   return p.price >= 50 && p.price <= 100;
    if (priceFilter === "100-500")  return p.price > 100 && p.price <= 500;
    if (priceFilter === "over500")  return p.price > 500;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "Price: Low to High")  return a.price - b.price;
    if (sort === "Price: High to Low")  return b.price - a.price;
    if (sort === "Best Rated")          return b.rating - a.rating;
    if (sort === "Most Popular")        return b.reviewCount - a.reviewCount;
    return 0;
  });

  return (
    <div className="w-full rounded-2xl overflow-hidden" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", maxWidth: 720 }}>
      {/* Header */}
      <div className="px-4 pt-4 pb-3" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold font-poppins" style={{ color: "var(--text-primary)" }}>
              {title ?? (query ? `Results for "${query}"` : "Products")}
            </h3>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              {description ?? `${sorted.length} products found`}
            </p>
          </div>
          {/* Sort */}
          <div className="relative">
            <button
              onClick={() => setShowSort(s => !s)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
              style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-base)", color: "var(--text-secondary)" }}
            >
              <SlidersHorizontal className="w-3 h-3" /> {sort} <ChevronDown className="w-3 h-3" />
            </button>
            {showSort && (
              <div
                className="absolute right-0 top-full mt-1 z-50 rounded-xl overflow-hidden py-1 min-w-40"
                style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-base)", boxShadow: "var(--shadow-md)" }}
              >
                {SORT_OPTIONS.map(o => (
                  <button
                    key={o}
                    onClick={() => { setSort(o); setShowSort(false); }}
                    className="w-full text-left px-3 py-2 text-xs transition-colors"
                    style={{
                      color: sort === o ? "var(--accent-1)" : "var(--text-secondary)",
                      background: sort === o ? "var(--accent-subtle)" : "transparent",
                    }}
                  >
                    {o}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Price filters */}
        <div className="flex gap-1.5 mt-2 flex-wrap">
          {(["all", "under50", "50-100", "100-500", "over500"] as const).map(f => (
            <button
              key={f}
              onClick={() => setPriceFilter(f)}
              className="px-2.5 py-1 rounded-full text-xs transition-all"
              style={{
                background: priceFilter === f ? "var(--accent-subtle)" : "var(--bg-hover)",
                color: priceFilter === f ? "var(--accent-1)" : "var(--text-muted)",
                border: `1px solid ${priceFilter === f ? "var(--accent-1)" : "transparent"}`,
              }}
            >
              {{ all: "All", under50: "< $50", "50-100": "$50–$100", "100-500": "$100–$500", over500: "> $500" }[f]}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="p-3">
        {sorted.length === 0 ? (
          <div className="py-8 text-center text-sm" style={{ color: "var(--text-muted)" }}>No products match your filters</div>
        ) : (
          <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" }}>
            {sorted.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
