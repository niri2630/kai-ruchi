"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Banknote, Check, Lock, ShoppingBag } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import { useAuth } from "@/store/useAuth";
import { useCart } from "@/store/useCart";
import type { PaymentIntent, ShippingInput } from "@/lib/types";
import { cn, money, num } from "@/lib/utils";
import { Field, Input, INDIAN_STATES, Select, Textarea } from "@/components/ui/Field";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ProductImage } from "@/components/ui/Bits";
import { PageHeader } from "@/components/ui/States";
import DemoGateway from "@/components/checkout/DemoGateway";

type Method = "razorpay" | "cod";

const EMPTY: ShippingInput = {
  full_name: "",
  phone: "",
  email: "",
  line1: "",
  line2: "",
  city: "",
  state: "Karnataka",
  pincode: "",
  notes: "",
};

export default function CheckoutPage() {
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const { cart, refresh } = useCart();

  const [form, setForm] = useState<ShippingInput>(EMPTY);
  const [method, setMethod] = useState<Method>("razorpay");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [placing, setPlacing] = useState(false);
  const [intent, setIntent] = useState<PaymentIntent | null>(null);

  const addresses = useApi(() => api.addresses(), [user?.id], { skip: !user });

  // Prefill from the account, then from the default saved address.
  useEffect(() => {
    if (!user) return;
    setForm((current) => ({
      ...current,
      full_name: current.full_name || user.full_name,
      email: current.email || user.email,
      phone: current.phone || user.phone || "",
    }));
  }, [user]);

  useEffect(() => {
    const saved = addresses.data?.find((a) => a.is_default) ?? addresses.data?.[0];
    if (!saved) return;
    setForm((current) => ({
      ...current,
      full_name: saved.full_name,
      phone: saved.phone,
      line1: saved.line1,
      line2: saved.line2 ?? "",
      city: saved.city,
      state: saved.state,
      pincode: saved.pincode,
    }));
  }, [addresses.data]);

  const set = (key: keyof ShippingInput, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (form.full_name.trim().length < 2) next.full_name = "We need a name for the parcel.";
    if (!/^[\d+\s-]{8,}$/.test(form.phone.trim()))
      next.phone = "A phone number the courier can call.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim()))
      next.email = "We send the tracking link here.";
    if (form.line1.trim().length < 5) next.line1 = "Street and building, please.";
    if (form.city.trim().length < 2) next.city = "Which city?";
    if (!/^\d{6}$/.test(form.pincode.trim())) next.pincode = "Six digits.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const placeOrder = async () => {
    if (!validate()) {
      toast.error("A few fields still need filling.");
      return;
    }
    setPlacing(true);
    try {
      const created = await api.checkout(
        { ...form, email: form.email.trim().toLowerCase() },
        method,
      );

      if (created.provider === "cod") {
        await api.verifyPayment({ order_number: created.order_number });
        await refresh();
        toast.success("Order placed. Pay the courier on delivery.");
        router.push(`/orders/${created.order_number}?email=${encodeURIComponent(form.email)}`);
        return;
      }

      // Mock and live both open a sheet; only live talks to Razorpay.
      setIntent(created);
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Couldn't place that order.",
      );
    } finally {
      setPlacing(false);
    }
  };

  const settle = async () => {
    if (!intent) return;
    try {
      await api.verifyPayment({ order_number: intent.order_number });
      await refresh();
      toast.success("Payment confirmed.");
      router.push(`/orders/${intent.order_number}?email=${encodeURIComponent(form.email)}`);
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "We couldn't confirm that payment.",
      );
      setIntent(null);
    }
  };

  const items = cart?.items ?? [];

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-6 py-40 text-center">
        <span className="mx-auto grid size-20 place-items-center rounded-full bg-turmeric/25">
          <ShoppingBag className="size-8 text-turmeric-deep" />
        </span>
        <h1 className="mt-7 font-display text-4xl font-extrabold tracking-tight">
          Nothing to check out
        </h1>
        <p className="mt-3 text-ash">Put something in the cart first.</p>
        <ButtonLink href="/products" size="lg" className="mt-7">
          Open the pantry
        </ButtonLink>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Last step"
        title="Where is it going?"
        blurb="One address, one payment, and it leaves the kitchen within a day."
      />

      <div className="mx-auto grid max-w-6xl gap-8 px-6 pb-24 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          {/* ------------------------------------------------- address --- */}
          <section className="glass rounded-[var(--radius-jar)] p-6 sm:p-8">
            <h2 className="font-display text-2xl font-extrabold tracking-tight">
              Delivery address
            </h2>

            {!user && (
              <p className="mt-3 rounded-2xl bg-turmeric/15 px-4 py-3 text-sm">
                Checking out as a guest.{" "}
                <Link href="/login" className="font-bold underline underline-offset-4">
                  Sign in
                </Link>{" "}
                to save this address and keep your order history.
              </p>
            )}

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field label="Full name" error={errors.full_name}>
                <Input
                  value={form.full_name}
                  onChange={(e) => set("full_name", e.target.value)}
                  placeholder="Who should the courier ask for?"
                  autoComplete="name"
                />
              </Field>
              <Field label="Phone" error={errors.phone}>
                <Input
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  placeholder="+91 98450 00000"
                  autoComplete="tel"
                  inputMode="tel"
                />
              </Field>
              <Field
                label="Email"
                hint="Tracking link goes here"
                error={errors.email}
                className="sm:col-span-2"
              >
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </Field>
              <Field label="Address" error={errors.line1} className="sm:col-span-2">
                <Input
                  value={form.line1}
                  onChange={(e) => set("line1", e.target.value)}
                  placeholder="Flat / house number, street"
                  autoComplete="address-line1"
                />
              </Field>
              <Field label="Landmark" hint="Optional" className="sm:col-span-2">
                <Input
                  value={form.line2 ?? ""}
                  onChange={(e) => set("line2", e.target.value)}
                  placeholder="Near the temple tank, opposite the bakery…"
                  autoComplete="address-line2"
                />
              </Field>
              <Field label="City" error={errors.city}>
                <Input
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                  placeholder="Udupi"
                  autoComplete="address-level2"
                />
              </Field>
              <Field label="PIN code" error={errors.pincode}>
                <Input
                  value={form.pincode}
                  onChange={(e) => set("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="576101"
                  inputMode="numeric"
                  autoComplete="postal-code"
                />
              </Field>
              <Field label="State" className="sm:col-span-2">
                <Select value={form.state} onChange={(e) => set("state", e.target.value)}>
                  {INDIAN_STATES.map((state) => (
                    <option key={state}>{state}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Anything we should know?" hint="Optional" className="sm:col-span-2">
                <Textarea
                  rows={2}
                  value={form.notes ?? ""}
                  onChange={(e) => set("notes", e.target.value)}
                  placeholder="Leave with the watchman, ring twice, no bell…"
                />
              </Field>
            </div>
          </section>

          {/* ------------------------------------------------- payment --- */}
          <section className="glass rounded-[var(--radius-jar)] p-6 sm:p-8">
            <h2 className="font-display text-2xl font-extrabold tracking-tight">
              How do you want to pay?
            </h2>

            <div className="mt-5 space-y-3">
              {[
                {
                  id: "razorpay" as Method,
                  icon: Lock,
                  title: "Pay now",
                  body: "UPI, card or netbanking — all simulated on a demo gateway.",
                  badge: "Demo",
                },
                {
                  id: "cod" as Method,
                  icon: Banknote,
                  title: "Cash on delivery",
                  body: "Hand the amount to the courier when the box arrives.",
                },
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => setMethod(option.id)}
                  className={cn(
                    "flex w-full items-start gap-4 rounded-2xl border p-5 text-left transition-all duration-300",
                    method === option.id
                      ? "border-transparent bg-kaadige text-mallige shadow-xl"
                      : "border-hairline bg-white/50 hover:border-kaadige/30 hover:bg-white/80",
                  )}
                >
                  <option.icon className="mt-0.5 size-5 shrink-0" />
                  <span className="flex-1">
                    <span className="flex items-center gap-2">
                      <span className="font-display text-lg font-extrabold tracking-tight">
                        {option.title}
                      </span>
                      {option.badge && (
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[0.625rem] font-black uppercase tracking-widest",
                            method === option.id
                              ? "bg-turmeric text-kaadige"
                              : "bg-indigo/12 text-indigo",
                          )}
                        >
                          {option.badge}
                        </span>
                      )}
                    </span>
                    <span
                      className={cn(
                        "mt-0.5 block text-sm",
                        method === option.id ? "text-mallige/65" : "text-ash",
                      )}
                    >
                      {option.body}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "mt-1 grid size-5 shrink-0 place-items-center rounded-full border-2 transition",
                      method === option.id ? "border-turmeric bg-turmeric" : "border-hairline",
                    )}
                  >
                    {method === option.id && (
                      <Check className="size-3 text-kaadige" strokeWidth={4} />
                    )}
                  </span>
                </button>
              ))}
            </div>

            <p className="mt-5 rounded-2xl bg-indigo/8 px-4 py-3 text-[0.75rem] leading-relaxed text-indigo">
              <strong>This is a college project.</strong> The payment step is a
              simulation — it never contacts a bank and never asks for a card number,
              UPI ID or any other credential.
            </p>
          </section>
        </div>

        {/* ------------------------------------------------------ summary */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="glass-deep rounded-[var(--radius-jar)] p-6">
            <h2 className="font-display text-2xl font-extrabold tracking-tight">
              Your order
            </h2>

            <ul className="mt-5 max-h-72 space-y-3 overflow-y-auto pr-1">
              {items.map((item) => (
                <li key={item.id} className="flex items-center gap-3">
                  <span className="relative size-14 shrink-0 overflow-hidden rounded-xl">
                    <ProductImage
                      src={item.product.image_url}
                      alt={item.product.name}
                      accent={item.product.category.accent}
                      sizes="56px"
                    />
                    <span className="tabular absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-kaadige text-[0.625rem] font-black text-mallige">
                      {item.quantity}
                    </span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-1 block text-sm font-bold">
                      {item.product.name}
                    </span>
                    <span className="block text-xs text-ash">{item.product.unit_label}</span>
                  </span>
                  <span className="tabular text-sm font-bold">{money(item.line_total)}</span>
                </li>
              ))}
            </ul>

            <div className="mt-5 space-y-2 border-t border-hairline pt-5 text-sm">
              <div className="flex justify-between">
                <span className="text-ash">Subtotal</span>
                <span className="tabular font-semibold">{money(cart!.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ash">Delivery</span>
                <span className="tabular font-semibold">
                  {num(cart!.shipping_fee) === 0 ? (
                    <span className="text-leaf">Free</span>
                  ) : (
                    money(cart!.shipping_fee)
                  )}
                </span>
              </div>
              <div className="flex items-baseline justify-between border-t border-hairline pt-3 font-display text-2xl font-extrabold">
                <span>Total</span>
                <span className="tabular">{money(cart!.total)}</span>
              </div>
            </div>

            <Button
              onClick={placeOrder}
              loading={placing}
              variant="ink"
              size="lg"
              className="mt-6 w-full"
            >
              {method === "cod" ? "Place order" : `Pay ${money(cart!.total)}`}
            </Button>

            <Link
              href="/cart"
              className="mt-4 block text-center text-xs font-semibold text-ash underline-offset-4 hover:text-kaadige hover:underline"
            >
              Back to cart
            </Link>
          </div>
        </aside>
      </div>

      <AnimatePresence>
        {intent && (
          <DemoGateway
            intent={intent}
            onPaid={settle}
            onFailed={() => {
              setIntent(null);
              toast.error("Payment failed. Nothing was charged — try again.");
            }}
            onClose={() => setIntent(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
