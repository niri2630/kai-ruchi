"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, SlidersHorizontal, X } from "lucide-react";
import type { Category } from "@/lib/types";
import { accentOf, cn } from "@/lib/utils";
import { SPICE_LABELS } from "@/lib/utils";

export interface Filters {
  category: string;
  spice: number | null;
  veg: boolean | null;
  inStock: boolean;
  sort: "featured" | "newest" | "price_asc" | "price_desc" | "rating" | "name";
}

export const DEFAULT_FILTERS: Filters = {
  category: "",
  spice: null,
  veg: null,
  inStock: false,
  sort: "featured",
};

const SORTS: { value: Filters["sort"]; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "rating", label: "Best rated" },
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "name", label: "A – Z" },
];

function Chip({
  active,
  onClick,
  children,
  color,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-300",
        active
          ? "border-transparent text-white shadow-lg"
          : "border-hairline bg-white/55 text-kaadige/75 hover:border-kaadige/35 hover:bg-white/80 hover:text-kaadige",
      )}
      style={active ? { background: color ?? "var(--color-kaadige)" } : undefined}
    >
      <span className="flex items-center gap-1.5">
        {active && <Check className="size-3.5" />}
        {children}
      </span>
    </button>
  );
}

export default function ProductFilters({
  categories,
  filters,
  onChange,
  total,
  open,
  onToggle,
}: {
  categories: Category[];
  filters: Filters;
  onChange: (next: Filters) => void;
  total: number;
  open: boolean;
  onToggle: () => void;
}) {
  const set = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    onChange({ ...filters, [key]: value });

  const activeCount =
    (filters.category ? 1 : 0) +
    (filters.spice !== null ? 1 : 0) +
    (filters.veg !== null ? 1 : 0) +
    (filters.inStock ? 1 : 0);

  return (
    <div className="glass sticky top-24 z-30 rounded-[var(--radius-jar)] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggle}
            className={cn(
              "clay flex items-center gap-2 px-4 py-2.5 text-sm font-bold",
              activeCount
                ? "bg-chilli text-white [--clay-edge:var(--color-chilli-deep)]"
                : "bg-turmeric text-kaadige [--clay-edge:var(--color-turmeric-deep)]",
            )}
            aria-expanded={open}
          >
            <SlidersHorizontal className="size-4" />
            Filters
            {activeCount > 0 && (
              <span className="tabular grid size-5 place-items-center rounded-full bg-white/85 text-[0.625rem] font-black text-chilli">
                {activeCount}
              </span>
            )}
          </button>
          <p className="tabular text-sm font-medium text-ash">
            {total} {total === 1 ? "product" : "products"}
          </p>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <span className="text-ash">Sort</span>
          <select
            value={filters.sort}
            onChange={(event) => set("sort", event.target.value as Filters["sort"])}
            className="clay-inset cursor-pointer rounded-full px-4 py-2.5 text-base font-semibold outline-none sm:py-2 sm:text-sm"
          >
            {SORTS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="space-y-5 border-t border-hairline/60 pt-5 mt-4">
              <div>
                <p className="eyebrow mb-2.5 text-ash">Shelf</p>
                <div className="flex flex-wrap gap-2">
                  <Chip active={!filters.category} onClick={() => set("category", "")}>
                    Everything
                  </Chip>
                  {categories.map((category) => (
                    <Chip
                      key={category.id}
                      active={filters.category === category.slug}
                      color={accentOf(category.accent).hex}
                      onClick={() =>
                        set(
                          "category",
                          filters.category === category.slug ? "" : category.slug,
                        )
                      }
                    >
                      {category.name}
                    </Chip>
                  ))}
                </div>
              </div>

              <div>
                <p className="eyebrow mb-2.5 text-ash">Heat</p>
                <div className="flex flex-wrap gap-2">
                  {SPICE_LABELS.map((label, level) => (
                    <Chip
                      key={label}
                      active={filters.spice === level}
                      color={level === 0 ? "var(--color-leaf)" : "var(--color-chilli)"}
                      onClick={() => set("spice", filters.spice === level ? null : level)}
                    >
                      {label}
                    </Chip>
                  ))}
                </div>
              </div>

              <div>
                <p className="eyebrow mb-2.5 text-ash">Diet &amp; stock</p>
                <div className="flex flex-wrap gap-2">
                  <Chip
                    active={filters.veg === true}
                    color="var(--color-leaf)"
                    onClick={() => set("veg", filters.veg === true ? null : true)}
                  >
                    Vegetarian
                  </Chip>
                  <Chip
                    active={filters.veg === false}
                    color="var(--color-chilli-deep)"
                    onClick={() => set("veg", filters.veg === false ? null : false)}
                  >
                    Meat &amp; fish
                  </Chip>
                  <Chip
                    active={filters.inStock}
                    color="var(--color-indigo)"
                    onClick={() => set("inStock", !filters.inStock)}
                  >
                    In stock only
                  </Chip>
                </div>
              </div>

              {activeCount > 0 && (
                <button
                  onClick={() => onChange({ ...DEFAULT_FILTERS, sort: filters.sort })}
                  className="flex items-center gap-1.5 text-sm font-semibold text-chilli underline-offset-4 hover:underline"
                >
                  <X className="size-3.5" />
                  Clear all filters
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
