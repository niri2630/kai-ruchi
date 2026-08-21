"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useEffect, useState } from "react";
import { Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useAuth } from "@/store/useAuth";
import { useCart } from "@/store/useCart";
import { cn, initials } from "@/lib/utils";
import { FlipText, Magnetic } from "@/components/ui/Hover";
import { KolamMark } from "@/components/ui/Kolam";
import SearchOverlay from "./SearchOverlay";

const LINKS = [
  { href: "/products", label: "Shop" },
  { href: "/categories", label: "Categories" },
  { href: "/about", label: "About" },
  { href: "/track", label: "Track" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (value) => setScrolled(value > 24));

  const user = useAuth((s) => s.user);
  const cart = useCart((s) => s.cart);
  const addPulse = useCart((s) => s.addPulse);
  const openDrawer = useCart((s) => s.openDrawer);
  const count = cart?.item_count ?? 0;

  useEffect(() => setMenuOpen(false), [pathname]);

  // Cmd/Ctrl-K opens search, the way every shopper under 25 expects.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-5">
        <motion.nav
          className={cn(
            "pointer-events-auto mx-auto flex max-w-6xl items-center gap-2 rounded-full px-3 py-2.5 transition-all duration-500 sm:px-4",
            scrolled ? "glass-deep shadow-2xl" : "glass",
          )}
          initial={{ y: -70, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        >
          {/* Wordmark */}
          <Link href="/" className="group flex shrink-0 items-center gap-2 pl-1 pr-2">
            <motion.span
              whileHover={{ rotate: 90 }}
              transition={{ type: "spring", stiffness: 220, damping: 14 }}
              className="text-chilli"
            >
              <KolamMark size={26} />
            </motion.span>
            <span className="wordmark text-xl leading-none sm:text-[1.4rem]">
              Kai<span className="text-chilli">Ruchi</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="ml-2 hidden flex-1 items-center gap-1 lg:flex">
            {LINKS.map((link) => {
              const active =
                pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative rounded-full px-3.5 py-2 text-sm font-semibold transition-colors",
                    active ? "text-kaadige" : "text-kaadige/60 hover:text-kaadige",
                  )}
                >
                  <FlipText>{link.label}</FlipText>
                  {active && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 -z-10 rounded-full bg-turmeric/30"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          <div className="ml-auto flex items-center gap-1">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(true)}
              className="group hidden items-center gap-2 rounded-full border border-hairline/70 bg-white/45 py-2 pl-3 pr-2 text-sm text-kaadige/55 transition hover:border-turmeric hover:bg-white/70 hover:text-kaadige md:flex"
              aria-label="Search products"
            >
              <Search className="size-4" />
              <span className="pr-6">Search</span>
              <kbd className="rounded-md border border-hairline bg-white/70 px-1.5 py-0.5 font-mono text-[0.625rem] font-semibold">
                ⌘K
              </kbd>
            </button>
            <button
              onClick={() => setSearchOpen(true)}
              className="grid size-10 place-items-center rounded-full text-kaadige/70 transition hover:bg-kaadige/10 hover:text-kaadige md:hidden"
              aria-label="Search products"
            >
              <Search className="size-[18px]" />
            </button>

            {/* Account */}
            <Link
              href={user ? "/account" : "/login"}
              className="grid size-10 place-items-center rounded-full text-kaadige/70 transition hover:bg-kaadige/10 hover:text-kaadige"
              aria-label={user ? "Your account" : "Sign in"}
            >
              {user ? (
                <span className="grid size-8 place-items-center rounded-full bg-indigo text-[0.7rem] font-bold text-white">
                  {initials(user.full_name)}
                </span>
              ) : (
                <User className="size-[18px]" />
              )}
            </Link>

            {/* Cart */}
            <Magnetic strength={0.2}>
              <button
                onClick={openDrawer}
                className="clay relative grid size-11 place-items-center bg-chilli text-white [--clay-edge:var(--color-chilli-deep)]"
                aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`}
              >
                <ShoppingBag className="size-[18px]" />
                <AnimatePresence>
                  {count > 0 && (
                    <motion.span
                      key={`${count}-${addPulse}`}
                      initial={{ scale: 0, y: -6 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0 }}
                      transition={{ type: "spring", stiffness: 520, damping: 16 }}
                      className="tabular absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-turmeric text-[0.6875rem] font-black text-kaadige ring-2 ring-white"
                    >
                      {count}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </Magnetic>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMenuOpen((open) => !open)}
              className="grid size-10 place-items-center rounded-full text-kaadige transition hover:bg-kaadige/10 lg:hidden"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </motion.nav>
      </header>

      {/* Mobile sheet */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-kaadige/50 backdrop-blur-lg"
              onClick={() => setMenuOpen(false)}
            />
            <motion.nav
              className="glass-deep absolute inset-x-3 top-24 rounded-[2rem] p-3"
              initial={{ y: -20, opacity: 0, scale: 0.97 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -14, opacity: 0, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
            >
              {LINKS.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + i * 0.05 }}
                >
                  <Link
                    href={link.href}
                    className="flex items-center justify-between rounded-2xl px-4 py-3.5 font-display text-2xl font-bold tracking-tight transition hover:bg-turmeric/25"
                  >
                    {link.label}
                    <KolamMark size={18} className="text-chilli/50" />
                  </Link>
                </motion.div>
              ))}
              <div className="mt-2 border-t border-hairline/60 pt-2">
                <Link
                  href={user ? "/account" : "/login"}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3.5 font-semibold transition hover:bg-kaadige/8"
                >
                  <User className="size-4" />
                  {user ? `Signed in as ${user.full_name.split(" ")[0]}` : "Sign in or create an account"}
                </Link>
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
