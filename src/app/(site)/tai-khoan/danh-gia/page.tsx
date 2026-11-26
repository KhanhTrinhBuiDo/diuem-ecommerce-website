import type { Metadata } from "next";
import { AccountShell } from "@/components/account/AccountShell";
import { MyReviewsView } from "@/components/account/MyReviewsView";
import { listMyReviews } from "@/lib/reviews";

export const metadata: Metadata = { title: "Đánh giá và phản hồi | Dịu Em" };
export const dynamic = "force-dynamic"; // đánh giá của riêng từng người dùng

/** Đánh giá thật của tài khoản đang đăng nhập (chưa có → câu thông báo + banner "Khám phá"). */
export default async function Page() {
  const { signedIn, reviews } = await listMyReviews();
  return (
    <AccountShell active="danh-gia" crumb="Đánh giá và phản hồi" title="Đánh giá và phản hồi">
      <MyReviewsView reviews={reviews} signedIn={signedIn} />
    </AccountShell>
  );
}
