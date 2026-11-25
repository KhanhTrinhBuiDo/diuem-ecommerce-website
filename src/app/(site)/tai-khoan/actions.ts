"use server";

import type { Address, Profile } from "@/data/account";
import { getAccount } from "@/lib/account";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type Result = { ok: true } | { ok: false; error: string };
const fail = (error: string): Result => ({ ok: false, error });
const NOT_READY = fail("Hệ thống chưa sẵn sàng. Vui lòng thử lại sau.");

/** Lỗi nghiệp vụ do hàm SQL ném (errcode P0001) có thông báo tiếng Việt → hiển thị cho khách; lỗi khác chỉ ghi log. */
function dbMessage(e: { code?: string; message: string }): string {
  if (e.code === "P0001") return e.message;
  if (e.code === "23505") return "Số điện thoại này đã được dùng cho một tài khoản khác.";
  console.error("[account]", e);
  return "Không lưu được. Vui lòng thử lại.";
}

export async function updateProfile(input: Pick<Profile, "name" | "phone" | "gender" | "birthday">): Promise<Result> {
  if (!isSupabaseConfigured()) return NOT_READY;
  const name = String(input.name ?? "").trim().slice(0, 120);
  const phone = String(input.phone ?? "").replace(/[\s.-]/g, "");
  if (!name) return fail("Vui lòng nhập họ tên.");
  if (phone && !/^(\+?84|0)\d{9}$/.test(phone)) return fail("Số điện thoại chưa đúng.");
  if (input.gender && !["Nam", "Nữ", "Khác"].includes(input.gender)) return fail("Giới tính không hợp lệ.");
  if (input.birthday && !/^\d{4}-\d{2}-\d{2}$/.test(input.birthday)) return fail("Ngày sinh không hợp lệ.");
  const sb = await createClient();
  const { data: cid } = await sb.rpc("current_customer_id");
  if (!cid) return fail("Bạn cần đăng nhập.");
  // customers có ràng buộc phone/email: ít nhất một trong hai → dùng "" thành null
  const { error } = await sb.from("customers").update({ full_name: name, phone: phone || null, gender: input.gender || null, birthday: input.birthday || null, updated_at: new Date().toISOString() }).eq("id", cid);
  return error ? fail(dbMessage(error)) : { ok: true };
}

export type AddressInput = { id: string | null; name: string; phone: string; province: string; district: string; street: string };

export async function saveAddress(a: AddressInput): Promise<Result> {
  if (!isSupabaseConfigured()) return NOT_READY;
  const sb = await createClient();
  const { error } = await sb.rpc("upsert_address", { p_id: a.id || null, p_name: a.name, p_phone: a.phone, p_province: a.province, p_ward: a.district, p_street: a.street });
  return error ? fail(dbMessage(error)) : { ok: true };
}
export async function setDefaultAddress(id: string): Promise<Result> {
  if (!isSupabaseConfigured()) return NOT_READY;
  const { error } = await (await createClient()).rpc("set_default_address", { p_id: id });
  return error ? fail(dbMessage(error)) : { ok: true };
}
export async function removeAddress(id: string): Promise<Result> {
  if (!isSupabaseConfigured()) return NOT_READY;
  const { error } = await (await createClient()).rpc("delete_address", { p_id: id });
  return error ? fail(dbMessage(error)) : { ok: true };
}

/** Thông tin tự điền ở trang thanh toán: hồ sơ + địa chỉ mặc định (nếu có). */
export async function getCheckoutDefaults(): Promise<{ name: string; phone: string; email: string; address: Address | null } | null> {
  const a = await getAccount();
  if (!a.signedIn) return null;
  const d = a.addresses.find((x) => x.isDefault) ?? a.addresses[0] ?? null;
  return { name: a.profile.name, phone: a.profile.phone, email: a.profile.email, address: d };
}
