import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Accent } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const rupees = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/** ₹279 — paise are dropped because every price here is a whole rupee. */
export function money(value: string | number) {
  const n = typeof value === "string" ? Number.parseFloat(value) : value;
  return Number.isFinite(n) ? rupees.format(n) : "—";
}

export function num(value: string | number) {
  return typeof value === "string" ? Number.parseFloat(value) : value;
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function discountPercent(price: string, compareAt: string | null) {
  if (!compareAt) return null;
  const p = num(price);
  const c = num(compareAt);
  if (!c || c <= p) return null;
  return Math.round(((c - p) / c) * 100);
}

/** Each category owns a colour; every surface tinted for it reads from here. */
export const ACCENTS: Record<
  Accent,
  { hex: string; deep: string; text: string; label: string }
> = {
  chilli: { hex: "#e23e2e", deep: "#a81d16", text: "#ffffff", label: "Chilli" },
  turmeric: { hex: "#f5a31a", deep: "#c87708", text: "#241209", label: "Turmeric" },
  leaf: { hex: "#1e7a54", deep: "#0f4e34", text: "#ffffff", label: "Banana leaf" },
  indigo: { hex: "#4b2e83", deep: "#2f1a58", text: "#ffffff", label: "Indigo" },
  rose: { hex: "#e0457b", deep: "#a82256", text: "#ffffff", label: "Rose" },
};

export function accentOf(accent: string | undefined): (typeof ACCENTS)[Accent] {
  return ACCENTS[(accent as Accent) ?? "turmeric"] ?? ACCENTS.turmeric;
}

export const SPICE_LABELS = [
  "No heat",
  "Gentle",
  "Properly hot",
  "Keep curd rice ready",
] as const;

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
