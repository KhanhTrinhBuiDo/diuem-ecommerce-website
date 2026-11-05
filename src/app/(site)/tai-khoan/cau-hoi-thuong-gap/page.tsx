import type { Metadata } from "next";
import { AccountShell } from "@/components/account/AccountShell";
import { FaqView } from "@/components/account/FaqView";

export const metadata: Metadata = { title: "Câu hỏi thường gặp | Dịu Em" };

export default function Page() {
  return (
    <AccountShell active="faq" crumb="Câu hỏi thường gặp" title="Câu hỏi thường gặp" rule="pink">
      <FaqView />
    </AccountShell>
  );
}
