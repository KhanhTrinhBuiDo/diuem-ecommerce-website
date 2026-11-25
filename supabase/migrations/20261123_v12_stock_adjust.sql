-- =====================================================================
-- DỊU EM — Migration v0.12: điều chỉnh tồn kho hàng loạt có nhật ký (chạy SAU v0.11, idempotent)
-- Admin đặt "tồn mới" cho nhiều SKU một lần; mỗi thay đổi ghi 1 dòng `stock_movements` (reason 'adjust', kèm ghi chú + người làm).
-- TODO(stock-audit): sửa tồn trực tiếp trong form sản phẩm chưa ghi nhật ký → nên dùng màn Kho.
-- =====================================================================
alter table public.stock_movements drop constraint if exists stock_movements_reason_check;
alter table public.stock_movements add constraint stock_movements_reason_check check (reason in ('order', 'cancel', 'adjust'));
alter table public.stock_movements add column if not exists note text;
alter table public.stock_movements add column if not exists created_by uuid;

create or replace function public.adjust_stock(p_changes jsonb, p_note text default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  c jsonb; v record; n int := 0; v_new int; v_note text := nullif(btrim(coalesce(p_note, '')), '');
begin
  if not public.is_admin() then raise exception 'Bạn không có quyền điều chỉnh tồn kho.' using errcode = '42501'; end if;
  if jsonb_typeof(p_changes) <> 'array' or jsonb_array_length(p_changes) = 0 then raise exception 'Chưa có thay đổi nào.' using errcode = 'P0001'; end if;
  if jsonb_array_length(p_changes) > 500 then raise exception 'Tối đa 500 dòng mỗi lần.' using errcode = 'P0001'; end if;
  if char_length(coalesce(v_note, '')) > 300 then raise exception 'Ghi chú tối đa 300 ký tự.' using errcode = 'P0001'; end if;
  -- khóa theo thứ tự id để tránh deadlock với place_order
  perform 1 from public.product_variants where sku in (select x->>'sku' from jsonb_array_elements(p_changes) x) order by id for update;
  for c in select * from jsonb_array_elements(p_changes) loop
    if (c->>'qty') is null or (c->>'qty') !~ '^\d{1,6}$' then raise exception 'Tồn kho phải là số nguyên từ 0 đến 999999 (SKU %).', coalesce(c->>'sku', '?') using errcode = 'P0001'; end if;
    v_new := (c->>'qty')::int;
    select id, stock_qty into v from public.product_variants where sku = c->>'sku';
    if not found then raise exception 'Không tìm thấy SKU %.', coalesce(c->>'sku', '?') using errcode = 'P0001'; end if;
    if v.stock_qty <> v_new then
      update public.product_variants set stock_qty = v_new where id = v.id;
      insert into public.stock_movements (variant_id, delta, reason, note, created_by) values (v.id, v_new - v.stock_qty, 'adjust', v_note, auth.uid());
      n := n + 1;
    end if;
  end loop;
  return jsonb_build_object('ok', true, 'changed', n);
end $$;
revoke all on function public.adjust_stock(jsonb, text) from public, anon;
grant execute on function public.adjust_stock(jsonb, text) to authenticated;
