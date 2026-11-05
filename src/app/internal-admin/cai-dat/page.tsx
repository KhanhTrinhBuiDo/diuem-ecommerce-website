import type { Metadata } from "next";
import { SettingsForm } from "@/components/admin/Operations";

export const metadata: Metadata = { title: "Cài đặt" };

export default function Page() {
  return <SettingsForm />;
}
