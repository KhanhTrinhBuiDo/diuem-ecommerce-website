-- =====================================================================
-- DỊU EM — Migration v0.10: hồ sơ (giới tính, ngày sinh) + sổ địa chỉ qua hàm (chạy SAU v0.9, idempotent)
-- Các hàm là SECURITY INVOKER → RLS `customers_self_*` / `addresses_self` vẫn là lớp bảo vệ chính.
-- Cột `ward` của địa chỉ = Quận/Huyện (giống `orders.ship_ward`). TODO(address): chuyển sang danh mục hành chính mới.
-- =====================================================================
alter table public.customers
  add column if not exists gender   text check (gender is null or gender in ('Nam', 'Nữ', 'Khác')),
  add column if not exists birthday date check (birthday is null or (birthday > date '1900-01-01' and birthday < current_date));

create or replace function public.upsert_address(p_id uuid, p_name text, p_phone text, p_province text, p_ward text, p_street text)
returns uuid language plpgsql security invoker set search_path = public as $$
declare
  cid uuid := public.current_customer_id();
  v_phone text := regexp_replace(coalesce(p_phone, ''), '[\s.\-]', '', 'g');
  v_id uuid;
begin
  if cid is null then raise exception 'Bạn cần đăng nhập.' using errcode = 'P0001'; end if;
  if btrim(coalesce(p_name, '')) = '' or btrim(coalesce(p_province, '')) = '' or btrim(coalesce(p_ward, '')) = '' or btrim(coalesce(p_street, '')) = ''
     or length(p_name) > 120 or length(p_province) > 120 or length(p_ward) > 120 or length(p_street) > 300 then
    raise exception 'Thông tin địa chỉ chưa đầy đủ.' using errcode = 'P0001';
  end if;
  if v_phone !~ '^(\+?84|0)[0-9]{9}$' then raise exception 'Số điện thoại chưa đúng.' using errcode = 'P0001'; end if;

  if p_id is null then
    if (select count(*) from public.customer_addresses where customer_id = cid) >= 20 then
      raise exception 'Tối đa 20 địa chỉ.' using errcode = 'P0001';
    end if;
    insert into public.customer_addresses (customer_id, recipient_name, recipient_phone, province, ward, street_address, is_default)
    values (cid, btrim(p_name), v_phone, btrim(p_province), btrim(p_ward), btrim(p_street),
            not exists (select 1 from public.customer_addresses where customer_id = cid))
    returning id into v_id;
  else
    update public.customer_addresses
       set recipient_name = btrim(p_name), recipient_phone = v_phone, province = btrim(p_province), ward = btrim(p_ward), street_address = btrim(p_street), updated_at = now()
     where id = p_id and customer_id = cid
    returning id into v_id;
    if v_id is null then raise exception 'Không tìm thấy địa chỉ.' using errcode = 'P0001'; end if;
  end if;
  return v_id;
end $$;

create or replace function public.set_default_address(p_id uuid)
returns void language plpgsql security invoker set search_path = public as $$
declare cid uuid := public.current_customer_id();
begin
  if cid is null then raise exception 'Bạn cần đăng nhập.' using errcode = 'P0001'; end if;
  if not exists (select 1 from public.customer_addresses where id = p_id and customer_id = cid) then
    raise exception 'Không tìm thấy địa chỉ.' using errcode = 'P0001';
  end if;
  update public.customer_addresses set is_default = false where customer_id = cid and is_default and id <> p_id;  -- bỏ mặc định cũ trước (index duy nhất)
  update public.customer_addresses set is_default = true, updated_at = now() where id = p_id and customer_id = cid;
end $$;

create or replace function public.delete_address(p_id uuid)
returns void language plpgsql security invoker set search_path = public as $$
declare cid uuid := public.current_customer_id(); was_default boolean;
begin
  if cid is null then raise exception 'Bạn cần đăng nhập.' using errcode = 'P0001'; end if;
  delete from public.customer_addresses where id = p_id and customer_id = cid returning is_default into was_default;
  if was_default then   -- xóa địa chỉ mặc định → địa chỉ mới nhất lên mặc định
    update public.customer_addresses set is_default = true
     where id = (select id from public.customer_addresses where customer_id = cid order by created_at desc limit 1);
  end if;
end $$;

revoke all on function public.upsert_address(uuid, text, text, text, text, text) from public;
revoke all on function public.set_default_address(uuid) from public;
revoke all on function public.delete_address(uuid) from public;
grant execute on function public.upsert_address(uuid, text, text, text, text, text) to authenticated;
grant execute on function public.set_default_address(uuid) to authenticated;
grant execute on function public.delete_address(uuid) to authenticated;
