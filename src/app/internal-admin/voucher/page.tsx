import type { Metadata } from "next";
import { VouchersManager } from "@/components/admin/Managers";

export const metadata: Metadata = { title: "Voucher" };

export default function Page() {
  return <VouchersManager />;
}
