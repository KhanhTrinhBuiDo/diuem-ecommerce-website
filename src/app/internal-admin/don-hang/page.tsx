import type { Metadata } from "next";
import { OrdersManager } from "@/components/admin/Operations";

export const metadata: Metadata = { title: "Đơn hàng" };

export default function Page() {
  return <OrdersManager />;
}
