"use client";

import Image from "next/image";
import { useState } from "react";
import { Flame, Leaf, Minus, Plus, Star } from "lucide-react";
import { cn, accentOf, initials, SPICE_LABELS } from "@/lib/utils";

/* --------------------------------------------------------------- surfaces -- */

export function GlassCard({
  children,
  className,
  deep,
}: {
  children: React.ReactNode;
  className?: string;
  deep?: boolean;
}) {
  return (
    <div className={cn(deep ? "glass-deep" : "glass", "rounded-[var(--radius-jar)]", className)}>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------ spice meter -- */

/**
 * How hot the thing actually is, 0–3. Real information for a masala shop, so
 * it gets a real control rather than a decorative flourish.
 */
export function SpiceMeter({
  level,
  size = 14,
  showLabel = false,
  className,
}: {
  level: number;
  size?: number;
  showLabel?: boolean;
  className?: string;
}) {
  if (level <= 0) {
    return (
      <span className={cn("inline-flex items-center gap-1.5 text-leaf", className)}>
        <Leaf style={{ width: size, height: size }} />
        {showLabel && <span className="text-xs font-semibold">No heat</span>}
      </span>
    );
  }
  return (
    <span
      className={cn("inline-flex items-center gap-1", className)}
      title={SPICE_LABELS[level]}
    >
      <span className="inline-flex items-center gap-0.5">
        {[1, 2, 3].map((step) => (
          <Flame
            key={step}
            style={{ width: size, height: size }}
            className={cn(
              "transition-colors",
              step <= level ? "text-chilli fill-chilli/25" : "text-kaadige/18",
            )}
          />
        ))}
      </span>
      {showLabel && (
        <span className="text-xs font-semibold text-kaadige/70">{SPICE_LABELS[level]}</span>
      )}
    </span>
  );
}

/* ------------------------------------------------------------------ stars -- */

export function Stars({
  value,
  size = 14,
  className,
}: {
  value: number;
  size?: number;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} aria-hidden>
      {[1, 2, 3, 4, 5].map((step) => (
        <Star
          key={step}
          style={{ width: size, height: size }}
          className={cn(
            step <= Math.round(value)
              ? "text-turmeric fill-turmeric"
              : "text-kaadige/18",
          )}
        />
      ))}
    </span>
  );
}

/* ------------------------------------------------------------------ badge -- */

export function VegMark({ isVeg, size = 16 }: { isVeg: boolean; size?: number }) {
  const color = isVeg ? "#1e7a54" : "#a81d16";
  return (
    <span
      title={isVeg ? "Vegetarian" : "Contains meat or fish"}
      className="inline-flex items-center justify-center rounded-[3px] border-2 bg-white/85"
      style={{ width: size, height: size, borderColor: color }}
    >
      <span
        className="rounded-full"
        style={{ width: size * 0.42, height: size * 0.42, background: color }}
      />
    </span>
  );
}

export function Pill({
  children,
  accent = "turmeric",
  className,
}: {
  children: React.ReactNode;
  accent?: string;
  className?: string;
}) {
  const tone = accentOf(accent);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.6875rem] font-bold uppercase tracking-[0.14em]",
        className,
      )}
      style={{ background: tone.hex, color: tone.text }}
    >
      {children}
    </span>
  );
}

/* -------------------------------------------------------------- qty steps -- */

export function QtyStepper({
  value,
  onChange,
  max = 99,
  min = 1,
  className,
}: {
  value: number;
  onChange: (next: number) => void;
  max?: number;
  min?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "clay-inset inline-flex items-center rounded-full p-1",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="Reduce quantity"
        className="grid size-8 place-items-center rounded-full text-kaadige transition hover:bg-kaadige/10 disabled:opacity-35"
      >
        <Minus className="size-4" />
      </button>
      <span className="tabular w-9 text-center text-sm font-bold">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="Increase quantity"
        className="grid size-8 place-items-center rounded-full text-kaadige transition hover:bg-kaadige/10 disabled:opacity-35"
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}

/* ----------------------------------------------------------------- images -- */

/**
 * Product photography, with a painted fallback. If an image is missing the
 * card still reads as a jar of something — tinted with its category colour and
 * marked with the product's initials — rather than collapsing to a grey box.
 */
export function ProductImage({
  src,
  alt,
  accent = "turmeric",
  fill = true,
  width,
  height,
  className,
  priority,
  sizes = "(max-width: 768px) 50vw, 320px",
}: {
  src: string | null | undefined;
  alt: string;
  accent?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  const [failed, setFailed] = useState(false);
  const tone = accentOf(accent);

  if (!src || failed) {
    return (
      <div
        className={cn(
          "grid h-full w-full place-items-center overflow-hidden",
          className,
        )}
        style={{
          background: `radial-gradient(120% 90% at 30% 20%, ${tone.hex}, ${tone.deep})`,
        }}
        aria-label={alt}
        role="img"
      >
        <span
          className="wordmark text-5xl opacity-45"
          style={{ color: tone.text }}
        >
          {initials(alt)}
        </span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      {...(fill ? { fill: true, sizes } : { width: width ?? 400, height: height ?? 400 })}
      className={cn("object-cover", className)}
      onError={() => setFailed(true)}
      priority={priority}
    />
  );
}

/* --------------------------------------------------------------- skeleton -- */

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-2xl", className)} />;
}

export function ProductCardSkeleton() {
  return (
    <div className="glass rounded-[var(--radius-jar)] p-3">
      <Skeleton className="aspect-[4/5] w-full" />
      <div className="space-y-2 p-3">
        <Skeleton className="h-3 w-20 rounded-full" />
        <Skeleton className="h-5 w-4/5 rounded-full" />
        <Skeleton className="h-3 w-full rounded-full" />
        <Skeleton className="h-8 w-28 rounded-full" />
      </div>
    </div>
  );
}
