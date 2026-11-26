-- =====================================================================
-- DỊU EM — Migration v0.11: đánh giá sản phẩm (chạy SAU v0.10, idempotent)
-- Quy tắc: mỗi dòng đơn hàng 1 đánh giá; chỉ đơn ĐÃ HOÀN THÀNH của chính khách; sửa tối đa 1 lần.
-- Khách ghi qua hàm `submit_review` (không có policy insert/update trực tiếp). Công khai đọc qua view `public_reviews` (tên được che bớt).
-- TODO(media): ảnh/video đánh giá cần luồng upload riêng (Cloudinary signed upload cho khách) — chưa làm.
-- TODO(reviews-policy): thời hạn được đánh giá sau khi nhận hàng (câu hỏi mở #18) — hiện không giới hạn.
-- =====================================================================
create table if not exists public.reviews (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid not null references public.products(id) on delete cascade,
  customer_id   uuid not null references public.customers(id) on delete cascade,
  order_item_id uuid not null unique references public.order_items(id) on delete cascade,
  rating        smallint not null check (rating between 1 and 5),
  content       text not null default '' check (char_length(content) <= 1000),
  variant_label text,
  edit_count    smallint not null default 0,
  is_hidden     boolean not null default false,   -- nhân sự ẩn đánh giá vi phạm
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists reviews_product_idx  on public.reviews (product_id, created_at desc) where not is_hidden;
create index if not exists reviews_customer_idx on public.reviews (customer_id, created_at desc);
alter table public.reviews enable row level security;
drop policy if exists reviews_self_read on public.reviews;
create policy reviews_self_read on public.reviews for select to authenticated using (customer_id = public.current_customer_id());
drop policy if exists reviews_admin_all on public.reviews;
create policy reviews_admin_all on public.reviews for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Công khai: chỉ cột an toàn, tên che bớt ("Lê Phước Thịnh" → "L*** Thịnh")
create or replace view public.public_reviews as
select r.id, r.product_id, r.rating, r.content, r.variant_label, r.created_at,
       case
         when nullif(btrim(c.full_name), '') is null then 'Khách hàng'
         when position(' ' in btrim(c.full_name)) = 0 then left(btrim(c.full_name), 1) || '***'
         else left(btrim(c.full_name), 1) || '*** ' || (regexp_match(btrim(c.full_name), '(\S+)$'))[1]
       end as author
  from public.reviews r join public.customers c on c.id = r.customer_id
 where not r.is_hidden;
grant select on public.public_reviews to anon, authenticated;

create or replace function public.submit_review(p_item uuid, p_rating int, p_content text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  cid uuid := public.current_customer_id();
  oi  record;
  v_content text := btrim(coalesce(p_content, ''));
  rv  public.reviews;
  cut int;
begin
  if cid is null then return jsonb_build_object('ok', false, 'message', 'Bạn cần đăng nhập để đánh giá.'); end if;
  if p_rating is null or p_rating < 1 or p_rating > 5 then return jsonb_build_object('ok', false, 'message', 'Vui lòng chọn số sao từ 1 đến 5.'); end if;
  if char_length(v_content) > 1000 then return jsonb_build_object('ok', false, 'message', 'Bình luận tối đa 1000 ký tự.'); end if;

  select i.id, i.product_name, v.product_id, o.status into oi
    from public.order_items i
    join public.orders o on o.id = i.order_id
    join public.product_variants v on v.id = i.variant_id
   where i.id = p_item and o.customer_id = cid;
  if not found then return jsonb_build_object('ok', false, 'message', 'Không tìm thấy sản phẩm trong đơn của bạn.'); end if;
  if oi.status <> 'completed' then return jsonb_build_object('ok', false, 'message', 'Chỉ đánh giá được khi đơn hàng đã hoàn thành.'); end if;

  select * into rv from public.reviews where order_item_id = p_item for update;
  if found then
    if rv.edit_count >= 1 then return jsonb_build_object('ok', false, 'message', 'Bạn đã sửa đánh giá này một lần, không thể sửa thêm.'); end if;
    update public.reviews set rating = p_rating, content = v_content, edit_count = edit_count + 1, updated_at = now() where id = rv.id;
  else
    cut := position(' – ' in oi.product_name);
    insert into public.reviews (product_id, customer_id, order_item_id, rating, content, variant_label)
    values (oi.product_id, cid, p_item, p_rating, v_content, case when cut > 0 then substr(oi.product_name, cut + 3) end);
  end if;
  return jsonb_build_object('ok', true);
end $$;
revoke all on function public.submit_review(uuid, int, text) from public;
grant execute on function public.submit_review(uuid, int, text) to authenticated;
