"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type CartItem = { title: string; price: number };

type CartContextType = {
  cart: CartItem[];
  addToCart: (title: string, price: number) => void;
  removeItem: (index: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    setCart(JSON.parse(localStorage.getItem("cart") || "[]"));
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (title: string, price: number) => {
    setCart((c) => [...c, { title, price }]);
  };

  const removeItem = (index: number) => {
    setCart((c) => c.filter((_, i) => i !== index));
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
