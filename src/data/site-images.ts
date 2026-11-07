import manifest from "@/data/image-manifest.json";

/**
 * Ảnh cố định của giao diện. Bỏ file vào public/images/<đúng cấu trúc thư mục của bạn>.<png|jpg|webp|svg> (xem docs/BAN_DO_ANH.md; không phân biệt hoa/thường)
 * rồi push; script scripts/scan-images.mjs tự chạy trước dev/build để cập nhật image-manifest.json.
 * Chưa có file → trả về null → hiện khung placeholder.
 */
export function siteImage(key: string): string | null {
    return (manifest as Record<string, string>)[key.toLowerCase()] ?? null;
}