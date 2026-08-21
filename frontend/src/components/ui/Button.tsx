"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "clay" | "ink" | "ghost" | "glass" | "leaf";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  clay: "clay bg-turmeric text-kaadige [--clay-edge:var(--color-turmeric-deep)]",
  ink: "clay bg-chilli text-white [--clay-edge:var(--color-chilli-deep)]",
  leaf: "clay bg-leaf text-white [--clay-edge:var(--color-leaf-deep)]",
  glass:
    "glass text-kaadige hover:bg-white/75 transition-colors duration-200 rounded-full",
  ghost:
    "text-kaadige/80 hover:text-kaadige hover:bg-kaadige/8 rounded-full transition-colors duration-200",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-4 text-[0.8125rem]",
  md: "h-12 px-6 text-[0.9375rem]",
  lg: "h-14 px-8 text-base",
};

interface BaseProps {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
}

function classes(variant: Variant, size: Size, className?: string) {
  return cn(
    "inline-flex items-center justify-center gap-2 font-semibold whitespace-nowrap",
    "disabled:opacity-55 disabled:pointer-events-none select-none",
    VARIANTS[variant],
    SIZES[size],
    className,
  );
}

export function Button({
  variant = "clay",
  size = "md",
  loading,
  icon,
  className,
  children,
  ...rest
}: BaseProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={classes(variant, size, className)}
      disabled={loading || rest.disabled}
      {...rest}
    >
      {loading ? <Loader2 className="size-4 animate-spin" /> : icon}
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  variant = "clay",
  size = "md",
  icon,
  className,
  children,
}: BaseProps & { href: string }) {
  return (
    <Link href={href} className={classes(variant, size, className)}>
      {icon}
      {children}
    </Link>
  );
}
