import type { Metadata } from "next";
import { AccountShell } from "@/components/account/AccountShell";
import { OrdersView } from "@/components/account/OrdersView";

export const metadata: Metadata = { title: "Lịch sử mua hàng | Dịu Em" };

export default function Page() {
  return (
    <AccountShell active="lich-su" crumb="Lịch sử mua hàng" title="Lịch sử mua hàng">
      <OrdersView />
    </AccountShell>
  );
}
