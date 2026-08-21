"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { ShoppingBag, Trash2, Truck, X } from "lucide-react";
import { useCart } from "@/store/useCart";
import { money, num } from "@/lib/utils";
import { ProductImage, QtyStepper } from "@/components/ui/Bits";
import { ButtonLink } from "@/components/ui/Button";

export default function CartDrawer() {
  const { cart, drawerOpen, closeDrawer, setQuantity, remove } = useCart();
  const items = cart?.items ?? [];

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDrawer();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [closeDrawer]);

  const toFree = num(cart?.amount_to_free_shipping ?? "0");
  const threshold = num(cart?.free_shipping_threshold ?? "799");
  const progress = Math.min(100, ((threshold - toFree) / threshold) * 100);

  return (
    <AnimatePresence>
      {drawerOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-[90] bg-kaadige/45 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
          />
          <motion.aside
            className="glass-deep fixed inset-y-0 right-0 z-[95] flex w-full max-w-md flex-col sm:rounded-l-[2rem]"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 280, damping: 32 }}
            role="dialog"
            aria-label="Your cart"
          >
            <header className="flex items-center justify-between border-b border-white/50 px-6 py-5">
              <h2 className="font-display text-2xl font-extrabold tracking-tight">
                Your cart
                {items.length > 0 && (
                  <span className="tabular ml-2 text-base font-bold text-ash">
                    {cart?.item_count}
                  </span>
                )}
              </h2>
              <button
                onClick={closeDrawer}
                className="grid size-9 place-items-center rounded-full transition hover:bg-kaadige/10"
                aria-label="Close cart"
              >
                <X className="size-5" />
              </button>
            </header>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
                <span className="grid size-20 place-items-center rounded-full bg-turmeric/25">
                  <ShoppingBag className="size-8 text-turmeric-deep" />
                </span>
                <div>
                  <p className="font-display text-xl font-bold">Nothing in here yet</p>
                  <p className="mt-1 text-sm text-ash">
                    The sukka masala is where most people start.
                  </p>
                </div>
                <ButtonLink href="/products" size="md" className="mt-1">
                  Open the pantry
                </ButtonLink>
              </div>
            ) : (
              <>
                {/* Free-shipping meter */}
                <div className="border-b border-white/40 px-6 py-4">
                  {toFree > 0 ? (
                    <p className="text-xs font-medium text-ash">
                      <span className="font-bold text-kaadige">{money(toFree)}</span> more
                      for free delivery
                    </p>
                  ) : (
                    <p className="flex items-center gap-1.5 text-xs font-bold text-leaf">
                      <Truck className="size-3.5" /> Delivery is on us
                    </p>
                  )}
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-kaadige/10">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-turmeric to-leaf"
                      animate={{ width: `${progress}%` }}
                      transition={{ type: "spring", stiffness: 120, damping: 20 }}
                    />
                  </div>
                </div>

                <ul className="flex-1 space-y-1 overflow-y-auto p-4">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <motion.li
                        key={item.id}
                        layout
                        initial={{ opacity: 0, x: 24 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 40, height: 0, marginBottom: 0 }}
                        transition={{ type: "spring", stiffness: 320, damping: 30 }}
                        className="flex gap-3 rounded-2xl p-2 transition hover:bg-white/55"
                      >
                        <Link
                          href={`/products/${item.product.slug}`}
                          onClick={closeDrawer}
                          className="relative size-20 shrink-0 overflow-hidden rounded-xl"
                        >
                          <ProductImage
                            src={item.product.image_url}
                            alt={item.product.name}
                            accent={item.product.category.accent}
                            sizes="80px"
                          />
                        </Link>
                        <div className="flex min-w-0 flex-1 flex-col justify-between">
                          <div>
                            <Link
                              href={`/products/${item.product.slug}`}
                              onClick={closeDrawer}
                              className="line-clamp-1 font-display text-base font-bold tracking-tight hover:text-chilli"
                            >
                              {item.product.name}
                            </Link>
                            <p className="text-xs text-ash">{item.product.unit_label}</p>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <QtyStepper
                              value={item.quantity}
                              max={item.product.stock_qty}
                              onChange={(next) => setQuantity(item.id, next)}
                            />
                            <span className="tabular font-display text-base font-bold">
                              {money(item.line_total)}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => remove(item.id)}
                          className="grid size-8 shrink-0 place-items-center self-start rounded-full text-ash transition hover:bg-chilli/12 hover:text-chilli"
                          aria-label={`Remove ${item.product.name}`}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>

                <footer className="space-y-3 border-t border-white/50 px-6 py-5">
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between text-ash">
                      <span>Subtotal</span>
                      <span className="tabular">{money(cart!.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-ash">
                      <span>Delivery</span>
                      <span className="tabular">
                        {num(cart!.shipping_fee) === 0 ? "Free" : money(cart!.shipping_fee)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-hairline pt-2 font-display text-xl font-extrabold">
                      <span>Total</span>
                      <span className="tabular">{money(cart!.total)}</span>
                    </div>
                  </div>
                  <ButtonLink
                    href="/checkout"
                    variant="ink"
                    size="lg"
                    className="w-full"
                  >
                    Checkout
                  </ButtonLink>
                  <button
                    onClick={closeDrawer}
                    className="w-full text-center text-xs font-semibold text-ash underline-offset-4 hover:text-kaadige hover:underline"
                  >
                    Keep shopping
                  </button>
                </footer>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
