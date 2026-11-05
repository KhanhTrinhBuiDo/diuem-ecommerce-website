import { getAdmin } from "@/lib/admin-auth";
import { listCategories } from "@/lib/admin-data";
import { buildTemplate } from "@/lib/admin-import";

export const dynamic = "force-dynamic";

/** Tải file Excel mẫu nhập sản phẩm. Chỉ admin; người khác nhận 404. */
export async function GET() {
  if (!(await getAdmin())) return new Response("Not found", { status: 404 });
  const buf = await buildTemplate(await listCategories());
  return new Response(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="mau-nhap-san-pham-diu-em.xlsx"',
      "Cache-Control": "private, no-store",
    },
  });
}
