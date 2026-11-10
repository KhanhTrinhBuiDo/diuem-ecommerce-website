"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { importProducts, saveProductImages } from "@/app/internal-admin/actions";
import { useAdminBase } from "@/components/admin/AdminBase";
import { ImageImporter, type SeedRow } from "@/components/admin/ImageImporter";
import { btn } from "@/components/admin/shared";
import { Badge, Dialog } from "@/components/admin/ui";
import type { ImportResponse, ImportSummary, RowError } from "@/lib/admin-import-spec";
import type { ProductRow } from "@/lib/admin-types";

/**
 * Nhập sản phẩm hàng loạt: (1) chọn Excel + kiểm tra → (2) kéo thả ảnh, ghép vào sản phẩm, xử lý ảnh trùng → (3) nhập.
 * Ảnh được trình duyệt tải thẳng lên Cloudinary rồi mới lưu link vào DB.
 */
export function ImportProducts() {
  const base = useAdminBase();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<{ text: string; rows?: RowError[] } | null>(null);
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const [done, setDone] = useState<ImportSummary | null>(null);
  const input = useRef<HTMLInputElement>(null);

  function reset() {
    setFile(null);
    setError(null);
    setSummary(null);
    setDone(null);
    if (input.current) input.current.value = "";
  }
  async function check() {
    if (!file || busy) return;
    setBusy(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.set("file", file);
      fd.set("commit", "0");
      const r: ImportResponse = await importProducts(fd);
      if (r.ok) setSummary(r.summary);
      else setError({ text: r.error, rows: r.rowErrors });
    } catch {
      setError({ text: "Không gửi được file (có thể file quá lớn hoặc mất kết nối). Thử lại." });
    } finally {
      setBusy(false);
    }
  }
  async function commit(images: Record<string, string[]>): Promise<string | null> {
    if (!file) return "Thiếu file Excel.";
    try {
      const fd = new FormData();
      fd.set("file", file);
      fd.set("commit", "1");
      fd.set("images", JSON.stringify(images));
      const r = await importProducts(fd);
      if (!r.ok) return r.error + (r.rowErrors?.length ? ` (${r.rowErrors[0].message})` : "");
      setDone(r.summary);
      router.refresh();
      return null;
    } catch {
      return "Không gửi được dữ liệu lên máy chủ. Ảnh đã tải lên Cloudinary vẫn được giữ; bấm nhập lại.";
    }
  }
  const rows: SeedRow[] = (summary?.products ?? []).map((p) => ({ slug: p.slug, name: p.name, isNew: p.isNew, skus: p.skus, existing: p.existingImages, links: p.excelImages }));

  return (
    <>
      <button type="button" className={btn.outline} onClick={() => setOpen(true)}>
        Nhập từ Excel
      </button>
      <Dialog open={open} onClose={() => { setOpen(false); reset(); }} title="Nhập sản phẩm từ Excel" wide={summary && !done ? "xl" : true}>
        {done ? (
          <div className="rounded-[10px] border-2 border-green-700 bg-green-50 p-4 text-sm">
            <p className="font-bold text-green-800">
              Đã nhập xong: {done.created} sản phẩm mới, {done.updated} cập nhật, {done.variants} phiên bản.
            </p>
            <p className="mt-1 text-xs">Sản phẩm mới có trạng thái Nháp; bật &quot;Đang bán&quot; sau khi kiểm tra.</p>
            <button type="button" className={`${btn.outline} mt-3`} onClick={reset}>Nhập file khác</button>
          </div>
        ) : summary ? (
          <div className="flex flex-col gap-3 text-sm">
            <div className="rounded-[10px] border-2 border-green-700 bg-green-50 p-3">
              <p className="font-bold text-green-800">
                File hợp lệ: {summary.created} sản phẩm mới, {summary.updated} cập nhật, {summary.variants} phiên bản.
              </p>
              <p className="mt-1 text-xs">Bước 2: thêm/sắp xếp ảnh cho từng sản phẩm (có thể bỏ qua nếu đã dán link trong Excel), rồi bấm nhập.</p>
            </div>
            <button type="button" className={`${btn.outline} self-start`} onClick={() => setSummary(null)}>← Chọn file khác</button>
            <ImageImporter rows={rows} commitLabel="Nhập vào hệ thống" onCommit={commit} />
          </div>
        ) : (
          <div className="flex flex-col gap-4 text-sm">
            <ol className="list-decimal space-y-1 pl-5 font-light">
              <li>Tải file mẫu (có danh sách danh mục, ví dụ và hướng dẫn trong file).</li>
              <li>Điền dữ liệu: cột hồng (*) hiển thị trên web và bắt buộc, cột xám không bắt buộc.</li>
              <li>Chọn file → <b>Kiểm tra</b> → danh sách sản phẩm sắp nhập hiện ra.</li>
              <li>Kéo thả ảnh (hoặc cả thư mục) vào, hệ thống tự ghép theo SKU/slug và tự tải lên Cloudinary.</li>
            </ol>
            <div>
              <a href={`${base}/san-pham/mau-nhap`} download className={btn.outline}>Tải file Excel mẫu (.xlsx)</a>
            </div>
            <label className="flex flex-col gap-1.5">
              <span className="font-medium">Chọn file đã điền</span>
              <input
                ref={input}
                type="file"
                accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={(e) => { setFile(e.target.files?.[0] ?? null); setError(null); }}
                className="rounded-[10px] border border-black p-2 text-sm"
              />
            </label>
            <div>
              <button type="button" className={btn.primary} disabled={!file || busy} onClick={check}>
                {busy ? "Đang kiểm tra..." : "Kiểm tra"}
              </button>
            </div>
            {error && (
              <div role="alert" className="rounded-[10px] border-2 border-red-600 bg-red-50 p-3">
                <p className="font-bold text-red-700">{error.text}</p>
                {error.rows && error.rows.length > 0 && (
                  <ul className="mt-2 max-h-56 list-disc space-y-0.5 overflow-y-auto pl-5 text-xs">
                    {error.rows.slice(0, 100).map((e, i) => <li key={i}>{e.row > 0 ? `Dòng ${e.row}: ` : ""}{e.message}</li>)}
                    {error.rows.length > 100 && <li>... và {error.rows.length - 100} lỗi khác</li>}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}
      </Dialog>
    </>
  );
}

/** "Tải ảnh hàng loạt": chỉ thêm/đổi ảnh cho các sản phẩm đã có, không cần Excel. */
export function BulkImages({ products }: { products: ProductRow[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [ok, setOk] = useState(false);
  const [gen, setGen] = useState(0);
  const rows: SeedRow[] = products.filter((p) => !p.deleted).map((p) => ({ slug: p.slug, name: p.name, isNew: false, skus: p.variants.map((v) => v.sku), existing: p.images, links: [] }));

  async function commit(images: Record<string, string[]>): Promise<string | null> {
    const r = await saveProductImages(images);
    if (!r.ok) return r.error;
    setOk(true);
    router.refresh();
    return null;
  }
  const close = () => { setOpen(false); setOk(false); setGen((g) => g + 1); };
  return (
    <>
      <button type="button" className={btn.outline} onClick={() => setOpen(true)}>Tải ảnh hàng loạt</button>
      <Dialog open={open} onClose={close} title="Tải ảnh hàng loạt" wide="xl">
        {ok ? (
          <div className="rounded-[10px] border-2 border-green-700 bg-green-50 p-4 text-sm">
            <p className="font-bold text-green-800">Đã cập nhật ảnh.</p>
            <button type="button" className={`${btn.outline} mt-3`} onClick={() => { setOk(false); setGen((g) => g + 1); }}>Tải thêm</button>
          </div>
        ) : (
          <ImageImporter key={gen} rows={rows} commitLabel="Lưu ảnh" onCommit={commit} />
        )}
      </Dialog>
    </>
  );
}