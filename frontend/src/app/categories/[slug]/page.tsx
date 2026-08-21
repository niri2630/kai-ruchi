"use client";

import Link from "next/link";
import { use } from "react";
import { ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import { accentOf } from "@/lib/utils";
import ProductCard from "@/components/product/ProductCard";
import { ProductCardSkeleton, ProductImage } from "@/components/ui/Bits";

/** Shelves we have footage for. The rest fall back to their still image. */
const SHELF_FILMS = new Set(["pickles", "fresh-batters", "snacks", "sweets"]);
import { EmptyState, ErrorState } from "@/components/ui/States";
import { Stagger, StaggerItem, WordsIn } from "@/components/ui/Reveal";
import { Parallax } from "@/components/ui/Scroll";

export default function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const category = useApi(() => api.category(slug), [slug]);
  const products = useApi(
    () => api.products({ category: slug, page_size: 48, sort: "featured" }),
    [slug],
  );

  if (category.error) {
    return (
      <div className="px-6 py-40">
        <ErrorState message={category.error} onRetry={category.reload} />
      </div>
    );
  }

  const tone = accentOf(category.data?.accent);
  const items = products.data?.items ?? [];

  return (
    <>
      {/* Full-bleed masthead: the shelf's own footage under its own colour. */}
      <header
        className="relative overflow-hidden px-5 pb-16 pt-32 sm:px-6 sm:pb-28 sm:pt-44"
        style={{ background: `linear-gradient(150deg, ${tone.hex}, ${tone.deep})` }}
      >
        {/* Four shelves have a film; masalas falls back to its still. Either
            way the colour wash on top keeps the type readable. */}
        {SHELF_FILMS.has(slug) ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden
            className="absolute inset-0 size-full object-cover"
          >
            <source src={`/videos/${slug}.mp4`} type="video/mp4" />
          </video>
        ) : (
          category.data?.image_url && (
            <span aria-hidden className="absolute inset-0">
              <ProductImage
                src={category.data.image_url}
                alt=""
                accent={category.data.accent}
                sizes="100vw"
                priority
              />
            </span>
          )
        )}

        <span
          aria-hidden
          className="absolute inset-0"
          style={{
            background: `linear-gradient(150deg, ${tone.hex}d9, ${tone.deep}f2)`,
          }}
        />

        <Parallax speed={0.3} className="pointer-events-none absolute inset-0">
          <div
            aria-hidden
            className="absolute inset-0 opacity-15"
            style={{
              backgroundImage: "radial-gradient(#fff 1.8px, transparent 1.8px)",
              backgroundSize: "34px 34px",
            }}
          />
        </Parallax>

        <div className="relative mx-auto max-w-6xl" style={{ color: tone.text }}>
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 text-sm font-semibold opacity-75 transition hover:opacity-100"
          >
            <ArrowLeft className="size-4" />
            All shelves
          </Link>

          <p className="eyebrow mt-6 opacity-75">{category.data?.tagline}</p>
          <h1 className="mt-3 font-display text-[clamp(3rem,10vw,7rem)] font-extrabold leading-[0.86] tracking-tight">
            {category.data ? <WordsIn text={category.data.name} /> : slug}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed opacity-85 sm:text-lg">
            {category.data?.description}
          </p>
          <p className="tabular mt-6 inline-block rounded-full bg-black/20 px-4 py-2 text-sm font-bold backdrop-blur-sm">
            {category.data?.product_count ?? 0} on this shelf
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-16">
        {products.error ? (
          <ErrorState message={products.error} onRetry={products.reload} />
        ) : products.loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            title="This shelf is empty today"
            body="Everything here is made in batches. Check back, or look at what else is around."
          />
        ) : (
          <Stagger
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            amount={0.05}
          >
            {items.map((product, i) => (
              <StaggerItem key={product.id}>
                <ProductCard product={product} priority={i < 4} />
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </div>
    </>
  );
}
