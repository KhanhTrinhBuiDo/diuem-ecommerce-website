import type { Metadata } from "next";
import { StaffManager } from "@/components/admin/Managers";

export const metadata: Metadata = { title: "Nhân viên & phân quyền" };

export default function Page() {
  return <StaffManager />;
}
