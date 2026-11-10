"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { saveProduct, setProductDeleted } from "@/app/internal-admin/actions";
import { BulkImages, ImportProducts } from "@/components/admin/ImportProducts";
import { btn, inputCls, money } from "@/components/admin/shared";
import { Badge, Dialog, Field, PageHeader, SearchInput, Table, Toggle } from "@/components/admin/ui";
import { productStatusText, sizeUnits, type CategoryRow, type ProductInput, type ProductRow, type ProductStatus, type VariantRow } from "@/lib/admin-types";
import { slugify } from "@/lib/admin-validate";

const statusTone = { draft: "amber", active: "green", discontinued: "gray" } as const;
const blankVariant = (): VariantRow => ({ sku: "", size_value: 100, size_unit: "ml", price_vnd: 0, stock_qty: 0, is_active: true });
const blank = (cat: string): ProductInput => ({
  slug: "", name: "", kind: "single", status: "draft", is_featured: false, category_id: cat, hero_material: "", short_description: "", usage_instructions: "",
  storage_instructions: "", warnings: "", shelf_life_months: null, pao_months: null, variants: [blankVariant()], images: [],
});
const toInput = (p: ProductRow): ProductInput => ({ ...p, variants: p.variants.map((v) => ({ ...v })), images: [...p.images] });

/** Quản lý sản phẩm: thêm/sửa, xóa mềm (deleted_at), khôi phục. Ảnh = link Cloudinary. */
export function ProductsAdmin({ products, categories }: { products: ProductRow[]; categories: CategoryRow[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [f, setF] = useState("");
  const [edit, setEdit] = useState<ProductInput | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [del, setDel] = useState<ProductRow | null>(null);
  const [imgDraft, setImgDraft] = useState("");

  const leafCats = categories.filter((c) => c.parent_id);
  const shown = useMemo(() => {
    const n = q.trim().toLowerCase();
    return products.filter((p) => {
      if (n && !`${p.name} ${p.slug} ${p.variants.map((v) => v.sku).join(" ")}`.toLowerCase().includes(n)) return false;
      if (f === "deleted") return p.deleted;
      if (p.deleted) return false;
      if (f === "low") return p.variants.some((v) => v.is_active && v.stock_qty <= 10);
      return !f || p.status === f;
    });
  }, [products, q, f]);

  const set = <K extends keyof ProductInput>(k: K, v: ProductInput[K]) => setEdit((e) => (e ? { ...e, [k]: v } : e));
  const setVariant = (i: number, patch: Partial<VariantRow>) => setEdit((e) => (e ? { ...e, variants: e.variants.map((v, j) => (j === i ? { ...v, ...patch } : v)) } : e));
  const num = (s: string) => (s === "" ? NaN : Number(s));

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!edit) return;
    setBusy(true);
    setError("");
    const r = await saveProduct(edit);
    setBusy(false);
    if (!r.ok) return setError(r.error);
    setEdit(null);
    router.refresh();
  }
  async function toggleDeleted(p: ProductRow, deleted: boolean) {
    setBusy(true);
    const r = await setProductDeleted(p.id, deleted);
    setBusy(false);
    setDel(null);
    if (!r.ok) return alert(r.error);
    router.refresh();
  }
  function addImage() {
    const u = imgDraft.trim();
    if (!u || !edit) return;
    set("images", [...edit.images, u]);
    setImgDraft("");
  }

  return (
    <>
      <PageHeader
        title="Sản phẩm"
        subtitle="Thêm, sửa, xóa mềm sản phẩm. Ảnh lưu bằng link Cloudinary."
        actions={
          <>
            <BulkImages products={products} />
            <ImportProducts />
            <button type="button" className={btn.primary} onClick={() => { setError(""); setSlugTouched(false); setEdit(blank(leafCats[0]?.id ?? "")); }}>
              + Thêm sản phẩm
            </button>
          </>
        }
      />
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchInput value={q} onChange={setQ} placeholder="Tên, slug, SKU..." />
        <label>
          <span className="sr-only">Trạng thái</span>
          <select value={f} onChange={(e) => setF(e.target.value)} className={`${inputCls} h-11 w-auto rounded-full pr-8`}>
            <option value="">Trạng thái: tất cả</option>
            {(Object.keys(productStatusText) as ProductStatus[]).map((s) => <option key={s} value={s}>{productStatusText[s]}</option>)}
            <option value="low">Sắp hết hàng (≤10)</option>
            <option value="deleted">Đã xóa</option>
          </select>
        </label>
        <p className="ml-auto text-sm font-light text-black/60">{shown.length} sản phẩm</p>
      </div>

      <Table head={["Sản phẩm", "Danh mục", "Giá", "Tồn kho", "Trạng thái", "Thao tác"]} empty={shown.length ? undefined : "Không có sản phẩm nào."}>
        {shown.map((p) => {
          const active = p.variants.filter((v) => v.is_active);
          const prices = active.map((v) => v.price_vnd);
          const stock = active.reduce((s, v) => s + v.stock_qty, 0);
          return (
            <tr key={p.id} className={p.deleted ? "opacity-60" : ""}>
              <td>
                <div className="flex items-center gap-3">
                  {p.images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.images[0]} alt="" className="size-12 flex-none rounded-[8px] object-cover" loading="lazy" />
                  ) : (
                    <span className="grid size-12 flex-none place-items-center rounded-[8px] bg-[linear-gradient(135deg,#ffe3f1,#f7b5d6)] text-[10px] text-brand">Ảnh</span>
                  )}
                  <div className="min-w-0"><p className="font-medium">{p.name}</p><p className="text-xs font-light text-black/50">{active.map((v) => v.sku).join(", ") || "—"}</p></div>
                </div>
              </td>
              <td>{p.category_name}</td>
              <td className="whitespace-nowrap">{prices.length ? (Math.min(...prices) === Math.max(...prices) ? money(prices[0]) : `${money(Math.min(...prices))} – ${money(Math.max(...prices))}`) : "—"}</td>
              <td>{stock === 0 ? <Badge tone="red">Hết hàng</Badge> : stock <= 10 ? <Badge tone="amber">Còn {stock}</Badge> : stock}</td>
              <td>{p.deleted ? <Badge tone="red">Đã xóa</Badge> : <Badge tone={statusTone[p.status]}>{productStatusText[p.status]}</Badge>}</td>
              <td>
                <div className="flex flex-wrap gap-2">
                  {p.deleted ? (
                    <button type="button" className={btn.small} disabled={busy} onClick={() => toggleDeleted(p, false)}>Khôi phục</button>
                  ) : (
                    <>
                      <button type="button" className={btn.small} onClick={() => { setError(""); setSlugTouched(true); setEdit(toInput(p)); }}>Sửa</button>
                      <button type="button" className="inline-flex h-8 items-center rounded-full border border-red-600 px-3 text-xs font-medium text-red-600 hover:bg-red-600 hover:text-white" onClick={() => setDel(p)}>Xóa</button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          );
        })}
      </Table>

      <Dialog open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? "Sửa sản phẩm" : "Thêm sản phẩm"} wide>
        {edit && (
          <form onSubmit={submit} className="flex flex-col gap-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Tên sản phẩm"><input required className={inputCls} value={edit.name} onChange={(e) => { set("name", e.target.value); if (!slugTouched) set("slug", slugify(e.target.value)); }} /></Field>
              <Field label="Slug (đường dẫn)"><input required className={inputCls} value={edit.slug} onChange={(e) => { setSlugTouched(true); set("slug", e.target.value); }} /></Field>
              <Field label="Danh mục">
                <select className={inputCls} value={edit.category_id} onChange={(e) => set("category_id", e.target.value)}>
                  {leafCats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="Trạng thái">
                <select className={inputCls} value={edit.status} onChange={(e) => set("status", e.target.value as ProductStatus)}>
                  {(Object.keys(productStatusText) as ProductStatus[]).map((s) => <option key={s} value={s}>{productStatusText[s]}</option>)}
                </select>
              </Field>
              <Field label="Nguyên liệu chủ đạo"><input className={inputCls} value={edit.hero_material} onChange={(e) => set("hero_material", e.target.value)} /></Field>
              <div className="flex items-center justify-between gap-3 text-sm"><span className="font-medium">Sản phẩm nổi bật</span><Toggle checked={edit.is_featured} onChange={(v) => set("is_featured", v)} label="Nổi bật" /></div>
              <div className="sm:col-span-2"><Field label="Mô tả ngắn"><textarea rows={3} className={`${inputCls} h-auto py-3`} value={edit.short_description} onChange={(e) => set("short_description", e.target.value)} /></Field></div>
              <div className="sm:col-span-2"><Field label="Hướng dẫn sử dụng"><textarea rows={2} className={`${inputCls} h-auto py-3`} value={edit.usage_instructions} onChange={(e) => set("usage_instructions", e.target.value)} /></Field></div>
              <Field label="Bảo quản"><textarea rows={2} className={`${inputCls} h-auto py-3`} value={edit.storage_instructions} onChange={(e) => set("storage_instructions", e.target.value)} /></Field>
              <Field label="Lưu ý"><textarea rows={2} className={`${inputCls} h-auto py-3`} value={edit.warnings} onChange={(e) => set("warnings", e.target.value)} /></Field>
              <Field label="Hạn sử dụng (tháng)"><input type="number" min={1} className={inputCls} value={edit.shelf_life_months ?? ""} onChange={(e) => set("shelf_life_months", e.target.value === "" ? null : Number(e.target.value))} /></Field>
              <Field label="Dùng trong (tháng sau mở nắp)"><input type="number" min={1} className={inputCls} value={edit.pao_months ?? ""} onChange={(e) => set("pao_months", e.target.value === "" ? null : Number(e.target.value))} /></Field>
            </div>

            <fieldset className="rounded-[10px] border-2 border-black p-4">
              <legend className="px-2 text-sm font-bold">Phiên bản (dung tích / giá / tồn kho)</legend>
              <div className="flex flex-col gap-4">
                {edit.variants.map((v, i) => (
                  <div key={i} className="grid items-end gap-3 sm:grid-cols-[1.3fr_0.8fr_0.7fr_1fr_0.8fr_auto]">
                    <Field label="SKU"><input required className={inputCls} value={v.sku} onChange={(e) => setVariant(i, { sku: e.target.value })} /></Field>
                    <Field label="Dung tích"><input type="number" min={0.01} step="any" className={inputCls} value={Number.isNaN(v.size_value) ? "" : v.size_value} onChange={(e) => setVariant(i, { size_value: num(e.target.value) })} /></Field>
                    <Field label="Đơn vị"><select className={inputCls} value={v.size_unit} onChange={(e) => setVariant(i, { size_unit: e.target.value as VariantRow["size_unit"] })}>{sizeUnits.map((u) => <option key={u}>{u}</option>)}</select></Field>
                    <Field label="Giá (VND)"><input type="number" min={0} className={inputCls} value={Number.isNaN(v.price_vnd) ? "" : v.price_vnd} onChange={(e) => setVariant(i, { price_vnd: num(e.target.value) })} /></Field>
                    <Field label="Tồn kho"><input type="number" min={0} className={inputCls} value={Number.isNaN(v.stock_qty) ? "" : v.stock_qty} onChange={(e) => setVariant(i, { stock_qty: num(e.target.value) })} /></Field>
                    <div className="flex items-center gap-2 pb-2">
                      <Toggle checked={v.is_active} onChange={(x) => setVariant(i, { is_active: x })} label={`Bật phiên bản ${v.sku}`} />
                      {edit.variants.length > 1 && !v.id && <button type="button" aria-label="Xóa dòng" className="text-lg leading-none text-red-600" onClick={() => set("variants", edit.variants.filter((_, j) => j !== i))}>×</button>}
                    </div>
                  </div>
                ))}
                <button type="button" className={`${btn.small} self-start`} onClick={() => set("variants", [...edit.variants, blankVariant()])}>+ Thêm phiên bản</button>
              </div>
            </fieldset>

            <fieldset className="rounded-[10px] border-2 border-black p-4">
              <legend className="px-2 text-sm font-bold">Ảnh (link Cloudinary – ảnh đầu tiên là ảnh chính)</legend>
              <ul className="mb-3 flex flex-wrap gap-3">
                {edit.images.map((u, i) => (
                  <li key={u + i} className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={u} alt={`Ảnh ${i + 1}`} className="size-20 rounded-[8px] object-cover" />
                    {i === 0 && <span className="absolute left-1 top-1 rounded bg-black px-1 text-[10px] text-white">Chính</span>}
                    <div className="mt-1 flex justify-between text-xs">
                      <button type="button" disabled={i === 0} onClick={() => set("images", [edit.images[i], ...edit.images.filter((_, j) => j !== i)])} className="underline disabled:opacity-30">Đặt chính</button>
                      <button type="button" onClick={() => set("images", edit.images.filter((_, j) => j !== i))} className="text-red-600 underline">Bỏ</button>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="flex gap-2">
                <input className={inputCls} placeholder="https://res.cloudinary.com/.../image/upload/..." value={imgDraft} onChange={(e) => setImgDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addImage(); } }} />
                <button type="button" className={btn.outline} onClick={addImage}>Thêm</button>
              </div>
            </fieldset>

            {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
            <div className="flex justify-end gap-3">
              <button type="button" className={btn.outline} onClick={() => setEdit(null)}>Hủy</button>
              <button type="submit" disabled={busy} className={btn.primary}>{busy ? "Đang lưu..." : "Lưu sản phẩm"}</button>
            </div>
          </form>
        )}
      </Dialog>

      <Dialog open={!!del} onClose={() => setDel(null)} title="Xóa sản phẩm?">
        <p className="text-sm font-light">“{del?.name}” sẽ bị ẩn khỏi cửa hàng (xóa mềm). Bạn có thể khôi phục trong bộ lọc “Đã xóa”.</p>
        <div className="mt-5 flex justify-end gap-3">
          <button type="button" className={btn.outline} onClick={() => setDel(null)}>Hủy</button>
          <button type="button" disabled={busy} className={btn.danger} onClick={() => del && toggleDeleted(del, true)}>Xóa</button>
        </div>
      </Dialog>
    </>
  );
}
