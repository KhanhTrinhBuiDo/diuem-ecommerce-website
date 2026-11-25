-- =====================================================================
-- DỊU EM — Migration v0.8: mốc thời gian đơn hàng + tra cứu đơn cho khách vãng lai
-- Chạy SAU v0.7. Có thể chạy lại nhiều lần (idempotent).
-- =====================================================================

-- 1) Mốc thời gian từng trạng thái (hiển thị thanh tiến trình đơn)
alter table public.orders
  add column if not exists confirmed_at timestamptz,
  add column if not exists shipped_at   timestamptz,
  add column if not exists completed_at timestamptz,
  add column if not exists cancelled_at timestamptz;

-- Trigger v0.7 + ghi mốc thời gian
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

-- 2) Tra cứu đơn (khách chưa đăng nhập): mã đơn + SĐT/email đặt hàng. Bảng orders KHÔNG mở cho anon.
create or replace function public.norm_phone(t text)
returns text language sql immutable as $$
  select regexp_replace(regexp_replace(coalesce(t, ''), '[^0-9+]', '', 'g'), '^\+?84', '0')
$$;

create table if not exists public.order_lookup_attempts (
  id      bigint generated always as identity primary key,
  code    text not null,
  contact text not null,
  ok      boolean not null,
  at      timestamptz not null default now()
);
create index if not exists order_lookup_attempts_code_idx    on public.order_lookup_attempts (code, at desc);
create index if not exists order_lookup_attempts_contact_idx on public.order_lookup_attempts (contact, at desc);
alter table public.order_lookup_attempts enable row level security;   -- không có policy: chỉ hàm SECURITY DEFINER ghi/đọc

create or replace function public.lookup_order(p_code text, p_contact text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_code    text := upper(btrim(coalesce(p_code, '')));
  v_raw     text := btrim(coalesce(p_contact, ''));
  v_contact text := case when position('@' in v_raw) > 0 then lower(v_raw) else public.norm_phone(v_raw) end;
  o         public.orders;
  v_fails_code int; v_fails_contact int; v_found boolean;
begin
  if v_code = '' or v_contact = '' or length(v_code) > 40 or length(v_contact) > 200 then
    return jsonb_build_object('ok', false, 'code', 'invalid');
  end if;

  delete from public.order_lookup_attempts where at < now() - interval '1 day';
  select count(*) into v_fails_code    from public.order_lookup_attempts where code = v_code       and not ok and at > now() - interval '15 minutes';
  select count(*) into v_fails_contact from public.order_lookup_attempts where contact = v_contact and not ok and at > now() - interval '15 minutes';
  if v_fails_code >= 8 or v_fails_contact >= 20 then
    return jsonb_build_object('ok', false, 'code', 'rate_limited');
  end if;

  select * into o from public.orders
   where upper(order_number) = v_code
     and ( lower(coalesce(contact_email::text, '')) = v_contact
        or public.norm_phone(contact_phone) = v_contact
        or public.norm_phone(ship_phone) = v_contact );

  v_found := found;
  insert into public.order_lookup_attempts (code, contact, ok) values (v_code, v_contact, v_found);
  if not v_found then
    return jsonb_build_object('ok', false, 'code', 'not_found');   -- không phân biệt "sai mã" với "sai SĐT"
  end if;

  return jsonb_build_object('ok', true, 'order', to_jsonb(o) - 'customer_id' - 'contact_email' - 'contact_phone' - 'contact_name'
    , 'items', coalesce((select jsonb_agg(jsonb_build_object('sku', i.sku, 'product_name', i.product_name, 'unit_price_vnd', i.unit_price_vnd, 'quantity', i.quantity) order by i.sku)
                          from public.order_items i where i.order_id = o.id), '[]'::jsonb));
end $$;

revoke all on function public.lookup_order(text, text) from public;
grant execute on function public.lookup_order(text, text) to anon, authenticated;
