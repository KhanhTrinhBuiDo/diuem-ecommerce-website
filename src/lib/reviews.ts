import "server-only";
import { unstable_cache } from "next/cache";
import { createClient as createAnon } from "@supabase/supabase-js";
import type { Review } from "@/data/reviews";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "@/lib/supabase/env";
import { getCatalog, hrefOf } from "@/lib/storefront";

type Row = Record<string, unknown>;

/** ISO → "YYYY-MM-DDTHH:mm" theo giờ Việt Nam (để server và trình duyệt hiển thị giống nhau). */
function vnLocal(iso: string): string {
  const p = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Ho_Chi_Minh", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date(iso));
  const g = (t: string) => p.find((x) => x.type === t)?.value ?? "";
  return `${g("year")}-${g("month")}-${g("day")}T${g("hour") === "24" ? "00" : g("hour")}:${g("minute")}`;
}

async function fetchPublic(productId: string): Promise<Review[]> {
  const sb = createAnon(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await sb.from("public_reviews").select("id,rating,content,variant_label,created_at,author").eq("product_id", productId).order("created_at", { ascending: false }).limit(500);
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => ({ id: String(r.id), author: String(r.author), rating: Number(r.rating), date: vnLocal(String(r.created_at)), variant: String(r.variant_label ?? ""), content: String(r.content ?? "") }));
}

/** Đánh giá công khai của một sản phẩm (cache 60 giây; không dùng cookie nên trang sản phẩm vẫn tĩnh/ISR). */
export async function getProductReviews(productId: string): Promise<{ reviews: Review[]; average: number }> {
  if (!isSupabaseConfigured()) return { reviews: [], average: 0 };
  try {
    const reviews = await unstable_cache(() => fetchPublic(productId), ["product-reviews", productId], { revalidate: 60, tags: ["reviews", `reviews-${productId}`] })();
    const average = reviews.length ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10 : 0;
    return { reviews, average };
  } catch (e) {
    console.error("[reviews] getProductReviews:", e);
    return { reviews: [], average: 0 };
  }
}

export type MyReview = { id: string; productName: string; variant: string; rating: number; content: string; date: string; canRedo: boolean; href: string; itemId: string };

/** Đánh giá của tài khoản đang đăng nhập (lọc theo customer_id: admin đọc được mọi đánh giá qua RLS). */
export async function listMyReviews(): Promise<{ signedIn: boolean; reviews: MyReview[] }> {
  if (!isSupabaseConfigured()) return { signedIn: false, reviews: [] };
  try {
    const sb = await createClient();
    const { data: me, error: e0 } = await sb.rpc("current_customer_id");
    if (e0) throw new Error(e0.message);
    if (!me) return { signedIn: false, reviews: [] };
    const { data, error } = await sb.from("reviews").select("id,product_id,order_item_id,rating,content,variant_label,edit_count,created_at,updated_at").eq("customer_id", me).order("created_at", { ascending: false }).limit(200);
    if (error) throw new Error(error.message);
    const { products } = await getCatalog();
    const byId = new Map(products.map((p) => [p.id, p]));
    return {
      signedIn: true,
      reviews: (data ?? []).map((r: Row) => {
        const p = byId.get(String(r.product_id));
        return { id: String(r.id), itemId: String(r.order_item_id), productName: p?.name ?? "Sản phẩm", href: p ? hrefOf(p) : "/san-pham", variant: String(r.variant_label ?? ""), rating: Number(r.rating), content: String(r.content ?? ""), date: vnLocal(String(r.updated_at ?? r.created_at)).replace("T", " "), canRedo: Number(r.edit_count) < 1 };
      }),
    };
  } catch (e) {
    console.error("[reviews] listMyReviews:", e);
    return { signedIn: false, reviews: [] };
  }
}
