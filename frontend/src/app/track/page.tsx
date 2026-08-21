"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { PackageSearch } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { Field, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/States";
import { Reveal } from "@/components/ui/Reveal";

/** Guest tracking: order number plus the email it was placed with. */
export default function TrackPage() {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [checking, setChecking] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const number = orderNumber.trim().toUpperCase();
    const mail = email.trim().toLowerCase();

    if (!number || !mail) {
      toast.error("We need both the order number and the email.");
      return;
    }

    setChecking(true);
    try {
      await api.order(number, mail);
      router.push(`/orders/${number}?email=${encodeURIComponent(mail)}`);
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Couldn't find that order. Check both fields.",
      );
    } finally {
      setChecking(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="No account needed"
        title="Track an order"
        blurb="Enter the order number from your confirmation, plus the email you placed it with."
      />

      <div className="mx-auto max-w-lg px-6 pb-32">
        <Reveal>
          <form onSubmit={submit} className="glass-deep rounded-[var(--radius-jar)] p-7">
            <span className="mx-auto grid size-14 place-items-center rounded-full bg-turmeric/20">
              <PackageSearch className="size-6 text-turmeric-deep" />
            </span>

            <div className="mt-6 space-y-4">
              <Field label="Order number" hint="Looks like KR2508-4F9C">
                <Input
                  value={orderNumber}
                  onChange={(event) => setOrderNumber(event.target.value.toUpperCase())}
                  placeholder="KR2508-4F9C"
                  className="tabular font-display text-lg font-bold tracking-tight"
                />
              </Field>
              <Field label="Email on the order">
                <Input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </Field>
            </div>

            <Button
              type="submit"
              variant="ink"
              size="lg"
              loading={checking}
              className="mt-6 w-full"
            >
              Find my order
            </Button>

            <p className="mt-5 text-center text-xs text-ash">
              Signed in?{" "}
              <a href="/orders" className="font-bold text-chilli underline underline-offset-4">
                All your orders are here
              </a>
              .
            </p>
          </form>
        </Reveal>
      </div>
    </>
  );
}
