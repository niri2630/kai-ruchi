"use client";

/**
 * ABOUT — the page is about a word, so it is set like a lexicon.
 *
 * The whole brand rests on an untranslatable term, and the most honest way to
 * present a term is a dictionary entry: the headword enormous, a phonetic
 * respelling, the languages it belongs to, and numbered senses. Everything
 * after it is an editorial article — drop cap, asymmetric measure, a hanging
 * pull quote — rather than another stack of cards.
 *
 * Motion here is scroll-driven only: tracking opens out as lines rise, a wipe
 * uncovers the photograph, the principles run sideways under a pin. Nothing
 * waits for a cursor.
 */

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ProductImage } from "@/components/ui/Bits";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { KolamMark } from "@/components/ui/Kolam";
import {
  HorizontalRail,
  Parallax,
  ScrollWipe,
  ScrollWordReveal,
  TrackingText,
  VelocityMarquee,
} from "@/components/ui/Scroll";

const SENSES = [
  {
    n: "1",
    body: "The taste that a particular pair of hands gives food. Not a technique and not an ingredient — the thing left over once you have accounted for both.",
  },
  {
    n: "2",
    body: "By extension: the reason your mother's sambar cannot be reproduced from your mother's own recipe, written down in your mother's own hand.",
  },
];

const PRINCIPLES = [
  {
    n: "01",
    heading: "One kitchen, not a network",
    body: "Everything on this site is made in the same room in Udupi. We do not white-label and we have no second unit. When the person who grinds the sukka masala travels, that product goes out of stock. It is a limit, and it is the point.",
    accent: "#e23e2e",
  },
  {
    n: "02",
    heading: "Nothing is stocked ahead",
    body: "Masalas are ground the morning they ship. Sweets are made after you order them, which is why Mysore pak takes an extra day. Batter is ground the night before and delivered cold. No shelf here holds six months of inventory.",
    accent: "#f5a31a",
  },
  {
    n: "03",
    heading: "The list is the whole list",
    body: "If it is not in the ingredients, it is not in the jar. No colour, no anti-caking agent, no rava bulking out a masala, no preservative in a pickle that salt and oil already protect. Powders clump in humidity because nothing in them stops it.",
    accent: "#1e7a54",
  },
  {
    n: "04",
    heading: "Seasons are not negotiable",
    body: "Mango pickle is cut in May from raw totapuri and cured twenty-one days. When that batch is finished it is finished until next May. We will not buy mango in from elsewhere and sell it under the same label.",
    accent: "#4b2e83",
  },
];

export default function AboutPage() {
  const entryRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: entryRef,
    offset: ["start start", "end start"],
  });
  const headwordY = useTransform(scrollYProgress, [0, 1], ["0%", "-45%"]);
  const headwordOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <>
      {/* ============================================ 1 — the lexicon entry */}
      <section
        ref={entryRef}
        className="relative flex min-h-[100svh] flex-col justify-center px-6 pb-16 pt-36"
      >
        <motion.div
          style={{ y: headwordY, opacity: headwordOpacity }}
          className="mx-auto w-full max-w-6xl"
        >
          <Reveal>
            <p className="eyebrow flex items-center gap-2.5 text-ash">
              <KolamMark size={14} className="text-chilli" />
              Entry · the word this shop is named after
            </p>
          </Reveal>

          {/* The headword. Tracking opens as it rises. */}
          <TrackingText from={-0.075} to={-0.03} className="mt-7">
            <h1 className="wordmark text-[clamp(3.5rem,15vw,12rem)] leading-[0.8] text-kaadige">
              kai&nbsp;ruchi
            </h1>
          </TrackingText>

          <Reveal delay={0.15}>
            <p className="mt-7 flex flex-wrap items-baseline gap-x-5 gap-y-2 border-b border-hairline pb-6 text-ash">
              <span className="font-display text-xl font-bold text-kaadige">
                /kai&nbsp;ˈruː·tʃi/
              </span>
              <span className="italic">noun</span>
              <span className="eyebrow">Tamil · Kannada · Malayalam</span>
              <span className="eyebrow ml-auto text-chilli">lit. “hand-taste”</span>
            </p>
          </Reveal>

          <dl className="mt-9 grid gap-8 sm:grid-cols-2">
            {SENSES.map((sense, i) => (
              <Reveal key={sense.n} delay={0.25 + i * 0.12}>
                <div className="flex gap-5">
                  <dt className="tabular font-display text-2xl font-extrabold leading-none text-turmeric-deep">
                    {sense.n}
                  </dt>
                  <dd className="text-lg leading-relaxed text-kaadige/85">{sense.body}</dd>
                </div>
              </Reveal>
            ))}
          </dl>

          <Reveal delay={0.5}>
            <p className="mt-12 max-w-md border-t border-hairline pt-6 text-sm leading-relaxed text-ash">
              You cannot buy that. You can buy what those hands made this week, before it
              has had time to sit anywhere.
            </p>
          </Reveal>
        </motion.div>
      </section>

      {/* ================================== 2 — the word in its own scripts */}
      <div className="border-y border-hairline bg-mallige-warm py-6">
        <VelocityMarquee baseVelocity={1.6}>
          <span className="wordmark flex items-center gap-10 pr-10 text-[clamp(2.5rem,7vw,5rem)] leading-none text-kaadige/12">
            கை ருசி
            <KolamMark size={26} className="text-chilli/30" />
            ಕೈ ರುಚಿ
            <KolamMark size={26} className="text-turmeric/45" />
            कै रुचि
            <KolamMark size={26} className="text-leaf/30" />
            kai ruchi
            <KolamMark size={26} className="text-indigo/25" />
          </span>
        </VelocityMarquee>
      </div>

      {/* ================================================ 3 — the article */}
      <section className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.35fr] lg:gap-20">
          <Reveal>
            <h2 className="font-display text-[clamp(2rem,4.5vw,3.5rem)] font-extrabold leading-[0.92] tracking-tight lg:sticky lg:top-32">
              It started because
              <br />
              people kept
              <br />
              <span className="text-chilli">asking.</span>
            </h2>
          </Reveal>

          <div className="max-w-2xl">
            <Reveal delay={0.1}>
              {/* Drop cap — the article signals it is an article. */}
              <p className="text-lg leading-relaxed text-kaadige/85 [&>span:first-child]:float-left [&>span:first-child]:mr-3 [&>span:first-child]:mt-1 [&>span:first-child]:font-display [&>span:first-child]:text-[4.5rem] [&>span:first-child]:font-extrabold [&>span:first-child]:leading-[0.72] [&>span:first-child]:text-chilli">
                <span>F</span>
                or years the masala left this kitchen in reused Bournvita jars, handed to
                relatives at bus stands and posted to cousins who had moved to cities where
                the sambar powder tastes of nothing in particular. Every one of them asked
                for more. A few asked whether they could pay for it.
              </p>
            </Reveal>

            <Reveal delay={0.16}>
              <p className="mt-6 text-lg leading-relaxed text-kaadige/85">
                So this is that, with a website in front of it. The recipes have not been
                adjusted for scale. The quantities have not been rounded up. The person who
                decides when the coriander is roasted enough is the same person who decided
                it in 1998, standing at the same stove, going by smell.
              </p>
            </Reveal>

            <Reveal delay={0.22}>
              <p className="mt-6 text-lg leading-relaxed text-kaadige/85">
                What changed is only that you can now ask for it without knowing somebody
                who knows somebody.
              </p>
            </Reveal>
          </div>
        </div>

        {/* Pull quote, hanging mark, set large. */}
        <Reveal>
          <figure className="relative mt-20 sm:mt-28">
            <span
              aria-hidden
              className="pointer-events-none absolute -left-2 -top-10 select-none font-display text-[10rem] leading-none text-turmeric/35 sm:-left-8 sm:text-[16rem]"
            >
              “
            </span>
            <blockquote className="relative max-w-4xl font-display text-[clamp(1.75rem,4.5vw,3.5rem)] font-extrabold leading-[1.05] tracking-tight">
              If the powder does not clump a little in August, somebody has added something
              to it.
            </blockquote>
            <figcaption className="mt-6 flex items-center gap-3 text-sm text-ash">
              <span className="h-px w-12 bg-chilli" />
              the standing answer to the most common complaint we receive
            </figcaption>
          </figure>
        </Reveal>
      </section>

      {/* ================================ 4 — the kitchen, uncovered by scroll */}
      <ScrollWipe className="mx-4 rounded-[2rem] sm:mx-6" color="var(--color-mallige)">
        <div className="relative aspect-[21/9] w-full">
          <ProductImage
            src="/images/about/kitchen.webp"
            alt="The Kai Ruchi kitchen in Udupi on a grinding morning"
            accent="chilli"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-kaadige/85 via-transparent to-transparent" />
          <p className="absolute bottom-6 left-6 right-6 max-w-md text-sm leading-relaxed text-mallige/85 sm:bottom-9 sm:left-10">
            The kitchen, on a grinding morning. Coriander goes into the kadai first, cumin
            about four minutes later.
          </p>
        </div>
      </ScrollWipe>

      {/* ============================ 5 — principles, running sideways */}
      <section className="pt-24">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <p className="eyebrow text-chilli">How we work</p>
            <h2 className="mt-3 max-w-2xl font-display text-[clamp(2rem,5vw,3.5rem)] font-extrabold leading-[0.94] tracking-tight">
              Four things that are not going to change
            </h2>
          </Reveal>
        </div>

        <HorizontalRail heightVh={320}>
          {PRINCIPLES.map((item) => (
            <article
              key={item.n}
              className="flex w-[85vw] shrink-0 flex-col justify-between rounded-[2rem] p-8 sm:w-[30rem] sm:p-10"
              style={{ background: item.accent, color: "#fff6e9" }}
            >
              <p className="tabular font-display text-[7rem] font-extrabold leading-[0.7] opacity-30 sm:text-[9rem]">
                {item.n}
              </p>
              <div className="mt-10">
                <h3 className="font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
                  {item.heading}
                </h3>
                <p className="mt-4 leading-relaxed opacity-85">{item.body}</p>
              </div>
            </article>
          ))}
        </HorizontalRail>
      </section>

      {/* ==================================================== 6 — the numbers */}
      <section className="relative overflow-hidden bg-kaadige py-24 text-mallige sm:py-32">
        <Parallax speed={0.25} className="pointer-events-none absolute -left-32 top-0">
          <div className="size-[28rem] rounded-full bg-turmeric/20 blur-3xl" />
        </Parallax>
        <Parallax speed={-0.2} className="pointer-events-none absolute -right-32 bottom-0">
          <div className="size-[26rem] rounded-full bg-chilli/25 blur-3xl" />
        </Parallax>

        <div className="relative mx-auto max-w-4xl px-6">
          <p className="eyebrow mb-8 text-turmeric">In plain numbers</p>
          <ScrollWordReveal
            text="Fourteen products. One kitchen. Four suppliers we have not changed. Zero preservatives, in anything, ever."
            highlight={["Zero"]}
            className="font-display text-[clamp(1.75rem,4.5vw,3.5rem)] font-extrabold leading-[1.1] tracking-tight"
          />

        </div>
      </section>

      {/* ======================================================= 7 — closing */}
      <section className="mx-auto max-w-3xl px-6 py-24 text-center sm:py-32">
        <Reveal>
          <KolamMark size={36} className="mx-auto text-chilli" />
        </Reveal>
        <TrackingText from={-0.05} to={-0.02} className="mt-8">
          <h2 className="font-display text-[clamp(2rem,5.5vw,3.75rem)] font-extrabold leading-[0.95]">
            Nothing here is trying to be clever
          </h2>
        </TrackingText>
        <Reveal delay={0.1}>
          <p className="mx-auto mt-6 max-w-xl leading-relaxed text-ash">
            It is the food from one house, made the way it has always been made, packed into
            jars with the grind date written on the label by hand. If that is the kind of
            thing you have been looking for, the shelf is through here.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/products" size="lg">
              Open the pantry
            </ButtonLink>
            <ButtonLink href="/contact" variant="glass" size="lg">
              Ask us something
            </ButtonLink>
          </div>
        </Reveal>
      </section>
    </>
  );
}
