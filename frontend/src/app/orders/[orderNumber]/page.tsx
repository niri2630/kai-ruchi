"use client";

import Link from "next/link";
import { Suspense, use, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ArrowLeft, Copy, MapPin, RotateCw } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import { cn, formatDateTime, money } from "@/lib/utils";
import { ProductImage } from "@/components/ui/Bits";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/States";
import Tracking from "@/components/order/Tracking";

const PAYMENT_TONE: Record<string, string> = {
  paid: "bg-leaf/12 text-leaf",
  pending: "bg-turmeric/20 text-turmeric-deep",
  failed: "bg-chilli/12 text-chilli",
  refunded: "bg-indigo/12 text-indigo",
};

function OrderInner({ orderNumber }: { orderNumber: string }) {
  const params = useSearchParams();
  const email = params.get("email") ?? undefined;
  const [cancelling, setCancelling] = useState(false);

  const order = useApi(() => api.order(orderNumber, email), [orderNumber, email]);

  const cancel = async () => {
    setCancelling(true);
    try {
      await api.cancelOrder(orderNumber);
      toast.success("Order cancelled.");
      order.reload();
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Couldn't cancel that order.",
      );
    } finally {
      setCancelling(false);
    }
  };

  if (order.error) {
    return (
      <div className="px-6 py-40">
        <ErrorState message={order.error} onRetry={order.reload} />
      </div>
    );
  }

  if (order.loading || !order.data) {
    return (
      <div className="mx-auto max-w-5xl space-y-5 px-6 pb-24 pt-36">
        <div className="skeleton h-14 w-72 rounded-2xl" />
        <div className="skeleton h-80 rounded-[var(--radius-jar)]" />
      </div>
    );
  }

  const o = order.data;
  const canCancel = !["shipped", "out_for_delivery", "delivered", "cancelled"].includes(
    o.status,
  );

  return (
    <>
      <header className="mx-auto max-w-5xl px-6 pb-8 pt-32 sm:pt-40">
        <Link
          href="/orders"
          className="inline-flex items-center gap-2 text-sm font-semibold text-ash transition hover:text-kaadige"
        >
          <ArrowLeft className="size-4" />
          Your orders
        </Link>

        <div className="mt-5 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="eyebrow text-chilli">Order</p>
            <h1 className="tabular mt-2 font-display text-[clamp(2.25rem,6vw,3.75rem)] font-extrabold leading-none tracking-tight">
              {o.order_number}
            </h1>
            <p className="mt-3 text-sm text-ash">
              Placed {formatDateTime(o.placed_at)} · {o.items.length}{" "}
              {o.items.length === 1 ? "item" : "items"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-bold capitalize",
                PAYMENT_TONE[o.payment_status] ?? "bg-kaadige/10 text-ash",
              )}
            >
              {o.payment_status === "paid" ? "Paid" : o.payment_status}
              {o.payment_method === "cod" && o.payment_status === "pending"
                ? " · cash on delivery"
                : ""}
            </span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(o.order_number);
                toast.success("Order number copied");
              }}
              className="flex items-center gap-1.5 rounded-full border border-hairline bg-white/55 px-3.5 py-1.5 text-xs font-semibold transition hover:bg-white/85"
            >
              <Copy className="size-3.5" />
              Copy number
            </button>
            <button
              onClick={order.reload}
              className="flex items-center gap-1.5 rounded-full border border-hairline bg-white/55 px-3.5 py-1.5 text-xs font-semibold transition hover:bg-white/85"
            >
              <RotateCw className="size-3.5" />
              Refresh
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-5xl gap-6 px-6 pb-24 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          <Tracking order={o} />

          {/* ------------------------------------------------------ items */}
          <section className="glass rounded-[var(--radius-jar)] p-6 sm:p-8">
            <h2 className="font-display text-2xl font-extrabold tracking-tight">
              What's in the box
            </h2>
            <ul className="mt-5 divide-y divide-hairline/60">
              {o.items.map((item, i) => (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
                >
                  <Link
                    href={`/products/${item.product_slug}`}
                    className="relative size-16 shrink-0 overflow-hidden rounded-xl"
                  >
                    <ProductImage src={item.image_url} alt={item.product_name} sizes="64px" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/products/${item.product_slug}`}
                      className="font-display text-lg font-extrabold tracking-tight hover:text-chilli"
                    >
                      {item.product_name}
                    </Link>
                    <p className="tabular text-xs text-ash">
                      {item.unit_label} · {money(item.unit_price)} × {item.quantity}
                    </p>
                  </div>
                  <p className="tabular font-display text-lg font-extrabold">
                    {money(item.line_total)}
                  </p>
                </motion.li>
              ))}
            </ul>

            <div className="mt-5 space-y-2 border-t border-hairline pt-5 text-sm">
              <div className="flex justify-between">
                <span className="text-ash">Subtotal</span>
                <span className="tabular font-semibold">{money(o.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ash">Delivery</span>
                <span className="tabular font-semibold">
                  {Number(o.shipping_fee) === 0 ? (
                    <span className="text-leaf">Free</span>
                  ) : (
                    money(o.shipping_fee)
                  )}
                </span>
              </div>
              <div className="flex items-baseline justify-between border-t border-hairline pt-3 font-display text-2xl font-extrabold">
                <span>Total</span>
                <span className="tabular">{money(o.total)}</span>
              </div>
            </div>
          </section>
        </div>

        {/* -------------------------------------------------------- aside */}
        <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
          <div className="glass rounded-[var(--radius-jar)] p-6">
            <p className="eyebrow flex items-center gap-2 text-chilli">
              <MapPin className="size-3.5" />
              Delivering to
            </p>
            <address className="mt-3 text-sm not-italic leading-relaxed">
              <span className="block font-bold">{o.ship_full_name}</span>
              <span className="block text-ash">
                {o.ship_line1}
                {o.ship_line2 ? `, ${o.ship_line2}` : ""}
                <br />
                {o.ship_city}, {o.ship_state} {o.ship_pincode}
                <br />
                {o.ship_phone}
                <br />
                {o.ship_email}
              </span>
            </address>
            {o.notes && (
              <p className="mt-4 rounded-2xl bg-turmeric/12 px-4 py-3 text-xs leading-relaxed">
                <span className="font-bold">Note: </span>
                {o.notes}
              </p>
            )}
          </div>

          {canCancel && (
            <div className="glass rounded-[var(--radius-jar)] p-6">
              <p className="text-sm font-bold">Changed your mind?</p>
              <p className="mt-1 text-xs text-ash">
                You can cancel until the box is handed to the courier.
              </p>
              <Button
                onClick={cancel}
                loading={cancelling}
                variant="glass"
                size="sm"
                className="mt-4 w-full text-chilli"
              >
                Cancel this order
              </Button>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}

export default function OrderPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = use(params);
  return (
    <Suspense fallback={<div className="px-6 pt-40" />}>
      <OrderInner orderNumber={orderNumber} />
    </Suspense>
  );
}
