"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const EASE = [0.76, 0, 0.24, 1] as const;

/**
 * The doorstep. A kolam is drawn, the counter runs to 100, and the panels part
 * like a curtain to let you in.
 *
 * Runs once per browser tab — coming back from a product page should not make
 * you watch it again.
 */
const SEEN_KEY = "kairuchi.entered";

const WORDS = ["ಕೈ ರುಚಿ", "கை ருசி", "कै रुचि", "Kai Ruchi"];

export default function Preloader() {
  const [active, setActive] = useState(false);
  const [count, setCount] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || sessionStorage.getItem(SEEN_KEY)) return;

    setActive(true);
    document.body.style.overflow = "hidden";

    const start = performance.now();
    const DURATION = 2100;
    let frame = 0;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION);
      setCount(Math.round(100 * (1 - Math.pow(1 - t, 2))));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    const cycle = setInterval(
      () => setWordIndex((i) => (i + 1) % WORDS.length),
      520,
    );

    const done = setTimeout(() => {
      sessionStorage.setItem(SEEN_KEY, "1");
      setActive(false);
      document.body.style.overflow = "";
    }, DURATION + 480);

    return () => {
      cancelAnimationFrame(frame);
      clearInterval(cycle);
      clearTimeout(done);
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center"
          exit={{ pointerEvents: "none" }}
        >
          {/* Two panels that part like a curtain. */}
          <motion.div
            className="absolute inset-x-0 top-0 h-1/2 bg-kaadige"
            exit={{ y: "-100%" }}
            transition={{ duration: 0.9, ease: EASE }}
          />
          <motion.div
            className="absolute inset-x-0 bottom-0 h-1/2 bg-kaadige"
            exit={{ y: "100%" }}
            transition={{ duration: 0.9, ease: EASE }}
          />

          <motion.div
            className="relative flex flex-col items-center gap-8 px-6 text-center"
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ duration: 0.4, ease: "easeIn" }}
          >
            {/* The kolam draws itself. */}
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none" aria-hidden>
              {[0, 1, 2, 3].map((i) => (
                <motion.circle
                  key={`d-${i}`}
                  cx={60 + 26 * Math.cos((i * Math.PI) / 2)}
                  cy={60 + 26 * Math.sin((i * Math.PI) / 2)}
                  r="3"
                  fill="#f5a31a"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 + i * 0.08, type: "spring", stiffness: 300 }}
                />
              ))}
              {[0, 1, 2, 3].map((i) => (
                <motion.path
                  key={`p-${i}`}
                  d="M60 22 C 78 40, 78 62, 60 80 C 42 62, 42 40, 60 22 Z"
                  stroke={i % 2 === 0 ? "#f5a31a" : "#e23e2e"}
                  strokeWidth="1.6"
                  fill="none"
                  style={{ transformOrigin: "60px 60px", rotate: i * 45 }}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1.5, delay: 0.2 + i * 0.14, ease: "easeInOut" }}
                />
              ))}
              <motion.circle
                cx="60"
                cy="60"
                r="4"
                fill="#1e7a54"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.3, type: "spring", stiffness: 400 }}
              />
            </svg>

            {/* The name, cycling through the scripts it is said in. */}
            <div className="h-12 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.p
                  key={wordIndex}
                  className="wordmark text-3xl text-mallige sm:text-4xl"
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -30, opacity: 0 }}
                  transition={{ duration: 0.32, ease: EASE }}
                >
                  {WORDS[wordIndex]}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Counter + a filling rule. */}
            <div className="w-56 space-y-2">
              <div className="h-px w-full overflow-hidden bg-mallige/20">
                <motion.div
                  className="h-full bg-gradient-to-r from-turmeric to-chilli"
                  style={{ width: `${count}%` }}
                />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="eyebrow text-mallige/45">Grinding</span>
                <span className="tabular font-display text-xl font-bold text-mallige">
                  {count}
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
