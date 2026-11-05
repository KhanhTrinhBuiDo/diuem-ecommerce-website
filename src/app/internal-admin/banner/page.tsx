import type { Metadata } from "next";
import { BannersManager } from "@/components/admin/Managers";

export const metadata: Metadata = { title: "Banner & nội dung" };

export default function Page() {
  return <BannersManager />;
}
