-- =====================================================================
-- DỊU EM — Migration v0.4: 2 role (customer / admin), tự tạo hồ sơ khách, ảnh bằng link Cloudinary
-- Chạy SAU schema v0.3 lite (+ seed). Có thể chạy lại nhiều lần (idempotent).
-- Role: "admin" = có dòng staff_members(status='active') + staff_roles('admin'). Mọi người còn lại là khách (customers).
-- =====================================================================

-- 1) Chỉ còn role admin (bỏ catalog / orders). has_role('catalog'|'orders') trong các policy cũ vẫn chạy:
--    admin luôn được coi là có mọi role.
delete from public.staff_roles where role_code <> 'admin';
delete from public.roles       where code      <> 'admin';

-- 2) Hàm kiểm tra admin dùng ở server (RPC) và trong policy
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.staff_members s
    join public.staff_roles r on r.staff_id = s.id
    where s.auth_user_id = auth.uid() and s.status = 'active' and r.role_code = 'admin')
$$;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- 3) Ảnh sản phẩm lưu LINK Cloudinary (https), không dùng Supabase Storage
do $$
begin
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='product_images' and column_name='storage_path') then
    alter table public.product_images rename column storage_path to image_url;
  end if;
end $$;
alter table public.product_images drop constraint if exists product_images_url_https;
alter table public.product_images add constraint product_images_url_https check (image_url ~ '^https://');

-- 4) Mỗi tài khoản đăng ký (email/Google) tự có một dòng trong customers
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.customers (auth_user_id, full_name, email)
  values (new.id,
          coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
          new.email)
  on conflict do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- 5) Admin đọc được toàn bộ (kể cả sản phẩm đã xóa mềm) nhờ policy *_staff dùng has_role(...) → đã gồm admin.
--    Bổ sung: admin được đọc danh sách nhân sự của mình (staff_self đã có) — không cần thêm policy.

-- 6) Sau khi chạy file này: chạy `node scripts/seed-admins.mjs` để tạo 5 tài khoản admin (xem docs/HUONG_DAN_SUPABASE_VERCEL.md).
