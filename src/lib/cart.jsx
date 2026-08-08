import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);

const KEY = (slug, tableId) => `vyapar360.cart.${slug}.${tableId || "counter"}`;

export function CartProvider({ vendorSlug, tableId = null, children }) {
  const [items, setItems] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!vendorSlug) return;
    try {
      const raw = localStorage.getItem(KEY(vendorSlug, tableId)) || (!tableId ? localStorage.getItem(`vyapar360.cart.${vendorSlug}`) : null);
      setItems(raw ? JSON.parse(raw) : []);
    } catch {
      setItems([]);
    }
    setHydrated(true);
  }, [vendorSlug, tableId]);

  useEffect(() => {
    if (!vendorSlug || !hydrated) return;
    localStorage.setItem(KEY(vendorSlug, tableId), JSON.stringify(items));
  }, [items, vendorSlug, tableId, hydrated]);

  const add = (item) => {
    setItems((prev) => {
      const idx = prev.findIndex((p) => p.id === item.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + 1 };
        return next;
      }
      return [...prev, { id: item.id, name: item.name, price: item.price, qty: 1, image: item.image }];
    });
  };
  const remove = (id) => setItems((prev) => prev.filter((p) => p.id !== id));
  const decrement = (id) =>
    setItems((prev) =>
      prev
        .map((p) => (p.id === id ? { ...p, qty: p.qty - 1 } : p))
        .filter((p) => p.qty > 0)
    );
  const increment = (id) =>
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, qty: p.qty + 1 } : p)));
  const clear = () => setItems([]);

  const subtotal = useMemo(() => items.reduce((s, i) => s + i.price * i.qty, 0), [items]);
  const count = useMemo(() => items.reduce((s, i) => s + i.qty, 0), [items]);
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + tax;

  return (
    <CartContext.Provider value={{ items, add, remove, increment, decrement, clear, subtotal, tax, total, count, tableId }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
