"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CornerDownLeft, Loader2, Search, X } from "lucide-react";
import { api } from "@/lib/api";
import type { Product } from "@/lib/types";
import { accentOf, money } from "@/lib/utils";
import { ProductImage, SpiceMeter } from "@/components/ui/Bits";

const QUICK = ["Sukka masala", "Mango pickle", "Dosa batter", "Mysore pak", "Chakli"];

export default function SearchOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      // Wait for the panel to mount before stealing focus.
      const id = requestAnimationFrame(() => inputRef.current?.focus());
      return () => cancelAnimationFrame(id);
    }
  }, [open]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    const term = query.trim();
    if (term.length < 2) {
      setResults([]);
      return;
    }
    setBusy(true);
    const id = setTimeout(async () => {
      try {
        setResults(await api.suggest(term));
      } catch {
        setResults([]);
      } finally {
        setBusy(false);
      }
    }, 220);
    return () => clearTimeout(id);
  }, [query]);

  const go = (path: string) => {
    onClose();
    router.push(path);
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const term = query.trim();
    if (term) go(`/search?q=${encodeURIComponent(term)}`);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-start justify-center px-4 pt-[12vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <button
            className="absolute inset-0 cursor-default bg-kaadige/45 backdrop-blur-md"
            onClick={onClose}
            aria-label="Close search"
          />

          <motion.div
            className="glass-deep relative w-full max-w-2xl overflow-hidden rounded-[2rem]"
            initial={{ y: -28, scale: 0.96, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: -20, scale: 0.97, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            role="dialog"
            aria-label="Search the pantry"
          >
            <form onSubmit={submit} className="flex items-center gap-3 px-6 py-5">
              <Search className="size-5 shrink-0 text-kaadige/50" />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search masalas, pickles, batter…"
                className="min-w-0 flex-1 bg-transparent font-display text-xl font-bold tracking-tight outline-none placeholder:text-kaadige/30 sm:text-2xl"
              />
              {busy && <Loader2 className="size-4 animate-spin text-kaadige/40" />}
              <button
                type="button"
                onClick={onClose}
                className="grid size-8 shrink-0 place-items-center rounded-full text-kaadige/50 transition hover:bg-kaadige/10 hover:text-kaadige"
                aria-label="Close search"
              >
                <X className="size-4" />
              </button>
            </form>

            <div className="border-t border-white/50">
              {query.trim().length < 2 ? (
                <div className="px-6 py-5">
                  <p className="eyebrow text-kaadige/45">Try one of these</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {QUICK.map((term) => (
                      <button
                        key={term}
                        onClick={() => setQuery(term)}
                        className="rounded-full border border-hairline bg-white/60 px-3.5 py-1.5 text-sm font-medium transition hover:border-turmeric hover:bg-turmeric/15"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              ) : results.length === 0 && !busy ? (
                <p className="px-6 py-8 text-center text-sm text-ash">
                  Nothing matches “{query.trim()}”. Try “masala” or “pickle”.
                </p>
              ) : (
                <ul className="max-h-[46vh] overflow-y-auto p-2">
                  {results.map((product, i) => (
                    <motion.li
                      key={product.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <button
                        onClick={() => go(`/products/${product.slug}`)}
                        className="group flex w-full items-center gap-4 rounded-2xl p-2.5 text-left transition hover:bg-white/70"
                      >
                        <span
                          className="relative size-14 shrink-0 overflow-hidden rounded-xl"
                          style={{ background: accentOf(product.category.accent).hex }}
                        >
                          <ProductImage
                            src={product.image_url}
                            alt={product.name}
                            accent={product.category.accent}
                            sizes="56px"
                          />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-2">
                            <span className="truncate font-display text-lg font-bold tracking-tight">
                              {product.name}
                            </span>
                            <SpiceMeter level={product.spice_level} size={11} />
                          </span>
                          <span className="line-clamp-1 block text-xs text-ash">
                            {product.short_description}
                          </span>
                        </span>
                        <span className="tabular shrink-0 font-display text-lg font-bold">
                          {money(product.price)}
                        </span>
                      </button>
                    </motion.li>
                  ))}
                  <li className="p-2">
                    <button
                      onClick={submit}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-kaadige/6 py-3 text-sm font-semibold transition hover:bg-kaadige/12"
                    >
                      See every match for “{query.trim()}”
                      <CornerDownLeft className="size-3.5" />
                    </button>
                  </li>
                </ul>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
