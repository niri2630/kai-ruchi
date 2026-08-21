"use client";

import Link from "next/link";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

/* ============================================================== FlipText ===
   The label rolls up and a copy rolls in behind it, letter by letter. Used on
   nav links and section headings.
   ========================================================================= */

export function FlipText({
  children,
  className,
  stagger = 0.022,
}: {
  children: string;
  className?: string;
  stagger?: number;
}) {
  const letters = [...children];

  return (
    <span
      className={cn("relative inline-block overflow-hidden align-bottom", className)}
      style={{ lineHeight: 1.15 }}
    >
      <span className="sr-only">{children}</span>
      <motion.span initial="rest" whileHover="hover" animate="rest" aria-hidden>
        <span className="flex">
          {letters.map((char, i) => (
            <motion.span
              key={`up-${i}`}
              className="inline-block"
              variants={{ rest: { y: 0 }, hover: { y: "-115%" } }}
              transition={{ duration: 0.42, ease: EASE, delay: i * stagger }}
            >
              {char === " " ? " " : char}
            </motion.span>
          ))}
        </span>
        <span className="absolute inset-0 flex">
          {letters.map((char, i) => (
            <motion.span
              key={`down-${i}`}
              className="inline-block"
              variants={{ rest: { y: "115%" }, hover: { y: 0 } }}
              transition={{ duration: 0.42, ease: EASE, delay: i * stagger }}
            >
              {char === " " ? " " : char}
            </motion.span>
          ))}
        </span>
      </motion.span>
    </span>
  );
}

/* =========================================================== ScrambleText ===
   Characters shuffle through a spice-shop alphabet before settling. Restrained
   to one or two moments per page — it is loud.
   ========================================================================= */

const GLYPHS = "अआकखगचटतपबमरलवषसह०१२३४५६७८९";

export function ScrambleText({
  children,
  className,
  speed = 34,
}: {
  children: string;
  className?: string;
  speed?: number;
}) {
  const [display, setDisplay] = useState(children);
  const frame = useRef(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    setDisplay(children);
  }, [children]);

  useEffect(() => stop, [stop]);

  const start = () => {
    if (timer.current) return;
    frame.current = 0;
    timer.current = setInterval(() => {
      frame.current += 1;
      const settled = Math.floor(frame.current / 2);
      setDisplay(
        [...children]
          .map((char, i) => {
            if (i < settled || char === " ") return char;
            return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          })
          .join(""),
      );
      if (settled >= children.length) stop();
    }, speed);
  };

  return (
    <span
      className={cn("inline-block", className)}
      onMouseEnter={start}
      onFocus={start}
      onMouseLeave={stop}
      onBlur={stop}
    >
      <span className="sr-only">{children}</span>
      <span aria-hidden>{display}</span>
    </span>
  );
}

/* ========================================================== UnderlineLink ===
   Underline wipes in from the left, out to the right — so it never looks like
   it is rewinding.
   ========================================================================= */

export function UnderlineLink({
  href,
  children,
  className,
  color = "currentColor",
  external,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  color?: string;
  external?: boolean;
}) {
  const inner = (
    <span className="relative inline-block">
      {children}
      <span
        className="pointer-events-none absolute -bottom-0.5 left-0 h-[2px] w-full origin-right scale-x-0 transition-transform duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/link:origin-left group-hover/link:scale-x-100"
        style={{ background: color }}
      />
    </span>
  );

  const classes = cn("group/link relative inline-block", className);

  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer noopener" className={classes}>
        {inner}
      </a>
    );
  }
  return (
    <Link href={href} className={classes}>
      {inner}
    </Link>
  );
}

/* ================================================================ Magnetic ===
   The element leans toward the cursor and springs back. A couple of pixels is
   plenty; more feels like a bug.
   ========================================================================= */

export function Magnetic({
  children,
  strength = 0.32,
  className,
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 18, mass: 0.4 });
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 18, mass: 0.4 });

  const onMove = (event: MouseEvent<HTMLDivElement>) => {
    const box = ref.current?.getBoundingClientRect();
    if (!box) return;
    x.set((event.clientX - (box.left + box.width / 2)) * strength);
    y.set((event.clientY - (box.top + box.height / 2)) * strength);
  };

  return (
    <motion.div
      ref={ref}
      className={cn("inline-block", className)}
      style={{ x, y }}
      onMouseMove={onMove}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

/* ================================================================ TiltCard ===
   3D tilt with a moving specular highlight — the card behaves like a glass jar
   catching the light as you turn it.
   ========================================================================= */

export function TiltCard({
  children,
  className,
  max = 9,
  glare = true,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
  glare?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);

  const spring = { stiffness: 190, damping: 20, mass: 0.5 };
  const rotateX = useSpring(useTransform(py, [0, 1], [max, -max]), spring);
  const rotateY = useSpring(useTransform(px, [0, 1], [-max, max]), spring);
  const glareX = useTransform(px, [0, 1], ["0%", "100%"]);
  const glareY = useTransform(py, [0, 1], ["0%", "100%"]);
  const glareBg = useMotionTemplate`radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,0.55), transparent 55%)`;

  const onMove = (event: MouseEvent<HTMLDivElement>) => {
    const box = ref.current?.getBoundingClientRect();
    if (!box) return;
    px.set((event.clientX - box.left) / box.width);
    py.set((event.clientY - box.top) / box.height);
  };

  const reset = () => {
    px.set(0.5);
    py.set(0.5);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d", perspective: 1000 }}
      className={cn("relative", className)}
    >
      {children}
      {glare && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 mix-blend-soft-light transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: glareBg }}
        />
      )}
    </motion.div>
  );
}

/* ============================================================= SlideReveal ===
   A coloured panel wipes across the element on hover, flipping the text to the
   inverse colour. Used on category tiles.
   ========================================================================= */

export function WipeHover({
  children,
  color = "var(--color-chilli)",
  textColor = "#fff",
  className,
}: {
  children: ReactNode;
  color?: string;
  textColor?: string;
  className?: string;
}) {
  return (
    <span className={cn("group/wipe relative inline-flex overflow-hidden", className)}>
      <span
        aria-hidden
        className="absolute inset-0 origin-bottom scale-y-0 transition-transform duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/wipe:scale-y-100"
        style={{ background: color }}
      />
      <span
        className="relative transition-colors duration-300"
        style={{ ["--hover-text" as string]: textColor }}
      >
        <span className="group-hover/wipe:text-[color:var(--hover-text)]">{children}</span>
      </span>
    </span>
  );
}
