"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/store/useAuth";
import { Field, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { KolamMark } from "@/components/ui/Kolam";
import { WordsIn } from "@/components/ui/Reveal";

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/";
  const login = useAuth((s) => s.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      const user = await login(email.trim().toLowerCase(), password);
      toast.success(`Welcome back, ${user.full_name.split(" ")[0]}.`);
      router.push(next);
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Couldn't sign you in.",
      );
    } finally {
      setBusy(false);
    }
  };

  const useDemo = () => {
    setEmail("meera@example.com");
    setPassword("kairuchi123");
    toast("Demo account filled in. Press sign in.");
  };

  return (
    <div className="mx-auto flex min-h-[100svh] max-w-6xl items-center px-6 py-32">
      <div className="grid w-full gap-14 lg:grid-cols-2 lg:items-center">
        {/* Left — the welcome */}
        <div className="hidden lg:block">
          <KolamMark size={44} className="text-chilli" />
          <h1 className="mt-7 font-display text-[clamp(2.5rem,5vw,4.25rem)] font-extrabold leading-[0.9] tracking-tight">
            <WordsIn text="Good to see" />
            <br />
            <WordsIn text="you again" delay={0.2} highlight={["again"]} />
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-ash">
            Your cart, your addresses and every order you have placed are waiting on the
            other side of this form.
          </p>
        </div>

        {/* Right — the form */}
        <form onSubmit={submit} className="glass-deep rounded-[2rem] p-8 sm:p-10">
          <h2 className="font-display text-3xl font-extrabold tracking-tight lg:hidden">
            Sign in
          </h2>
          <p className="eyebrow hidden text-chilli lg:block">Sign in</p>

          <div className="mt-6 space-y-4">
            <Field label="Email">
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </Field>

            <Field label="Password">
              <div className="relative">
                <Input
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="pr-12"
                  required
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
            </Field>
          </div>

          <Button
            type="submit"
            variant="ink"
            size="lg"
            loading={busy}
            className="mt-6 w-full"
          >
            Sign in
          </Button>

          <p className="mt-5 text-center text-sm text-ash">
            New here?{" "}
            <Link
              href={`/signup${next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}`}
              className="font-bold text-chilli underline underline-offset-4"
            >
              Create an account
            </Link>
          </p>

          <div className="mt-6 rounded-2xl border border-dashed border-hairline bg-turmeric/8 p-4 text-center">
            <p className="text-xs font-bold">Marking this project?</p>
            <p className="mt-1 text-xs text-ash">
              Use the seeded demo account instead of signing up.
            </p>
            <button
              type="button"
              onClick={useDemo}
              className="mt-2.5 rounded-full bg-kaadige px-4 py-2 text-xs font-bold text-mallige transition hover:brightness-125"
            >
              Fill in demo credentials
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="px-6 pt-40" />}>
      <LoginInner />
    </Suspense>
  );
}
