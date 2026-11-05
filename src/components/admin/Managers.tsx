"use client";

import { Badge, Toggle } from "@/components/admin/ui";
import { money } from "@/components/admin/shared";
import { ResourceManager } from "@/components/admin/ResourceManager";
import { ImageOrPlaceholder } from "@/components/ui/ImageOrPlaceholder";
import {
  adminBanners, adminCategories, roleLabel, type AdminRole, adminProducts, adminStaff, adminVouchers, categoryOptions,
  type AdminBanner, type AdminCategory, type AdminProduct, type AdminStaff, type AdminVoucher,
} from "@/data/admin";

const opt = (xs: string[]) => xs.map((x) => ({ value: x, label: x }));

const productStatus = { active: ["green", "Đang bán"], draft: ["amber", "Nháp"], hidden: ["gray", "Ẩn"] } as const;

export function ProductsManager() {
  return (
    <ResourceManager<AdminProduct>
      title="Sản phẩm"
      subtitle="Quản lý sản phẩm, giá, tồn kho và trạng thái hiển thị."
      noun="sản phẩm"
      initial={adminProducts}
      searchText={(p) => `${p.name} ${p.sku} ${p.category}`}
      filter={{ label: "Trạng thái", options: [{ value: "active", label: "Đang bán" }, { value: "draft", label: "Nháp" }, { value: "hidden", label: "Ẩn" }, { value: "low", label: "Sắp hết hàng (≤10)" }], match: (p, v) => (v === "low" ? p.stock <= 10 : p.status === v) }}
      blank={() => ({ id: "", name: "", sku: "", category: categoryOptions[0], price: 0, stock: 0, status: "draft", sold: 0 })}
      columns={[
        { header: "Sản phẩm", render: (p) => (
          <div className="flex items-center gap-3">
            <ImageOrPlaceholder src={null} alt="" label="" className="size-12 flex-none rounded-[8px]" />
            <div className="min-w-0"><p className="font-medium">{p.name}</p><p className="text-xs font-light text-black/50">{p.sku}</p></div>
          </div>
        ) },
        { header: "Danh mục", render: (p) => p.category },
        { header: "Giá", render: (p) => money(p.price) },
        { header: "Tồn kho", render: (p) => (p.stock === 0 ? <Badge tone="red">Hết hàng</Badge> : p.stock <= 10 ? <Badge tone="amber">Còn {p.stock}</Badge> : p.stock) },
        { header: "Đã bán", render: (p) => p.sold },
        { header: "Trạng thái", render: (p) => <Badge tone={productStatus[p.status][0]}>{productStatus[p.status][1]}</Badge> },
      ]}
      fields={[
        { key: "name", label: "Tên sản phẩm", type: "text", required: true },
        { key: "sku", label: "Mã SKU", type: "text", required: true },
        { key: "category", label: "Danh mục", type: "select", options: opt(categoryOptions) },
        { key: "status", label: "Trạng thái", type: "select", options: [{ value: "active", label: "Đang bán" }, { value: "draft", label: "Nháp" }, { value: "hidden", label: "Ẩn" }] },
        { key: "price", label: "Giá (VND)", type: "number", min: 0 },
        { key: "stock", label: "Tồn kho", type: "number", min: 0 },
      ]}
    />
  );
}

export function CategoriesManager() {
  return (
    <ResourceManager<AdminCategory>
      title="Danh mục"
      subtitle="Nhóm sản phẩm hiển thị ở menu và trang danh mục."
      noun="danh mục"
      initial={adminCategories}
      searchText={(c) => `${c.name} ${c.slug}`}
      blank={() => ({ id: "", name: "", slug: "", description: "", visible: true })}
      columns={[
        { header: "Tên", render: (c) => <span className="font-medium">{c.name}</span> },
        { header: "Đường dẫn", render: (c) => <code className="text-xs">/san-pham/{c.slug}</code> },
        { header: "Mô tả", render: (c) => <span className="font-light">{c.description}</span> },
        { header: "Hiển thị", render: (c) => <Badge tone={c.visible ? "green" : "gray"}>{c.visible ? "Hiện" : "Ẩn"}</Badge> },
      ]}
      fields={[
        { key: "name", label: "Tên danh mục", type: "text", required: true },
        { key: "slug", label: "Đường dẫn (slug)", type: "text", required: true },
        { key: "description", label: "Mô tả", type: "textarea" },
        { key: "visible", label: "Hiển thị trên website", type: "toggle" },
      ]}
    />
  );
}

export function VouchersManager() {
  return (
    <ResourceManager<AdminVoucher>
      title="Voucher"
      subtitle="Mã giảm giá."
      noun="voucher"
      initial={adminVouchers}
      searchText={(v) => v.code}
      filter={{ label: "Trạng thái", options: [{ value: "on", label: "Đang bật" }, { value: "off", label: "Đã tắt" }], match: (v, x) => (x === "on") === v.active }}
      blank={() => ({ id: "", code: "", type: "percent", value: 10, minOrder: 0, used: 0, limit: 100, expires: "2026-12-31", active: true })}
      columns={[
        { header: "Mã", render: (v) => <code className="font-bold">{v.code}</code> },
        { header: "Giảm", render: (v) => (v.type === "percent" ? `${v.value}%` : money(v.value)) },
        { header: "Đơn tối thiểu", render: (v) => money(v.minOrder) },
        { header: "Đã dùng", render: (v) => `${v.used}/${v.limit}` },
        { header: "Hết hạn", render: (v) => v.expires.split("-").reverse().join("/") },
        { header: "Bật", render: (v) => <Badge tone={v.active ? "green" : "gray"}>{v.active ? "Bật" : "Tắt"}</Badge> },
      ]}
      fields={[
        { key: "code", label: "Mã voucher", type: "text", required: true },
        { key: "type", label: "Loại giảm", type: "select", options: [{ value: "percent", label: "Phần trăm (%)" }, { value: "fixed", label: "Số tiền (VND)" }] },
        { key: "value", label: "Giá trị giảm", type: "number", min: 1 },
        { key: "minOrder", label: "Đơn tối thiểu (VND)", type: "number", min: 0 },
        { key: "limit", label: "Giới hạn lượt dùng", type: "number", min: 1 },
        { key: "expires", label: "Ngày hết hạn", type: "date", required: true },
        { key: "active", label: "Đang bật", type: "toggle" },
      ]}
    />
  );
}

export function BannersManager() {
  return (
    <ResourceManager<AdminBanner>
      title="Banner & nội dung"
      subtitle="Các vị trí ảnh/banner trên website."
      noun="banner"
      initial={adminBanners}
      searchText={(b) => `${b.slot} ${b.title}`}
      blank={() => ({ id: "", slot: "", title: "", link: "/", active: true })}
      columns={[
        { header: "Ảnh", render: () => <ImageOrPlaceholder src={null} alt="" label="" className="h-12 w-20 rounded-[8px]" /> },
        { header: "Vị trí", render: (b) => <span className="font-medium">{b.slot}</span> },
        { header: "Tiêu đề", render: (b) => b.title },
        { header: "Liên kết", render: (b) => <code className="text-xs">{b.link}</code> },
        { header: "Hiển thị", render: (b) => <Badge tone={b.active ? "green" : "gray"}>{b.active ? "Hiện" : "Ẩn"}</Badge> },
      ]}
      fields={[
        { key: "slot", label: "Vị trí", type: "text", required: true },
        { key: "title", label: "Tiêu đề", type: "text", required: true },
        { key: "link", label: "Liên kết", type: "text", required: true },
        { key: "active", label: "Hiển thị", type: "toggle" },
      ]}
    />
  );
}

export function StaffManager() {
  return (
    <ResourceManager<AdminStaff>
      title="Nhân viên & phân quyền"
      subtitle="Quản trị viên: toàn quyền. Quản lý sản phẩm: sản phẩm, danh mục. Xử lý đơn hàng: đơn hàng, khách hàng, voucher."
      noun="nhân viên"
      initial={adminStaff}
      searchText={(s) => `${s.name} ${s.email}`}
      canDelete={(s) => s.id !== "s1"}
      blank={() => ({ id: "", name: "", email: "", role: "orders", active: true })}
      columns={[
        { header: "Tên", render: (s) => <span className="font-medium">{s.name}</span> },
        { header: "Email", render: (s) => s.email },
        { header: "Vai trò", render: (s) => <Badge tone={s.role === "admin" ? "pink" : s.role === "catalog" ? "blue" : "amber"}>{roleLabel[s.role]}</Badge> },
        { header: "Trạng thái", render: (s) => <Badge tone={s.active ? "green" : "gray"}>{s.active ? "Hoạt động" : "Khóa"}</Badge> },
      ]}
      fields={[
        { key: "name", label: "Họ tên", type: "text", required: true },
        { key: "email", label: "Email", type: "text", required: true },
        { key: "role", label: "Vai trò", type: "select", options: (Object.keys(roleLabel) as AdminRole[]).map((r) => ({ value: r, label: roleLabel[r] })) },
        { key: "active", label: "Hoạt động", type: "toggle" },
      ]}
      extraActions={(s, up) => <Toggle checked={s.active} onChange={(v) => up({ active: v })} label={`Bật/tắt ${s.name}`} />}
    />
  );
}

// TODO(supabase): ảnh sản phẩm/banner tải lên Storage; dung tích (variants); đồng bộ danh mục ↔ mega menu (src/data/menu.ts).
// TODO(checkout): voucher phải được server kiểm tra điều kiện/hạn/lượt dùng khi đặt hàng.
// TODO(auth): role lưu ở profiles, kiểm tra bằng RLS.
