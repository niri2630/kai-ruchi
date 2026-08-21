"use client";

import { create } from "zustand";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import type { Cart } from "@/lib/types";

interface CartState {
  cart: Cart | null;
  loading: boolean;
  /** Product ids with a request in flight — drives per-button spinners. */
  pending: Set<number>;
  drawerOpen: boolean;
  /** Bumps on every add so the nav badge can pop. */
  addPulse: number;

  refresh: () => Promise<void>;
  add: (productId: number, quantity?: number, productName?: string) => Promise<void>;
  setQuantity: (itemId: number, quantity: number) => Promise<void>;
  remove: (itemId: number) => Promise<void>;
  clear: () => Promise<void>;
  openDrawer: () => void;
  closeDrawer: () => void;
  reset: () => void;
}

function fail(error: unknown, fallback: string) {
  toast.error(error instanceof ApiError ? error.message : fallback);
}

export const useCart = create<CartState>((set, get) => ({
  cart: null,
  loading: false,
  pending: new Set(),
  drawerOpen: false,
  addPulse: 0,

  refresh: async () => {
    set({ loading: true });
    try {
      set({ cart: await api.cart() });
    } catch {
      // A missing cart is not worth a toast on first paint.
    } finally {
      set({ loading: false });
    }
  },

  add: async (productId, quantity = 1, productName) => {
    const pending = new Set(get().pending).add(productId);
    set({ pending });
    try {
      const cart = await api.addToCart(productId, quantity);
      set({ cart, addPulse: get().addPulse + 1 });
      toast.success(productName ? `${productName} added` : "Added to your cart");
    } catch (error) {
      fail(error, "Couldn't add that to your cart.");
    } finally {
      const next = new Set(get().pending);
      next.delete(productId);
      set({ pending: next });
    }
  },

  setQuantity: async (itemId, quantity) => {
    try {
      set({ cart: await api.updateCartItem(itemId, quantity) });
    } catch (error) {
      fail(error, "Couldn't update that quantity.");
    }
  },

  remove: async (itemId) => {
    try {
      set({ cart: await api.removeCartItem(itemId) });
      toast("Removed from your cart");
    } catch (error) {
      fail(error, "Couldn't remove that item.");
    }
  },

  clear: async () => {
    try {
      set({ cart: await api.clearCart() });
    } catch (error) {
      fail(error, "Couldn't empty your cart.");
    }
  },

  openDrawer: () => set({ drawerOpen: true }),
  closeDrawer: () => set({ drawerOpen: false }),
  reset: () => set({ cart: null }),
}));
