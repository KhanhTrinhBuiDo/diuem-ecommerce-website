-- =====================================================================
-- DỊU EM — Migration v0.7: đặt hàng COD, trừ/hoàn tồn kho, giỏ hàng theo tài khoản
-- Chạy SAU v0.6. Có thể chạy lại nhiều lần (idempotent).
-- Không dùng service_role: `place_order` là SECURITY DEFINER, tự kiểm tra mọi thứ (giá, tồn kho, trạng thái SP)
-- và chỉ nhận SKU + số lượng + thông tin giao hàng. Trình duyệt không thể gửi giá.
-- =====================================================================

-- 1) Nhật ký tồn kho (mỗi lần trừ/hoàn đều có dòng, để đối soát) -----------------
create table if not exists public.stock_movements (
  id          bigint generated always as identity primary key,
  variant_id  uuid not null references public.product_variants(id) on delete cascade,
  delta       int  not null check (delta <> 0),
  reason      text not null check (reason in ('order','cancel')),
  order_id    uuid references public.orders(id) on delete set null,
  created_at  timestamptz not null default now()
);
create index if not exists stock_movements_variant_idx on public.stock_movements (variant_id, created_at desc);
create index if not exists stock_movements_order_idx   on public.stock_movements (order_id);
alter table public.stock_movements enable row level security;
drop policy if exists stock_movements_admin on public.stock_movements;
create policy stock_movements_admin on public.stock_movements for select to authenticated using (public.is_admin());

-- 2) Giỏ hàng lưu theo tài khoản (chỉ SKU + số lượng + đã chọn; giá/tên luôn lấy lại từ catalog) --------
create table if not exists public.customer_carts (
  customer_id uuid primary key references public.customers(id) on delete cascade,
  items       jsonb not null default '[]'::jsonb check (jsonb_typeof(items) = 'array' and jsonb_array_length(items) <= 100),
  updated_at  timestamptz not null default now()
);
alter table public.customer_carts enable row level security;
drop policy if exists carts_self on public.customer_carts;
create policy carts_self on public.customer_carts for all to authenticated
  using (customer_id = public.current_customer_id()) with check (customer_id = public.current_customer_id());

-- 3) Phí giao hàng. TODO(shipping): mức phí khi dưới ngưỡng freeship CHƯA được khách hàng chốt → đang là giá trị tạm.
--    Nếu đổi, sửa ĐỒNG THỜI src/lib/checkout.ts (SHIPPING_FEE_VND, FREESHIP_FROM_VND).
create or replace function public.shipping_fee_vnd(p_subtotal bigint)
returns bigint language sql immutable as $$
  select case when p_subtotal >= 300000 then 0::bigint else 30000::bigint end
$$;

-- 4) Đặt hàng COD (nguyên tử: khóa dòng tồn kho → kiểm tra → trừ kho → tạo đơn + dòng đơn + payment) ----------
-- p = {
--   items: [{sku, qty}], expected_total: số (tuỳ chọn: tổng khách đang thấy, lệch → trả price_changed),
--   contact:{name,phone,email}, ship:{name,phone,province,ward,street}, note, payment_method:'cod',
--   is_gift?, gift_message?
-- }
-- Trả về jsonb: {ok:true, order_number, total_vnd, ...} hoặc {ok:false, code, message, ...}
create or replace function public.place_order(p jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_items     jsonb := coalesce(p->'items', '[]'::jsonb);
  v_phone     text  := regexp_replace(coalesce(p#>>'{contact,phone}', ''), '[\s.\-]', '', 'g');
  v_sphone    text  := regexp_replace(coalesce(p#>>'{ship,phone}', ''), '[\s.\-]', '', 'g');
  v_name      text  := btrim(coalesce(p#>>'{contact,name}', ''));
  v_sname     text  := btrim(coalesce(p#>>'{ship,name}', ''));
  v_email     text  := nullif(btrim(coalesce(p#>>'{contact,email}', '')), '');
  v_prov      text  := btrim(coalesce(p#>>'{ship,province}', ''));
  v_ward      text  := btrim(coalesce(p#>>'{ship,ward}', ''));
  v_street    text  := btrim(coalesce(p#>>'{ship,street}', ''));
  v_note      text  := nullif(left(btrim(coalesce(p->>'note', '')), 500), '');
  v_method    public.payment_method;
  v_cust      uuid  := public.current_customer_id();
  v_subtotal  bigint := 0;
  v_fee       bigint;
  v_total     bigint;
  v_order     public.orders;
  r           record;
  v_short     jsonb := '[]'::jsonb;
  v_gone      jsonb := '[]'::jsonb;
  v_n         int;
begin
  -- ---- kiểm tra đầu vào ----
  if jsonb_typeof(v_items) <> 'array' or jsonb_array_length(v_items) = 0 or jsonb_array_length(v_items) > 50 then
    return jsonb_build_object('ok', false, 'code', 'empty', 'message', 'Giỏ hàng trống hoặc không hợp lệ.');
  end if;
  if v_name = '' or v_sname = '' or v_prov = '' or v_ward = '' or v_street = ''
     or length(v_name) > 120 or length(v_sname) > 120 or length(v_prov) > 120 or length(v_ward) > 120 or length(v_street) > 300 then
    return jsonb_build_object('ok', false, 'code', 'invalid', 'message', 'Thông tin giao hàng chưa đầy đủ.');
  end if;
  if v_phone !~ '^(\+?84|0)[0-9]{9}$' or v_sphone !~ '^(\+?84|0)[0-9]{9}$' then
    return jsonb_build_object('ok', false, 'code', 'invalid', 'message', 'Số điện thoại chưa đúng.');
  end if;
  if v_email is not null and (v_email !~ '^\S+@\S+\.\S+$' or length(v_email) > 200) then
    return jsonb_build_object('ok', false, 'code', 'invalid', 'message', 'Email chưa đúng.');
  end if;
  begin
    v_method := coalesce(nullif(p->>'payment_method', ''), 'cod')::public.payment_method;
  exception when others then
    return jsonb_build_object('ok', false, 'code', 'invalid', 'message', 'Phương thức thanh toán không hợp lệ.');
  end;
  if v_method <> 'cod' then   -- TODO(payment): cổng thanh toán online sẽ mở ở bước sau
    return jsonb_build_object('ok', false, 'code', 'invalid', 'message', 'Hiện chỉ hỗ trợ thanh toán khi nhận hàng (COD).');
  end if;

  -- chống spam: tối đa 5 đơn chờ xác nhận / số điện thoại / giờ. TODO(captcha): thêm captcha nếu bị lạm dụng.
  select count(*) into v_n from public.orders
   where contact_phone = v_phone and status = 'pending' and placed_at > now() - interval '1 hour';
  if v_n >= 5 then
    return jsonb_build_object('ok', false, 'code', 'rate_limited', 'message', 'Bạn đặt quá nhiều đơn trong thời gian ngắn. Vui lòng thử lại sau hoặc liên hệ Dịu Em.');
  end if;

  -- ---- gộp dòng trùng SKU, kiểm tra số lượng ----
  create temp table if not exists _po_lines (sku text primary key, qty int not null) on commit drop;
  truncate _po_lines;
  for r in select btrim(e->>'sku') as sku, (e->>'qty') as qty from jsonb_array_elements(v_items) e loop
    if r.sku is null or r.sku = '' or r.qty is null or r.qty !~ '^[0-9]{1,3}$' or r.qty::int < 1 or r.qty::int > 99 then
      return jsonb_build_object('ok', false, 'code', 'invalid', 'message', 'Số lượng sản phẩm không hợp lệ.');
    end if;
    insert into _po_lines values (r.sku, r.qty::int)
      on conflict (sku) do update set qty = least(99, _po_lines.qty + excluded.qty);
  end loop;

  -- ---- khóa các dòng tồn kho (theo id để tránh deadlock), kiểm tra, tính tiền ----
  perform 1 from public.product_variants where sku in (select sku from _po_lines) order by id for update;
  for r in
    select l.sku, l.qty, v.id as vid, v.price_vnd, v.stock_qty, v.is_active, v.label, v.size_value, v.size_unit,
           p2.name as pname, (p2.status = 'active' and p2.deleted_at is null) as p_ok
      from _po_lines l
      left join public.product_variants v on v.sku = l.sku
      left join public.products p2 on p2.id = v.product_id
     order by l.sku
  loop
    if r.vid is null or not coalesce(r.is_active, false) or not coalesce(r.p_ok, false) then
      v_gone := v_gone || jsonb_build_object('sku', r.sku);
    elsif r.stock_qty < r.qty then
      v_short := v_short || jsonb_build_object('sku', r.sku, 'name', r.pname, 'available', r.stock_qty);
    end if;
    v_subtotal := v_subtotal + coalesce(r.price_vnd, 0) * r.qty;
  end loop;

  if jsonb_array_length(v_gone) > 0 then
    return jsonb_build_object('ok', false, 'code', 'unavailable', 'items', v_gone, 'message', 'Có sản phẩm không còn được bán. Vui lòng kiểm tra lại giỏ hàng.');
  end if;
  if jsonb_array_length(v_short) > 0 then
    return jsonb_build_object('ok', false, 'code', 'out_of_stock', 'items', v_short, 'message', 'Có sản phẩm không đủ số lượng trong kho.');
  end if;

  v_fee   := public.shipping_fee_vnd(v_subtotal);
  v_total := v_subtotal + v_fee;
  if p ? 'expected_total' and (p->>'expected_total') ~ '^[0-9]{1,12}$' and (p->>'expected_total')::bigint <> v_total then
    return jsonb_build_object('ok', false, 'code', 'price_changed', 'total_vnd', v_total, 'message', 'Giá hoặc phí giao hàng đã thay đổi. Vui lòng kiểm tra lại tổng tiền.');
  end if;

  -- ---- ghi đơn ----
  insert into public.orders (customer_id, contact_name, contact_phone, contact_email, ship_name, ship_phone, ship_province, ship_ward, ship_street,
                             subtotal_vnd, shipping_fee_vnd, discount_vnd, total_vnd, payment_method, is_gift, gift_message, customer_note)
  values (v_cust, v_name, v_phone, v_email, v_sname, v_sphone, v_prov, v_ward, v_street,
          v_subtotal, v_fee, 0, v_total, v_method, coalesce((p->>'is_gift')::boolean, false), nullif(left(coalesce(p->>'gift_message',''), 300), ''), v_note)
  returning * into v_order;

  insert into public.order_items (order_id, variant_id, sku, product_name, unit_price_vnd, quantity)
  select v_order.id, v.id, v.sku,
         p2.name || case when coalesce(v.label, '') <> '' then ' – ' || v.label else '' end,
         v.price_vnd, l.qty
    from _po_lines l
    join public.product_variants v on v.sku = l.sku
    join public.products p2 on p2.id = v.product_id;

  update public.product_variants v set stock_qty = v.stock_qty - l.qty
    from _po_lines l where v.sku = l.sku;
  insert into public.stock_movements (variant_id, delta, reason, order_id)
  select v.id, -l.qty, 'order', v_order.id from _po_lines l join public.product_variants v on v.sku = l.sku;

  insert into public.payments (order_id, method, status, amount_vnd) values (v_order.id, v_method, 'pending', v_total);

  return jsonb_build_object('ok', true, 'order_number', v_order.order_number, 'subtotal_vnd', v_subtotal,
                            'shipping_fee_vnd', v_fee, 'total_vnd', v_total, 'payment_method', v_method);
end $$;

revoke all on function public.place_order(jsonb) from public;
grant execute on function public.place_order(jsonb) to anon, authenticated;

-- 5) Đổi trạng thái đơn: hủy → hoàn kho (1 lần); hoàn thành + COD → đánh dấu đã thu tiền; không mở lại đơn đã hủy -----
create or replace function public.orders_status_effects()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status is not distinct from old.status then return new; end if;

  if old.status = 'cancelled' then
    raise exception 'Đơn đã hủy không thể mở lại. Hãy tạo đơn mới.' using errcode = 'P0001';
  end if;

  if new.status = 'cancelled' then
    update public.product_variants v set stock_qty = v.stock_qty + oi.quantity
      from public.order_items oi where oi.order_id = new.id and oi.variant_id = v.id;
    insert into public.stock_movements (variant_id, delta, reason, order_id)
      select oi.variant_id, oi.quantity, 'cancel', new.id from public.order_items oi where oi.order_id = new.id;
    if new.payment_status = 'pending' then
      new.payment_status := 'failed';
      update public.payments set status = 'failed', updated_at = now() where order_id = new.id and status = 'pending';
    end if;
  elsif new.status = 'completed' and new.payment_method = 'cod' and new.payment_status = 'pending' then
    new.payment_status := 'paid';
    update public.payments set status = 'paid', paid_at = now(), updated_at = now() where order_id = new.id and status = 'pending';
  end if;
  return new;
end $$;

drop trigger if exists trg_orders_status_effects on public.orders;
create trigger trg_orders_status_effects before update of status on public.orders
  for each row execute function public.orders_status_effects();
