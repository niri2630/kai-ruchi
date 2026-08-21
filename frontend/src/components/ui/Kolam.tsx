"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Kolam — the rice-flour pattern drawn on a South Indian doorstep every
 * morning. It is a real dot grid with a line looped around the dots, so it
 * earns its place as this site's divider: a threshold you cross between
 * sections, and a mark that the house is open.
 *
 * The path draws itself when the divider scrolls into view.
 */

function loopPath(dots: number) {
  const step = 28;
  let d = "";
  for (let i = 0; i < dots; i += 1) {
    const x = i * step + 14;
    // Alternating half-loops above and below the dot row.
    d +=
      i % 2 === 0
        ? `M ${x - 12} 22 a 12 12 0 0 1 24 0 `
        : `M ${x - 12} 22 a 12 12 0 0 0 24 0 `;
  }
  return d;
}

export function KolamDivider({
  dots = 13,
  className,
  color = "var(--color-turmeric-deep)",
}: {
  dots?: number;
  className?: string;
  color?: string;
}) {
  const width = dots * 28;
  return (
    <div className={cn("flex justify-center py-10", className)} aria-hidden>
      <motion.svg
        viewBox={`0 0 ${width} 44`}
        width={width}
        height={44}
        className="max-w-full opacity-70"
        initial="hidden"
        whileInView="shown"
        viewport={{ once: true, amount: 0.6 }}
      >
        {Array.from({ length: dots }).map((_, i) => (
          <motion.circle
            key={i}
            cx={i * 28 + 14}
            cy={22}
            r={2.6}
            fill={color}
            variants={{
              hidden: { opacity: 0, scale: 0 },
              shown: { opacity: 1, scale: 1 },
            }}
            transition={{ delay: i * 0.035, type: "spring", stiffness: 300, damping: 18 }}
          />
        ))}
        <motion.path
          d={loopPath(dots)}
          fill="none"
          stroke={color}
          strokeWidth={1.6}
          strokeLinecap="round"
          variants={{
            hidden: { pathLength: 0, opacity: 0 },
            shown: { pathLength: 1, opacity: 0.85 },
          }}
          transition={{ duration: 1.4, ease: "easeInOut", delay: 0.25 }}
        />
      </motion.svg>
    </div>
  );
}

/** A single kolam knot, used as a bullet and in the footer. */
export function KolamMark({
  size = 28,
  className,
  color = "currentColor",
}: {
  size?: number;
  className?: string;
  color?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={className}
      aria-hidden
      fill="none"
    >
      <path
        d="M16 4c3 4 3 8 0 12-3-4-3-8 0-12ZM28 16c-4 3-8 3-12 0 4-3 8-3 12 0ZM16 28c-3-4-3-8 0-12 3 4 3 8 0 12ZM4 16c4-3 8-3 12 0-4 3-8 3-12 0Z"
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="16" r="2" fill={color} />
    </svg>
  );
}
