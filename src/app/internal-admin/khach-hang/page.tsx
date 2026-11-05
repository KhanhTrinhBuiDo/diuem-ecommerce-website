import type { Metadata } from "next";
import { CustomersManager } from "@/components/admin/Operations";

export const metadata: Metadata = { title: "Khách hàng" };

export default function Page() {
  return <CustomersManager />;
}
