"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { signUploads } from "@/app/internal-admin/actions";
import { btn } from "@/components/admin/shared";
import { Badge } from "@/components/admin/ui";
import { MAX_FILE_BYTES, MAX_IMAGES, isUsable, matchFiles, pool, prepareUpload, readDrop, uploadReady, uploadSigned, type DropFile, type Prepared } from "@/lib/image-upload";

/** Dòng sản phẩm đầu vào cho màn hình kéo thả ảnh. */
export type SeedRow = { slug: string; name: string; isNew: boolean; skus: string[]; existing: string[]; links: string[] };
type Mode = "replace" | "skip" | "edit";
type Img = { id: string; kind: "existing" | "link" | "new"; url?: string; file?: File; sig?: string; preview: string; status: "idle" | "err"; err?: string };
type RowState = SeedRow & { items: Img[]; mode: Mode };

const modeText: Record<Mode, string> = { edit: "Giữ để sửa (giữ cả ảnh cũ và mới)", replace: "Replace (thay bằng ảnh mới)", skip: "Skip (bỏ qua ảnh mới)" };
const sm = "rounded-full border border-black px-2 py-0.5 text-xs hover:bg-black/10 disabled:opacity-30";
const sig = (f: File) => `${f.name}|${f.size}|${f.lastModified}`;
const thumb = (u: string) => (u.includes("/upload/") ? u.replace("/upload/", "/upload/c_fill,w_160,h_160,f_auto,q_auto/") : u);
let seq = 0;
const uid = () => `i${++seq}`;

/** Danh sách ảnh cuối cùng của 1 sản phẩm theo chế độ xử lý trùng. */
function finalList(r: RowState): Img[] {
    const hasEx = r.items.some((i) => i.kind === "existing");
    const hasNew = r.items.some((i) => i.kind !== "existing");
    if (hasEx && hasNew) {
        if (r.mode === "skip") return r.items.filter((i) => i.kind === "existing");
        if (r.mode === "replace") return r.items.filter((i) => i.kind !== "existing");
    }
    return r.items;
}
const keyOf = (i: Img) => i.url ?? i.id;
const isChanged = (r: RowState) => {
    const f = finalList(r).map(keyOf);
    return f.length > 0 && JSON.stringify(f) !== JSON.stringify(r.existing);
};

type Props = {
    rows: SeedRow[];
    commitLabel: string;
    /** Nhận {slug: [link ảnh...]} chỉ cho sản phẩm có thay đổi; trả về thông báo lỗi hoặc null nếu xong. */
    onCommit: (images: Record<string, string[]>) => Promise<string | null>;
};

export function ImageImporter({ rows: seed, commitLabel, onCommit }: Props) {
    const previews = useRef<string[]>([]);
    const [rows, setRows] = useState<RowState[]>(() =>
        seed.map((s) => ({
            ...s,
            mode: "edit" as Mode,
            items: [
                ...s.existing.map((url): Img => ({ id: uid(), kind: "existing", url, preview: thumb(url), status: "idle" })),
                ...s.links.filter((u) => !s.existing.includes(u)).map((url): Img => ({ id: uid(), kind: "link", url, preview: thumb(url), status: "idle" })),
            ],
        })),
    );
    const rowsRef = useRef(rows);
    rowsRef.current = rows;
    const [tray, setTray] = useState<DropFile[]>([]);
    const [globalMode, setGlobalMode] = useState<Mode>("edit");
    const [notice, setNotice] = useState("");
    const [busy, setBusy] = useState(false);
    const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
    const [msg, setMsg] = useState("");
    const [over, setOver] = useState<string | null>(null);
    const fileIn = useRef<HTMLInputElement>(null);
    const dirIn = useRef<HTMLInputElement>(null);
    const trayUrls = useRef(new Map<File, string>());

    useEffect(() => () => { previews.current.forEach(URL.revokeObjectURL); trayUrls.current.forEach(URL.revokeObjectURL); }, []);

    const patchRow = (slug: string, fn: (r: RowState) => RowState) => setRows((p) => p.map((r) => (r.slug === slug ? fn(r) : r)));
    const trayUrl = (f: File) => {
        let u = trayUrls.current.get(f);
        if (!u) { u = URL.createObjectURL(f); trayUrls.current.set(f, u); }
        return u;
    };

    function addToRows(map: Map<string, DropFile[]>): { added: number; overflow: number } {
        let added = 0, overflow = 0;
        setRows((prev) =>
            prev.map((r) => {
                const files = map.get(r.slug);
                if (!files?.length) return r;
                const have = new Set(r.items.map((i) => i.sig).filter(Boolean));
                const items = [...r.items];
                for (const f of files) {
                    if (have.has(sig(f.file))) continue;
                    if (items.length >= MAX_IMAGES) { overflow++; continue; }
                    const preview = URL.createObjectURL(f.file);
                    previews.current.push(preview);
                    items.push({ id: uid(), kind: "new", file: f.file, sig: sig(f.file), preview, status: "idle" });
                    added++;
                }
                return { ...r, items };
            }),
        );
        return { added, overflow };
    }

    function intake(files: DropFile[], slug?: string) {
        setMsg("");
        const usable = files.filter((f) => isUsable(f.file));
        const rejected = files.filter((f) => !isUsable(f.file) && !f.path.endsWith(".DS_Store") && !/^(thumbs\.db|desktop\.ini)$/i.test(f.file.name)).length;
        let map: Map<string, DropFile[]>;
        let un: DropFile[] = [];
        if (slug) map = new Map([[slug, usable]]);
        else {
            const m = matchFiles(usable, rowsRef.current);
            map = m.assigned;
            un = m.unassigned;
        }
        const { added, overflow } = addToRows(map);
        if (un.length) setTray((t) => [...t, ...un.filter((u) => !t.some((x) => sig(x.file) === sig(u.file)))]);
        const parts = [`Đã thêm ${added} ảnh`];
        if (un.length) parts.push(`${un.length} ảnh chưa khớp sản phẩm nào (xem khay "Chưa gán")`);
        if (overflow) parts.push(`${overflow} ảnh vượt giới hạn ${MAX_IMAGES} ảnh/sản phẩm`);
        if (rejected) parts.push(`${rejected} file bị bỏ (không phải jpg/png/webp hoặc > ${MAX_FILE_BYTES / 1024 / 1024}MB)`);
        setNotice(parts.join("; ") + ".");
    }

    const dropOn = (slug?: string) => ({
        onDragOver: (e: React.DragEvent) => { e.preventDefault(); setOver(slug ?? "*"); },
        onDragLeave: () => setOver(null),
        onDrop: async (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setOver(null);
            intake(await readDrop(e.dataTransfer), slug);
        },
    });

    const fromInput = (e: React.ChangeEvent<HTMLInputElement>, slug?: string) => {
        const list = Array.from(e.target.files ?? []).map((file) => ({ file, path: (file as File & { webkitRelativePath?: string }).webkitRelativePath || file.name }));
        e.target.value = "";
        intake(list, slug);
    };

    function assignTray(f: DropFile, slug: string) {
        setTray((t) => t.filter((x) => x !== f));
        addToRows(new Map([[slug, [f]]]));
    }
    const move = (slug: string, i: number, d: -1 | 1) =>
        patchRow(slug, (r) => {
            const j = i + d;
            if (j < 0 || j >= r.items.length) return r;
            const items = [...r.items];
            [items[i], items[j]] = [items[j], items[i]];
            return { ...r, items };
        });
    const setMain = (slug: string, i: number) => patchRow(slug, (r) => ({ ...r, items: [r.items[i], ...r.items.filter((_, k) => k !== i)] }));
    const removeAt = (slug: string, i: number) => patchRow(slug, (r) => ({ ...r, items: r.items.filter((_, k) => k !== i) }));
    const applyAllModes = (m: Mode) => { setGlobalMode(m); setRows((p) => p.map((r) => ({ ...r, mode: m }))); };

    const stats = useMemo(() => {
        const ch = rows.filter(isChanged);
        const up = ch.reduce((n, r) => n + finalList(r).filter((i) => i.kind === "new" && !i.url).length, 0);
        return { changed: ch.length, upload: up };
    }, [rows]);

    async function commit() {
        if (busy) return;
        setBusy(true);
        setMsg("");
        try {
            const targets = rows.filter(isChanged).map((r) => ({ r, list: finalList(r) }));
            const jobs = targets.flatMap(({ r, list }) => list.filter((i) => i.kind === "new" && !i.url).map((i) => ({ slug: r.slug, img: i })));
            if (jobs.length && !uploadReady) { setMsg("Chưa cấu hình Cloudinary (NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME)."); return; }
            const done = new Map<string, string>();
            const mark = (j: { slug: string; img: Img }, patch: Partial<Img>) => patchRow(j.slug, (r) => ({ ...r, items: r.items.map((i) => (i.id === j.img.id ? { ...i, ...patch } : i)) }));
            let failed = 0, count = 0;
            setProgress({ done: 0, total: jobs.length });
            // 1) nén + băm (song song)  2) xin chữ ký 1 lần cho cả lô  3) tải lên (4 luồng)
            const prepared = new Map<string, Prepared>();
            await pool(jobs, 6, async (j) => {
                try { prepared.set(j.img.id, await prepareUpload(j.img.file!)); }
                catch { failed++; mark(j, { status: "err", err: "Không đọc được ảnh" }); }
            });
            const ready = jobs.filter((j) => prepared.has(j.img.id));
            let signed: Record<string, Parameters<typeof uploadSigned>[1]> = {};
            if (ready.length) {
                const sr = await signUploads(ready.map((j) => ({ slug: j.slug, id: prepared.get(j.img.id)!.id })));
                if (!sr.ok) { setMsg(sr.error); return; }
                signed = sr.signed;
            }
            await pool(ready, 4, async (j) => {
                try {
                    const p = prepared.get(j.img.id)!;
                    const url = await uploadSigned(p, signed[`${j.slug}/${p.id}`]);
                    done.set(j.img.id, url);
                    mark(j, { url, status: "idle", err: undefined });
                } catch (e) {
                    failed++;
                    mark(j, { status: "err", err: e instanceof Error ? e.message : "Lỗi" });
                }
                setProgress({ done: ++count, total: ready.length });
            });
            if (failed) { setMsg(`${failed} ảnh tải lên lỗi (đánh dấu đỏ). Bấm nút lần nữa để thử lại chỉ các ảnh lỗi; chưa lưu gì vào hệ thống.`); return; }
            const out: Record<string, string[]> = {};
            for (const { r, list } of targets) out[r.slug] = list.map((i) => i.url ?? done.get(i.id)!).filter(Boolean);
            const err = await onCommit(out);
            if (err) setMsg(err);
        } finally {
            setBusy(false);
            setProgress(null);
        }
    }

    return (
        <div className="flex flex-col gap-4 text-sm">
            {!uploadReady && (
                <p role="alert" className="rounded-[10px] border-2 border-amber-500 bg-amber-50 p-3 text-xs">
                    Chưa cấu hình Cloudinary nên chưa tải ảnh từ máy được (vẫn dùng được link). Đặt <code>NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME</code>, <code>CLOUDINARY_API_KEY</code>, <code>CLOUDINARY_API_SECRET</code>, <code>CLOUDINARY_UPLOAD_PRESET</code> trên Vercel rồi Redeploy.
                </p>
            )}

            <div
                {...dropOn()}
                className={`flex flex-col items-center gap-2 rounded-[14px] border-2 border-dashed px-4 py-6 text-center ${over === "*" ? "border-brand bg-brand/10" : "border-black/40"}`}
            >
                <p className="font-medium">Kéo thả ảnh hoặc cả thư mục vào đây</p>
                <p className="max-w-[640px] text-xs font-light">
                    Đặt tên <code>SKU_1.jpg</code>, <code>SKU_2.jpg</code>… (hoặc dùng slug thay SKU), hoặc thư mục tên SKU/slug chứa <code>1.jpg</code>, <code>2.jpg</code>…. Số 1 là ảnh chính. Ảnh không khớp sẽ vào khay &quot;Chưa gán&quot;.
                </p>
                <div className="flex gap-2">
                    <button type="button" className={btn.outline} onClick={() => fileIn.current?.click()}>Chọn ảnh</button>
                    <button type="button" className={btn.outline} onClick={() => dirIn.current?.click()}>Chọn thư mục</button>
                </div>
                <input ref={fileIn} type="file" multiple accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => fromInput(e)} />
                <input ref={dirIn} type="file" multiple hidden onChange={(e) => fromInput(e)} {...({ webkitdirectory: "", directory: "" } as object)} />
            </div>
            <p aria-live="polite" className="min-h-5 text-xs">{notice}</p>

            <label className="flex flex-wrap items-center gap-2">
                <span className="font-medium">Khi sản phẩm đã có ảnh (áp dụng cho tất cả):</span>
                <select value={globalMode} onChange={(e) => applyAllModes(e.target.value as Mode)} className="rounded-[10px] border border-black px-2 py-1">
                    {(Object.keys(modeText) as Mode[]).map((m) => <option key={m} value={m}>{modeText[m]}</option>)}
                </select>
                <span className="text-xs font-light">(có thể chỉnh riêng từng sản phẩm bên dưới)</span>
            </label>

            {tray.length > 0 && (
                <section aria-label="Ảnh chưa gán" className="rounded-[10px] border-2 border-amber-500 bg-amber-50 p-3">
                    <h3 className="mb-2 font-bold">Chưa gán ({tray.length})</h3>
                    <ul className="flex flex-wrap gap-3">
                        {tray.map((f) => (
                            <li key={sig(f.file)} className="flex w-[150px] flex-col gap-1">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={trayUrl(f.file)} alt="" className="size-[150px] rounded-[8px] object-cover" />
                                <span className="truncate text-xs" title={f.path}>{f.path}</span>
                                <select aria-label={`Gán ${f.file.name} vào sản phẩm`} defaultValue="" onChange={(e) => e.target.value && assignTray(f, e.target.value)} className="rounded-[8px] border border-black px-1 py-0.5 text-xs">
                                    <option value="">Gán vào…</option>
                                    {rows.map((r) => <option key={r.slug} value={r.slug}>{r.name}</option>)}
                                </select>
                                <button type="button" className={sm} onClick={() => setTray((t) => t.filter((x) => x !== f))}>Bỏ ảnh này</button>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            <ul className="flex flex-col gap-3">
                {rows.map((r) => {
                    const fin = new Set(finalList(r).map((i) => i.id));
                    const conflict = r.items.some((i) => i.kind === "existing") && r.items.some((i) => i.kind !== "existing");
                    return (
                        <li key={r.slug} {...dropOn(r.slug)} className={`rounded-[14px] border-2 p-3 ${over === r.slug ? "border-brand bg-brand/10" : "border-black"}`}>
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge tone={r.isNew ? "pink" : "blue"}>{r.isNew ? "Mới" : "Cập nhật"}</Badge>
                                <b>{r.name}</b>
                                <span className="text-xs font-light text-black/60">{r.skus.join(", ")}</span>
                                <span className="ml-auto flex items-center gap-2">
                                    {conflict && (
                                        <select aria-label={`Xử lý ảnh trùng cho ${r.name}`} value={r.mode} onChange={(e) => patchRow(r.slug, (x) => ({ ...x, mode: e.target.value as Mode }))} className="rounded-[8px] border border-black px-1 py-0.5 text-xs">
                                            {(Object.keys(modeText) as Mode[]).map((m) => <option key={m} value={m}>{modeText[m]}</option>)}
                                        </select>
                                    )}
                                    <label className={`${sm} cursor-pointer`}>
                                        + Ảnh
                                        <input type="file" multiple accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => fromInput(e, r.slug)} />
                                    </label>
                                </span>
                            </div>
                            {r.items.length === 0 ? (
                                <p className="mt-2 text-xs font-light">Chưa có ảnh. Kéo ảnh thả vào đây hoặc bấm &quot;+ Ảnh&quot;.</p>
                            ) : (
                                <ul className="mt-2 flex flex-wrap gap-3">
                                    {r.items.map((i, idx) => {
                                        const used = fin.has(i.id);
                                        return (
                                            <li key={i.id} className={`flex w-[104px] flex-col gap-1 ${used ? "" : "opacity-40"}`}>
                                                <div className={`relative ${i.status === "err" ? "ring-2 ring-red-600" : ""}`}>
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={i.preview} alt={`Ảnh ${idx + 1} của ${r.name}`} className="size-[104px] rounded-[8px] object-cover" loading="lazy" />
                                                    <span className="absolute left-1 top-1 rounded bg-black/70 px-1 text-[10px] text-white">
                                                        {idx === 0 ? "Chính" : idx + 1} · {i.kind === "existing" ? "Cũ" : i.kind === "link" ? "Link" : "Mới"}
                                                    </span>
                                                    {!used && <span className="absolute inset-x-0 bottom-0 bg-black/70 text-center text-[10px] text-white">Không dùng</span>}
                                                </div>
                                                {i.status === "err" && <span className="text-[10px] text-red-700" title={i.err}>Lỗi tải lên</span>}
                                                <div className="flex gap-1">
                                                    <button type="button" className={sm} aria-label="Chuyển sang trái" disabled={idx === 0} onClick={() => move(r.slug, idx, -1)}>←</button>
                                                    <button type="button" className={sm} aria-label="Chuyển sang phải" disabled={idx === r.items.length - 1} onClick={() => move(r.slug, idx, 1)}>→</button>
                                                    <button type="button" className={sm} aria-label="Đặt làm ảnh chính" disabled={idx === 0} onClick={() => setMain(r.slug, idx)}>★</button>
                                                    <button type="button" className={sm} aria-label="Bỏ ảnh" onClick={() => removeAt(r.slug, idx)}>✕</button>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </li>
                    );
                })}
            </ul>

            <div className="sticky bottom-0 -mx-6 flex flex-wrap items-center gap-3 border-t-2 border-black bg-white px-6 py-3">
                <button type="button" className={btn.primary} disabled={busy} onClick={commit}>
                    {busy ? (progress && progress.total ? `Đang tải ảnh ${progress.done}/${progress.total}…` : "Đang lưu…") : commitLabel}
                </button>
                <span className="text-xs">
                    {stats.changed} sản phẩm có thay đổi ảnh · {stats.upload} ảnh chờ tải lên
                </span>
                {msg && <p role="alert" className="w-full rounded-[10px] border-2 border-red-600 bg-red-50 p-2 text-xs font-bold text-red-700">{msg}</p>}
            </div>
        </div>
    );
}