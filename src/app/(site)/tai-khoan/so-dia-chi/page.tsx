import type { Metadata } from "next";
import { AccountShell } from "@/components/account/AccountShell";
import { AddressesView } from "@/components/account/AddressesView";

export const metadata: Metadata = { title: "Sổ địa chỉ | Dịu Em" };

export default function Page() {
  return (
    <AccountShell active="dia-chi" crumb="Sổ địa chỉ" title="Sổ địa chỉ" subtitle="Quản lý địa chỉ nhận hàng của bạn">
      <AddressesView />
    </AccountShell>
  );
}
