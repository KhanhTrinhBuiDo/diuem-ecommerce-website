-- =====================================================================================
-- DỮ LIỆU DEMO: 5 khách có tài khoản (1–3 đơn) + 2 khách vãng lai (1–2 đơn). Chỉ để xem thử giao diện admin / tài khoản.
-- Chạy trong Supabase SQL Editor SAU KHI đã chạy migration v07→v12 và đã có sản phẩm thật.
-- Mọi thông tin cần chỉnh nằm ở HAI khối VALUES ngay bên dưới (khách hàng, đơn hàng). Không đụng tới tồn kho.
-- Xóa sạch dữ liệu demo: chạy supabase/seed_demo_cleanup.sql
-- Nhận diện demo: email khách kết thúc bằng @demo.diuem.test (đơn vãng lai cũng dùng email đó); ghi chú đơn bắt đầu bằng [DEMO].
-- Khách "có tài khoản" ở đây là dòng trong bảng customers CHƯA gắn tài khoản đăng nhập (auth_user_id trống):
--   xem được trong admin, nhưng không đăng nhập được. Muốn đăng nhập thử, tự đăng ký bằng email thật rồi sửa.
-- Chạy lại nhiều lần an toàn: script tự xóa bản demo cũ trước khi tạo lại.
-- =====================================================================================
begin;

-- Dọn bản demo cũ (nếu có)
delete from public.payments    where order_id in (select id from public.orders where customer_note like '[DEMO]%');
delete from public.order_items where order_id in (select id from public.orders where customer_note like '[DEMO]%');
delete from public.orders      where customer_note like '[DEMO]%';
delete from public.customers   where email::text like '%@demo.diuem.test';

-- ---------- KHỐI 1: KHÁCH HÀNG CÓ TÀI KHOẢN (sửa tên / SĐT / email / địa chỉ tại đây) ----------
create temp table _demo_customers on commit drop as
select * from (values
  -- key, họ tên,            SĐT,          email (giữ đuôi @demo.diuem.test), giới tính, tỉnh/thành,   phường/xã,     địa chỉ
  ('c1', 'Nguyễn Thu Hà',    '0900000001', 'c1@demo.diuem.test', 'Nữ',  'TP. Hồ Chí Minh', 'Phường Bến Nghé',  '12 Lê Lợi'),
  ('c2', 'Trần Minh Anh',    '0900000002', 'c2@demo.diuem.test', 'Nữ',  'Hà Nội',          'Phường Dịch Vọng', '25 Trần Thái Tông'),
  ('c3', 'Lê Phương Linh',   '0900000003', 'c3@demo.diuem.test', 'Nữ',  'Cần Thơ',         'Phường Xuân Khánh','8 Nguyễn Văn Cừ'),
  ('c4', 'Phạm Ngọc Mai',    '0900000004', 'c4@demo.diuem.test', 'Nữ',  'Đà Nẵng',         'Phường Hải Châu 1','40 Bạch Đằng'),
  ('c5', 'Võ Khánh Vy',      '0900000005', 'c5@demo.diuem.test', 'Nữ',  'TP. Hồ Chí Minh', 'Phường Tân Định',  '77 Hai Bà Trưng')
) as t(key, full_name, phone, email, gender, province, ward, street);

-- ---------- KHỐI 2: ĐƠN HÀNG ----------
-- cust: key khách ở khối 1; để trống (null) = khách vãng lai → điền tên/SĐT/email/địa chỉ vãng lai ở các cột g_*.
-- placed_at: MỖI ĐƠN MỘT THỜI ĐIỂM KHÁC NHAU (giờ Việt Nam).
-- lines: 'số thứ tự biến thể:số lượng,…' — số thứ tự là vị trí trong danh sách biến thể ĐANG CÒN HÀNG xếp theo SKU (1 = đầu tiên).
-- status: pending | confirmed | shipping | completed | cancelled        pay: cod | bank_transfer | momo | vnpay | zalopay
create temp table _demo_orders on commit drop as
select * from (values
  ('c1', timestamptz '2026-10-03 09:12:41+07', 'completed', 'cod',           '1:1,4:2', null, null, null, null, null, null, 'Giao giờ hành chính'),
  ('c1', timestamptz '2026-10-19 20:45:07+07', 'completed', 'bank_transfer', '7:1',     null, null, null, null, null, null, null),
  ('c1', timestamptz '2026-11-14 13:30:55+07', 'shipping',  'cod',           '3:1,9:1', null, null, null, null, null, null, null),
  ('c2', timestamptz '2026-10-08 18:02:19+07', 'completed', 'momo',          '2:2',     null, null, null, null, null, null, null),
  ('c3', timestamptz '2026-10-12 11:21:33+07', 'completed', 'cod',           '5:1,6:1', null, null, null, null, null, null, 'Gọi trước khi giao'),
  ('c3', timestamptz '2026-11-02 08:58:02+07', 'cancelled', 'cod',           '8:1',     null, null, null, null, null, null, 'Đổi ý, hủy đơn'),
  ('c4', timestamptz '2026-10-25 21:17:48+07', 'completed', 'vnpay',         '10:1,2:1',null, null, null, null, null, null, null),
  ('c4', timestamptz '2026-11-09 15:40:26+07', 'confirmed', 'cod',           '4:1',     null, null, null, null, null, null, null),
  ('c4', timestamptz '2026-11-22 10:05:14+07', 'pending',   'cod',           '6:2',     null, null, null, null, null, null, null),
  ('c5', timestamptz '2026-11-18 19:26:39+07', 'completed', 'cod',           '1:1',     null, null, null, null, null, null, null),
  -- khách vãng lai 1 (2 đơn): cust = null
  (null, timestamptz '2026-10-15 16:33:21+07', 'completed', 'cod',          '3:1',     'Đặng Thị Lan', '0900000101', 'g1@demo.diuem.test', 'TP. Hồ Chí Minh', 'Phường Võ Thị Sáu', '3 Nguyễn Thị Minh Khai', null),
  (null, timestamptz '2026-11-05 12:11:09+07', 'shipping',  'cod',          '5:2',     'Đặng Thị Lan', '0900000101', 'g1@demo.diuem.test', 'TP. Hồ Chí Minh', 'Phường Võ Thị Sáu', '3 Nguyễn Thị Minh Khai', null),
  -- khách vãng lai 2 (1 đơn)
  (null, timestamptz '2026-11-20 22:04:57+07', 'pending',   'cod',          '2:1,8:1', 'Bùi Quốc Bảo', '0900000102', 'g2@demo.diuem.test', 'Hà Nội', 'Phường Cầu Giấy', '15 Xuân Thủy', null)
) as t(cust, placed_at, status, pay, lines, g_name, g_phone, g_email, g_province, g_ward, g_street, note);

-- ---------- Từ đây trở xuống không cần sửa ----------
insert into public.customers (full_name, phone, email, gender)
select full_name, phone, email::citext, gender from _demo_customers;

do $$
declare
  r record; l text; o public.orders; pv record; n int;
  v_sub bigint; v_fee bigint; v_cust public.customers; c record;
begin
  select count(*) into n from public.product_variants where is_active and stock_qty > 0;
  if n = 0 then raise exception 'Chưa có biến thể sản phẩm nào đang bán/còn hàng — hãy nhập sản phẩm trước.'; end if;

  for r in select * from _demo_orders order by placed_at loop
    select * into c from _demo_customers where key = r.cust;
    v_sub := 0;
    -- tính tạm tiền hàng
    for l in select unnest(string_to_array(r.lines, ',')) loop
      select * into pv from (select x.*, row_number() over (order by x.sku) rn from public.product_variants x where x.is_active and x.stock_qty > 0) q
        where rn = ((split_part(l, ':', 1)::int - 1) % n) + 1;
      v_sub := v_sub + pv.price_vnd * split_part(l, ':', 2)::int;
    end loop;
    v_fee := public.shipping_fee_vnd(v_sub);

    select * into v_cust from public.customers where email::text = c.email;
    insert into public.orders (customer_id, contact_name, contact_phone, contact_email, ship_name, ship_phone, ship_province, ship_ward, ship_street,
        subtotal_vnd, shipping_fee_vnd, discount_vnd, total_vnd, status, payment_method, payment_status, customer_note,
        placed_at, confirmed_at, shipped_at, completed_at, cancelled_at)
    values (
      v_cust.id,
      coalesce(c.full_name, r.g_name), coalesce(c.phone, r.g_phone), coalesce(c.email, r.g_email)::citext,
      coalesce(c.full_name, r.g_name), coalesce(c.phone, r.g_phone),
      coalesce(c.province, r.g_province), coalesce(c.ward, r.g_ward), coalesce(c.street, r.g_street),
      v_sub, v_fee, 0, v_sub + v_fee, r.status::public.order_status, r.pay::public.payment_method,
      case when r.status = 'completed' then 'paid' when r.status = 'cancelled' then 'failed' else 'pending' end::public.payment_status,
      '[DEMO]' || coalesce(' ' || r.note, ''),
      r.placed_at,
      case when r.status in ('confirmed','shipping','completed') then r.placed_at + interval '3 hours' end,
      case when r.status in ('shipping','completed') then r.placed_at + interval '1 day' end,
      case when r.status = 'completed' then r.placed_at + interval '3 days' end,
      case when r.status = 'cancelled' then r.placed_at + interval '2 hours' end
    ) returning * into o;

    for l in select unnest(string_to_array(r.lines, ',')) loop
      select * into pv from (select x.*, row_number() over (order by x.sku) rn from public.product_variants x where x.is_active and x.stock_qty > 0) q
        where rn = ((split_part(l, ':', 1)::int - 1) % n) + 1;
      insert into public.order_items (order_id, variant_id, sku, product_name, unit_price_vnd, quantity)
      select o.id, pv.id, pv.sku, p.name || case when coalesce(pv.label,'') <> '' then ' – ' || pv.label else '' end, pv.price_vnd, split_part(l, ':', 2)::int
        from public.products p where p.id = pv.product_id;
    end loop;

    insert into public.payments (order_id, method, status, amount_vnd, paid_at)
    values (o.id, o.payment_method, o.payment_status, o.total_vnd, case when o.payment_status = 'paid' then o.completed_at end);
  end loop;
end $$;

commit;
