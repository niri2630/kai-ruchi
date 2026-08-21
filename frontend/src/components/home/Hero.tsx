"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ArrowDown } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { WordsIn } from "@/components/ui/Reveal";
import { Magnetic } from "@/components/ui/Hover";

/**
 * The hero is the film, not a gradient with words on it.
 *
 * Composition is a documentary title card: footage full-bleed, type anchored
 * bottom-left, and a strip of real facts along the base. Deliberately not a
 * centred headline with a pill badge over a colour wash.
 *
 * Layering note: this backdrop must sit ABOVE the fixed masala mesh (z-index
 * -2) and grain (-1), so it stays at z-0 inside the section's stacking
 * context rather than going negative.
 */

// Three things that are true of this kitchen, and specific enough to be
// checkable. Not badges — a strip of facts along the bottom of the frame.
const FACTS = [
  { value: "05:40", label: "Grinding starts" },
  { value: "6 kg", label: "Biggest batch we run" },
  { value: "24 hrs", label: "Grinder to courier" },
];

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);

  /**
   * A cached video is often already at readyState 4 by the time React attaches
   * its handlers, so `canplay` never fires again and an onCanPlay-only fade
   * would leave the element stuck at opacity 0. Check the state directly on
   * mount, listen for both events, and re-request playback — Chrome will
   * refuse the first autoplay attempt while the preloader has the tab busy.
   */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const markReady = () => setVideoReady(true);
    if (video.readyState >= 2) markReady();
    video.addEventListener("loadeddata", markReady);
    video.addEventListener("canplay", markReady);

    const attemptPlay = () => {
      video.play().catch(() => {
        /* Autoplay refused — the poster frame carries the hero instead. */
      });
    };
    attemptPlay();
    // Retry once the preloader has released the page.
    const retry = setTimeout(attemptPlay, 2800);
    document.addEventListener("visibilitychange", attemptPlay);

    return () => {
      clearTimeout(retry);
      video.removeEventListener("loadeddata", markReady);
      video.removeEventListener("canplay", markReady);
      document.removeEventListener("visibilitychange", attemptPlay);
    };
  }, []);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const videoY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const videoScale = useTransform(scrollYProgress, [0, 1], [1, 1.14]);
  const copyY = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative isolate flex min-h-[100svh] flex-col justify-end overflow-hidden"
    >
      {/* --- The film ---------------------------------------------------- */}
      <motion.div style={{ y: videoY, scale: videoScale }} className="absolute inset-0 z-0">
        {/* Holds the frame while the first bytes arrive. */}
        <div className="absolute inset-0 bg-[#2a0f07]" />
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/images/hero-poster.jpg"
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1200ms] ${
            videoReady ? "opacity-100" : "opacity-0"
          }`}
        >
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>

        {/* Weighted to the bottom-left, where the type sits — the top of the
            frame stays bright so you can actually see the pan. */}
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(20,8,3,.94)_0%,rgba(20,8,3,.72)_28%,rgba(20,8,3,.18)_58%,rgba(20,8,3,.34)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(90%_70%_at_12%_88%,rgba(20,8,3,.75),transparent_62%)]" />
      </motion.div>

      {/* --- Title card --------------------------------------------------- */}
      <motion.div
        style={{ y: copyY, opacity: copyOpacity }}
        className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-16 pt-40 sm:pb-20"
      >
        {/* A rule and a line of text, rather than a floating capsule. */}
        <motion.div
          initial={{ opacity: 0, x: -14 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          className="flex items-center gap-3.5"
        >
          <span className="h-8 w-0.5 shrink-0 bg-turmeric" />
          <p className="eyebrow text-mallige/70">
            Udupi, Karnataka — since the Bournvita-jar days
          </p>
        </motion.div>

        <h1 className="mt-6 max-w-[15ch] font-display text-[clamp(3rem,9.5vw,7.5rem)] font-extrabold leading-[0.84] tracking-[-0.045em] text-mallige">
          <span className="block">
            <WordsIn text="The taste only" delay={0.5} />
          </span>
          <span className="block">
            <WordsIn
              text="hands can make"
              delay={0.68}
              highlight={["hands"]}
              highlightClassName="wordmark italic text-turmeric"
            />
          </span>
        </h1>

        <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.05, duration: 0.8 }}
            className="max-w-md text-base leading-relaxed text-mallige/75"
          >
            Masalas stone-ground the morning we pack them. Mango cut in May and cured
            twenty-one days on the terrace. Batter that arrives still cold.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="flex flex-wrap items-center gap-3"
          >
            <Magnetic>
              <ButtonLink href="/products" size="lg" variant="clay">
                Open the pantry
              </ButtonLink>
            </Magnetic>
            <ButtonLink
              href="/about"
              size="lg"
              variant="ghost"
              className="text-mallige/85 hover:bg-mallige/10 hover:text-mallige"
            >
              How it's made
            </ButtonLink>
          </motion.div>
        </div>

        {/* --- Fact strip -------------------------------------------------- */}
        <motion.dl
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.45, duration: 0.9 }}
          className="mt-12 grid max-w-2xl grid-cols-3 gap-px overflow-hidden border-t border-mallige/20 pt-6"
        >
          {FACTS.map((fact) => (
            <div key={fact.label}>
              <dt className="sr-only">{fact.label}</dt>
              <dd className="tabular font-display text-2xl font-extrabold leading-none text-turmeric sm:text-3xl">
                {fact.value}
              </dd>
              <p className="mt-1.5 text-[0.6875rem] uppercase tracking-[0.14em] text-mallige/55">
                {fact.label}
              </p>
            </div>
          ))}
        </motion.dl>
      </motion.div>

      {/* --- Scroll cue, tucked into the corner rather than centred ------- */}
      <motion.a
        href="#pantry"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        className="absolute bottom-8 right-6 z-10 hidden items-center gap-2.5 text-mallige/50 transition hover:text-mallige lg:flex"
        aria-label="Scroll to the pantry"
      >
        <span className="eyebrow text-[0.625rem]">Scroll</span>
        <motion.span
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.9, repeat: Infinity, ease: "easeInOut" }}
        >
          <ArrowDown className="size-4" />
        </motion.span>
      </motion.a>
    </section>
  );
}
