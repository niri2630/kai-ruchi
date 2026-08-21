"use client";

import { AlertTriangle, RotateCw, SearchX } from "lucide-react";
import { Button, ButtonLink } from "./Button";

/** Shown when the API can't be reached. Says what to do, not just what broke. */
export function ErrorState({
  message,
  onRetry,
  className,
}: {
  message: string;
  onRetry?: () => void;
  className?: string;
}) {
  const offline = message.toLowerCase().includes("reach the kitchen");
  return (
    <div
      className={`glass mx-auto max-w-lg rounded-[var(--radius-jar)] p-10 text-center ${className ?? ""}`}
    >
      <span className="mx-auto grid size-14 place-items-center rounded-full bg-chilli/15">
        <AlertTriangle className="size-6 text-chilli" />
      </span>
      <p className="mt-5 font-display text-2xl font-extrabold tracking-tight">
        {offline ? "The kitchen isn't answering" : "That didn't load"}
      </p>
      <p className="mt-2 text-sm text-ash">{message}</p>
      {offline && (
        <p className="mt-4 rounded-2xl bg-kaadige/6 px-4 py-3 text-left font-mono text-[0.6875rem] leading-relaxed text-ash">
          Start the API, then retry:
          <br />
          <span className="text-kaadige">cd backend</span>
          <br />
          <span className="text-kaadige">
            .venv\Scripts\python -m uvicorn app.main:app --reload
          </span>
        </p>
      )}
      {onRetry && (
        <Button onClick={onRetry} variant="clay" size="md" className="mt-6" icon={<RotateCw className="size-4" />}>
          Try again
        </Button>
      )}
    </div>
  );
}

/** Nothing matched. An empty screen is an invitation to act. */
export function EmptyState({
  title,
  body,
  actionHref = "/products",
  actionLabel = "Browse everything",
}: {
  title: string;
  body: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="glass mx-auto max-w-lg rounded-[var(--radius-jar)] p-12 text-center">
      <span className="mx-auto grid size-14 place-items-center rounded-full bg-turmeric/20">
        <SearchX className="size-6 text-turmeric-deep" />
      </span>
      <p className="mt-5 font-display text-2xl font-extrabold tracking-tight">{title}</p>
      <p className="mt-2 text-sm text-ash">{body}</p>
      <ButtonLink href={actionHref} variant="clay" size="md" className="mt-6">
        {actionLabel}
      </ButtonLink>
    </div>
  );
}

/** Standard page shell so every route has the same rhythm. */
export function PageHeader({
  eyebrow,
  title,
  blurb,
  children,
}: {
  eyebrow: string;
  title: string;
  blurb?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="mx-auto max-w-6xl px-6 pb-10 pt-36 sm:pt-40">
      <p className="eyebrow text-chilli">{eyebrow}</p>
      <h1 className="mt-3 font-display text-[clamp(2.5rem,7vw,5rem)] font-extrabold leading-[0.9] tracking-tight">
        {title}
      </h1>
      {blurb && <p className="mt-5 max-w-2xl text-base leading-relaxed text-ash sm:text-lg">{blurb}</p>}
      {children}
    </header>
  );
}
