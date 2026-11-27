-- =====================================================================
-- DỊU EM — Migration v14: ví voucher theo tài khoản + điều kiện nâng cao + 10 voucher mẫu
-- Chạy SAU v13. Chạy lại được (idempotent). Không dùng service_role: mọi thứ qua hàm SECURITY DEFINER + RLS.
--
-- Cột mới của `coupons`:
--   title / description     : tên + mô tả hiển thị cho khách
--   auto_apply              : tự động áp dụng ở giỏ hàng (khi khách đủ điều kiện, chưa nhập mã khác)
--   per_account_grant       : số lượt CẤP RIÊNG cho mỗi tài khoản (null = mã công khai, ai biết mã cũng nhập được)
--   min_qty                 : tổng số món tối thiểu trong đơn
--   min_completed_orders    : số đơn đã HOÀN TẤT tối thiểu của tài khoản (hạng thân thiết)
--   new_customer_only       : chỉ dùng cho tài khoản chưa có đơn nào (trừ đơn đã hủy)
-- Bảng `customer_vouchers` (ví): mỗi tài khoản một dòng/voucher được cấp riêng, đếm lượt đã dùng.
-- Cấp lượt "lười": tự tạo dòng ví khi khách mở giỏ hàng/trang voucher (đủ điều kiện) → cả tài khoản cũ lẫn mới đều nhận.
-- =====================================================================

alter table public.coupons
  add column if not exists title                text,
  add column if not exists description          text,
  add column if not exists auto_apply           boolean not null default false,
  add column if not exists per_account_grant    int check (per_account_grant is null or per_account_grant > 0),
  add column if not exists min_qty              int not null default 0 check (min_qty >= 0),
  add column if not exists min_completed_orders int not null default 0 check (min_completed_orders >= 0),
  add column if not exists new_customer_only    boolean not null default false;

create table if not exists public.customer_vouchers (
  customer_id uuid not null references public.customers(id) on delete cascade,
  code        text not null references public.coupons(code) on update cascade on delete cascade,
  granted     int  not null check (granted > 0),
  used        int  not null default 0 check (used >= 0),
  granted_at  timestamptz not null default now(),
  primary key (customer_id, code),
  check (used <= granted)
);
alter table public.customer_vouchers enable row level security;
drop policy if exists customer_vouchers_self on public.customer_vouchers;
create policy customer_vouchers_self on public.customer_vouchers for select to authenticated
  using (customer_id = public.current_customer_id());
drop policy if exists customer_vouchers_admin on public.customer_vouchers;
create policy customer_vouchers_admin on public.customer_vouchers for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Cấp voucher còn thiếu cho tài khoản đang đăng nhập (đủ điều kiện, còn hiệu lực).
create or replace function public.grant_my_vouchers()
returns void language plpgsql security definer set search_path = public as $$
declare
  v_cust uuid := public.current_customer_id();
  v_done int; v_any int;
begin
  if v_cust is null then return; end if;
  select count(*) into v_done from public.orders where customer_id = v_cust and status = 'completed';
  select count(*) into v_any  from public.orders where customer_id = v_cust and status <> 'cancelled';
  insert into public.customer_vouchers (customer_id, code, granted)
  select v_cust, c.code, c.per_account_grant
    from public.coupons c
   where c.is_active and c.per_account_grant is not null
     and (c.ends_at is null or now() <= c.ends_at)
     and (c.starts_at is null or now() >= c.starts_at)
     and v_done >= c.min_completed_orders
     and (not c.new_customer_only or v_any = 0)
  on conflict (customer_id, code) do nothing;
end $$;
revoke all on function public.grant_my_vouchers() from public, anon;
grant execute on function public.grant_my_vouchers() to authenticated;

-- Kiểm tra mã (thay bản v09: thêm p_qty + các điều kiện mới). p_lock=true khi đặt hàng.
drop function if exists public.quote_coupon(text, bigint);
drop function if exists public.coupon_check(text, bigint, boolean);
create or replace function public.coupon_check(p_code text, p_subtotal bigint, p_lock boolean default false, p_qty int default 0)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  c public.coupons;
  w public.customer_vouchers;
  v_code text := upper(btrim(coalesce(p_code, '')));
  v_cust uuid := public.current_customer_id();
  v_disc bigint; v_done int; v_any int;
begin
  if v_code = '' or length(v_code) > 40 then
    return jsonb_build_object('ok', false, 'message', 'Vui lòng nhập mã ưu đãi.');
  end if;
  if p_lock then select * into c from public.coupons where upper(code) = v_code for update;
  else select * into c from public.coupons where upper(code) = v_code; end if;
  if not found or not c.is_active then
    return jsonb_build_object('ok', false, 'message', 'Mã ưu đãi không hợp lệ hoặc đã hết hiệu lực.');
  end if;
  if c.starts_at is not null and now() < c.starts_at then
    return jsonb_build_object('ok', false, 'message', 'Mã ưu đãi chưa đến thời gian áp dụng.');
  end if;
  if c.ends_at is not null and now() > c.ends_at then
    return jsonb_build_object('ok', false, 'message', 'Mã ưu đãi đã hết hạn.');
  end if;
  if c.max_uses is not null and c.used_count >= c.max_uses then
    return jsonb_build_object('ok', false, 'message', 'Mã ưu đãi đã hết lượt sử dụng.');
  end if;
  if p_subtotal < c.min_order_vnd then
    return jsonb_build_object('ok', false, 'message', 'Đơn hàng cần từ ' || replace(to_char(c.min_order_vnd, 'FM999G999G999'), ',', '.') || 'đ để dùng mã này.');
  end if;
  if coalesce(p_qty, 0) < c.min_qty then
    return jsonb_build_object('ok', false, 'message', 'Cần mua từ ' || c.min_qty || ' món để dùng mã này.');
  end if;

  -- điều kiện theo tài khoản
  if c.per_account_grant is not null or c.new_customer_only or c.min_completed_orders > 0 then
    if v_cust is null then
      return jsonb_build_object('ok', false, 'message', 'Vui lòng đăng nhập để dùng mã này.');
    end if;
    select count(*) into v_done from public.orders where customer_id = v_cust and status = 'completed';
    select count(*) into v_any  from public.orders where customer_id = v_cust and status <> 'cancelled';
    if c.min_completed_orders > 0 and v_done < c.min_completed_orders then
      return jsonb_build_object('ok', false, 'message', 'Mã dành cho khách đã hoàn tất từ ' || c.min_completed_orders || ' đơn hàng (bạn đang có ' || v_done || ').');
    end if;
    if c.new_customer_only and v_any > 0 then
      return jsonb_build_object('ok', false, 'message', 'Mã chỉ dành cho đơn hàng đầu tiên của tài khoản.');
    end if;
    if c.per_account_grant is not null then
      perform public.grant_my_vouchers();
      if p_lock then select * into w from public.customer_vouchers where customer_id = v_cust and code = c.code for update;
      else select * into w from public.customer_vouchers where customer_id = v_cust and code = c.code; end if;
      if not found then
        return jsonb_build_object('ok', false, 'message', 'Tài khoản của bạn chưa có mã này.');
      end if;
      if w.used >= w.granted then
        return jsonb_build_object('ok', false, 'message', 'Bạn đã dùng hết lượt của mã này.');
      end if;
    end if;
  end if;

  if c.discount_type = 'percent' then
    v_disc := (p_subtotal * least(c.discount_value, 100)) / 100;
    if c.max_discount_vnd is not null then v_disc := least(v_disc, c.max_discount_vnd); end if;
  else
    v_disc := c.discount_value;
  end if;
  v_disc := greatest(0, least(v_disc, p_subtotal));
  return jsonb_build_object('ok', true, 'code', c.code, 'discount', v_disc);
end $$;
revoke all on function public.coupon_check(text, bigint, boolean, int) from public;

create or replace function public.quote_coupon(p_code text, p_subtotal bigint, p_qty int default 0)
returns jsonb language sql security definer set search_path = public as $$
  select public.coupon_check(p_code, greatest(coalesce(p_subtotal, 0), 0), false, greatest(coalesce(p_qty, 0), 0))
$$;
revoke all on function public.quote_coupon(text, bigint, int) from public;
grant execute on function public.quote_coupon(text, bigint, int) to anon, authenticated;

-- Voucher của tôi: các voucher được cấp riêng (còn lượt) + trạng thái dùng được với giỏ hiện tại.
create or replace function public.my_vouchers(p_subtotal bigint default 0, p_qty int default 0)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_cust uuid := public.current_customer_id();
  r record; q jsonb; v_out jsonb := '[]'::jsonb;
begin
  if v_cust is null then return v_out; end if;
  perform public.grant_my_vouchers();
  for r in
    select c.code, c.title, c.description, c.auto_apply, c.discount_type, c.discount_value, c.min_order_vnd, c.min_qty,
           c.ends_at, w.granted - w.used as remaining
      from public.customer_vouchers w join public.coupons c on c.code = w.code
     where w.customer_id = v_cust and w.used < w.granted and c.is_active
       and (c.ends_at is null or now() <= c.ends_at)
     order by c.auto_apply desc, c.code
  loop
    q := public.coupon_check(r.code, greatest(coalesce(p_subtotal, 0), 0), false, greatest(coalesce(p_qty, 0), 0));
    v_out := v_out || jsonb_build_object(
      'code', r.code, 'title', coalesce(r.title, r.code), 'description', r.description, 'auto', r.auto_apply,
      'remaining', r.remaining, 'percent', case when r.discount_type = 'percent' then r.discount_value end,
      'fixed', case when r.discount_type = 'fixed' then r.discount_value end,
      'ends_at', r.ends_at, 'ok', coalesce((q->>'ok')::boolean, false),
      'discount', coalesce((q->>'discount')::bigint, 0), 'message', q->>'message');
  end loop;
  return v_out;
end $$;
revoke all on function public.my_vouchers(bigint, int) from public, anon;
grant execute on function public.my_vouchers(bigint, int) to authenticated;

-- place_order: truyền số lượng vào coupon_check và trừ lượt trong ví (vá đúng 2 chỗ trên định nghĩa hiện tại)
do $$
declare d text; d2 text;
begin
  select pg_get_functiondef('public.place_order(jsonb)'::regprocedure) into d;
  if position('from _po_lines))' in d) > 0 and position('update public.customer_vouchers' in d) > 0 then return; end if;  -- đã vá
  d2 := replace(d, 'public.coupon_check(v_coupon, v_subtotal, true)',
                   'public.coupon_check(v_coupon, v_subtotal, true, (select coalesce(sum(qty), 0)::int from _po_lines))');
  if d2 = d then raise exception 'Không tìm thấy lời gọi coupon_check trong place_order — hãy chạy v09 và v13 trước.'; end if;
  d := d2;
  d2 := replace(d, 'update public.coupons set used_count = used_count + 1 where code = v_coupon;',
                   'update public.coupons set used_count = used_count + 1 where code = v_coupon;
    update public.customer_vouchers set used = used + 1 where customer_id = v_cust and code = v_coupon;');
  if d2 = d then raise exception 'Không tìm thấy dòng tăng used_count trong place_order.'; end if;
  execute d2;
end $$;

-- Hủy đơn: hoàn lượt trong ví (vá trigger hiện tại)
do $$
declare d text; d2 text;
begin
  select pg_get_functiondef('public.orders_status_effects()'::regprocedure) into d;
  if position('update public.customer_vouchers' in d) > 0 then return; end if;  -- đã vá
  d2 := replace(d, 'update public.coupons set used_count = greatest(used_count - 1, 0) where code = new.coupon_code;',
                   'update public.coupons set used_count = greatest(used_count - 1, 0) where code = new.coupon_code;
      update public.customer_vouchers set used = greatest(used - 1, 0) where customer_id = new.customer_id and code = new.coupon_code;');
  if d2 = d then raise exception 'Không tìm thấy dòng hoàn lượt mã trong orders_status_effects.'; end if;
  execute d2;
end $$;

-- ---------- 10 voucher mẫu (không ghi đè nếu đã có; sửa tiếp trong Admin → Voucher) ----------
-- Giờ Việt Nam. Mã công khai (per_account_grant trống) ai biết mã đều nhập được.
insert into public.coupons (code, discount_type, discount_value, min_order_vnd, starts_at, ends_at, is_active, title, description, auto_apply, per_account_grant, min_qty, min_completed_orders, new_customer_only) values
 ('CHAOBANMOI',  'percent', 10, 0,      null, null, true, 'Quà chào bạn mới', 'Giảm 10% cho đơn hàng đầu tiên của tài khoản. Tự động áp dụng.', true, 1, 0, 0, true),
 ('COMBO5',      'percent', 20, 0,      null, null, true, 'Combo 5 món', 'Giảm 20% khi mua từ 5 món. Mỗi tài khoản có 5 lượt.', false, 5, 5, 0, false),
 ('NGAY2011',    'percent', 11, 0,      timestamptz '2026-11-20 00:00:00+07', timestamptz '2026-11-20 23:59:59+07', true, 'Ngày 20/11', 'Giảm 11% trong ngày 20/11/2026.', false, null, 0, 0, false),
 ('QUACUOINAM',  'percent', 10, 0,      timestamptz '2026-12-01 00:00:00+07', timestamptz '2026-12-31 23:59:59+07', true, 'Quà cuối năm', 'Giảm 10% cho mọi đơn hàng trong tháng 12/2026.', false, null, 0, 0, false),
 ('THANTHIET',   'percent', 10, 0,      null, null, true, 'Khách hàng thân thiết', 'Giảm 10% cho tài khoản đã hoàn tất từ 10 đơn hàng (1 lượt).', false, 1, 0, 10, false),
 -- 6–10: do Claude đề xuất, bạn sửa/tắt tùy ý
 ('BLACKFRIDAY', 'percent', 15, 0,      timestamptz '2026-11-27 00:00:00+07', timestamptz '2026-11-30 23:59:59+07', true, 'Black Friday', 'Giảm 15% từ 27 đến 30/11/2026.', false, null, 0, 0, false),
 ('PHUNU83',     'percent',  8, 0,      timestamptz '2027-03-06 00:00:00+07', timestamptz '2027-03-10 23:59:59+07', true, 'Quốc tế Phụ nữ 8/3', 'Giảm 8% quanh ngày 8/3/2027.', false, null, 0, 0, false),
 ('MEVABE',      'percent', 12, 0,      timestamptz '2027-05-07 00:00:00+07', timestamptz '2027-05-10 23:59:59+07', true, 'Ngày của Mẹ', 'Giảm 12% dịp Ngày của Mẹ 2027.', false, null, 0, 0, false),
 ('PHUNU2010',   'percent', 10, 0,      timestamptz '2027-10-18 00:00:00+07', timestamptz '2027-10-22 23:59:59+07', true, 'Phụ nữ Việt Nam 20/10', 'Giảm 10% quanh ngày 20/10/2027.', false, null, 0, 0, false),
 ('GIAM50K',     'fixed',   50000, 500000, null, null, true, 'Giảm 50.000đ', 'Giảm 50.000đ cho đơn từ 500.000đ.', false, null, 0, 0, false)
on conflict (code) do nothing;
