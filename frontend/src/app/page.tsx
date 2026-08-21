"use client";

import { api } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import Hero from "@/components/home/Hero";
import {
  BestsellerGrid,
  CategoryTiles,
  ClosingCTA,
  FreshBatch,
  HowItsMade,
  PromiseBand,
  SectionHead,
  Testimonials,
} from "@/components/home/Sections";
import { ProductCardSkeleton } from "@/components/ui/Bits";
import { ErrorState } from "@/components/ui/States";

export default function HomePage() {
  const categories = useApi(() => api.categories(), []);
  const featured = useApi(
    () => api.products({ featured: true, page_size: 8, sort: "rating" }),
    [],
  );
  const newest = useApi(() => api.products({ sort: "newest", page_size: 3 }), []);
  const reviews = useApi(() => api.recentReviews(9), []);

  const offline = featured.error && categories.error;

  return (
    <>
      <Hero />

      {offline ? (
        <section className="px-6 py-24">
          <ErrorState message={featured.error!} onRetry={featured.reload} />
        </section>
      ) : (
        <>
          {/* ---------------------------------------------------- categories */}
          <section id="pantry" className="mx-auto max-w-6xl scroll-mt-28 px-6 py-24 sm:py-32">
            <SectionHead
              eyebrow="Five shelves"
              title="What's on the pantry shelf"
              blurb="Each shelf is a different kind of patience. Masalas are ground the day they ship; pickles wait three weeks in the sun; batter is only ever a night old."
              href="/categories"
              hrefLabel="All categories"
            />
            {categories.loading ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="skeleton h-60 rounded-[var(--radius-jar)]" />
                ))}
              </div>
            ) : (
              <CategoryTiles categories={categories.data ?? []} />
            )}
          </section>

          {/* --------------------------------------------------- bestsellers */}
          <section className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
            <SectionHead
              eyebrow="Most reordered"
              title="The ones people come back for"
              blurb="Ranked by what shoppers actually rate, not by what we would like to move."
              href="/products"
              hrefLabel="Shop everything"
            />
            {featured.loading ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <BestsellerGrid products={featured.data?.items.slice(0, 8) ?? []} />
            )}
          </section>

          {/* ------------------------------------------------- how it's made */}
          <section className="mx-auto max-w-5xl px-6 py-24 sm:py-32">
            <SectionHead
              eyebrow="Four steps, in order"
              title="How a batch actually happens"
              blurb="Nothing here is a secret. It is just slower than a factory, done by fewer people, in smaller amounts."
              align="center"
            />
            <HowItsMade />
          </section>

          {/* -------------------------------------------------- fresh batch */}
          <section className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
            <SectionHead
              eyebrow="Newest on the shelf"
              title="Just off the grinder"
              href="/products?sort=newest"
              hrefLabel="See what's new"
            />
            <FreshBatch products={newest.data?.items ?? []} />
          </section>

          {/* ------------------------------------------------------ promise */}
          <section className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
            <PromiseBand />
          </section>

          {/* -------------------------------------------------- testimonials */}
          <section className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
            <SectionHead
              eyebrow="Verified purchases"
              title="What lands in the reviews"
              blurb="Every review below is from an account that actually ordered the thing."
              align="center"
            />
            <Testimonials reviews={reviews.data ?? []} />
          </section>

          {/* ------------------------------------------------------ closing */}
          <section className="mx-auto max-w-6xl px-6 pb-24 pt-8">
            <ClosingCTA />
          </section>
        </>
      )}
    </>
  );
}
