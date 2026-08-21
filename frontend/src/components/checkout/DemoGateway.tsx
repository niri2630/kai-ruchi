"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Check, CreditCard, Landmark, Lock, Smartphone, X } from "lucide-react";
import type { PaymentIntent } from "@/lib/types";
import { money } from "@/lib/utils";
import { cn } from "@/lib/utils";

/**
 * A stand-in for a payment gateway.
 *
 * This project has no merchant account, so nothing here talks to a bank and
 * nothing here asks for a card number, UPI PIN or any other credential — there
 * are deliberately no credential fields at all. Picking a method and pressing
 * pay simply tells our own API that the order was paid.
 *
 * The failure path is a real button so the error handling can be demonstrated
 * too, not just the happy path.
 */

type Method = "upi" | "card" | "netbanking";

const METHODS: { id: Method; label: string; hint: string; icon: typeof Smartphone }[] = [
  { id: "upi", label: "UPI", hint: "Simulated · any UPI app", icon: Smartphone },
  { id: "card", label: "Card", hint: "Simulated · no details collected", icon: CreditCard },
  { id: "netbanking", label: "Netbanking", hint: "Simulated · no bank contacted", icon: Landmark },
];

export default function DemoGateway({
  intent,
  onPaid,
  onFailed,
  onClose,
}: {
  intent: PaymentIntent;
  onPaid: () => void;
  onFailed: () => void;
  onClose: () => void;
}) {
  const [method, setMethod] = useState<Method>("upi");
  const [phase, setPhase] = useState<"idle" | "processing" | "done">("idle");

  const pay = () => {
    setPhase("processing");
    // A beat of latency so the flow reads like a real redirect.
    setTimeout(() => {
      setPhase("done");
      setTimeout(onPaid, 700);
    }, 1600);
  };

  return (
    <motion.div
      className="fixed inset-0 z-[120] flex items-end justify-center sm:items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-kaadige/60 backdrop-blur-md" />

      <motion.div
        role="dialog"
        aria-label="Demo payment"
        className="glass-deep relative w-full max-w-md overflow-hidden rounded-t-[2rem] sm:rounded-[2rem]"
        initial={{ y: 60, scale: 0.97, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 28 }}
      >
        {/* Demo badge — the first thing you read, on purpose. */}
        <div className="flex items-center justify-between bg-indigo px-6 py-3 text-mallige">
          <p className="flex items-center gap-2 text-[0.6875rem] font-black uppercase tracking-[0.18em]">
            <Lock className="size-3.5" />
            Demo gateway · no real payment
          </p>
          {phase === "idle" && (
            <button
              onClick={onClose}
              className="grid size-7 place-items-center rounded-full transition hover:bg-white/20"
              aria-label="Cancel payment"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {phase === "done" ? (
            <motion.div
              key="done"
              className="flex flex-col items-center gap-4 px-8 py-16 text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <motion.span
                className="grid size-20 place-items-center rounded-full bg-leaf text-white"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 320, damping: 16 }}
              >
                <Check className="size-10" strokeWidth={3} />
              </motion.span>
              <p className="font-display text-3xl font-extrabold tracking-tight">Paid</p>
              <p className="text-sm text-ash">Taking you to your order…</p>
            </motion.div>
          ) : phase === "processing" ? (
            <motion.div
              key="processing"
              className="flex flex-col items-center gap-5 px-8 py-16 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <span className="relative grid size-20 place-items-center">
                <motion.span
                  className="absolute inset-0 rounded-full border-4 border-turmeric/25 border-t-turmeric"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
                />
                <Lock className="size-7 text-turmeric-deep" />
              </span>
              <div>
                <p className="font-display text-2xl font-extrabold tracking-tight">
                  Simulating payment
                </p>
                <p className="mt-1 text-sm text-ash">
                  Nothing is being charged. This is a demo.
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              className="p-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="text-center">
                <p className="eyebrow text-ash">Paying Kai Ruchi</p>
                <p className="tabular mt-1 font-display text-5xl font-extrabold tracking-tight">
                  {money(intent.amount_paise / 100)}
                </p>
                <p className="tabular mt-1 text-xs text-ash">
                  Order {intent.order_number}
                </p>
              </div>

              <div className="mt-7 space-y-2">
                {METHODS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setMethod(item.id)}
                    className={cn(
                      "flex w-full items-center gap-3.5 rounded-2xl border p-4 text-left transition-all duration-300",
                      method === item.id
                        ? "border-transparent bg-kaadige text-mallige shadow-lg"
                        : "border-hairline bg-white/50 hover:border-kaadige/30 hover:bg-white/80",
                    )}
                  >
                    <item.icon className="size-5 shrink-0" />
                    <span className="flex-1">
                      <span className="block text-sm font-bold">{item.label}</span>
                      <span
                        className={cn(
                          "block text-[0.6875rem]",
                          method === item.id ? "text-mallige/60" : "text-ash",
                        )}
                      >
                        {item.hint}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "grid size-5 shrink-0 place-items-center rounded-full border-2 transition",
                        method === item.id
                          ? "border-turmeric bg-turmeric"
                          : "border-hairline",
                      )}
                    >
                      {method === item.id && (
                        <Check className="size-3 text-kaadige" strokeWidth={4} />
                      )}
                    </span>
                  </button>
                ))}
              </div>

              <button
                onClick={pay}
                className="clay mt-6 w-full bg-leaf py-4 font-display text-lg font-extrabold text-white [--clay-edge:var(--color-leaf-deep)]"
              >
                Pay {money(intent.amount_paise / 100)}
              </button>

              <button
                onClick={onFailed}
                className="mt-3 w-full text-center text-xs font-semibold text-ash underline-offset-4 transition hover:text-chilli hover:underline"
              >
                Simulate a failed payment instead
              </button>

              <p className="mt-5 rounded-2xl bg-indigo/8 px-4 py-3 text-center text-[0.6875rem] leading-relaxed text-indigo">
                No card, UPI ID or bank credential is asked for or stored anywhere in
                this project.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
