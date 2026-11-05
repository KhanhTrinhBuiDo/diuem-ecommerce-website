import type { Metadata } from "next";
import { OrderLookup } from "@/components/account/OrderLookup";
import { ListenBanner } from "@/components/sections/ListenBanner";

export const metadata: Metadata = { title: "Tra cứu đơn hàng | Dịu Em" };

export default function Page() {
  return (
    <>
      <OrderLookup />
      <ListenBanner />
    </>
  );
}
