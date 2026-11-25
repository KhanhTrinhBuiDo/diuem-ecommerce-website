-- =====================================================================
-- DỊU EM — Migration v0.9: mã ưu đãi (voucher) áp dụng vào đơn hàng
-- Chạy SAU v0.8. Có thể chạy lại nhiều lần (idempotent).
-- Giảm giá tính trên tiền hàng (không giảm phí ship); phí ship tính theo tiền hàng trước giảm giá.
-- =====================================================================

alter table public.coupons
  add column if not exists max_uses         int check (max_uses is null or max_uses > 0),   -- null = không giới hạn
  add column if not exists used_count       int not null default 0,
  add column if not exists max_discount_vnd bigint check (max_discount_vnd is null or max_discount_vnd > 0);  -- trần giảm khi theo %

-- Kiểm tra mã. p_lock=true (khi đặt hàng) khóa dòng coupon để không vượt số lượt dùng.
create or replace function public.coupon_check(p_code text, p_subtotal bigint, p_lock boolean default false)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  c public.coupons;
  v_code text := upper(btrim(coalesce(p_code, '')));
  v_disc bigint;
begin
  if v_code = '' or length(v_code) > 40 then
    return jsonb_build_object('ok', false, 'message', 'Vui lòng nhập mã ưu đãi.');
  end if;
  if p_lock then
    select * into c from public.coupons where upper(code) = v_code for update;
  else
    select * into c from public.coupons where upper(code) = v_code;
  end if;
  -- cùng một thông báo cho mã không tồn tại / tắt, để không lộ danh sách mã
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

  if c.discount_type = 'percent' then
    v_disc := (p_subtotal * least(c.discount_value, 100)) / 100;
    if c.max_discount_vnd is not null then v_disc := least(v_disc, c.max_discount_vnd); end if;
  else
    v_disc := c.discount_value;
  end if;
  v_disc := greatest(0, least(v_disc, p_subtotal));
  return jsonb_build_object('ok', true, 'code', c.code, 'discount', v_disc);
end $$;
revoke all on function public.coupon_check(text, bigint, boolean) from public;

-- Cho giao diện giỏ hàng xem trước mức giảm (không khóa, không ghi).
create or replace function public.quote_coupon(p_code text, p_subtotal bigint)
returns jsonb language sql security definer set search_path = public as $$
  select public.coupon_check(p_code, greatest(coalesce(p_subtotal, 0), 0), false)
$$;
revoke all on function public.quote_coupon(text, bigint) from public;
grant execute on function public.quote_coupon(text, bigint) to anon, authenticated;

-- place_order (v0.7) + mã ưu đãi
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
  v_coupon    text := nullif(upper(btrim(coalesce(p->>'coupon_code', ''))), '');
  v_disc      bigint := 0;
  v_cq        jsonb;
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

  -- mã ưu đãi: khóa dòng coupon, kiểm tra điều kiện + lượt dùng; giảm trên tiền hàng (không giảm phí ship)
  if v_coupon is not null then
    v_cq := public.coupon_check(v_coupon, v_subtotal, true);
    if not (v_cq->>'ok')::boolean then
      return jsonb_build_object('ok', false, 'code', 'coupon_invalid', 'message', v_cq->>'message');
    end if;
    v_disc := (v_cq->>'discount')::bigint;
    v_coupon := v_cq->>'code';
  end if;

  v_fee   := public.shipping_fee_vnd(v_subtotal);   -- phí ship tính theo tiền hàng TRƯỚC giảm giá
  v_total := v_subtotal - v_disc + v_fee;
  if p ? 'expected_total' and (p->>'expected_total') ~ '^[0-9]{1,12}$' and (p->>'expected_total')::bigint <> v_total then
    return jsonb_build_object('ok', false, 'code', 'price_changed', 'total_vnd', v_total, 'message', 'Giá hoặc phí giao hàng đã thay đổi. Vui lòng kiểm tra lại tổng tiền.');
  end if;

  -- ---- ghi đơn ----
  insert into public.orders (customer_id, contact_name, contact_phone, contact_email, ship_name, ship_phone, ship_province, ship_ward, ship_street,
                             subtotal_vnd, shipping_fee_vnd, discount_vnd, total_vnd, coupon_code, payment_method, is_gift, gift_message, customer_note)
  values (v_cust, v_name, v_phone, v_email, v_sname, v_sphone, v_prov, v_ward, v_street,
          v_subtotal, v_fee, v_disc, v_total, v_coupon, v_method, coalesce((p->>'is_gift')::boolean, false), nullif(left(coalesce(p->>'gift_message',''), 300), ''), v_note)
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

  if v_coupon is not null then
    update public.coupons set used_count = used_count + 1 where code = v_coupon;
  end if;

  insert into public.payments (order_id, method, status, amount_vnd) values (v_order.id, v_method, 'pending', v_total);

  return jsonb_build_object('ok', true, 'order_number', v_order.order_number, 'subtotal_vnd', v_subtotal,
                            'shipping_fee_vnd', v_fee, 'discount_vnd', v_disc, 'total_vnd', v_total, 'payment_method', v_method);
end $$;

revoke all on function public.place_order(jsonb) from public;
grant execute on function public.place_order(jsonb) to anon, authenticated;

-- Hủy đơn: hoàn kho + hoàn lượt dùng mã (v0.8 + coupon)
create or replace function public.orders_status_effects()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status is not distinct from old.status then return new; end if;

  if old.status = 'cancelled' then
    raise exception 'Đơn đã hủy không thể mở lại. Hãy tạo đơn mới.' using errcode = 'P0001';
  end if;

  if new.status = 'confirmed' then new.confirmed_at := coalesce(new.confirmed_at, now());
  elsif new.status = 'shipping' then
    new.confirmed_at := coalesce(new.confirmed_at, now());
    new.shipped_at   := coalesce(new.shipped_at, now());
  end if;

  if new.status = 'cancelled' then
    new.cancelled_at := now();
    if new.coupon_code is not null then   -- hoàn lại lượt dùng mã ưu đãi
      update public.coupons set used_count = greatest(used_count - 1, 0) where code = new.coupon_code;
    end if;
    update public.product_variants v set stock_qty = v.stock_qty + oi.quantity
      from public.order_items oi where oi.order_id = new.id and oi.variant_id = v.id;
    insert into public.stock_movements (variant_id, delta, reason, order_id)
      select oi.variant_id, oi.quantity, 'cancel', new.id from public.order_items oi where oi.order_id = new.id;
    if new.payment_status = 'pending' then
      new.payment_status := 'failed';
      update public.payments set status = 'failed', updated_at = now() where order_id = new.id and status = 'pending';
    end if;
  elsif new.status = 'completed' then
    new.confirmed_at := coalesce(new.confirmed_at, now());
    new.shipped_at   := coalesce(new.shipped_at, now());
    new.completed_at := now();
    if new.payment_method = 'cod' and new.payment_status = 'pending' then
      new.payment_status := 'paid';
      update public.payments set status = 'paid', paid_at = now(), updated_at = now() where order_id = new.id and status = 'pending';
    end if;
  end if;
  return new;
end $$;

