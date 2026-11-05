"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Dialog, Field, PageHeader, SearchInput, Table, Toggle } from "@/components/admin/ui";
import { btn, inputCls } from "@/components/admin/shared";

export type FieldDef<T> = {
  key: keyof T & string;
  label: string;
  type: "text" | "number" | "select" | "textarea" | "toggle" | "date";
  options?: { value: string; label: string }[];
  required?: boolean;
  min?: number;
  /** Khóa khi sửa (vd mã voucher là khóa chính) */
  lockOnEdit?: boolean;
};
export type Column<T> = { header: string; render: (item: T) => ReactNode };
export type Filter<T> = { label: string; options: { value: string; label: string }[]; match: (item: T, value: string) => boolean };

type Props<T extends { id: string }> = {
  title: string;
  subtitle?: string;
  noun: string;
  initial: T[];
  columns: Column<T>[];
  fields: FieldDef<T>[];
  blank: () => T;
  searchText: (item: T) => string;
  filter?: Filter<T>;
  /** Cột thao tác thêm (vd bật/tắt) */
  extraActions?: (item: T, update: (patch: Partial<T>) => void) => ReactNode;
  canDelete?: (item: T) => boolean;
  headerExtra?: ReactNode;
  /** Có onSave/onRemove → ghi dữ liệu thật qua server action (trả về chuỗi lỗi hoặc null) */
  onSave?: (item: T, isNew: boolean) => Promise<string | null>;
  onRemove?: (item: T) => Promise<string | null>;
};

/**
 * Bảng quản lý CRUD dùng chung (sản phẩm, danh mục, voucher, banner, nhân viên).
 * Dữ liệu chỉ nằm trên trình duyệt (mock). TODO(supabase): thay setItems bằng server action + revalidate.
 */
export function ResourceManager<T extends { id: string }>({ title, subtitle, noun, initial, columns, fields, blank, searchText, filter, extraActions, canDelete, headerExtra, onSave, onRemove }: Props<T>) {
  const router = useRouter();
  const [items, setItems] = useState<T[]>(initial);
  const [q, setQ] = useState("");
  const [f, setF] = useState("");
  const [editing, setEditing] = useState<{ item: T; isNew: boolean } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirm, setConfirm] = useState<T | null>(null);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");
  useEffect(() => setItems(initial), [initial]);

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return items.filter((i) => (!needle || searchText(i).toLowerCase().includes(needle)) && (!filter || !f || filter.match(i, f)));
  }, [items, q, f, filter, searchText]);

  const update = (id: string, patch: Partial<T>) => setItems((l) => l.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    const er: Record<string, string> = {};
    for (const fd of fields) {
      const v = editing.item[fd.key] as unknown;
      if (fd.required && (v === "" || v === undefined || v === null)) er[fd.key] = "Bắt buộc";
      if (fd.type === "number" && (typeof v !== "number" || Number.isNaN(v) || v < (fd.min ?? 0))) er[fd.key] = `Nhập số ≥ ${fd.min ?? 0}`;
    }
    setErrors(er);
    if (Object.keys(er).length) return;
    if (onSave) {
      setBusy(true);
      setFormError("");
      const msg = await onSave(editing.item, editing.isNew);
      setBusy(false);
      if (msg) return setFormError(msg);
      setEditing(null);
      router.refresh();
      return;
    }
    setItems((l) => (editing.isNew ? [{ ...editing.item, id: `n${Date.now()}` }, ...l] : l.map((i) => (i.id === editing.item.id ? editing.item : i))));
    setEditing(null);
  }
  const set = (key: string, value: unknown) => setEditing((s) => (s ? { ...s, item: { ...s.item, [key]: value } } : s));

  return (
    <>
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={
          <>
            {headerExtra}
            <button type="button" className={btn.primary} onClick={() => { setErrors({}); setFormError(""); setEditing({ item: blank(), isNew: true }); }}>
              + Thêm {noun}
            </button>
          </>
        }
      />
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchInput value={q} onChange={setQ} placeholder={`Tìm ${noun}...`} />
        {filter && (
          <label className="flex items-center gap-2 text-sm">
            <span className="sr-only">{filter.label}</span>
            <select value={f} onChange={(e) => setF(e.target.value)} className={`${inputCls} h-11 w-auto rounded-full pr-8`}>
              <option value="">{filter.label}: tất cả</option>
              {filter.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        )}
        <p className="ml-auto text-sm font-light text-black/60">{shown.length} kết quả</p>
      </div>

      <Table head={[...columns.map((c) => c.header), "Thao tác"]} empty={shown.length ? undefined : `Không có ${noun} nào.`}>
        {shown.map((item) => (
          <tr key={item.id}>
            {columns.map((c) => (
              <td key={c.header}>{c.render(item)}</td>
            ))}
            <td>
              <div className="flex flex-wrap items-center gap-2">
                {extraActions?.(item, (p) => update(item.id, p))}
                <button type="button" className={btn.small} onClick={() => { setErrors({}); setFormError(""); setEditing({ item: { ...item }, isNew: false }); }}>
                  Sửa
                </button>
                {(canDelete?.(item) ?? true) && (
                  <button type="button" className="inline-flex h-8 items-center rounded-full border border-red-600 px-3 text-xs font-medium text-red-600 hover:bg-red-600 hover:text-white" onClick={() => setConfirm(item)}>
                    Xóa
                  </button>
                )}
              </div>
            </td>
          </tr>
        ))}
      </Table>

      <Dialog open={!!editing} onClose={() => setEditing(null)} title={editing?.isNew ? `Thêm ${noun}` : `Sửa ${noun}`}>
        {editing && (
          <form onSubmit={save} noValidate className="grid gap-4 sm:grid-cols-2">
            {fields.map((fd) => {
              const v = editing.item[fd.key] as unknown;
              const full = fd.type === "textarea" ? "sm:col-span-2" : "";
              return (
                <div key={fd.key} className={full}>
                  {fd.type === "toggle" ? (
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="font-medium">{fd.label}</span>
                      <Toggle checked={Boolean(v)} onChange={(x) => set(fd.key, x)} label={fd.label} />
                    </div>
                  ) : (
                    <Field label={fd.label} error={errors[fd.key]}>
                      {fd.type === "select" ? (
                        <select disabled={fd.lockOnEdit && !editing.isNew} value={String(v ?? "")} onChange={(e) => set(fd.key, e.target.value)} className={inputCls}>
                          {fd.options?.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      ) : fd.type === "textarea" ? (
                        <textarea value={String(v ?? "")} onChange={(e) => set(fd.key, e.target.value)} rows={3} className={`${inputCls} h-auto py-3`} />
                      ) : fd.type === "number" ? (
                        <input type="number" min={fd.min ?? 0} value={typeof v === "number" && !Number.isNaN(v) ? v : ""} onChange={(e) => set(fd.key, e.target.value === "" ? NaN : Number(e.target.value))} className={inputCls} />
                      ) : (
                        <input type={fd.type} readOnly={fd.lockOnEdit && !editing.isNew} value={String(v ?? "")} onChange={(e) => set(fd.key, e.target.value)} className={inputCls} />
                      )}
                    </Field>
                  )}
                </div>
              );
            })}
            {formError && <p role="alert" className="text-sm text-red-600 sm:col-span-2">{formError}</p>}
            <div className="flex justify-end gap-3 sm:col-span-2">
              <button type="button" className={btn.outline} onClick={() => setEditing(null)}>
                Hủy
              </button>
              <button type="submit" disabled={busy} className={btn.primary}>
                {busy ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </form>
        )}
      </Dialog>

      <Dialog open={!!confirm} onClose={() => { setConfirm(null); setFormError(""); }} title={`Xóa ${noun}?`}>
        <p className="text-sm font-light">Thao tác này không thể hoàn tác. Bạn chắc chắn muốn xóa mục đã chọn?</p>
        <div className="mt-5 flex justify-end gap-3">
          <button type="button" className={btn.outline} onClick={() => setConfirm(null)}>
            Hủy
          </button>
          {formError && <p role="alert" className="mr-auto text-sm text-red-600">{formError}</p>}
          <button
            type="button"
            className={btn.danger}
            disabled={busy}
            onClick={async () => {
              if (!confirm) return;
              if (onRemove) {
                setBusy(true);
                const msg = await onRemove(confirm);
                setBusy(false);
                if (msg) return setFormError(msg);
                router.refresh();
              } else setItems((l) => l.filter((i) => i.id !== confirm.id));
              setFormError("");
              setConfirm(null);
            }}
          >
            Xóa
          </button>
        </div>
      </Dialog>
    </>
  );
}
