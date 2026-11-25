import type { Metadata } from "next";
import { AccountShell } from "@/components/account/AccountShell";
import { OrdersView } from "@/components/account/OrdersView";
import { listMyOrders } from "@/lib/orders";

export const metadata: Metadata = { title: "Lịch sử mua hàng | Dịu Em" };
export const dynamic = "force-dynamic"; // đơn của riêng từng người dùng, không cache

export default async function Page() {
  const { signedIn, orders } = await listMyOrders();
  return (
    <AccountShell active="lich-su" crumb="Lịch sử mua hàng" title="Lịch sử mua hàng">
      <OrdersView orders={orders} signedIn={signedIn} />
    </AccountShell>
  );
}
