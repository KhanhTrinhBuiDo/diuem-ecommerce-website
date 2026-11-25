import "server-only";
import type { Address, Profile } from "@/data/account";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type AccountData = { signedIn: boolean; profile: Profile; addresses: Address[] };
const EMPTY: AccountData = { signedIn: false, profile: { name: "", phone: "", email: "", gender: "", birthday: "" }, addresses: [] };

type Row = Record<string, unknown>;
export const toAddress = (r: Row): Address => ({
  id: String(r.id), name: String(r.recipient_name), phone: String(r.recipient_phone),
  province: String(r.province), district: String(r.ward), street: String(r.street_address),
  line: [r.street_address, r.ward, r.province].filter(Boolean).join(", "), isDefault: Boolean(r.is_default),
});

/** Hồ sơ + sổ địa chỉ của tài khoản đang đăng nhập. Lọc theo customer id vì nhân sự (RLS) đọc được mọi khách. */
export async function getAccount(): Promise<AccountData> {
  if (!isSupabaseConfigured()) return EMPTY;
  try {
    const sb = await createClient();
    const { data: cid, error: e0 } = await sb.rpc("current_customer_id");
    if (e0) throw new Error(e0.message);
    if (!cid) return EMPTY;
    const [{ data: c }, { data: addrs }, { data: auth }] = await Promise.all([
      sb.from("customers").select("full_name,phone,email,gender,birthday").eq("id", cid).maybeSingle(),
      sb.from("customer_addresses").select("*").eq("customer_id", cid).order("is_default", { ascending: false }).order("created_at", { ascending: false }),
      sb.auth.getUser(),
    ]);
    return {
      signedIn: true,
      profile: {
        name: String(c?.full_name ?? ""), phone: String(c?.phone ?? ""), email: String(c?.email ?? auth.user?.email ?? ""),
        gender: (c?.gender as Profile["gender"]) ?? "", birthday: c?.birthday ? String(c.birthday).slice(0, 10) : "",
      },
      addresses: (addrs ?? []).map((r) => toAddress(r as Row)),
    };
  } catch (e) {
    console.error("[account] getAccount:", e);
    return EMPTY;
  }
}
