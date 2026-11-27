-- Xóa toàn bộ dữ liệu demo do seed_demo_orders.sql tạo (đơn có ghi chú bắt đầu bằng [DEMO] và khách @demo.diuem.test).
begin;
delete from public.reviews     where order_item_id in (select oi.id from public.order_items oi join public.orders o on o.id = oi.order_id where o.customer_note like '[DEMO]%');
delete from public.payments    where order_id in (select id from public.orders where customer_note like '[DEMO]%');
delete from public.order_items where order_id in (select id from public.orders where customer_note like '[DEMO]%');
delete from public.orders      where customer_note like '[DEMO]%';
delete from public.customers   where email::text like '%@demo.diuem.test';
commit;
