"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { api } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import ProductCard from "@/components/product/ProductCard";
import { ProductCardSkeleton } from "@/components/ui/Bits";
import { EmptyState, ErrorState, PageHeader } from "@/components/ui/States";
import { Stagger, StaggerItem } from "@/components/ui/Reveal";

function SearchInner() {
  const params = useSearchParams();
  const router = useRouter();
  const initial = params.get("q") ?? "";
  const [term, setTerm] = useState(initial);
  const [active, setActive] = useState(initial);

  useEffect(() => {
    setTerm(initial);
    setActive(initial);
  }, [initial]);

  const results = useApi(
    () => api.products({ q: active, page_size: 48, sort: "rating" }),
    [active],
    { skip: !active },
  );

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const next = term.trim();
    setActive(next);
    router.replace(next ? `/search?q=${encodeURIComponent(next)}` : "/search");
  };

  const items = results.data?.items ?? [];

  return (
    <>
      <PageHeader
        eyebrow="Search"
        title={active ? `“${active}”` : "Find something"}
        blurb={
          active
            ? `${results.data?.total ?? 0} match${results.data?.total === 1 ? "" : "es"} across masalas, pickles, batters, snacks and sweets.`
            : "Search by name, by what's in it, or by what you want to cook."
        }
      >
        <form onSubmit={submit} className="clay-inset mt-8 flex max-w-xl items-center gap-3 rounded-full px-5 py-3">
          <Search className="size-5 shrink-0 text-ash" />
          <input
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Try “tamarind”, “coconut oil”, “curd rice”…"
            className="min-w-0 flex-1 bg-transparent font-display text-lg font-bold tracking-tight outline-none placeholder:font-body placeholder:text-sm placeholder:font-normal placeholder:text-ash"
            autoFocus
          />
          <button
            type="submit"
            className="clay shrink-0 bg-kaadige px-5 py-2 text-sm font-bold text-mallige [--clay-edge:#000]"
          >
            Search
          </button>
        </form>
      </PageHeader>

      <div className="mx-auto max-w-6xl px-6 pb-24">
        {!active ? null : results.error ? (
          <ErrorState message={results.error} onRetry={results.reload} />
        ) : results.loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            title={`Nothing matches “${active}”`}
            body="We only make fourteen things, so the catalogue is small on purpose. Try a broader word like “masala” or “pickle”."
          />
        ) : (
          <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" amount={0.05}>
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

export default function SearchPage() {
  return (
    <Suspense fallback={<PageHeader eyebrow="Search" title="Find something" />}>
      <SearchInner />
    </Suspense>
  );
}
