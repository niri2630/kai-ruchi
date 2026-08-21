"use client";

/**
 * About is deliberately the quiet page.
 *
 * No flip text, no scramble, no tilting cards — everywhere else on the site
 * rewards a cursor, and here the reward is just reading. Motion is scroll-only,
 * so the page still moves with Lenis without asking to be played with.
 */

import { ProductImage } from "@/components/ui/Bits";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { KolamDivider, KolamMark } from "@/components/ui/Kolam";
import { CountUp, Parallax, ScrollWordReveal, ScrollZoom } from "@/components/ui/Scroll";

const PRINCIPLES = [
  {
    heading: "One kitchen, not a network",
    body: "Everything on this site is made in the same room in Udupi. We do not white-label, we do not have a second unit, and when the person who grinds the sukka masala travels, that product goes out of stock. It is a limit, and it is the point.",
  },
  {
    heading: "Nothing is stocked ahead",
    body: "Masalas are ground the morning they ship. Sweets are made after you order them, which is why Mysore pak takes an extra day. Batter is ground the night before and delivered cold. There is no shelf here holding six months of inventory.",
  },
  {
    heading: "The list is the whole list",
    body: "If it is not in the ingredients, it is not in the jar. No colour, no anti-caking agent, no rava bulking out a masala, no preservative in a pickle that salt and oil already protect. Powders clump in humidity because there is nothing in them to stop it.",
  },
  {
    heading: "Seasons are not negotiable",
    body: "Mango pickle is cut in May, from raw totapuri, and cured twenty-one days. When that batch is finished, it is finished until next May. We will not buy in mango from elsewhere and sell it under the same label.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* ------------------------------------------------------- masthead */}
      <header className="mx-auto max-w-4xl px-6 pb-16 pt-36 sm:pt-48">
        <Reveal>
          <KolamMark size={40} className="text-chilli" />
        </Reveal>

        <Reveal delay={0.1}>
          <p className="eyebrow mt-8 text-ash">About Kai Ruchi</p>
        </Reveal>

        <Reveal delay={0.15}>
          <h1 className="mt-4 font-display text-[clamp(2.75rem,8vw,6rem)] font-extrabold leading-[0.88] tracking-tight">
            There is a word for
            <br />
            what we sell.
          </h1>
        </Reveal>

        <Reveal delay={0.25}>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-kaadige/80 sm:text-xl">
            <span className="wordmark text-2xl text-chilli sm:text-3xl">Kai ruchi</span> —
            hand-taste. It is what people mean when they say the same recipe tastes
            different depending on who made it. Not better ingredients, not a secret step.
            Just the hands.
          </p>
        </Reveal>

        <Reveal delay={0.32}>
          <p className="mt-5 max-w-2xl leading-relaxed text-ash">
            You cannot buy that, obviously. What you can buy is what those hands made this
            week, before it has had time to sit anywhere.
          </p>
        </Reveal>
      </header>

      {/* --------------------------------------------------------- band */}
      <ScrollZoom className="px-4 sm:px-6">
        <div className="relative mx-auto aspect-[21/9] max-w-6xl overflow-hidden">
          <ProductImage
            src="/images/about/kitchen.png"
            alt="The Kai Ruchi kitchen in Udupi"
            accent="chilli"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-kaadige/70 via-transparent to-transparent" />
          <p className="absolute bottom-6 left-6 right-6 text-sm text-mallige/85 sm:bottom-8 sm:left-10">
            The kitchen, on a grinding morning. Coriander goes into the kadai first, cumin
            about four minutes later.
          </p>
        </div>
      </ScrollZoom>

      {/* ------------------------------------------------------ the story */}
      <section className="mx-auto max-w-4xl px-6 py-24 sm:py-32">
        <Reveal>
          <h2 className="font-display text-[clamp(2rem,5vw,3.25rem)] font-extrabold leading-[0.95] tracking-tight">
            It started because people kept asking
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-8 sm:grid-cols-2">
          <Reveal delay={0.1}>
            <p className="leading-relaxed text-kaadige/85">
              For years the masala left this kitchen in reused Bournvita jars, handed to
              relatives at bus stands and posted to cousins who had moved to cities where
              the sambar powder tastes of nothing in particular. Every one of them asked
              for more. A few asked whether they could pay for it.
            </p>
          </Reveal>
          <Reveal delay={0.18}>
            <p className="leading-relaxed text-kaadige/85">
              So this is that, with a website in front of it. The recipes have not been
              adjusted for scale, the quantities have not been rounded up, and the person
              who decides when the coriander is roasted enough is the same person who
              decided it in 1998.
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.24}>
          <blockquote className="relative mt-14 border-l-4 border-chilli pl-7 sm:pl-10">
            <p className="font-display text-[clamp(1.5rem,3.5vw,2.5rem)] font-extrabold leading-[1.1] tracking-tight">
              “If the powder does not clump a little in August, somebody has added
              something to it.”
            </p>
            <footer className="mt-4 text-sm text-ash">
              — the standing answer to the most common complaint we receive
            </footer>
          </blockquote>
        </Reveal>
      </section>

      <KolamDivider />

      {/* ------------------------------------------------------ principles */}
      <section className="mx-auto max-w-4xl px-6 py-16 sm:py-24">
        <Reveal>
          <p className="eyebrow text-chilli">How we work</p>
          <h2 className="mt-3 font-display text-[clamp(2rem,5vw,3.25rem)] font-extrabold leading-[0.95] tracking-tight">
            Four things that are not going to change
          </h2>
        </Reveal>

        <div className="mt-12 divide-y divide-hairline">
          {PRINCIPLES.map((item, i) => (
            <Reveal key={item.heading} delay={i * 0.08}>
              <article className="grid gap-4 py-9 sm:grid-cols-[6rem_1fr] sm:gap-8">
                <p className="tabular font-display text-4xl font-extrabold leading-none text-turmeric">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <div>
                  <h3 className="font-display text-2xl font-extrabold tracking-tight">
                    {item.heading}
                  </h3>
                  <p className="mt-3 leading-relaxed text-ash">{item.body}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* --------------------------------------------------------- numbers */}
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

          <div className="mt-16 grid gap-10 border-t border-mallige/15 pt-12 sm:grid-cols-3">
            {[
              { n: 14, suffix: "", label: "Things we make" },
              { n: 21, suffix: " days", label: "Mango cures on the terrace" },
              { n: 24, suffix: " hrs", label: "From grinder to courier" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="font-display text-5xl font-extrabold tracking-tight text-turmeric sm:text-6xl">
                  <CountUp to={stat.n} suffix={stat.suffix} />
                </p>
                <p className="mt-2 text-sm text-mallige/65">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- close */}
      <section className="mx-auto max-w-3xl px-6 py-24 text-center sm:py-32">
        <Reveal>
          <KolamMark size={36} className="mx-auto text-chilli" />
          <h2 className="mt-8 font-display text-[clamp(2rem,5.5vw,3.5rem)] font-extrabold leading-[0.95] tracking-tight">
            Nothing here is trying to be clever
          </h2>
          <p className="mx-auto mt-6 max-w-xl leading-relaxed text-ash">
            It is the food from one house, made the way it has always been made, packed
            into jars with the grind date written on the label by hand. If that is the
            kind of thing you have been looking for, the shelf is through here.
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
