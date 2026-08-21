"use client";

import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

/** lucide dropped brand marks, so the Instagram glyph is drawn here. */
function InstagramGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" />
    </svg>
  );
}
import { KolamMark } from "@/components/ui/Kolam";
import { UnderlineLink } from "@/components/ui/Hover";
import { VelocityMarquee } from "@/components/ui/Scroll";

const SHOP = [
  { href: "/products", label: "Everything" },
  { href: "/categories/masalas", label: "Masalas" },
  { href: "/categories/pickles", label: "Pickles" },
  { href: "/categories/fresh-batters", label: "Fresh batters" },
  { href: "/categories/snacks", label: "Snacks" },
  { href: "/categories/sweets", label: "Sweets" },
];

const HELP = [
  { href: "/track", label: "Track an order" },
  { href: "/orders", label: "Your orders" },
  { href: "/contact", label: "Contact us" },
  { href: "/about", label: "Our story" },
];

export default function Footer() {
  return (
    <footer className="relative mt-24 overflow-hidden bg-leaf-deep text-mallige">
      {/* Banana-leaf rib texture along the top edge. */}
      <div
        aria-hidden
        className="h-8 w-full opacity-25"
        style={{
          backgroundImage:
            "repeating-linear-gradient(100deg, transparent 0 10px, rgba(255,246,233,.5) 10px 11px)",
        }}
      />

      <VelocityMarquee baseVelocity={2} className="border-y border-mallige/15 py-4">
        <span className="wordmark flex items-center gap-6 pr-6 text-2xl text-mallige/35 sm:text-3xl">
          Kai Ruchi
          <KolamMark size={20} className="text-turmeric" />
          ಕೈ ರುಚಿ
          <KolamMark size={20} className="text-chilli" />
          கை ருசி
          <KolamMark size={20} className="text-turmeric" />
          The taste only hands can make
          <KolamMark size={20} className="text-chilli" />
        </span>
      </VelocityMarquee>

      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <p className="wordmark text-3xl">
            Kai<span className="text-turmeric">Ruchi</span>
          </p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-mallige/65">
            Masalas ground, pickles cured and batters fermented in one kitchen in
            Udupi. Small batches, dated by hand.
          </p>
          <div className="mt-5 flex gap-2">
            {[InstagramGlyph, Mail, Phone].map((Icon, i) => (
              <span
                key={i}
                className="grid size-9 place-items-center rounded-full border border-mallige/20 text-mallige/70 transition hover:border-turmeric hover:bg-turmeric hover:text-kaadige"
              >
                <Icon className="size-4" />
              </span>
            ))}
          </div>
        </div>

        <nav>
          <p className="eyebrow text-turmeric">Shop</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {SHOP.map((link) => (
              <li key={link.href}>
                <UnderlineLink
                  href={link.href}
                  className="text-mallige/70 transition-colors hover:text-mallige"
                  color="var(--color-turmeric)"
                >
                  {link.label}
                </UnderlineLink>
              </li>
            ))}
          </ul>
        </nav>

        <nav>
          <p className="eyebrow text-turmeric">Help</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {HELP.map((link) => (
              <li key={link.href}>
                <UnderlineLink
                  href={link.href}
                  className="text-mallige/70 transition-colors hover:text-mallige"
                  color="var(--color-turmeric)"
                >
                  {link.label}
                </UnderlineLink>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="eyebrow text-turmeric">The kitchen</p>
          <address className="mt-4 space-y-3 text-sm not-italic text-mallige/70">
            <p className="flex gap-2.5">
              <MapPin className="mt-0.5 size-4 shrink-0 text-turmeric" />
              <span>
                2nd Cross, Car Street
                <br />
                Udupi, Karnataka 576101
              </span>
            </p>
            <p className="flex gap-2.5">
              <Phone className="mt-0.5 size-4 shrink-0 text-turmeric" />
              <span>+91 98450 00000</span>
            </p>
            <p className="flex gap-2.5">
              <Mail className="mt-0.5 size-4 shrink-0 text-turmeric" />
              <span>hello@kairuchi.in</span>
            </p>
          </address>
        </div>
      </div>

      <div className="border-t border-mallige/12 px-6 py-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-xs text-mallige/45 sm:flex-row">
          <p>© {new Date().getFullYear()} Kai Ruchi. Built as a college mini project.</p>
          <p className="flex items-center gap-4">
            <Link href="/about" className="transition hover:text-mallige">
              Our story
            </Link>
            <span className="opacity-40">·</span>
            <Link href="/contact" className="transition hover:text-mallige">
              Contact
            </Link>
            <span className="opacity-40">·</span>
            <span>Payments run in demo mode</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
