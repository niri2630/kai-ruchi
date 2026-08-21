"use client";

import Link from "next/link";
import { use, useState } from "react";
import { motion } from "framer-motion";
import {
  ChevronRight,
  Clock,
  Leaf,
  Loader2,
  ShoppingBag,
  Sparkles,
  Truck,
} from "lucide-react";
import { api } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import { useCart } from "@/store/useCart";
import { accentOf, cn, discountPercent, money } from "@/lib/utils";
import { ProductImage, QtyStepper, SpiceMeter, Stars, VegMark } from "@/components/ui/Bits";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/States";
import { Reveal } from "@/components/ui/Reveal";
import { Parallax } from "@/components/ui/Scroll";
import { KolamDivider } from "@/components/ui/Kolam";
import ProductCard from "@/components/product/ProductCard";
import Reviews from "@/components/product/Reviews";

const TABS = ["The label", "What's in it", "Keeping it"] as const;

export default function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<(typeof TABS)[number]>("The label");
  const [shot, setShot] = useState(0);

  const product = useApi(() => api.product(slug), [slug]);
  const related = useApi(() => api.related(slug, 4), [slug]);

  const add = useCart((s) => s.add);
  const openDrawer = useCart((s) => s.openDrawer);
  const pending = useCart((s) => (product.data ? s.pending.has(product.data.id) : false));

  if (product.error) {
    return (
      <div className="px-6 py-40">
        <ErrorState message={product.error} onRetry={product.reload} />
      </div>
    );
  }

  if (product.loading || !product.data) {
    return (
      <div className="mx-auto grid max-w-6xl gap-10 px-6 pb-24 pt-36 lg:grid-cols-2">
        <div className="skeleton aspect-square rounded-[var(--radius-jar)]" />
        <div className="space-y-4 pt-6">
          <div className="skeleton h-4 w-28 rounded-full" />
          <div className="skeleton h-14 w-4/5 rounded-2xl" />
          <div className="skeleton h-20 w-full rounded-2xl" />
          <div className="skeleton h-12 w-40 rounded-full" />
        </div>
      </div>
    );
  }

  const p = product.data;
  const tone = accentOf(p.category.accent);
  const off = discountPercent(p.price, p.compare_at_price);
  const soldOut = p.stock_qty <= 0;
  const gallery = p.gallery?.length ? p.gallery : [p.image_url].filter(Boolean) as string[];

  const tabBody =
    tab === "The label"
      ? p.description
      : tab === "What's in it"
        ? p.ingredients ?? "Ingredient list coming soon."
        : p.shelf_life ?? "Store somewhere cool and dry.";

  return (
    <>
      {/* ---------------------------------------------------- breadcrumb --- */}
      <nav
        className="mx-auto max-w-6xl px-6 pb-6 pt-32 text-sm text-ash sm:pt-36"
        aria-label="Breadcrumb"
      >
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" className="transition hover:text-kaadige">
              Home
            </Link>
          </li>
          <ChevronRight className="size-3.5 opacity-50" />
          <li>
            <Link
              href={`/categories/${p.category.slug}`}
              className="transition hover:text-kaadige"
            >
              {p.category.name}
            </Link>
          </li>
          <ChevronRight className="size-3.5 opacity-50" />
          <li className="font-semibold text-kaadige">{p.name}</li>
        </ol>
      </nav>

      {/* -------------------------------------------------------- buy box --- */}
      <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-2 lg:gap-14">
        {/* Gallery */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <motion.div
            layoutId={`product-${p.slug}`}
            className="relative aspect-square overflow-hidden rounded-[2rem]"
            style={{ background: tone.hex }}
          >
            <ProductImage
              src={gallery[shot] ?? p.image_url}
              alt={p.name}
              accent={p.category.accent}
              priority
              sizes="(max-width: 1024px) 100vw, 560px"
            />
            {off && (
              <span className="absolute left-5 top-5 rounded-full bg-kaadige px-3.5 py-1.5 text-xs font-black uppercase tracking-widest text-mallige">
                {off}% off
              </span>
            )}
            <span className="absolute right-5 top-5">
              <VegMark isVeg={p.is_veg} size={26} />
            </span>
          </motion.div>

          {gallery.length > 1 && (
            <div className="mt-3 flex gap-3">
              {gallery.map((src, i) => (
                <button
                  key={src}
                  onClick={() => setShot(i)}
                  aria-label={`View image ${i + 1}`}
                  className={cn(
                    "relative size-20 overflow-hidden rounded-2xl transition-all duration-300",
                    shot === i
                      ? "ring-2 ring-kaadige ring-offset-2 ring-offset-mallige"
                      : "opacity-60 hover:opacity-100",
                  )}
                  style={{ background: tone.hex }}
                >
                  <ProductImage
                    src={src}
                    alt={`${p.name} view ${i + 1}`}
                    accent={p.category.accent}
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="pb-4">
          <Reveal>
            <Link
              href={`/categories/${p.category.slug}`}
              className="eyebrow inline-flex items-center gap-2 rounded-full px-3 py-1.5 transition hover:brightness-95"
              style={{ background: tone.hex, color: tone.text }}
            >
              {p.category.name}
            </Link>

            <h1 className="mt-4 font-display text-[clamp(2.25rem,6vw,3.75rem)] font-extrabold leading-[0.92] tracking-tight">
              {p.name}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
              {p.rating_count > 0 && (
                <a href="#reviews" className="flex items-center gap-2 hover:text-chilli">
                  <Stars value={Number(p.rating_avg)} size={15} />
                  <span className="tabular font-semibold">{Number(p.rating_avg).toFixed(1)}</span>
                  <span className="text-ash">({p.rating_count})</span>
                </a>
              )}
              <SpiceMeter level={p.spice_level} size={15} showLabel />
              <span className="tabular text-ash">SKU {p.sku}</span>
            </div>

            <p className="mt-5 text-lg leading-relaxed text-kaadige/85">
              {p.short_description}
            </p>
          </Reveal>

          {/* Price + add */}
          <Reveal delay={0.1} className="glass mt-7 rounded-[var(--radius-jar)] p-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-ash">{p.unit_label}</p>
                <p className="mt-1 flex items-baseline gap-2.5">
                  <span className="tabular font-display text-5xl font-extrabold leading-none">
                    {money(p.price)}
                  </span>
                  {p.compare_at_price && (
                    <span className="tabular text-lg text-ash line-through">
                      {money(p.compare_at_price)}
                    </span>
                  )}
                </p>
              </div>
              <span
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-xs font-bold",
                  soldOut
                    ? "bg-kaadige/10 text-ash"
                    : p.stock_qty <= 10
                      ? "bg-chilli/12 text-chilli"
                      : "bg-leaf/12 text-leaf",
                )}
              >
                {soldOut
                  ? "This batch is over"
                  : p.stock_qty <= 10
                    ? `Only ${p.stock_qty} left`
                    : "In stock"}
              </span>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <QtyStepper value={qty} onChange={setQty} max={Math.max(1, p.stock_qty)} />
              <Button
                variant="ink"
                size="lg"
                disabled={soldOut}
                loading={pending}
                onClick={async () => {
                  await add(p.id, qty, p.name);
                  openDrawer();
                }}
                icon={!pending ? <ShoppingBag className="size-4" /> : undefined}
                className="flex-1"
              >
                {soldOut ? "Batch over" : `Add ${qty > 1 ? `${qty} ` : ""}to cart`}
              </Button>
            </div>

            {p.pairs_with && (
              <p className="mt-5 flex items-start gap-2.5 border-t border-hairline/70 pt-5 text-sm">
                <Sparkles className="mt-0.5 size-4 shrink-0 text-turmeric-deep" />
                <span>
                  <span className="font-bold">Eat it with </span>
                  <span className="text-ash">{p.pairs_with}</span>
                </span>
              </p>
            )}
          </Reveal>

          {/* Three promises, each true of this specific product */}
          <Reveal delay={0.15} className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              { icon: Truck, title: "Free over ₹799", body: "Ships in 24 hours" },
              { icon: Leaf, title: "No preservatives", body: "Nothing but the list" },
              { icon: Clock, title: p.shelf_life?.split(",")[0] ?? "Fresh", body: "Dated by hand" },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-hairline/70 bg-white/45 p-4"
              >
                <item.icon className="size-4 text-leaf" />
                <p className="mt-2 text-sm font-bold leading-tight">{item.title}</p>
                <p className="text-xs text-ash">{item.body}</p>
              </div>
            ))}
          </Reveal>

          {/* Tabs */}
          <Reveal delay={0.2} className="mt-8">
            <div className="flex gap-1 border-b border-hairline">
              {TABS.map((key) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={cn(
                    "relative px-4 py-3 text-sm font-bold transition-colors",
                    tab === key ? "text-kaadige" : "text-ash hover:text-kaadige",
                  )}
                >
                  {key}
                  {tab === key && (
                    <motion.span
                      layoutId="tab-underline"
                      className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-chilli"
                    />
                  )}
                </button>
              ))}
            </div>
            <motion.p
              key={tab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="pt-5 leading-relaxed text-kaadige/85"
            >
              {tabBody}
            </motion.p>
          </Reveal>
        </div>
      </div>

      {/* A quiet parallax band of the category colour between the buy box and
          the reviews, so the page has a breath in the middle. */}
      <div className="relative my-24 overflow-hidden py-16" style={{ background: tone.hex }}>
        <Parallax speed={0.15}>
          <p
            className="wordmark whitespace-nowrap text-center text-[clamp(3rem,14vw,10rem)] leading-none opacity-25"
            style={{ color: tone.text }}
          >
            {p.category.tagline}
          </p>
        </Parallax>
      </div>

      {/* ---------------------------------------------------------- reviews */}
      <div className="mx-auto max-w-6xl px-6">
        <Reviews slug={slug} />
      </div>

      <KolamDivider className="py-20" />

      {/* ---------------------------------------------------------- related */}
      {(related.data?.length ?? 0) > 0 && (
        <section className="mx-auto max-w-6xl px-6 pb-24">
          <h2 className="mb-8 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            Goes on the same shelf
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.data!.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
