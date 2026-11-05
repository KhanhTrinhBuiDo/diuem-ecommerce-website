import { requireAdmin } from "@/lib/admin-auth";
import { listOrders } from "@/lib/admin-data";
import { OrdersAdmin } from "@/components/admin/OrdersAdmin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Đơn hàng" };

export default async function Page() {
  await requireAdmin();
  return <OrdersAdmin orders={await listOrders()} />;
}
