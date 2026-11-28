-- v15: khi báo "giá đã thay đổi", trả kèm tiền hàng / giảm giá / phí ship mà SERVER tính để dễ tìm chỗ lệch.
-- Vá đúng 1 dòng trong place_order (idempotent). Chạy SAU v13 và v14.
do $$
declare d text; d2 text;
begin
  select pg_get_functiondef('public.place_order(jsonb)'::regprocedure) into d;
  if position('''subtotal_vnd'', v_subtotal, ''discount_vnd'', v_disc, ''shipping_fee_vnd'', v_fee, ''message'', ''Giá hoặc' in d) > 0 then return; end if;
  d2 := replace(d, '''total_vnd'', v_total, ''message'', ''Giá hoặc',
                   '''total_vnd'', v_total, ''subtotal_vnd'', v_subtotal, ''discount_vnd'', v_disc, ''shipping_fee_vnd'', v_fee, ''message'', ''Giá hoặc');
  if d2 = d then raise exception 'Không tìm thấy dòng price_changed trong place_order — hãy chạy v09, v13, v14 trước.'; end if;
  execute d2;
end $$;
