"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ShoppingBag, Trash2, Truck } from "lucide-react";
import { useCart } from "@/store/useCart";
import { money, num } from "@/lib/utils";
import { ProductImage, QtyStepper, SpiceMeter } from "@/components/ui/Bits";
import { Button, ButtonLink } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/States";

export default function CartPage() {
  const { cart, loading, setQuantity, remove, clear } = useCart();
  const items = cart?.items ?? [];

  const toFree = num(cart?.amount_to_free_shipping ?? "0");
  const threshold = num(cart?.free_shipping_threshold ?? "799");
  const progress = Math.min(100, ((threshold - toFree) / threshold) * 100);

  if (!loading && items.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-6 py-40 text-center">
        <span className="mx-auto grid size-24 place-items-center rounded-full bg-turmeric/25">
          <ShoppingBag className="size-10 text-turmeric-deep" />
        </span>
        <h1 className="mt-8 font-display text-4xl font-extrabold tracking-tight">
          Your cart is empty
        </h1>
        <p className="mt-3 text-ash">
          Fourteen things on the shelf. The sukka masala is where most people start.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/products" size="lg">
            Open the pantry
          </ButtonLink>
          <ButtonLink href="/categories" variant="glass" size="lg">
            Browse by shelf
          </ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Almost there"
        title="Your cart"
        blurb={
          cart
            ? `${cart.item_count} item${cart.item_count === 1 ? "" : "s"} from the kitchen.`
            : undefined
        }
      />

      <div className="mx-auto grid max-w-6xl gap-8 px-6 pb-24 lg:grid-cols-[1fr_22rem]">
        {/* --------------------------------------------------------- lines */}
        <div>
          <div className="glass overflow-hidden rounded-[var(--radius-jar)]">
            <AnimatePresence initial={false}>
              {items.map((item, i) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 60, height: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30, delay: i * 0.04 }}
                  className="flex flex-wrap items-center gap-4 border-b border-hairline/60 p-4 last:border-0 sm:p-5"
                >
                  <Link
                    href={`/products/${item.product.slug}`}
                    className="relative size-24 shrink-0 overflow-hidden rounded-2xl sm:size-28"
                  >
                    <ProductImage
                      src={item.product.image_url}
                      alt={item.product.name}
                      accent={item.product.category.accent}
                      sizes="112px"
                    />
                  </Link>

                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/products/${item.product.slug}`}
                      className="font-display text-xl font-extrabold tracking-tight hover:text-chilli"
                    >
                      {item.product.name}
                    </Link>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ash">
                      <span>{item.product.unit_label}</span>
                      <SpiceMeter level={item.product.spice_level} size={11} />
                      <span className="tabular">{money(item.unit_price)} each</span>
                    </p>
                    <div className="mt-3 flex items-center gap-3">
                      <QtyStepper
                        value={item.quantity}
                        max={item.product.stock_qty}
                        onChange={(next) => setQuantity(item.id, next)}
                      />
                      <button
                        onClick={() => remove(item.id)}
                        className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-ash transition hover:bg-chilli/10 hover:text-chilli"
                      >
                        <Trash2 className="size-3.5" />
                        Remove
                      </button>
                    </div>
                  </div>

                  <p className="tabular ml-auto font-display text-2xl font-extrabold">
                    {money(item.line_total)}
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <Link
              href="/products"
              className="text-sm font-semibold text-ash underline-offset-4 transition hover:text-kaadige hover:underline"
            >
              ← Keep shopping
            </Link>
            <button
              onClick={clear}
              className="text-sm font-semibold text-ash underline-offset-4 transition hover:text-chilli hover:underline"
            >
              Empty the cart
            </button>
          </div>
        </div>

        {/* ------------------------------------------------------- summary */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="glass-deep rounded-[var(--radius-jar)] p-6">
            <h2 className="font-display text-2xl font-extrabold tracking-tight">Summary</h2>

            <div className="mt-5 space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-ash">Subtotal</span>
                <span className="tabular font-semibold">{money(cart?.subtotal ?? 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ash">Delivery</span>
                <span className="tabular font-semibold">
                  {num(cart?.shipping_fee ?? 0) === 0 ? (
                    <span className="text-leaf">Free</span>
                  ) : (
                    money(cart!.shipping_fee)
                  )}
                </span>
              </div>
            </div>

            <div className="mt-5 border-t border-hairline pt-5">
              {toFree > 0 ? (
                <p className="text-xs text-ash">
                  Add <span className="font-bold text-kaadige">{money(toFree)}</span> more and
                  delivery is free.
                </p>
              ) : (
                <p className="flex items-center gap-1.5 text-xs font-bold text-leaf">
                  <Truck className="size-3.5" /> Delivery is on us
                </p>
              )}
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-kaadige/10">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-turmeric to-leaf"
                  animate={{ width: `${progress}%` }}
                  transition={{ type: "spring", stiffness: 110, damping: 20 }}
                />
              </div>
            </div>

            <div className="mt-6 flex items-baseline justify-between border-t border-hairline pt-5">
              <span className="font-display text-xl font-extrabold">Total</span>
              <span className="tabular font-display text-3xl font-extrabold">
                {money(cart?.total ?? 0)}
              </span>
            </div>

            <ButtonLink
              href="/checkout"
              variant="ink"
              size="lg"
              className="mt-6 w-full"
              icon={<ArrowRight className="size-4" />}
            >
              Checkout
            </ButtonLink>

            <p className="mt-4 rounded-2xl bg-indigo/8 px-4 py-3 text-center text-[0.6875rem] leading-relaxed text-indigo">
              Payments run on a demo gateway. No card details are collected and no money
              moves.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
