import { StockAdmin } from "@/components/admin/StockAdmin";
import { requireAdmin } from "@/lib/admin-auth";
import { listStock, listStockMovements } from "@/lib/admin-data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Kho hàng" };

export default async function Page() {
  await requireAdmin();
  const [rows, moves] = await Promise.all([listStock(), listStockMovements()]);
  return <StockAdmin rows={rows} moves={moves} />;
}
