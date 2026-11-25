"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { lookupCartItems, loadMyCart, saveMyCart } from "@/app/(site)/gio-hang/actions";
import { useAuthModal } from "@/components/auth/AuthProvider";
import type { Variant } from "@/data/products";
import { CART_STORAGE_KEY, type CartLine, type CartProductInfo } from "@/lib/checkout";

/**
 * Giỏ hàng: lưu localStorage (khách vãng lai) + đồng bộ vào bảng `customer_carts` khi đã đăng nhập
 * (gộp giỏ trình duyệt với giỏ đã lưu khi đăng nhập; tên/giá/tồn kho luôn lấy lại từ catalog).
 * GIÁ Ở ĐÂY CHỈ ĐỂ HIỂN THỊ. Khi đặt hàng, server (`place_order`) tính lại giá từ database.
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

/** SKU là duy nhất toàn cửa hàng → dùng làm khóa dòng giỏ (không phụ thuộc cách thêm từ thẻ SP hay trang chi tiết). */
const keyOf = (_productId: string, variantId: string) => variantId;

type NewItem = Omit<CartItem, "key" | "qty" | "selected">;

/** Lần thêm gần nhất – dùng cho popup "Thêm vào giỏ hàng thành công". */
export type AddedInfo = { nonce: number; name: string; image: string | null; variantLabel: string; qty: number; price: number };

type Ctx = {
  items: CartItem[];
  lastAdded: AddedInfo | null;
  dismissAdded: () => void;
  /** false cho tới khi đã đọc xong localStorage (tránh lệch hydration) */
  ready: boolean;
  /** Thông báo sau khi đối chiếu với kho (vd "đã bỏ sản phẩm không còn bán") */
  notice: string;
  clearNotice: () => void;
  /** Đối chiếu lại giỏ với catalog (giá, còn hàng, sản phẩm đã ngừng bán) */
  refresh: () => Promise<void>;
  /** Xóa các dòng theo khóa (vd các dòng vừa đặt xong) */
  removeMany: (keys: string[]) => void;
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

export const variantOf = (item: CartItem): Variant => item.variants.find((v) => v.id === item.variantId) ?? item.variants[0];
export function priceOf(item: CartItem): number {
  return variantOf(item).price;
}
/** Dòng được chọn VÀ còn hàng → sẽ được đặt. */
export const isOrderable = (item: CartItem) => item.selected && variantOf(item).available;

const toLines = (items: CartItem[]): CartLine[] => items.map((i) => ({ sku: i.variantId, qty: i.qty, selected: i.selected }));
const sameLines = (a: CartLine[], b: CartLine[]) => JSON.stringify(a) === JSON.stringify(b);

/** Áp thông tin mới từ catalog lên các dòng; trả về dòng còn bán + danh sách SKU đã bỏ. */
function applyInfo(items: CartItem[], info: Record<string, CartProductInfo>): { items: CartItem[]; dropped: string[] } {
  const out: CartItem[] = [];
  const dropped: string[] = [];
  for (const i of items) {
    const p = info[i.variantId];
    if (!p) { dropped.push(i.name); continue; }
    const next: CartItem = { ...i, key: keyOf(p.productId, i.variantId), productId: p.productId, name: p.name, image: p.image, href: p.href, variants: p.variants };
    const dup = out.find((o) => o.key === next.key);
    if (dup) dup.qty = Math.min(99, dup.qty + next.qty);
    else out.push(next);
  }
  return { items: out, dropped };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuthModal();
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [lastAdded, setLastAdded] = useState<AddedInfo | null>(null);
  const [notice, setNotice] = useState("");
  const itemsRef = useRef<CartItem[]>([]);
  itemsRef.current = items;
  /** id người dùng đã gộp giỏ xong với server (chỉ lúc đó mới ghi ngược lên server) */
  const [syncedFor, setSyncedFor] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const seen = new Set<string>();
          const clean: CartItem[] = [];
          for (const r of parsed as CartItem[]) {
            if (!r || typeof r.variantId !== "string" || !Array.isArray(r.variants) || !r.variants.length) continue;
            const key = keyOf(r.productId, r.variantId);
            if (seen.has(key)) continue;
            seen.add(key);
            clean.push({ ...r, key, qty: Math.max(1, Math.min(99, Math.trunc(Number(r.qty)) || 1)), selected: r.selected !== false });
          }
          setItems(clean);
        }
      }
    } catch {
      /* localStorage bị chặn hoặc dữ liệu hỏng → bắt đầu giỏ trống */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* bỏ qua */
    }
  }, [items, ready]);

  /** Đối chiếu với catalog: cập nhật giá/tồn kho, bỏ sản phẩm không còn bán. */
  const refresh = useCallback(async () => {
    const cur = itemsRef.current;
    if (!cur.length) return;
    try {
      const info = await lookupCartItems(cur.map((i) => i.variantId));
      const { items: next, dropped } = applyInfo(itemsRef.current, info);
      // chỉ ghi khi có thay đổi thật (tránh vòng lặp render)
      if (JSON.stringify(next) !== JSON.stringify(itemsRef.current)) setItems(next);
      if (dropped.length) setNotice(`Đã bỏ khỏi giỏ hàng ${dropped.length} sản phẩm không còn được bán: ${dropped.join(", ")}.`);
    } catch {
      /* mất mạng: giữ nguyên giỏ, server vẫn kiểm tra lại khi đặt hàng */
    }
  }, []);

  const refreshed = useRef(false);
  useEffect(() => {
    if (!ready || refreshed.current) return;
    refreshed.current = true;
    void refresh();
  }, [ready, refresh]);

  // Đăng nhập → gộp giỏ trình duyệt với giỏ đã lưu trên server (cùng SKU lấy số lượng lớn hơn)
  const userId = user?.id ?? null;
  useEffect(() => {
    if (!ready) return;
    if (!userId) { setSyncedFor(null); return; }
    let alive = true;
    (async () => {
      const remote = await loadMyCart();
      if (!alive) return;
      if (!remote.signedIn) return; // chưa có hồ sơ khách / lỗi mạng: không ghi đè giỏ trên server
      const local = toLines(itemsRef.current);
      const merged = new Map<string, CartLine>(remote.lines.map((l) => [l.sku, l]));
      for (const l of local) {
        const m = merged.get(l.sku);
        merged.set(l.sku, m ? { sku: l.sku, qty: Math.max(m.qty, l.qty), selected: m.selected || l.selected } : l);
      }
      const lines = [...merged.values()];
      if (lines.length) {
        const info = await lookupCartItems(lines.map((l) => l.sku));
        if (!alive) return;
        const base: CartItem[] = lines.flatMap((l) => {
          const p = info[l.sku];
          if (!p) return [];
          return [{ key: keyOf(p.productId, l.sku), productId: p.productId, name: p.name, image: p.image, href: p.href, variants: p.variants, variantId: l.sku, qty: l.qty, selected: l.selected }];
        });
        setItems(base);
      }
      setSyncedFor(userId);
    })().catch(() => {});
    return () => { alive = false; };
  }, [ready, userId]);

  // Đã gộp xong → mọi thay đổi giỏ được lưu lên server (gộp nhiều thao tác liên tiếp)
  const lastSaved = useRef<CartLine[] | null>(null);
  useEffect(() => {
    if (!ready || !userId || syncedFor !== userId) return;
    const lines = toLines(items);
    if (lastSaved.current && sameLines(lastSaved.current, lines)) return;
    const t = window.setTimeout(() => {
      void saveMyCart(lines).then((ok) => { if (ok) lastSaved.current = lines; });
    }, 800);
    return () => window.clearTimeout(t);
  }, [items, ready, userId, syncedFor]);

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
  const removeMany = useCallback<Ctx["removeMany"]>((keys) => setItems((p) => p.filter((i) => !keys.includes(i.key))), []);
  const clearNotice = useCallback(() => setNotice(""), []);

  const value = useMemo<Ctx>(
    () => ({ items, lastAdded, dismissAdded, ready, notice, clearNotice, refresh, removeMany, count: items.reduce((n, i) => n + i.qty, 0), add, setQty, setVariant, toggle, toggleAll, remove, clear }),
    [items, lastAdded, dismissAdded, ready, notice, clearNotice, refresh, removeMany, add, setQty, setVariant, toggle, toggleAll, remove, clear],
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): Ctx {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart phải nằm trong <CartProvider>");
  return ctx;
}
