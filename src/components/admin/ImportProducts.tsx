"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { importProducts } from "@/app/internal-admin/actions";
import { useAdminBase } from "@/components/admin/AdminBase";
import { btn } from "@/components/admin/shared";
import { Badge, Dialog } from "@/components/admin/ui";
import type { ImportResponse } from "@/lib/admin-import-spec";

/** Nhập sản phẩm hàng loạt từ Excel: tải file mẫu → chọn file → kiểm tra thử → nhập. */
export function ImportProducts() {
  const base = useAdminBase();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [res, setRes] = useState<ImportResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  function reset() {
    setFile(null);
    setRes(null);
    if (input.current) input.current.value = "";
  }
  async function run(commit: boolean) {
    if (!file || busy) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.set("file", file);
      fd.set("commit", commit ? "1" : "0");
      const r = await importProducts(fd);
      setRes(r);
      if (r.ok && r.committed) router.refresh();
    } catch {
      setRes({ ok: false, error: "Không gửi được file (có thể file quá lớn hoặc mất kết nối). Thử lại." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button type="button" className={btn.outline} onClick={() => setOpen(true)}>
        Nhập từ Excel
      </button>
      <Dialog open={open} onClose={() => { setOpen(false); reset(); }} title="Nhập sản phẩm từ Excel" wide>
        <div className="flex flex-col gap-4 text-sm">
          <ol className="list-decimal space-y-1 pl-5 font-light">
            <li>Tải file mẫu (có danh sách danh mục, ví dụ và hướng dẫn trong file).</li>
            <li>Điền dữ liệu: cột hồng (*) hiển thị trên web và bắt buộc, cột xám không bắt buộc.</li>
            <li>Nhiều ảnh trong một ô: cách nhau bằng dấu cách hoặc dấu phẩy, link đầu tiên là ảnh chính.</li>
            <li>Chọn file → <b>Kiểm tra</b> → nếu không có lỗi thì bấm <b>Nhập</b>.</li>
          </ol>
          <div>
            <a href={`${base}/san-pham/mau-nhap`} download className={btn.outline}>
              Tải file Excel mẫu (.xlsx)
            </a>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="font-medium">Chọn file đã điền</span>
            <input
              ref={input}
              type="file"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={(e) => { setFile(e.target.files?.[0] ?? null); setRes(null); }}
              className="rounded-[10px] border border-black p-2 text-sm"
            />
          </label>

          <div className="flex flex-wrap gap-3">
            <button type="button" className={btn.outline} disabled={!file || busy} onClick={() => run(false)}>
              {busy && !(res?.ok) ? "Đang xử lý..." : "Kiểm tra"}
            </button>
            <button type="button" className={btn.primary} disabled={!file || busy || !res?.ok || res.committed} onClick={() => run(true)}>
              {busy && res?.ok ? "Đang nhập..." : "Nhập vào hệ thống"}
            </button>
          </div>

          <div aria-live="polite">
            {res && !res.ok && (
              <div role="alert" className="rounded-[10px] border-2 border-red-600 bg-red-50 p-3">
                <p className="font-bold text-red-700">{res.error}</p>
                {res.rowErrors && res.rowErrors.length > 0 && (
                  <ul className="mt-2 max-h-56 list-disc space-y-0.5 overflow-y-auto pl-5 text-xs">
                    {res.rowErrors.slice(0, 100).map((e, i) => (
                      <li key={i}>{e.row > 0 ? `Dòng ${e.row}: ` : ""}{e.message}</li>
                    ))}
                    {res.rowErrors.length > 100 && <li>... và {res.rowErrors.length - 100} lỗi khác</li>}
                  </ul>
                )}
              </div>
            )}
            {res?.ok && (
              <div className="rounded-[10px] border-2 border-green-700 bg-green-50 p-3">
                <p className="font-bold text-green-800">
                  {res.committed ? "Đã nhập xong: " : "File hợp lệ. Sẽ nhập: "}
                  {res.summary.created} sản phẩm mới, {res.summary.updated} cập nhật, {res.summary.variants} phiên bản.
                </p>
                {!res.committed && <p className="mt-1 text-xs">Sản phẩm mới có trạng thái Nháp; bật &quot;Đang bán&quot; sau khi kiểm tra.</p>}
                <ul className="mt-2 max-h-48 space-y-1 overflow-y-auto text-xs">
                  {res.summary.products.slice(0, 100).map((p) => (
                    <li key={p.slug} className="flex items-center gap-2">
                      <Badge tone={p.isNew ? "pink" : "blue"}>{p.isNew ? "Mới" : "Cập nhật"}</Badge>
                      <span>{p.name}</span>
                      <span className="text-black/50">({p.variants} phiên bản)</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </Dialog>
    </>
  );
}
