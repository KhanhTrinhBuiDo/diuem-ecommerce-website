import type { Metadata } from "next";
import { AccountShell } from "@/components/account/AccountShell";
import { AddressesView } from "@/components/account/AddressesView";
import { getAccount } from "@/lib/account";

export const metadata: Metadata = { title: "Sổ địa chỉ | Dịu Em" };
export const dynamic = "force-dynamic";

export default async function Page() {
  const { signedIn, addresses } = await getAccount();
  return (
    <AccountShell active="dia-chi" crumb="Sổ địa chỉ" title="Sổ địa chỉ" subtitle="Quản lý địa chỉ nhận hàng của bạn">
      <AddressesView addresses={addresses} signedIn={signedIn} />
    </AccountShell>
  );
}
