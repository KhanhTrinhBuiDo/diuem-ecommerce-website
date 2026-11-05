#!/usr/bin/env node
/**
 * Tạo / đồng bộ 5 tài khoản admin mặc định (idempotent).
 * Chạy TRÊN MÁY BẠN (không chạy trên Vercel), cần service_role key:
 *
 *   SUPABASE_URL=https://xxxx.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ... \
 *   ADMIN_SEED_PASSWORD='Admin@123' \
 *   node scripts/seed-admins.mjs
 *
 * - Mật khẩu KHÔNG nằm trong mã nguồn; lấy từ biến môi trường ADMIN_SEED_PASSWORD.
 * - Nếu email đã tồn tại (kể cả đã đăng ký trước đó): đặt lại mật khẩu + xác nhận email → không ai chiếm trước được.
 * - Quyền admin được quyết định bởi bảng staff_members/staff_roles, KHÔNG phải do tên email.
 */
import { createClient } from "@supabase/supabase-js";

const ADMINS = [
  ["admin.thinh@gmail.com", "Admin Thịnh"],
  ["admin.le@gmail.com", "Admin Lê"],
  ["admin.trinh@gmail.com", "Admin Trình"],
  ["admin.nhi@gmail.com", "Admin Nhi"],
  ["admin.toan@gmail.com", "Admin Toàn"],
];

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const password = process.env.ADMIN_SEED_PASSWORD;
if (!url || !key || !password) {
  console.error("Thiếu SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY hoặc ADMIN_SEED_PASSWORD.");
  process.exit(1);
}
const sb = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

async function findUserByEmail(email) {
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await sb.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const hit = data.users.find((u) => u.email?.toLowerCase() === email);
    if (hit) return hit;
    if (data.users.length < 200) return null;
  }
  return null;
}

for (const [email, name] of ADMINS) {
  let user = await findUserByEmail(email);
  if (user) {
    const { error } = await sb.auth.admin.updateUserById(user.id, { password, email_confirm: true, user_metadata: { full_name: name } });
    if (error) throw error;
    console.log(`~ cập nhật   ${email}`);
  } else {
    const { data, error } = await sb.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { full_name: name } });
    if (error) throw error;
    user = data.user;
    console.log(`+ tạo mới    ${email}`);
  }
  const { data: staff, error: e1 } = await sb
    .from("staff_members")
    .upsert({ auth_user_id: user.id, full_name: name, work_email: email, job_title: "Quản trị viên", status: "active" }, { onConflict: "auth_user_id" })
    .select("id")
    .single();
  if (e1) throw e1;
  const { error: e2 } = await sb.from("staff_roles").upsert({ staff_id: staff.id, role_code: "admin" }, { onConflict: "staff_id,role_code" });
  if (e2) throw e2;
}
console.log("Xong. 5 tài khoản admin đã sẵn sàng.");
