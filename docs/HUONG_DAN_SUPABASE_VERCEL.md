# Hướng dẫn nối Supabase + Vercel (admin đăng nhập & quản lý)

Hệ thống có **2 vai trò**: khách (`customer`) và `admin`. Admin được xác định bằng bảng `staff_roles` trong DB (hàm `is_admin()`), **không** dựa vào tên email.

## 1. Chạy migration (1 lần)
Supabase → SQL Editor → dán và chạy `supabase/migrations/20261105_v04_admin_auth.sql` (chạy sau schema v0.3 + seed 30 sản phẩm). File an toàn khi chạy lại. Nó: chỉ giữ role `admin`, tạo `is_admin()`, đổi `product_images.storage_path` → `image_url` (link Cloudinary, bắt buộc https), và tự tạo dòng `customers` khi có người đăng ký.

## 2. Tạo 5 tài khoản admin (chạy trên máy bạn)
Lấy **Project URL** và **service_role key** (Settings → API). Key này cực nhạy cảm: chỉ dùng tại máy, **không** đưa lên Vercel/GitHub/chat.
```bash
SUPABASE_URL="https://xxxx.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="..." \
ADMIN_SEED_PASSWORD='Admin@123' \
node scripts/seed-admins.mjs
```
Script tạo/cập nhật: admin.thinh / admin.le / admin.trinh / admin.nhi / admin.toan `@gmail.com`, gán role admin. Mật khẩu không nằm trong mã nguồn.
> ⚠️ Mật khẩu chung `Admin@123` yếu và 5 người dùng chung. Hãy đổi riêng sau lần đăng nhập đầu (hoặc chạy lại script với mật khẩu mới).

## 3. Supabase Auth
- Authentication → URL Configuration: **Site URL** = domain Vercel; **Redirect URLs** thêm `https://<domain>/auth/callback` và `http://localhost:3000/auth/callback`.
- Đăng nhập Google (tuỳ chọn): Providers → Google, điền Client ID/Secret từ Google Cloud (redirect URI lấy trong trang Supabase).
- Email xác nhận khi đăng ký: bật/tắt tại Providers → Email (khi bật, khách phải bấm link trong mail).

## 4. Biến môi trường Vercel (Settings → Environment Variables)
| Biến | Giá trị |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon/public key |
| `ADMIN_PATH_SLUG` | chuỗi ngẫu nhiên 16–64 ký tự `a-z0-9-` (vd `node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"`) |
| `NEXT_PUBLIC_SITE_URL` | domain production |

**Không** thêm `SUPABASE_SERVICE_ROLE_KEY`. Redeploy sau khi đặt biến. Admin ở `https://<domain>/<ADMIN_PATH_SLUG>`; `/admin` luôn 404. Đăng nhập admin bằng form đăng nhập thường → tự chuyển vào trang admin.

## 5. Ảnh Cloudinary
Trong form sản phẩm, dán link dạng `https://res.cloudinary.com/<cloud>/image/upload/...`; ảnh đầu tiên là ảnh chính. Link khác domain bị từ chối.

## 6. Việc admin làm được
Dashboard; sản phẩm (thêm/sửa, biến thể, ảnh, **xóa mềm/khôi phục**); đơn hàng (đổi trạng thái theo luồng, mã vận đơn, in); danh mục; voucher; xem khách hàng; xem danh sách admin.

## 7. Admin chậm? Đặt vùng chạy Vercel gần Supabase
Nguyên nhân chính thường là Vercel Functions chạy ở Mỹ (mặc định `iad1`) còn Supabase ở Singapore → mỗi truy vấn tốn ~200–300ms. Cách sửa: Vercel → Project → Settings → **Functions → Function Region** chọn vùng gần Supabase (Supabase ở Singapore → `sin1`), rồi Redeploy. Xem vùng Supabase tại Project Settings → General.

## 8. Nhập sản phẩm bằng Excel
Admin → Sản phẩm → **Nhập từ Excel** → tải file mẫu (.xlsx, có sheet Danh mục, Hướng dẫn, ví dụ) → điền → chọn file → **Kiểm tra** → **Nhập vào hệ thống**.
- Cột hồng (*) hiển thị trên web, bắt buộc với sản phẩm mới: Tên, Danh mục, Dung tích, Đơn vị, Giá, Ảnh, Mô tả ngắn.
- Cột xám không bắt buộc: SKU, Tồn kho, Slug, Trạng thái (mặc định Nháp), Nổi bật, Thành phần, Hướng dẫn sử dụng/bảo quản, Lưu ý, Hạn dùng, PAO.
- Nhiều ảnh trong 1 ô: cách nhau bằng dấu cách, dấu phẩy hoặc xuống dòng; link đầu là ảnh chính.
- Nhiều dòng cùng Tên/Slug = 1 sản phẩm nhiều phiên bản. Slug đã có = cập nhật (ô trống giữ nguyên); phiên bản khớp theo SKU.
- Tối đa 500 dòng, file ≤ 3MB. Combo chưa hỗ trợ qua file.
