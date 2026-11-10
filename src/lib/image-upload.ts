/**
 * Tiện ích phía trình duyệt cho tải ảnh hàng loạt: đọc thư mục kéo thả, ghép ảnh với sản phẩm theo tên,
 * nén ảnh lớn rồi tải thẳng lên Cloudinary (signed preset; chữ ký do server cấp cho admin).
 */
export const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "";
/** Tải lên có chữ ký: khóa bí mật và tên preset nằm ở server (action signUploads), trình duyệt chỉ cần cloud name. */
export const uploadReady = Boolean(CLOUD_NAME);
export const MAX_FILE_BYTES = 10 * 1024 * 1024;
export const MAX_IMAGES = 10;

export type DropFile = { file: File; path: string };

const okType = (f: File) => /^image\/(jpeg|png|webp)$/.test(f.type) || /\.(jpe?g|png|webp)$/i.test(f.name);
export const isUsable = (f: File) => okType(f) && f.size <= MAX_FILE_BYTES;

/** Đọc mọi file từ sự kiện thả (kể cả cả thư mục, đệ quy). */
export async function readDrop(dt: DataTransfer): Promise<DropFile[]> {
    const entries: FileSystemEntry[] = [];
    for (const it of Array.from(dt.items ?? [])) {
        const e = it.kind === "file" ? it.webkitGetAsEntry?.() : null; // phải gọi đồng bộ trước khi await
        if (e) entries.push(e);
    }
    if (!entries.length) return Array.from(dt.files).map((file) => ({ file, path: file.name }));
    const out: DropFile[] = [];
    const walk = async (e: FileSystemEntry): Promise<void> => {
        if (e.isFile) {
            const file = await new Promise<File>((res, rej) => (e as FileSystemFileEntry).file(res, rej));
            out.push({ file, path: e.fullPath.replace(/^\//, "") });
        } else if (e.isDirectory) {
            const reader = (e as FileSystemDirectoryEntry).createReader();
            for (; ;) {
                const batch = await new Promise<FileSystemEntry[]>((res, rej) => reader.readEntries(res, rej));
                if (!batch.length) break;
                for (const c of batch) await walk(c);
            }
        }
    };
    for (const e of entries) await walk(e);
    return out;
}

/** Chuẩn hóa để so khớp: bỏ dấu, thường, mọi ký tự không phải chữ/số → "-". */
export const nk = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/gi, "d").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export type MatchRow = { slug: string; skus: string[] };
export type MatchResult = { assigned: Map<string, DropFile[]>; unassigned: DropFile[] };

const collator = new Intl.Collator("vi", { numeric: true });

/**
 * Quy ước: `SKU_1.jpg`, `SKU_2.jpg` (hoặc slug thay SKU), hoặc thư mục `SKU/1.jpg`, `SKU/2.jpg`.
 * Số 1 = ảnh chính. Không có số: sắp theo tên file.
 */
export function matchFiles(files: DropFile[], rows: MatchRow[]): MatchResult {
    const lookup = new Map<string, string | null>(); // null = trùng khóa giữa 2 sản phẩm → bỏ qua
    const put = (k: string, slug: string) => {
        if (!k) return;
        lookup.set(k, lookup.has(k) && lookup.get(k) !== slug ? null : slug);
    };
    for (const r of rows) {
        put(nk(r.slug), r.slug);
        for (const s of r.skus) put(nk(s), r.slug);
    }
    const hit = new Map<string, { f: DropFile; n: number }[]>();
    const unassigned: DropFile[] = [];
    for (const f of files) {
        if (!okType(f.file)) continue;
        const parts = f.path.split("/");
        const base = parts[parts.length - 1].replace(/\.[^.]+$/, "");
        const num = /^(.*?)[_\s]+\(?(\d+)\)?$/.exec(base);
        let slug: string | null = null;
        let n = 0;
        // 1) thư mục cha khớp SKU/slug
        for (let i = parts.length - 2; i >= 0 && !slug; i--) {
            const s = lookup.get(nk(parts[i]));
            if (s) {
                slug = s;
                const lead = /^\(?(\d+)/.exec(base);
                n = lead ? Number(lead[1]) : 0;
            }
        }
        // 2) tên file: KHÓA_số hoặc cả tên là khóa
        if (!slug && num) {
            const s = lookup.get(nk(num[1]));
            if (s) { slug = s; n = Number(num[2]); }
        }
        if (!slug) {
            const s = lookup.get(nk(base));
            if (s) slug = s;
        }
        if (!slug) { unassigned.push(f); continue; }
        hit.set(slug, [...(hit.get(slug) ?? []), { f, n }]);
    }
    const assigned = new Map<string, DropFile[]>();
    for (const [slug, list] of hit) {
        list.sort((a, b) => (a.n || 1e9) - (b.n || 1e9) || collator.compare(a.f.path, b.f.path));
        assigned.set(slug, list.map((x) => x.f));
    }
    return { assigned, unassigned };
}

/** Thu nhỏ ảnh lớn (cạnh dài > 2000px hoặc > 2MB) sang WebP trước khi tải; giữ nguyên nếu không có lợi. */
async function prepare(file: File): Promise<Blob> {
    try {
        const bmp = await createImageBitmap(file);
        const scale = Math.min(1, 2000 / Math.max(bmp.width, bmp.height));
        if (scale === 1 && file.size <= 2 * 1024 * 1024) { bmp.close(); return file; }
        const c = document.createElement("canvas");
        c.width = Math.round(bmp.width * scale);
        c.height = Math.round(bmp.height * scale);
        c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
        bmp.close();
        const blob = await new Promise<Blob | null>((res) => c.toBlob(res, "image/webp", 0.9));
        return blob && blob.size < file.size ? blob : file;
    } catch {
        return file;
    }
}

async function sha(blob: Blob): Promise<string> {
    const h = await crypto.subtle.digest("SHA-256", await blob.arrayBuffer());
    return Array.from(new Uint8Array(h)).map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 20);
}

export type Prepared = { blob: Blob; id: string; name: string };
/** Nén + tính mã băm nội dung (dùng làm public_id → ảnh trùng nội dung không bị tải lặp). */
export async function prepareUpload(file: File): Promise<Prepared> {
    const blob = await prepare(file);
    return { blob, id: await sha(blob), name: file.name };
}

export type Signed = { signature: string; timestamp: number; apiKey: string; preset: string; folder: string };

/** Tải 1 ảnh đã chuẩn bị lên Cloudinary bằng chữ ký do server cấp. Trả về secure_url. */
export async function uploadSigned(p: Prepared, s: Signed): Promise<string> {
    if (!uploadReady) throw new Error("Chưa cấu hình Cloudinary.");
    const fd = new FormData();
    fd.set("file", p.blob, p.name);
    fd.set("api_key", s.apiKey);
    fd.set("timestamp", String(s.timestamp));
    fd.set("signature", s.signature);
    fd.set("upload_preset", s.preset);
    fd.set("folder", s.folder);
    fd.set("public_id", p.id);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: "POST", body: fd });
    const j = (await res.json().catch(() => ({}))) as { secure_url?: string; error?: { message?: string } };
    if (!res.ok || !j.secure_url) throw new Error(j.error?.message ?? `Lỗi tải lên (${res.status})`);
    return j.secure_url;
}

/** Chạy tối đa `limit` tác vụ cùng lúc. */
export async function pool<T>(items: T[], limit: number, fn: (x: T) => Promise<void>): Promise<void> {
    let i = 0;
    await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => { while (i < items.length) await fn(items[i++]); }));
}