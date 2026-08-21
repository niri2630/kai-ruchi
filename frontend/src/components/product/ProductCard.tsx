"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2, Plus } from "lucide-react";
import { useCart } from "@/store/useCart";
import type { Product } from "@/lib/types";
import { accentOf, cn, discountPercent, money } from "@/lib/utils";
import { ProductImage, SpiceMeter, Stars, VegMark } from "@/components/ui/Bits";
import { TiltCard } from "@/components/ui/Hover";

export default function ProductCard({
  product,
  className,
  priority,
}: {
  product: Product;
  className?: string;
  priority?: boolean;
}) {
  const add = useCart((s) => s.add);
  const pending = useCart((s) => s.pending.has(product.id));
  const [justAdded, setJustAdded] = useState(false);

  const tone = accentOf(product.category.accent);
  const off = discountPercent(product.price, product.compare_at_price);
  const soldOut = product.stock_qty <= 0;
  const lastFew = !soldOut && product.stock_qty <= 10;

  return (
    <TiltCard max={7} className={cn("group h-full", className)}>
      <article className="glass flex h-full flex-col overflow-hidden rounded-[var(--radius-jar)] transition-shadow duration-500 group-hover:shadow-[0_40px_80px_-40px_rgba(36,18,9,.6)]">
        <Link
          href={`/products/${product.slug}`}
          className="relative block aspect-[4/5] overflow-hidden"
          style={{ background: tone.hex }}
        >
          <motion.div
            className="absolute inset-0"
            whileHover={{ scale: 1.07 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <ProductImage
              src={product.image_url}
              alt={product.name}
              accent={product.category.accent}
              priority={priority}
            />
          </motion.div>

          {/* The lid: a band that lifts off the jar as you hover. */}
          <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-3">
            <div className="flex flex-col gap-1.5">
              {off && (
                <span className="rounded-full bg-kaadige px-2.5 py-1 text-[0.625rem] font-black uppercase tracking-widest text-mallige">
                  {off}% off
                </span>
              )}
              {lastFew && (
                <span className="rounded-full bg-white/90 px-2.5 py-1 text-[0.625rem] font-black uppercase tracking-widest text-chilli">
                  {product.stock_qty} left
                </span>
              )}
              {soldOut && (
                <span className="rounded-full bg-kaadige/85 px-2.5 py-1 text-[0.625rem] font-black uppercase tracking-widest text-mallige">
                  Batch over
                </span>
              )}
            </div>
            <VegMark isVeg={product.is_veg} size={18} />
          </div>

          {/* Category label slides up from the bottom edge. */}
          <span className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-full bg-kaadige/80 px-4 py-2 text-center text-[0.6875rem] font-bold uppercase tracking-[0.2em] text-mallige backdrop-blur-sm transition-transform duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0">
            {product.category.name}
          </span>
        </Link>

        <div className="flex flex-1 flex-col gap-2.5 p-4">
          <div className="flex items-center justify-between gap-2">
            <SpiceMeter level={product.spice_level} size={13} />
            {product.rating_count > 0 && (
              <span className="flex items-center gap-1.5">
                <Stars value={Number(product.rating_avg)} size={12} />
                <span className="tabular text-[0.6875rem] font-bold text-ash">
                  {product.rating_count}
                </span>
              </span>
            )}
          </div>

          <h3 className="font-display text-xl font-extrabold leading-tight tracking-tight">
            <Link
              href={`/products/${product.slug}`}
              className="bg-gradient-to-r from-chilli to-chilli bg-[length:0%_2px] bg-left-bottom bg-no-repeat transition-[background-size] duration-400 hover:bg-[length:100%_2px]"
            >
              {product.name}
            </Link>
          </h3>

          <p className="line-clamp-2 flex-1 text-[0.8125rem] leading-snug text-ash">
            {product.short_description}
          </p>

          <div className="mt-1 flex items-end justify-between gap-3">
            <div>
              <p className="text-[0.6875rem] font-medium text-ash">{product.unit_label}</p>
              <p className="flex items-baseline gap-1.5">
                <span className="tabular font-display text-2xl font-extrabold leading-none">
                  {money(product.price)}
                </span>
                {product.compare_at_price && (
                  <span className="tabular text-xs text-ash line-through">
                    {money(product.compare_at_price)}
                  </span>
                )}
              </p>
            </div>

            {/* Press, spin, then flash a tick — the button confirms itself
                rather than relying on the toast alone. */}
            <motion.button
              onClick={async () => {
                await add(product.id, 1, product.name);
                setJustAdded(true);
                setTimeout(() => setJustAdded(false), 1400);
              }}
              disabled={soldOut || pending}
              aria-label={soldOut ? `${product.name} is out of stock` : `Add ${product.name} to cart`}
              whileTap={soldOut ? undefined : { scale: 0.86 }}
              transition={{ type: "spring", stiffness: 500, damping: 18 }}
              className={cn(
                "clay grid size-11 shrink-0 place-items-center overflow-hidden text-white",
                soldOut
                  ? "cursor-not-allowed bg-ash [--clay-edge:#5a4a3d]"
                  : justAdded
                    ? "bg-kaadige [--clay-edge:#000]"
                    : "bg-leaf [--clay-edge:var(--color-leaf-deep)]",
              )}
            >
              <AnimatePresence mode="popLayout" initial={false}>
                {pending ? (
                  <motion.span
                    key="busy"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                  >
                    <Loader2 className="size-5 animate-spin" />
                  </motion.span>
                ) : justAdded ? (
                  <motion.span
                    key="done"
                    initial={{ opacity: 0, scale: 0.3, rotate: -40 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.3 }}
                    transition={{ type: "spring", stiffness: 520, damping: 15 }}
                  >
                    <Check className="size-5" strokeWidth={3} />
                  </motion.span>
                ) : (
                  <motion.span
                    key="add"
                    initial={{ opacity: 0, scale: 0.5, rotate: 90 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.5, rotate: -90 }}
                    transition={{ type: "spring", stiffness: 420, damping: 20 }}
                  >
                    <Plus className="size-5" />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </article>
    </TiltCard>
  );
}
