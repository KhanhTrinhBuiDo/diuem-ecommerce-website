import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/catalog/Breadcrumb";
import { LoginRequired } from "@/components/account/LoginRequired";
import { OrderPanel } from "@/components/account/OrderPanel";
import { ListenBanner } from "@/components/sections/ListenBanner";
import { getMyOrder } from "@/lib/orders";

export const metadata: Metadata = { title: "Chi tiết đơn hàng | Dịu Em" };
export const dynamic = "force-dynamic";

/** [id] = mã đơn hàng (vd DE261122-00001). Chỉ đọc được đơn của chính người đăng nhập. */
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { signedIn, order } = await getMyOrder(decodeURIComponent(id));
  if (signedIn && !order) notFound();
  return (
    <>
      <Breadcrumb items={[{ label: "Lịch sử đơn hàng", href: "/tai-khoan/lich-su-mua-hang" }, { label: "Chi tiết đơn hàng" }]} />
      <div className="mx-auto w-full max-w-[1728px] px-6 pb-20 lg:px-[100px]">
        {order ? <OrderPanel order={order} back={{ label: "Trở lại", href: "/tai-khoan/lich-su-mua-hang" }} /> : <LoginRequired />}
      </div>
      <ListenBanner />
    </>
  );
}
