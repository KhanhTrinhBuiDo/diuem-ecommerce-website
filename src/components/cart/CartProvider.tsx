"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Variant } from "@/data/products";

/**
 * Giỏ hàng phía trình duyệt (lưu localStorage).
 * TODO(supabase): khi đã đăng nhập, đồng bộ giỏ vào bảng `carts`/`cart_items`.
 * TODO(checkout): GIÁ Ở ĐÂY CHỈ ĐỂ HIỂN THỊ. Khi đặt hàng, server phải tính lại giá từ database
 *   (không tin giá/số lượng từ trình duyệt).
 */
export type CartItem = {
  /** `${productId}:${variantId}` */
  key: string;
  productId: string;
  name: string;
  image: string | null;
  href: string;
  variants: Variant[];
  variantId: string;
  qty: number;
  selected: boolean;
};

const STORAGE_KEY = "diuem-cart-v1";
const keyOf = (productId: string, variantId: string) => `${productId}:${variantId}`;

type NewItem = Omit<CartItem, "key" | "qty" | "selected">;

/** Lần thêm gần nhất – dùng cho popup "Thêm vào giỏ hàng thành công". */
export type AddedInfo = { nonce: number; name: string; image: string | null; variantLabel: string; qty: number; price: number };

type Ctx = {
  items: CartItem[];
  lastAdded: AddedInfo | null;
  dismissAdded: () => void;
  /** false cho tới khi đã đọc xong localStorage (tránh lệch hydration) */
  ready: boolean;
  count: number;
  add: (item: NewItem, qty?: number) => void;
  setQty: (key: string, qty: number) => void;
  setVariant: (key: string, variantId: string) => void;
  toggle: (key: string) => void;
  toggleAll: (selected: boolean) => void;
  remove: (key: string) => void;
  clear: () => void;
};

const CartContext = createContext<Ctx | null>(null);

export function priceOf(item: CartItem): number {
  return (item.variants.find((v) => v.id === item.variantId) ?? item.variants[0]).price;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [lastAdded, setLastAdded] = useState<AddedInfo | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) setItems(parsed as CartItem[]);
      }
    } catch {
      /* localStorage bị chặn hoặc dữ liệu hỏng → bắt đầu giỏ trống */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* bỏ qua */
    }
  }, [items, ready]);

  const dismissAdded = useCallback(() => setLastAdded(null), []);

  const add = useCallback<Ctx["add"]>((item, qty = 1) => {
    const v = item.variants.find((x) => x.id === item.variantId) ?? item.variants[0];
    setLastAdded({ nonce: Date.now(), name: item.name, image: item.image, variantLabel: v.label, qty, price: v.price });
    const key = keyOf(item.productId, item.variantId);
    setItems((prev) =>
      prev.some((i) => i.key === key)
        ? prev.map((i) => (i.key === key ? { ...i, qty: Math.min(99, i.qty + qty) } : i))
        : [...prev, { ...item, key, qty, selected: true }],
    );
  }, []);

  const setQty = useCallback<Ctx["setQty"]>((key, qty) => setItems((p) => p.map((i) => (i.key === key ? { ...i, qty: Math.max(1, Math.min(99, qty)) } : i))), []);

  const setVariant = useCallback<Ctx["setVariant"]>((key, variantId) => {
    setItems((prev) => {
      const cur = prev.find((i) => i.key === key);
      if (!cur || cur.variantId === variantId) return prev;
      const newKey = keyOf(cur.productId, variantId);
      const dup = prev.find((i) => i.key === newKey);
      if (dup) {
        // Gộp vào dòng đã có cùng dung tích
        return prev.filter((i) => i.key !== key).map((i) => (i.key === newKey ? { ...i, qty: Math.min(99, i.qty + cur.qty) } : i));
      }
      return prev.map((i) => (i.key === key ? { ...i, key: newKey, variantId } : i));
    });
  }, []);

  const toggle = useCallback<Ctx["toggle"]>((key) => setItems((p) => p.map((i) => (i.key === key ? { ...i, selected: !i.selected } : i))), []);
  const toggleAll = useCallback<Ctx["toggleAll"]>((selected) => setItems((p) => p.map((i) => ({ ...i, selected }))), []);
  const remove = useCallback<Ctx["remove"]>((key) => setItems((p) => p.filter((i) => i.key !== key)), []);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<Ctx>(
    () => ({ items, lastAdded, dismissAdded, ready, count: items.reduce((n, i) => n + i.qty, 0), add, setQty, setVariant, toggle, toggleAll, remove, clear }),
    [items, lastAdded, dismissAdded, ready, add, setQty, setVariant, toggle, toggleAll, remove, clear],
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): Ctx {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart phải nằm trong <CartProvider>");
  return ctx;
}
