"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Check, Eye, EyeOff } from "lucide-react";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/store/useAuth";
import { Field, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { KolamMark } from "@/components/ui/Kolam";
import { WordsIn } from "@/components/ui/Reveal";

const PERKS = [
  "Your cart follows you between devices",
  "Save addresses so checkout is two taps",
  "Review anything you have actually bought",
  "Track every order without the number",
];

function SignupInner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/";
  const signup = useAuth((s) => s.signup);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  const set = (key: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const strong = form.password.length >= 8;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!strong) {
      toast.error("Passwords need at least 8 characters.");
      return;
    }
    setBusy(true);
    try {
      const user = await signup({
        full_name: form.full_name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim() || undefined,
        password: form.password,
      });
      toast.success(`Welcome, ${user.full_name.split(" ")[0]}.`);
      router.push(next);
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Couldn't create that account.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[100svh] max-w-6xl items-center px-6 py-32">
      <div className="grid w-full gap-14 lg:grid-cols-2 lg:items-center">
        <div className="hidden lg:block">
          <KolamMark size={44} className="text-leaf" />
          <h1 className="mt-7 font-display text-[clamp(2.5rem,5vw,4.25rem)] font-extrabold leading-[0.9] tracking-tight">
            <WordsIn text="Pull up a" />
            <br />
            <WordsIn text="chair" delay={0.2} highlight={["chair"]} />
          </h1>
          <ul className="mt-8 space-y-3">
            {PERKS.map((perk) => (
              <li key={perk} className="flex items-center gap-3 text-ash">
                <span className="grid size-5 shrink-0 place-items-center rounded-full bg-leaf text-white">
                  <Check className="size-3" strokeWidth={3.5} />
                </span>
                {perk}
              </li>
            ))}
          </ul>
        </div>

        <form onSubmit={submit} className="glass-deep rounded-[2rem] p-8 sm:p-10">
          <h2 className="font-display text-3xl font-extrabold tracking-tight lg:hidden">
            Create an account
          </h2>
          <p className="eyebrow hidden text-leaf lg:block">Create an account</p>

          <div className="mt-6 space-y-4">
            <Field label="Full name">
              <Input
                value={form.full_name}
                onChange={(event) => set("full_name", event.target.value)}
                placeholder="Your name"
                autoComplete="name"
                required
                minLength={2}
              />
            </Field>
            <Field label="Email">
              <Input
                type="email"
                value={form.email}
                onChange={(event) => set("email", event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </Field>
            <Field label="Phone" hint="Optional — for delivery updates">
              <Input
                value={form.phone}
                onChange={(event) => set("phone", event.target.value)}
                placeholder="+91 98450 00000"
                autoComplete="tel"
                inputMode="tel"
              />
            </Field>
            <Field label="Password" hint="At least 8 characters">
              <div className="relative">
                <Input
                  type={show ? "text" : "password"}
                  value={form.password}
                  onChange={(event) => set("password", event.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="pr-12"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  aria-label={show ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-ash transition hover:bg-kaadige/10 hover:text-kaadige"
                >
                  {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {form.password.length > 0 && (
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-kaadige/10">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      strong ? "w-full bg-leaf" : "w-1/3 bg-chilli"
                    }`}
                  />
                </div>
              )}
            </Field>
          </div>

          <Button
            type="submit"
            variant="leaf"
            size="lg"
            loading={busy}
            className="mt-6 w-full"
          >
            Create account
          </Button>

          <p className="mt-5 text-center text-sm text-ash">
            Already have one?{" "}
            <Link
              href={`/login${next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}`}
              className="font-bold text-chilli underline underline-offset-4"
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="px-6 pt-40" />}>
      <SignupInner />
    </Suspense>
  );
}
