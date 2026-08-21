"use client";

import { create } from "zustand";
import { api, cartTokenStore, tokenStore } from "@/lib/api";
import type { User } from "@/lib/types";

interface AuthState {
  user: User | null;
  ready: boolean; // true once the initial token check has settled
  setUser: (user: User | null) => void;
  hydrate: () => Promise<void>;
  login: (email: string, password: string) => Promise<User>;
  signup: (input: {
    full_name: string;
    email: string;
    phone?: string;
    password: string;
  }) => Promise<User>;
  logout: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  ready: false,

  setUser: (user) => set({ user }),

  hydrate: async () => {
    if (!tokenStore.get()) {
      set({ user: null, ready: true });
      return;
    }
    try {
      set({ user: await api.me(), ready: true });
    } catch {
      tokenStore.clear();
      set({ user: null, ready: true });
    }
  },

  login: async (email, password) => {
    const res = await api.login({ email, password });
    tokenStore.set(res.access_token);
    // The guest cart has been merged server-side; drop the guest token.
    cartTokenStore.clear();
    set({ user: res.user, ready: true });
    return res.user;
  },

  signup: async (input) => {
    const res = await api.signup(input);
    tokenStore.set(res.access_token);
    cartTokenStore.clear();
    set({ user: res.user, ready: true });
    return res.user;
  },

  logout: () => {
    tokenStore.clear();
    set({ user: null });
  },
}));
