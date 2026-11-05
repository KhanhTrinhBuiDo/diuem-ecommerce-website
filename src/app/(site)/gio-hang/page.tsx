import type { Metadata } from "next";
import { Breadcrumb } from "@/components/catalog/Breadcrumb";
import { CartPage } from "@/components/cart/CartPage";
import { ListenBanner } from "@/components/sections/ListenBanner";

export const metadata: Metadata = { title: "Giỏ hàng" };

export default function Page() {
  return (
    <>
      <Breadcrumb items={[{ label: "Giỏ hàng" }]} />
      <CartPage />
      <ListenBanner />
    </>
  );
}
