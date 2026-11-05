import type { Metadata } from "next";
import { AccountShell } from "@/components/account/AccountShell";
import { MyReviewsView } from "@/components/account/MyReviewsView";

export const metadata: Metadata = { title: "Đánh giá và phản hồi | Dịu Em" };

/**
 * Hai trạng thái theo Figma: có đánh giá / chưa có (hoặc chưa đăng nhập).
 * Tạm thời xem trạng thái trống qua `?trang-thai=trong`.
 * TODO(auth): trạng thái lấy từ số đánh giá thật của người dùng.
 */
export default async function Page({ searchParams }: { searchParams: Promise<{ "trang-thai"?: string }> }) {
  const sp = await searchParams;
  return (
    <AccountShell active="danh-gia" crumb="Đánh giá và phản hồi" title="Đánh giá và phản hồi">
      <MyReviewsView empty={sp["trang-thai"] === "trong"} />
    </AccountShell>
  );
}
