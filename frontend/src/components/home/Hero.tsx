"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { ArrowDown, Star } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { WordsIn } from "@/components/ui/Reveal";
import { Magnetic } from "@/components/ui/Hover";
import { KolamMark } from "@/components/ui/Kolam";

/**
 * The hero opens on the most characteristic thing in this business: the moment
 * spices hit a hot pan. Video first, words over it.
 */
export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const [videoReady, setVideoReady] = useState(false);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  // The video sinks slower than the copy — depth without a parallax library.
  const videoY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const videoScale = useTransform(scrollYProgress, [0, 1], [1, 1.18]);
  const copyY = useTransform(scrollYProgress, [0, 1], ["0%", "-38%"]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const veil = useTransform(scrollYProgress, [0, 1], [0.42, 0.78]);

  return (
    <section
      ref={ref}
      className="relative flex min-h-[100svh] items-center justify-center overflow-hidden"
    >
      {/* --- Backdrop --------------------------------------------------- */}
      <motion.div
        style={{ y: videoY, scale: videoScale }}
        className="absolute inset-0 -z-10"
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(150deg, #a81d16 0%, #e23e2e 32%, #f5a31a 68%, #c87708 100%)",
          }}
        />
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/images/hero-poster.jpg"
          onCanPlay={() => setVideoReady(true)}
          className={`h-full w-full object-cover transition-opacity duration-1000 ${
            videoReady ? "opacity-100" : "opacity-0"
          }`}
        >
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>
        <motion.div className="absolute inset-0 bg-kaadige" style={{ opacity: veil }} />
        {/* Warm vignette so the type always has ground to sit on. */}
        <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_110%,rgba(36,18,9,.85),transparent_60%)]" />
      </motion.div>

      {/* --- Copy ------------------------------------------------------- */}
      <motion.div
        style={{ y: copyY, opacity: copyOpacity }}
        className="relative mx-auto w-full max-w-6xl px-6 pb-24 pt-32 text-center"
      >
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.7 }}
          className="eyebrow mx-auto inline-flex items-center gap-2.5 rounded-full border border-mallige/25 bg-kaadige/25 px-4 py-2 text-mallige/85 backdrop-blur-md"
        >
          <KolamMark size={14} className="text-turmeric" />
          Ground in Udupi · Shipped all over India
        </motion.p>

        <h1 className="mt-7 font-display text-[clamp(3rem,11vw,8.5rem)] font-extrabold leading-[0.86] tracking-[-0.045em] text-mallige">
          <span className="block">
            <WordsIn text="The taste only" delay={0.5} />
          </span>
          <span className="block">
            <WordsIn
              text="hands can make"
              delay={0.72}
              highlight={["hands"]}
              highlightClassName="wordmark text-turmeric italic"
            />
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.15, duration: 0.8 }}
          className="mx-auto mt-7 max-w-xl text-base leading-relaxed text-mallige/80 sm:text-lg"
        >
          Masalas stone-ground the morning we pack them. Mango cut in May and cured
          twenty-one days on the terrace. Batter that arrives still cold.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.8 }}
          className="mt-9 flex flex-wrap items-center justify-center gap-4"
        >
          <Magnetic>
            <ButtonLink href="/products" size="lg" variant="clay">
              Open the pantry
            </ButtonLink>
          </Magnetic>
          <Magnetic strength={0.22}>
            <ButtonLink
              href="/about"
              size="lg"
              variant="glass"
              className="border-mallige/30 bg-mallige/10 text-mallige backdrop-blur-md hover:bg-mallige/20"
            >
              How it's made
            </ButtonLink>
          </Magnetic>
        </motion.div>

        {/* One honest proof point, not a wall of badges. */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 0.9 }}
          className="mt-10 flex items-center justify-center gap-2 text-sm text-mallige/70"
        >
          <span className="flex">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="size-4 fill-turmeric text-turmeric" />
            ))}
          </span>
          <span>4.8 from shoppers who cook every day</span>
        </motion.div>
      </motion.div>

      {/* --- Scroll cue -------------------------------------------------- */}
      <motion.a
        href="#pantry"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-7 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-mallige/60 transition hover:text-mallige"
        aria-label="Scroll to the pantry"
      >
        <span className="eyebrow text-[0.625rem]">Scroll</span>
        <motion.span
          animate={{ y: [0, 7, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <ArrowDown className="size-4" />
        </motion.span>
      </motion.a>
    </section>
  );
}
