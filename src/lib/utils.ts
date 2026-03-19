import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  // Simple className merger without external dep
  return inputs
    .flatMap((i) => {
      if (!i) return [];
      if (typeof i === "string") return [i];
      if (Array.isArray(i)) return i.filter(Boolean);
      if (typeof i === "object") {
        return Object.entries(i)
          .filter(([, v]) => Boolean(v))
          .map(([k]) => k);
      }
      return [];
    })
    .join(" ");
}

export function nanoid(size = 12): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const randomValues = new Uint8Array(size);
  if (typeof window !== "undefined") {
    window.crypto.getRandomValues(randomValues);
  } else {
    // Node.js fallback
    for (let i = 0; i < size; i++) randomValues[i] = Math.floor(Math.random() * 256);
  }
  for (let i = 0; i < size; i++) {
    result += chars[randomValues[i] % chars.length];
  }
  return result;
}

export function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function getDaysUntil(dateStr: string | undefined): number | null {
  if (!dateStr) return null;
  try {
    const target = new Date(dateStr);
    const now = new Date();
    return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  } catch {
    return null;
  }
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + "...";
}
