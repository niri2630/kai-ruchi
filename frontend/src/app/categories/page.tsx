"use client";

import { api } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import { CategoryTiles } from "@/components/home/Sections";
import { ErrorState, PageHeader } from "@/components/ui/States";

export default function CategoriesPage() {
  const categories = useApi(() => api.categories(), []);

  return (
    <>
      <PageHeader
        eyebrow="Five shelves"
        title="Browse by shelf"
        blurb="Masalas, pickles, fresh batters, snacks and sweets. Each one is a different kind of waiting."
      />
      <div className="mx-auto max-w-6xl px-6 pb-24">
        {categories.error ? (
          <ErrorState message={categories.error} onRetry={categories.reload} />
        ) : categories.loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton h-60 rounded-[var(--radius-jar)]" />
            ))}
          </div>
        ) : (
          <CategoryTiles categories={categories.data ?? []} />
        )}
      </div>
    </>
  );
}
