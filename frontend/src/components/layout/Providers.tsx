"use client";

import { useEffect } from "react";
import { Toaster } from "sonner";
import { useAuth } from "@/store/useAuth";
import { useCart } from "@/store/useCart";

/**
 * Restores the session and the cart on first paint, then keeps them in sync:
 * signing in or out reloads the cart, because the server merges a guest cart
 * into the account at that moment.
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  const hydrate = useAuth((s) => s.hydrate);
  const user = useAuth((s) => s.user);
  const ready = useAuth((s) => s.ready);
  const refreshCart = useCart((s) => s.refresh);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (ready) refreshCart();
  }, [ready, user?.id, refreshCart]);

  return (
    <>
      {children}
      <Toaster
        position="bottom-right"
        offset={20}
        toastOptions={{
          style: {
            background: "rgba(255, 246, 233, 0.94)",
            backdropFilter: "blur(16px)",
            border: "1px solid var(--color-hairline)",
            color: "var(--color-kaadige)",
            borderRadius: "1rem",
            fontFamily: "var(--font-instrument)",
            fontWeight: 500,
            boxShadow: "0 20px 45px -20px rgba(36,18,9,.45)",
          },
        }}
      />
    </>
  );
}
