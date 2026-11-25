import type { Metadata } from "next";
import { AccountShell } from "@/components/account/AccountShell";
import { ProfileView } from "@/components/account/ProfileView";
import { getAccount } from "@/lib/account";

export const metadata: Metadata = { title: "Hồ sơ thông tin | Dịu Em" };
export const dynamic = "force-dynamic";

export default async function Page() {
  const { signedIn, profile } = await getAccount();
  return (
    <AccountShell active="ho-so" crumb="Hồ sơ thông tin" title="Hồ sơ thông tin" subtitle="Quản lý thông tin hồ sơ để bảo mật tài khoản">
      <ProfileView profile={profile} signedIn={signedIn} />
    </AccountShell>
  );
}
