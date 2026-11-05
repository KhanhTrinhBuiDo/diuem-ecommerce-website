import { requireAdmin } from "@/lib/admin-auth";
import { listCoupons } from "@/lib/admin-data";
import { CouponsAdmin } from "@/components/admin/SimpleManagers";

export const dynamic = "force-dynamic";
export const metadata = { title: "Voucher" };

export default async function Page() {
  await requireAdmin();
  return <CouponsAdmin coupons={await listCoupons()} />;
}
