"use client";

import { createContext, useContext, useMemo, ReactNode } from "react";
import { parseJSON, readStorage, useStoredString, writeStorage } from "@/lib/storage";

// Every listing is a single, one-of-a-kind item, so the bag holds each piece at most once.
export type CartItem = { id: number; title: string; brand?: string; sellerName?: string; price: number; image?: string };

type CartContextType = {
  cart: CartItem[];
  count: number;
  subtotal: number;
  /** Returns false if the piece was already in the bag. */
  addToCart: (item: CartItem) => boolean;
  removeItem: (id: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | null>(null);

const KEY = "cart";

// Drop malformed entries and duplicates left by older versions of the bag.
const parse = (raw: string | null) =>
  parseJSON<Partial<CartItem>[]>(raw, [])
    .filter((i): i is CartItem => typeof i?.id === "number" && typeof i.price === "number")
    .filter((i, idx, all) => all.findIndex((x) => x.id === i.id) === idx);
const current = () => parse(readStorage(KEY));
const save = (items: CartItem[]) => writeStorage(KEY, JSON.stringify(items));

export function CartProvider({ children }: { children: ReactNode }) {
  const raw = useStoredString(KEY);

  const value = useMemo(() => {
    const cart = parse(raw);
    return {
      cart,
      count: cart.length,
      subtotal: cart.reduce((s, i) => s + i.price, 0),
      addToCart: (item: CartItem) => {
        const items = current();
        if (items.some((i) => i.id === item.id)) return false;
        save([...items, item]);
        return true;
      },
      removeItem: (id: number) => save(current().filter((i) => i.id !== id)),
      clearCart: () => save([]),
    };
  }, [raw]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
