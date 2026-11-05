/**
 * Đường dẫn quản trị bí mật.
 * - Thư mục route thật là `app/internal-admin` (không ai truy cập trực tiếp được: middleware trả 404).
 * - URL công khai của admin là `/<ADMIN_PATH_SLUG>/...` (middleware rewrite vào internal-admin).
 * - ADMIN_PATH_SLUG đặt trong biến môi trường (Vercel → Settings → Environment Variables), KHÔNG dùng NEXT_PUBLIC_.
 *   Tạo chuỗi ngẫu nhiên:  openssl rand -hex 16   (hoặc: node -e "console.log(require('crypto').randomBytes(16).toString('hex'))")
 * Lưu ý: đường dẫn bí mật chỉ giảm dò quét, KHÔNG thay cho đăng nhập + kiểm tra role ở server/RLS (TODO(auth)).
 */
export const ADMIN_INTERNAL = "/internal-admin";
const PATTERN = /^[a-z0-9][a-z0-9-]{15,63}$/;

/** Trả về slug hợp lệ, hoặc null (production chưa cấu hình → admin tắt hẳn). Dev có slug mặc định. */
export function resolveAdminSlug(env: { ADMIN_PATH_SLUG?: string; NODE_ENV?: string }): string | null {
  const s = env.ADMIN_PATH_SLUG?.trim().toLowerCase();
  if (s) return PATTERN.test(s) ? s : null;
  return env.NODE_ENV === "production" ? null : "dev-admin-local-path";
}

/** Dùng ở server component: "/<slug>" hoặc null. */
export function getAdminBase(): string | null {
  const s = resolveAdminSlug(process.env);
  return s ? `/${s}` : null;
}
