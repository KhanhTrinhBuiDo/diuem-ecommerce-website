import type { Metadata } from "next";
import { ReviewsManager } from "@/components/admin/Operations";

export const metadata: Metadata = { title: "Đánh giá" };

export default function Page() {
  return <ReviewsManager />;
}
