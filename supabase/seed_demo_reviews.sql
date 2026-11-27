-- =====================================================================================
-- ĐÁNH GIÁ MẪU: mọi sản phẩm đang bán có 3–10 đánh giá, trung bình 4,7–5,0 sao (chỉ có 4★ và 5★, số 4★ ≤ 30%).
-- Chạy SAU v11 và khi đã có sản phẩm thật. Chạy lại an toàn (tự xóa bản cũ rồi tạo lại).
-- Vì mỗi đánh giá phải gắn một dòng đơn hàng đã hoàn tất, script tạo 14 khách mẫu (dg01…dg14@demo.diuem.test)
-- và các đơn mẫu HOÀN TẤT có ghi chú "[DEMO] review" (không trừ kho; có tính vào doanh thu trong Admin → nhớ xóa trước khi chạy thật).
-- Sửa nội dung đánh giá / tên người đánh giá ở hai khối VALUES bên dưới. Xóa sạch: supabase/seed_demo_cleanup.sql
-- =====================================================================================
begin;

delete from public.reviews     where order_item_id in (select oi.id from public.order_items oi join public.orders o on o.id = oi.order_id where o.customer_note like '[DEMO] review%');
delete from public.payments    where order_id in (select id from public.orders where customer_note like '[DEMO] review%');
delete from public.order_items where order_id in (select id from public.orders where customer_note like '[DEMO] review%');
delete from public.orders      where customer_note like '[DEMO] review%';
delete from public.customers   where email::text like 'dg%@demo.diuem.test';

-- ---------- KHỐI 1: 14 người đánh giá (tên hiển thị trên web được che: "N*** Trang") ----------
create temp table _rv_people on commit drop as
select * from (values
  (1,'Nguyễn Thu Trang'),(2,'Trần Hoàng Yến'),(3,'Lê Minh Châu'),(4,'Phạm Bảo Ngọc'),(5,'Võ Ngọc Hân'),(6,'Đặng Thanh Thảo'),(7,'Bùi Khánh Linh'),
  (8,'Hoàng Mai Anh'),(9,'Phan Thị Hồng'),(10,'Huỳnh Kim Ngân'),(11,'Vũ Diễm My'),(12,'Đỗ Quỳnh Như'),(13,'Ngô Thùy Dương'),(14,'Dương Gia Hân')
) as t(n, full_name);

-- ---------- KHỐI 2: nội dung đánh giá (dùng chung cho mọi sản phẩm; chọn theo vòng) ----------
create temp table _rv_text on commit drop as
select row_number() over () as id, rating, content from (values
  (5,'Mùi thơm dịu nhẹ, dùng xong rất dễ chịu. Mình đang cho con bú nên chọn kỹ thành phần, Dịu Em làm mình yên tâm.'),
  (5,'Dùng được một tuần là thấy khác rõ rệt, da/tóc mềm hơn nhiều. Sẽ mua lại!'),
  (5,'Đóng gói đẹp, giao hàng nhanh. Sản phẩm đúng như mô tả, thành phần lành tính.'),
  (5,'Hương hoa bưởi thơm thật sự, không nồng. Cả nhà ai cũng thích.'),
  (5,'Mua tặng mẹ, mẹ khen mãi. Chất sản phẩm mịn, dùng tiết kiệm.'),
  (5,'Rất ưng! Bầu và sau sinh mình đều dùng được, không bị kích ứng.'),
  (5,'Chai nhỏ gọn, mang đi công tác tiện. Dùng xong không bị khô hay căng.'),
  (5,'Lần đầu thử thương hiệu này mà mê luôn. Giá hợp lý so với chất lượng.'),
  (5,'Thơm nhẹ, không để lại cảm giác nhờn dính. 5 sao cho shop.'),
  (5,'Shop tư vấn nhiệt tình, hàng về đúng hẹn. Sản phẩm xài ổn áp, sẽ ủng hộ tiếp.'),
  (5,'Dùng cho cả mẹ và bé đều thấy dịu. Đã mua lần thứ hai.'),
  (5,'Chất lượng vượt mong đợi so với tầm giá.'),
  (4,'Sản phẩm tốt, mùi dễ chịu. Mong shop có thêm size lớn để dùng lâu hơn.'),
  (4,'Dùng ổn, thấm nhanh. Giao hơi lâu một chút nhưng hàng đóng gói cẩn thận.'),
  (4,'Mùi hơi nhẹ so với mình mong đợi nhưng chất rất tốt, sẽ mua lại.'),
  (4,'Hiệu quả khá, cần dùng đều đặn mới thấy rõ. Đáng tiền.'),
  (4,'Đóng gói chắc chắn, thành phần rõ ràng. Trừ 1 sao vì mình muốn thêm hương mới.')
) as t(rating, content);

create temp table _rv on commit drop as
with prods as (
  select p.id as product_id, p.name as pname, row_number() over (order by p.name) as pi
    from public.products p where p.status = 'active' and p.deleted_at is null
), per as (
  select *, 3 + ((pi * 7 + 3) % 8) as n from prods                           -- 3..10 đánh giá
), gen as (
  select per.*, j, least(floor(n * 0.3)::int, (pi % 4)::int) as fours          -- số đánh giá 4★ (≤ 30% → TB ≥ 4,7)
    from per, generate_series(1, 10) j where j <= per.n
), v as (
  select g.*, vv.id as variant_id, vv.sku, vv.label, vv.price_vnd
    from gen g
    join lateral (
      select x.* , count(*) over () as cnt, row_number() over (order by x.sku) as rn
        from public.product_variants x where x.product_id = g.product_id and x.is_active
    ) vv on vv.rn = ((g.pi + g.j) % vv.cnt) + 1
)
select v.*, (v.j <= v.fours) as is4,
       ((v.pi * 5 + v.j * 3) % 14) + 1 as reviewer,
       timestamptz '2026-09-12 00:00:00+07' + (((v.pi * 3 + v.j * 7) % 70) * interval '1 day')
         + ((8 + (v.pi * v.j) % 13) * interval '1 hour') + (((v.pi * 17 + v.j * 29) % 60) * interval '1 minute') + interval '17 seconds' as rv_at
  from v;

-- gán nội dung theo vòng, đúng nhóm sao
create temp table _rv2 on commit drop as
select r.*, case when r.is4 then 4 else 5 end as rating,
       (select t.content from _rv_text t where t.rating = case when r.is4 then 4 else 5 end
         order by t.id offset ((r.pi * 3 + r.j) % (select count(*) from _rv_text x where x.rating = case when r.is4 then 4 else 5 end)) limit 1) as content
  from _rv r;

insert into public.customers (full_name, phone, email)
select full_name, '09100000' || lpad(n::text, 2, '0'), 'dg' || lpad(n::text, 2, '0') || '@demo.diuem.test' from _rv_people;

do $$
declare
  g record; o public.orders; it record; v_sub bigint; v_n int; k int := 0; v_cust uuid; v_item uuid;
begin
  if not exists (select 1 from _rv2) then raise exception 'Chưa có sản phẩm đang bán — hãy nhập sản phẩm trước.'; end if;
  -- mỗi nhóm (người đánh giá, ngày đánh giá) = một đơn hàng hoàn tất đặt 5 ngày trước đó
  for g in select reviewer, rv_at::date as d from _rv2 group by 1, 2 order by 2, 1 loop
    k := k + 1;
    select c.id into v_cust from public.customers c where c.email::text = 'dg' || lpad(g.reviewer::text, 2, '0') || '@demo.diuem.test';
    select coalesce(sum(price_vnd), 0), count(*) into v_sub, v_n from _rv2 where reviewer = g.reviewer and rv_at::date = g.d;
    insert into public.orders (customer_id, contact_name, contact_phone, contact_email, ship_name, ship_phone, ship_province, ship_ward, ship_street,
        subtotal_vnd, shipping_fee_vnd, discount_vnd, total_vnd, status, payment_method, payment_status, customer_note,
        placed_at, confirmed_at, shipped_at, completed_at)
    select c.id, c.full_name, c.phone, c.email, c.full_name, c.phone, 'TP. Hồ Chí Minh', 'Phường Bến Nghé', '1 Lê Lợi',
        v_sub, case when v_n >= 2 then 0 else 30000 end, 0, v_sub + case when v_n >= 2 then 0 else 30000 end,
        'completed', 'cod', 'paid', '[DEMO] review',
        (g.d::timestamp - interval '5 days') at time zone 'Asia/Ho_Chi_Minh' + interval '8 hours' + (k * interval '6 minutes') + interval '29 seconds',
        (g.d::timestamp - interval '5 days') at time zone 'Asia/Ho_Chi_Minh' + interval '10 hours' + (k * interval '6 minutes') + interval '29 seconds',
        (g.d::timestamp - interval '4 days') at time zone 'Asia/Ho_Chi_Minh' + interval '9 hours' + (k * interval '6 minutes') + interval '29 seconds',
        (g.d::timestamp - interval '2 days') at time zone 'Asia/Ho_Chi_Minh' + interval '15 hours' + (k * interval '6 minutes') + interval '29 seconds'
      from public.customers c where c.id = v_cust
    returning * into o;
    for it in select * from _rv2 where reviewer = g.reviewer and rv_at::date = g.d loop
      insert into public.order_items (order_id, variant_id, sku, product_name, unit_price_vnd, quantity)
      values (o.id, it.variant_id, it.sku, it.pname || case when coalesce(it.label, '') <> '' then ' – ' || it.label else '' end, it.price_vnd, 1)
      returning id into v_item;
      insert into public.reviews (product_id, customer_id, order_item_id, rating, content, variant_label, created_at, updated_at)
      values (it.product_id, v_cust, v_item, it.rating, it.content, it.label, it.rv_at, it.rv_at);
    end loop;
    insert into public.payments (order_id, method, status, amount_vnd, paid_at) values (o.id, 'cod', 'paid', o.total_vnd, o.completed_at);
  end loop;
end $$;

commit;
