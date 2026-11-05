"use client";

import { deleteCategory, deleteCoupon, saveCategory, saveCoupon } from "@/app/internal-admin/actions";
import { Badge } from "@/components/admin/ui";
import { money } from "@/components/admin/shared";
import { ResourceManager } from "@/components/admin/ResourceManager";
import type { CategoryRow, CouponRow } from "@/lib/admin-types";

export function CouponsAdmin({ coupons }: { coupons: CouponRow[] }) {
  return (
    <ResourceManager<CouponRow>
      title="Voucher"
      subtitle="Mã giảm giá. Khi đặt hàng, server phải kiểm tra điều kiện/hạn dùng (TODO ở bước thanh toán)."
      noun="voucher"
      initial={coupons}
      searchText={(c) => c.code}
      blank={() => ({ id: "", code: "", discount_type: "percent", discount_value: 10, min_order_vnd: 0, starts_at: "", ends_at: "", is_active: true })}
      columns={[
        { header: "Mã", render: (c) => <code className="font-bold">{c.code}</code> },
        { header: "Giảm", render: (c) => (c.discount_type === "percent" ? `${c.discount_value}%` : money(c.discount_value)) },
        { header: "Đơn tối thiểu", render: (c) => money(c.min_order_vnd) },
        { header: "Hiệu lực", render: (c) => `${c.starts_at ? c.starts_at.split("-").reverse().join("/") : "—"} → ${c.ends_at ? c.ends_at.split("-").reverse().join("/") : "—"}` },
        { header: "Bật", render: (c) => <Badge tone={c.is_active ? "green" : "gray"}>{c.is_active ? "Bật" : "Tắt"}</Badge> },
      ]}
      fields={[
        { key: "code", label: "Mã voucher (CHỮ HOA)", type: "text", required: true, lockOnEdit: true },
        { key: "discount_type", label: "Loại giảm", type: "select", options: [{ value: "percent", label: "Phần trăm (%)" }, { value: "fixed", label: "Số tiền (VND)" }] },
        { key: "discount_value", label: "Giá trị giảm", type: "number", min: 1 },
        { key: "min_order_vnd", label: "Đơn tối thiểu (VND)", type: "number", min: 0 },
        { key: "starts_at", label: "Bắt đầu", type: "date" },
        { key: "ends_at", label: "Kết thúc", type: "date" },
        { key: "is_active", label: "Đang bật", type: "toggle" },
      ]}
      onSave={async (c, isNew) => {
        const r = await saveCoupon(c, isNew);
        return r.ok ? null : r.error;
      }}
      onRemove={async (c) => {
        const r = await deleteCoupon(c.id);
        return r.ok ? null : r.error;
      }}
    />
  );
}

export function CategoriesAdmin({ categories }: { categories: CategoryRow[] }) {
  const parents = categories.filter((c) => !c.parent_id);
  const name = (id: string | null) => categories.find((c) => c.id === id)?.name ?? "—";
  return (
    <ResourceManager<CategoryRow>
      title="Danh mục"
      subtitle="Cây 2 cấp: nhóm cha → danh mục con. Sản phẩm gắn vào danh mục con."
      noun="danh mục"
      initial={categories}
      searchText={(c) => `${c.name} ${c.slug}`}
      blank={() => ({ id: "", parent_id: parents[0]?.id ?? null, slug: "", name: "", sort_order: 0, min_price_vnd: null })}
      columns={[
        { header: "Tên", render: (c) => <span className={c.parent_id ? "pl-4 font-light" : "font-bold"}>{c.name}</span> },
        { header: "Thuộc nhóm", render: (c) => (c.parent_id ? name(c.parent_id) : <Badge tone="pink">Nhóm cha</Badge>) },
        { header: "Slug", render: (c) => <code className="text-xs">{c.slug}</code> },
        { header: "Thứ tự", render: (c) => c.sort_order },
        { header: "Giá từ", render: (c) => (c.min_price_vnd ? money(c.min_price_vnd) : "—") },
      ]}
      fields={[
        { key: "name", label: "Tên", type: "text", required: true },
        { key: "slug", label: "Slug", type: "text", required: true },
        { key: "parent_id", label: "Thuộc nhóm", type: "select", options: [{ value: "", label: "— Nhóm cha —" }, ...parents.map((p) => ({ value: p.id, label: p.name }))] },
        { key: "sort_order", label: "Thứ tự", type: "number", min: 0 },
      ]}
      onSave={async (c, isNew) => {
        const r = await saveCategory({ ...c, parent_id: c.parent_id || null }, isNew);
        return r.ok ? null : r.error;
      }}
      onRemove={async (c) => {
        const r = await deleteCategory(c.id);
        return r.ok ? null : r.error;
      }}
    />
  );
}
