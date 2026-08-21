"use client";

import { motion } from "framer-motion";
import { Check, CircleDot, PackageX } from "lucide-react";
import type { OrderDetail } from "@/lib/types";
import { cn, formatDateTime } from "@/lib/utils";

/**
 * The tracking timeline. Six steps, in order, with the line between them
 * filling to wherever the parcel has actually reached.
 */
export default function Tracking({ order }: { order: OrderDetail }) {
  const cancelled = order.status === "cancelled";
  const steps = order.tracking ?? [];
  const doneCount = steps.filter((step) => step.done).length;
  const progress = steps.length > 1 ? ((doneCount - 1) / (steps.length - 1)) * 100 : 0;

  if (cancelled) {
    return (
      <div className="glass rounded-[var(--radius-jar)] p-8 text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-chilli/12">
          <PackageX className="size-6 text-chilli" />
        </span>
        <p className="mt-4 font-display text-2xl font-extrabold tracking-tight">
          This order was cancelled
        </p>
        <p className="mt-2 text-sm text-ash">
          {order.payment_status === "refunded"
            ? "The payment has been marked refunded."
            : "Nothing was charged."}
        </p>
      </div>
    );
  }

  return (
    <div className="glass rounded-[var(--radius-jar)] p-6 sm:p-8">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-2xl font-extrabold tracking-tight">
          Where it is now
        </h2>
        <p className="tabular text-sm text-ash">
          Step {doneCount} of {steps.length}
        </p>
      </div>

      <ol className="relative mt-8 space-y-8">
        {/* The rail, and the filled part of it. */}
        <span
          aria-hidden
          className="absolute left-[19px] top-2 h-[calc(100%-2rem)] w-0.5 rounded-full bg-kaadige/12"
        />
        <motion.span
          aria-hidden
          className="absolute left-[19px] top-2 w-0.5 origin-top rounded-full bg-gradient-to-b from-turmeric via-chilli to-leaf"
          initial={{ height: 0 }}
          animate={{ height: `calc((100% - 2rem) * ${progress / 100})` }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        />

        {steps.map((step, i) => (
          <motion.li
            key={step.status}
            className="relative flex gap-5"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.09, duration: 0.5 }}
          >
            <span
              className={cn(
                "relative z-10 grid size-10 shrink-0 place-items-center rounded-full border-2 transition-colors",
                step.done
                  ? "border-transparent bg-leaf text-white"
                  : "border-kaadige/15 bg-mallige text-kaadige/25",
              )}
            >
              {step.done ? (
                <Check className="size-5" strokeWidth={3} />
              ) : (
                <CircleDot className="size-4" />
              )}
              {step.current && (
                <motion.span
                  className="absolute inset-0 rounded-full border-2 border-leaf"
                  animate={{ scale: [1, 1.55], opacity: [0.7, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                />
              )}
            </span>

            <div className={cn("pb-1", !step.done && "opacity-45")}>
              <p className="flex flex-wrap items-center gap-2 font-display text-lg font-extrabold tracking-tight">
                {step.label}
                {step.current && (
                  <span className="rounded-full bg-leaf/12 px-2.5 py-0.5 text-[0.625rem] font-black uppercase tracking-widest text-leaf">
                    Now
                  </span>
                )}
              </p>
              <p className="mt-0.5 text-sm text-ash">{step.message}</p>
              {step.at && (
                <p className="tabular mt-1 text-xs font-semibold text-kaadige/50">
                  {formatDateTime(step.at)}
                </p>
              )}
            </div>
          </motion.li>
        ))}
      </ol>

      {order.status !== "delivered" && (
        <p className="mt-8 rounded-2xl bg-turmeric/12 px-4 py-3 text-xs leading-relaxed text-kaadige/75">
          <strong>Demo note.</strong> There is no real warehouse behind this project, so
          the order walks itself along this timeline over the next half hour. Refresh to
          see it move.
        </p>
      )}
    </div>
  );
}
