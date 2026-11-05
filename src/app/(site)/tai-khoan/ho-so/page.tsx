import type { Metadata } from "next";
import { AccountShell } from "@/components/account/AccountShell";
import { ProfileView } from "@/components/account/ProfileView";

export const metadata: Metadata = { title: "Hồ sơ thông tin | Dịu Em" };

export default function Page() {
  return (
    <AccountShell active="ho-so" crumb="Hồ sơ thông tin" title="Hồ sơ thông tin" subtitle="Quản lý thông tin hồ sơ để bảo mật tài khoản">
      <ProfileView />
    </AccountShell>
  );
}
