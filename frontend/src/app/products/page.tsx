"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import ProductCard from "@/components/product/ProductCard";
import ProductFilters, {
  DEFAULT_FILTERS,
  type Filters,
} from "@/components/product/ProductFilters";
import { ProductCardSkeleton } from "@/components/ui/Bits";
import { EmptyState, ErrorState, PageHeader } from "@/components/ui/States";
import { Button } from "@/components/ui/Button";
import { Stagger, StaggerItem } from "@/components/ui/Reveal";

function ProductsInner() {
  const params = useSearchParams();
  const [filters, setFilters] = useState<Filters>({
    ...DEFAULT_FILTERS,
    category: params.get("category") ?? "",
    sort: (params.get("sort") as Filters["sort"]) ?? "featured",
  });
  const [panelOpen, setPanelOpen] = useState(false);
  const [page, setPage] = useState(1);

  const categories = useApi(() => api.categories(), []);
  const products = useApi(
    () =>
      api.products({
        category: filters.category || undefined,
        spice: filters.spice ?? undefined,
        veg: filters.veg ?? undefined,
        in_stock: filters.inStock || undefined,
        sort: filters.sort,
        page,
        page_size: 12,
      }),
    [filters.category, filters.spice, filters.veg, filters.inStock, filters.sort, page],
  );

  // Any filter change starts the results over from page one.
  useEffect(() => {
    setPage(1);
  }, [filters.category, filters.spice, filters.veg, filters.inStock, filters.sort]);

  const items = products.data?.items ?? [];
  const pages = products.data?.pages ?? 1;

  return (
    <>
      <PageHeader
        eyebrow="The whole pantry"
        title="Everything we make"
        blurb="Fourteen things, made in one kitchen. Filter by shelf, by how hot it is, or by what is actually in stock today."
      />

      <div className="mx-auto max-w-6xl px-6 pb-24">
        <ProductFilters
          categories={categories.data ?? []}
          filters={filters}
          onChange={setFilters}
          total={products.data?.total ?? 0}
          open={panelOpen}
          onToggle={() => setPanelOpen((open) => !open)}
        />

        <div className="mt-8">
          {products.error ? (
            <ErrorState message={products.error} onRetry={products.reload} />
          ) : products.loading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              title="Nothing on this shelf right now"
              body="Loosen a filter — dropping the heat level usually brings things back."
              actionLabel="Clear filters"
              actionHref="/products"
            />
          ) : (
            <>
              <Stagger
                key={`${filters.category}-${filters.sort}-${page}`}
                className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                amount={0.05}
              >
                {items.map((product, i) => (
                  <StaggerItem key={product.id}>
                    <ProductCard product={product} priority={i < 4} />
                  </StaggerItem>
                ))}
              </Stagger>

              {pages > 1 && (
                <motion.nav
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-14 flex items-center justify-center gap-2"
                  aria-label="Pagination"
                >
                  <Button
                    variant="glass"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  {Array.from({ length: pages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      aria-current={page === i + 1 ? "page" : undefined}
                      className={`tabular size-10 rounded-full text-sm font-bold transition ${
                        page === i + 1
                          ? "bg-kaadige text-mallige"
                          : "text-kaadige/60 hover:bg-kaadige/10 hover:text-kaadige"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <Button
                    variant="glass"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(pages, p + 1))}
                    disabled={page === pages}
                  >
                    Next
                  </Button>
                </motion.nav>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<PageHeader eyebrow="The whole pantry" title="Everything we make" />}>
      <ProductsInner />
    </Suspense>
  );
}
