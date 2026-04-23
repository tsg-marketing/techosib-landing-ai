import { useCallback, useEffect, useState } from "react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
}

const CART_KEY = "cart_items";
const CART_EVENT = "cart:updated";

function readCart(): CartItem[] {
  try {
    const stored = localStorage.getItem(CART_KEY);
    return stored ? (JSON.parse(stored) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function writeCart(items: CartItem[]) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
  try {
    window.dispatchEvent(
      new CustomEvent<CartItem[]>(CART_EVENT, { detail: items })
    );
  } catch {
    // ignore
  }
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>(() => readCart());

  useEffect(() => {
    const onCustom = (e: Event) => {
      const ce = e as CustomEvent<CartItem[]>;
      if (Array.isArray(ce.detail)) {
        setItems(ce.detail);
      } else {
        setItems(readCart());
      }
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === CART_KEY) setItems(readCart());
    };
    window.addEventListener(CART_EVENT, onCustom);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(CART_EVENT, onCustom);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const addItem = useCallback((item: CartItem) => {
    const current = readCart();
    if (current.find((i) => i.id === item.id)) return;
    const next = [...current, item];
    writeCart(next);
    setItems(next);
  }, []);

  const removeItem = useCallback((id: string) => {
    const current = readCart();
    const next = current.filter((i) => i.id !== id);
    writeCart(next);
    setItems(next);
  }, []);

  const clearCart = useCallback(() => {
    writeCart([]);
    setItems([]);
  }, []);

  const total = items.reduce((sum, i) => sum + i.price, 0);

  return { items, addItem, removeItem, clearCart, total };
}
