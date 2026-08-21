"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Quote } from "lucide-react";
import type { Category, Product, Review } from "@/lib/types";
import { accentOf, cn, formatDate } from "@/lib/utils";
import { ProductImage, Stars } from "@/components/ui/Bits";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { UnderlineLink, WipeHover } from "@/components/ui/Hover";
import { KolamMark } from "@/components/ui/Kolam";
import {
  CountUp,
  Parallax,
  ScrollWordReveal,
  StickyCard,
  VelocityMarquee,
} from "@/components/ui/Scroll";
import ProductCard from "@/components/product/ProductCard";

/* ============================================================= section head */

export function SectionHead({
  eyebrow,
  title,
  blurb,
  href,
  hrefLabel = "See all",
  align = "left",
}: {
  eyebrow: string;
  title: string;
  blurb?: string;
  href?: string;
  hrefLabel?: string;
  align?: "left" | "center";
}) {
  return (
    <Reveal
      className={cn(
        "mb-10 flex flex-wrap items-end gap-6",
        align === "center" ? "flex-col items-center text-center" : "justify-between",
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        <p className="eyebrow flex items-center gap-2 text-chilli">
          <KolamMark size={14} />
          {eyebrow}
        </p>
        <h2 className="mt-3 font-display text-[clamp(2.25rem,5.5vw,4rem)] font-extrabold leading-[0.92] tracking-tight">
          {title}
        </h2>
        {blurb && <p className="mt-4 text-base leading-relaxed text-ash">{blurb}</p>}
      </div>
      {href && (
        <UnderlineLink
          href={href}
          className="group/all flex shrink-0 items-center gap-2 font-semibold"
          color="var(--color-chilli)"
        >
          {hrefLabel}
          <ArrowRight className="size-4 transition-transform duration-300 group-hover/all:translate-x-1.5" />
        </UnderlineLink>
      )}
    </Reveal>
  );
}

/* ================================================================== ticker */

export function TickerBand({ products }: { products: Product[] }) {
  const names = products.length
    ? products.map((p) => p.name)
    : ["Sukka Masala", "Mango Pickle", "Dosa Batter", "Mysore Pak", "Chakli", "Papad"];

  return (
    <div className="border-y border-kaadige/10 bg-kaadige py-5 text-mallige">
      <VelocityMarquee baseVelocity={2.4}>
        <span className="flex items-center gap-8 pr-8 font-display text-2xl font-extrabold uppercase tracking-tight sm:text-3xl">
          {names.map((name, i) => (
            <span key={`${name}-${i}`} className="flex items-center gap-8 whitespace-nowrap">
              {name}
              <KolamMark
                size={18}
                className={i % 2 === 0 ? "text-turmeric" : "text-chilli"}
              />
            </span>
          ))}
        </span>
      </VelocityMarquee>
    </div>
  );
}

/* ============================================================== categories */

export function CategoryTiles({ categories }: { categories: Category[] }) {
  return (
    <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((category, i) => {
        const tone = accentOf(category.accent);
        const wide = i === 0 || i === 3;
        return (
          <StaggerItem key={category.id} className={cn(wide && "lg:col-span-2")}>
            <Link
              href={`/categories/${category.slug}`}
              className="group relative flex h-full min-h-[15rem] flex-col justify-between overflow-hidden rounded-[var(--radius-jar)] p-7 transition-shadow duration-500 hover:shadow-[0_40px_80px_-40px_rgba(36,18,9,.65)]"
              style={{
                background: `linear-gradient(145deg, ${tone.hex}, ${tone.deep})`,
                color: tone.text,
              }}
            >
              {/* The shelf itself, sitting under its own colour. It brightens
                  and pushes in as you hover, so the tile reads as a doorway. */}
              {category.image_url && (
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 opacity-35 mix-blend-luminosity transition-all duration-700 group-hover:scale-105 group-hover:opacity-55"
                >
                  <ProductImage
                    src={category.image_url}
                    alt=""
                    accent={category.accent}
                    sizes="(max-width: 640px) 100vw, 640px"
                  />
                </span>
              )}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background: `linear-gradient(145deg, ${tone.hex}cc, ${tone.deep}ee)`,
                }}
              />

              {/* Kolam dot field, revealed on hover. */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  backgroundImage:
                    "radial-gradient(currentColor 1.5px, transparent 1.5px)",
                  backgroundSize: "26px 26px",
                  opacity: 0.14,
                }}
              />
              <span
                aria-hidden
                className="absolute -right-10 -top-10 size-44 rounded-full opacity-25 blur-2xl transition-transform duration-700 group-hover:scale-150"
                style={{ background: "white" }}
              />

              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <p className="eyebrow opacity-70">{category.tagline}</p>
                  <h3 className="mt-2 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
                    {category.name}
                  </h3>
                </div>
                <span className="tabular shrink-0 rounded-full bg-black/20 px-3 py-1.5 text-xs font-bold backdrop-blur-sm">
                  {category.product_count ?? 0}
                </span>
              </div>

              <div className="relative mt-6 flex items-end justify-between gap-4">
                <p className="max-w-sm text-sm leading-relaxed opacity-80">
                  {category.description?.split(".")[0]}.
                </p>
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-white/20 backdrop-blur-sm transition-all duration-400 group-hover:bg-white group-hover:text-kaadige">
                  <ArrowRight className="size-5 transition-transform duration-400 group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          </StaggerItem>
        );
      })}
    </Stagger>
  );
}

/* =============================================================== how it's made */

const STEPS = [
  {
    title: "Sourced by name, not by grade",
    body: "Byadgi from Haveri, totapuri from one orchard in Karkala, urad from a mill that still stone-hulls. We buy from the same four suppliers we started with, which is why some things sell out.",
    accent: "leaf",
    label: "Sourcing",
  },
  {
    title: "Roasted in an iron kadai",
    body: "Every spice is dry-roasted separately, because coriander and cumin are ready at different moments. This is the step machines get wrong and the step everything else depends on.",
    accent: "chilli",
    label: "Roasting",
  },
  {
    title: "Ground coarse, never fine",
    body: "Fine powder is what you do when you want to hide filler. We grind coarse so you can still see the coconut in the sukka and the dal in the sambar masala.",
    accent: "turmeric",
    label: "Grinding",
  },
  {
    title: "Packed, dated, and out the door",
    body: "Sealed the same day, with the grind date written on the label by hand. Nothing sits in a warehouse waiting for you to want it.",
    accent: "indigo",
    label: "Packing",
  },
];

export function HowItsMade() {
  return (
    <div className="relative">
      {STEPS.map((step, i) => {
        const tone = accentOf(step.accent);
        return (
          <StickyCard key={step.title} index={i} total={STEPS.length} className="mb-6">
            <div
              className="overflow-hidden rounded-[var(--radius-jar)] p-8 sm:p-12"
              style={{
                background: `linear-gradient(135deg, ${tone.hex}, ${tone.deep})`,
                color: tone.text,
              }}
            >
              <div className="flex flex-col gap-8 sm:flex-row sm:items-center">
                {/* The number is real information here: these steps happen in order. */}
                <div className="flex shrink-0 items-center gap-4 sm:flex-col sm:items-start">
                  <span className="tabular font-display text-7xl font-extrabold leading-none opacity-35 sm:text-8xl">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="eyebrow opacity-70">{step.label}</span>
                </div>
                <div className="max-w-2xl">
                  <h3 className="font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
                    {step.title}
                  </h3>
                  <p className="mt-4 text-base leading-relaxed opacity-85 sm:text-lg">
                    {step.body}
                  </p>
                </div>
              </div>
            </div>
          </StickyCard>
        );
      })}
    </div>
  );
}

/* ================================================================== promise */

export function PromiseBand() {
  return (
    <div className="relative overflow-hidden rounded-[2.5rem] bg-kaadige px-6 py-20 text-mallige sm:px-14 sm:py-28">
      <Parallax speed={0.22} className="pointer-events-none absolute -right-24 -top-24">
        <div className="size-80 rounded-full bg-chilli/35 blur-3xl" />
      </Parallax>
      <Parallax speed={-0.18} className="pointer-events-none absolute -bottom-32 -left-24">
        <div className="size-96 rounded-full bg-turmeric/25 blur-3xl" />
      </Parallax>

      <div className="relative mx-auto max-w-4xl">
        <p className="eyebrow mb-8 text-turmeric">What we will not do</p>
        <ScrollWordReveal
          text="No colour. No anti-caking agent. No rava bulking out the masala. Nothing sits in a warehouse. If a batch is over, the page says batch over — we do not grind more and call it the same thing."
          highlight={["No", "over,", "over"]}
          className="font-display text-[clamp(1.75rem,4.2vw,3.25rem)] font-extrabold leading-[1.12] tracking-tight"
        />

        <div className="mt-16 grid gap-8 border-t border-mallige/15 pt-10 sm:grid-cols-3">
          {[
            { n: 21, suffix: " days", label: "Mango cured on the terrace" },
            { n: 4, suffix: "", label: "Suppliers, same since day one" },
            { n: 0, suffix: "", label: "Preservatives, in anything" },
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
    </div>
  );
}

/* ============================================================== bestsellers */

export function BestsellerGrid({ products }: { products: Product[] }) {
  return (
    <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {products.map((product, i) => (
        <StaggerItem key={product.id}>
          <ProductCard product={product} priority={i < 4} />
        </StaggerItem>
      ))}
    </Stagger>
  );
}

/* =============================================================== testimonials */

export function Testimonials({ reviews }: { reviews: Review[] }) {
  if (!reviews.length) return null;

  return (
    <div className="columns-1 gap-5 sm:columns-2 lg:columns-3 [&>*]:mb-5">
      {reviews.map((review, i) => (
        <motion.figure
          key={review.id}
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: (i % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ y: -6, rotate: i % 2 === 0 ? -0.6 : 0.6 }}
          className="glass break-inside-avoid rounded-[var(--radius-jar)] p-6"
        >
          <Quote className="size-6 text-turmeric" />
          <Stars value={review.rating} className="mt-3" />
          {review.title && (
            <figcaption className="mt-3 font-display text-xl font-extrabold tracking-tight">
              {review.title}
            </figcaption>
          )}
          <blockquote className="mt-2 text-[0.9375rem] leading-relaxed text-kaadige/85">
            {review.body}
          </blockquote>
          <div className="mt-5 flex items-center justify-between gap-3 border-t border-hairline/70 pt-4 text-xs">
            <span className="font-bold">{review.author_name}</span>
            {review.product_slug && (
              <Link
                href={`/products/${review.product_slug}`}
                className="text-ash transition hover:text-chilli"
              >
                {review.product_name}
              </Link>
            )}
          </div>
        </motion.figure>
      ))}
    </div>
  );
}

/* ================================================================== closing */

export function ClosingCTA() {
  return (
    <Reveal className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-chilli via-chilli-deep to-indigo px-6 py-20 text-center text-mallige sm:py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-15"
        style={{
          backgroundImage: "radial-gradient(#fff 1.5px, transparent 1.5px)",
          backgroundSize: "30px 30px",
        }}
      />
      <div className="relative mx-auto max-w-2xl">
        <KolamMark size={40} className="mx-auto text-turmeric" />
        <h2 className="mt-6 font-display text-[clamp(2.25rem,6vw,4.5rem)] font-extrabold leading-[0.9] tracking-tight">
          Start with the sukka.
        </h2>
        <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-mallige/80">
          It is the one people come back for, and the one that will tell you whether
          the rest of this shelf is for you.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-4">
          <Link
            href="/products/chicken-sukka-masala"
            className="clay bg-turmeric px-8 py-4 font-display text-lg font-extrabold text-kaadige [--clay-edge:var(--color-turmeric-deep)]"
          >
            <WipeHover color="var(--color-kaadige)" textColor="#f5a31a">
              <span className="px-1">Try the sukka masala</span>
            </WipeHover>
          </Link>
          <Link
            href="/products"
            className="glass rounded-full border-mallige/25 bg-mallige/10 px-8 py-4 font-semibold text-mallige backdrop-blur-md transition hover:bg-mallige/20"
          >
            Browse everything
          </Link>
        </div>
      </div>
    </Reveal>
  );
}

/* ================================================================== journal */

export function FreshBatch({ products }: { products: Product[] }) {
  const picks = products.slice(0, 3);
  if (!picks.length) return null;

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {picks.map((product, i) => {
        const tone = accentOf(product.category.accent);
        return (
          <Reveal key={product.id} delay={i * 0.1}>
            <Link
              href={`/products/${product.slug}`}
              className="group relative block overflow-hidden rounded-[var(--radius-jar)]"
            >
              <div className="relative aspect-[3/4]" style={{ background: tone.hex }}>
                <motion.div
                  className="absolute inset-0"
                  whileHover={{ scale: 1.06 }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                >
                  <ProductImage
                    src={product.image_url}
                    alt={product.name}
                    accent={product.category.accent}
                    sizes="(max-width: 1024px) 100vw, 380px"
                  />
                </motion.div>
                <div className="absolute inset-0 bg-gradient-to-t from-kaadige via-kaadige/25 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-mallige">
                  <p className="eyebrow text-turmeric">{product.category.name}</p>
                  <h3 className="mt-2 font-display text-2xl font-extrabold tracking-tight">
                    {product.name}
                  </h3>
                  <p className="mt-1.5 line-clamp-2 text-sm text-mallige/75">
                    {product.short_description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-turmeric">
                    Read the label
                    <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </div>
              </div>
            </Link>
          </Reveal>
        );
      })}
    </div>
  );
}

export function ReviewMeta({ review }: { review: Review }) {
  return <span className="text-xs text-ash">{formatDate(review.created_at)}</span>;
}
