"use client";

import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  useAnimationFrame,
  useMotionValue,
  type MotionValue,
} from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/* ====================================================== ScrollProgressBar ===
   A turmeric thread across the top of the window that fills as you read.
   ========================================================================= */

export function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 26,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[70] h-[3px] origin-left bg-gradient-to-r from-turmeric via-chilli to-indigo"
    />
  );
}

/* ============================================================== Parallax ===
   Moves at a different rate than the page. Negative speed drifts upward.
   ========================================================================= */

export function Parallax({
  children,
  speed = 0.2,
  className,
}: {
  children: ReactNode;
  speed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [`${speed * 100}%`, `${-speed * 100}%`]);
  const smooth = useSpring(y, { stiffness: 120, damping: 26, mass: 0.4 });

  return (
    <div ref={ref} className={className}>
      <motion.div style={{ y: smooth }}>{children}</motion.div>
    </div>
  );
}

/* ========================================================== ScrollReveal ===
   Scale + fade + lift driven by the element's own position in the viewport,
   so the motion tracks the scroll rather than firing once and finishing.
   ========================================================================= */

export function ScrollZoom({
  children,
  className,
  from = 0.86,
  to = 1,
  rounded = true,
}: {
  children: ReactNode;
  className?: string;
  from?: number;
  to?: number;
  rounded?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [from, to]);
  const radius = useTransform(scrollYProgress, [0, 1], ["5rem", "1.75rem"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [0.35, 1]);

  return (
    <div ref={ref} className={className}>
      <motion.div
        style={{ scale, opacity, borderRadius: rounded ? radius : undefined }}
        className="overflow-hidden"
      >
        {children}
      </motion.div>
    </div>
  );
}

/* ======================================================= ScrollWordReveal ===
   Each word brightens as the line passes through the middle of the screen.
   The signature scroll moment of the site — used once, on the promise band.
   ========================================================================= */

export function ScrollWordReveal({
  text,
  className,
  highlight = [],
}: {
  text: string;
  className?: string;
  highlight?: string[];
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "start 0.28"],
  });
  const words = text.split(" ");

  return (
    <p ref={ref} className={cn("flex flex-wrap", className)}>
      {words.map((word, i) => {
        const start = i / words.length;
        const end = start + 1 / words.length;
        return (
          <Word
            key={`${word}-${i}`}
            progress={scrollYProgress}
            range={[start, end]}
            hot={highlight.includes(word.replace(/[^\w'-]/g, ""))}
          >
            {word}
          </Word>
        );
      })}
    </p>
  );
}

function Word({
  children,
  progress,
  range,
  hot,
}: {
  children: ReactNode;
  progress: MotionValue<number>;
  range: [number, number];
  hot?: boolean;
}) {
  const opacity = useTransform(progress, range, [0.15, 1]);
  const y = useTransform(progress, range, [8, 0]);
  return (
    <span className="relative mr-[0.28em] inline-block">
      <motion.span
        style={{ opacity, y }}
        className={cn("inline-block", hot && "text-chilli")}
      >
        {children}
      </motion.span>
    </span>
  );
}

/* ======================================================= VelocityMarquee ===
   A ticker whose speed and direction follow how fast — and which way — you are
   scrolling. This is the effect Lenis exists for.
   ========================================================================= */

export function VelocityMarquee({
  children,
  baseVelocity = 3,
  className,
}: {
  children: ReactNode;
  baseVelocity?: number;
  className?: string;
}) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 4], {
    clamp: false,
  });
  const direction = useRef(1);

  useAnimationFrame((_, delta) => {
    let move = direction.current * baseVelocity * (delta / 1000);
    // Scrolling up flips the ticker — the page feels physically connected.
    if (velocityFactor.get() < 0) direction.current = -1;
    else if (velocityFactor.get() > 0) direction.current = 1;
    move += direction.current * move * velocityFactor.get();
    baseX.set(wrap(-25, -50, baseX.get() + move));
  });

  const x = useTransform(baseX, (v) => `${v}%`);

  return (
    <div className={cn("relative flex w-full overflow-hidden", className)}>
      <motion.div className="flex whitespace-nowrap" style={{ x }}>
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="flex shrink-0">
            {children}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

function wrap(min: number, max: number, value: number) {
  const range = max - min;
  return min + (((((value - min) % range) + range) % range));
}

/* ============================================================== StickyRow ===
   Pinned cards that stack on top of one another as you scroll past. Used for
   the four steps of how a batch is made.
   ========================================================================= */

export function StickyCard({
  index,
  total,
  children,
  className,
}: {
  index: number;
  total: number;
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  // Each card shrinks slightly as the next one slides over it.
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);
  const opacity = useTransform(scrollYProgress, [0, 0.85, 1], [1, 1, 0.35]);

  return (
    <div
      ref={ref}
      className={cn("sticky", className)}
      style={{ top: `calc(7rem + ${index * 1.5}rem)`, zIndex: index + 1 }}
    >
      <motion.div style={{ scale, opacity }} data-step={`${index + 1}/${total}`}>
        {children}
      </motion.div>
    </div>
  );
}

/* =========================================================== HorizontalRail ===
   Scrolls sideways while the section is pinned. Gives the bestsellers rail a
   long, deliberate reveal rather than a row of cards that all arrive at once.
   ========================================================================= */

export function HorizontalRail({
  children,
  className,
  heightVh = 260,
}: {
  children: ReactNode;
  className?: string;
  heightVh?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref });

  useEffect(() => {
    const measure = () => {
      const track = trackRef.current;
      if (!track) return;
      setDistance(Math.max(0, track.scrollWidth - window.innerWidth + 64));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [children]);

  const x = useTransform(scrollYProgress, [0, 1], [0, -distance]);
  const smooth = useSpring(x, { stiffness: 90, damping: 24, mass: 0.4 });

  return (
    <div ref={ref} style={{ height: `${heightVh}vh` }} className={cn("relative", className)}>
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <motion.div ref={trackRef} style={{ x: smooth }} className="flex gap-6 px-8">
          {children}
        </motion.div>
      </div>
    </div>
  );
}

/* =========================================================== TrackingText ===
   Letter-spacing opens out as the line rises through the viewport. A purely
   typographic move — the word itself performs rather than sliding around.
   ========================================================================= */

export function TrackingText({
  children,
  className,
  from = -0.06,
  to = 0.02,
}: {
  children: ReactNode;
  className?: string;
  from?: number;
  to?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const tracking = useTransform(scrollYProgress, [0, 1], [`${from}em`, `${to}em`]);
  const smooth = useSpring(tracking, { stiffness: 90, damping: 24 });

  return (
    <div ref={ref} className={className}>
      <motion.div style={{ letterSpacing: smooth }}>{children}</motion.div>
    </div>
  );
}

/* ============================================================= ScrollWipe ===
   A block of colour that retreats across the element as it enters view,
   uncovering what is underneath. Used once, over the kitchen photograph.
   ========================================================================= */

export function ScrollWipe({
  children,
  className,
  color = "var(--color-kaadige)",
}: {
  children: ReactNode;
  className?: string;
  color?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.9", "center 0.6"],
  });
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "101%"]);

  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      {children}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10"
        style={{ background: color, x }}
      />
    </div>
  );
}

/* ================================================================ CountUp ===
   Counts to a number the first time it is seen. Only used for figures that
   are actually true of the business.
   ========================================================================= */

export function CountUp({
  to,
  suffix = "",
  duration = 1.6,
  className,
}: {
  to: number;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return;
        started.current = true;
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / (duration * 1000));
          // Ease-out so it decelerates into the final number.
          setValue(Math.round(to * (1 - Math.pow(1 - t, 3))));
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.5 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [to, duration]);

  return (
    <span ref={ref} className={cn("tabular", className)}>
      {value.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}
