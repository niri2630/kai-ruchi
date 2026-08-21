"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Package } from "lucide-react";
import { api } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import { useAuth } from "@/store/useAuth";
import { cn, formatDate, money } from "@/lib/utils";
import { ProductImage } from "@/components/ui/Bits";
import { ButtonLink } from "@/components/ui/Button";
import { ErrorState, PageHeader } from "@/components/ui/States";

const STATUS_TONE: Record<string, string> = {
  placed: "bg-turmeric/20 text-turmeric-deep",
  confirmed: "bg-turmeric/20 text-turmeric-deep",
  packed: "bg-indigo/12 text-indigo",
  shipped: "bg-indigo/12 text-indigo",
  out_for_delivery: "bg-leaf/12 text-leaf",
  delivered: "bg-leaf/12 text-leaf",
  cancelled: "bg-chilli/12 text-chilli",
};

export default function OrdersPage() {
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const ready = useAuth((s) => s.ready);

  const orders = useApi(() => api.orders(), [user?.id], { skip: !user });

  useEffect(() => {
    if (ready && !user) router.replace("/login?next=/orders");
  }, [ready, user, router]);

  if (!ready || !user) {
    return <div className="px-6 pt-40" />;
  }

  const list = orders.data ?? [];

  return (
    <>
      <PageHeader
        eyebrow={`Signed in as ${user.full_name}`}
        title="Your orders"
        blurb="Every box that has left the kitchen for you, and where each one has reached."
      />

      <div className="mx-auto max-w-5xl px-6 pb-24">
        {orders.error ? (
          <ErrorState message={orders.error} onRetry={orders.reload} />
        ) : orders.loading ? (
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="skeleton h-40 rounded-[var(--radius-jar)]" />
            ))}
          </div>
        ) : list.length === 0 ? (
          <div className="glass mx-auto max-w-lg rounded-[var(--radius-jar)] p-12 text-center">
            <span className="mx-auto grid size-16 place-items-center rounded-full bg-turmeric/20">
              <Package className="size-7 text-turmeric-deep" />
            </span>
            <p className="mt-6 font-display text-2xl font-extrabold tracking-tight">
              No orders yet
            </p>
            <p className="mt-2 text-sm text-ash">
              When you order, this is where you'll follow it.
            </p>
            <ButtonLink href="/products" size="md" className="mt-6">
              Open the pantry
            </ButtonLink>
          </div>
        ) : (
          <div className="space-y-4">
            {list.map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07, duration: 0.5 }}
              >
                <Link
                  href={`/orders/${order.order_number}`}
                  className="glass group block rounded-[var(--radius-jar)] p-6 transition-shadow duration-400 hover:shadow-[0_30px_60px_-30px_rgba(36,18,9,.5)]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="tabular font-display text-2xl font-extrabold tracking-tight">
                        {order.order_number}
                      </p>
                      <p className="mt-1 text-xs text-ash">
                        {formatDate(order.placed_at)} · {order.items.length}{" "}
                        {order.items.length === 1 ? "item" : "items"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "rounded-full px-3 py-1.5 text-xs font-bold capitalize",
                          STATUS_TONE[order.status] ?? "bg-kaadige/10 text-ash",
                        )}
                      >
                        {order.status.replace(/_/g, " ")}
                      </span>
                      <span className="tabular font-display text-2xl font-extrabold">
                        {money(order.total)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-4">
                    <div className="flex -space-x-3">
                      {order.items.slice(0, 5).map((item) => (
                        <span
                          key={item.id}
                          className="relative size-12 overflow-hidden rounded-xl ring-2 ring-mallige"
                        >
                          <ProductImage
                            src={item.image_url}
                            alt={item.product_name}
                            sizes="48px"
                          />
                        </span>
                      ))}
                      {order.items.length > 5 && (
                        <span className="tabular grid size-12 place-items-center rounded-xl bg-kaadige text-xs font-bold text-mallige ring-2 ring-mallige">
                          +{order.items.length - 5}
                        </span>
                      )}
                    </div>
                    <span className="flex items-center gap-1.5 text-sm font-bold text-chilli">
                      Track it
                      <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1.5" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
