import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/catalog/Breadcrumb";
import { OrderPanel } from "@/components/account/OrderPanel";
import { ListenBanner } from "@/components/sections/ListenBanner";
import { getOrder, mockOrders } from "@/data/account";

export const dynamicParams = false;
export const metadata: Metadata = { title: "Chi tiết đơn hàng | Dịu Em" };

// TODO(supabase): đọc đơn của chính người dùng đăng nhập, bỏ generateStaticParams.
export function generateStaticParams() {
  return mockOrders.map((o) => ({ id: o.id }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = getOrder(id);
  if (!order) notFound();
  return (
    <>
      <Breadcrumb items={[{ label: "Lịch sử đơn hàng", href: "/tai-khoan/lich-su-mua-hang" }, { label: "Chi tiết đơn hàng" }]} />
      <div className="mx-auto w-full max-w-[1728px] px-6 pb-20 lg:px-[100px]">
        <OrderPanel order={order} back={{ label: "Trở lại", href: "/tai-khoan/lich-su-mua-hang" }} />
      </div>
      <ListenBanner />
    </>
  );
}
