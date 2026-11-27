import type { Metadata } from "next";
import Link from "next/link";
import { listMyVouchers } from "@/app/(site)/gio-hang/actions";
import { AccountShell } from "@/components/account/AccountShell";
import { LoginRequired } from "@/components/account/LoginRequired";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = { title: "Voucher của tôi | Dịu Em" };
export const dynamic = "force-dynamic"; // voucher riêng từng tài khoản

/** Voucher được cấp riêng cho tài khoản (chào bạn mới, combo, thân thiết…). Mã công khai theo dịp thì nhập ở giỏ hàng. */
export default async function Page() {
  let signedIn = false;
  if (isSupabaseConfigured()) {
    const { data } = await (await createClient()).auth.getUser();
    signedIn = Boolean(data.user);
  }
  const list = signedIn ? await listMyVouchers(0, 0) : [];
  return (
    <AccountShell active="voucher" crumb="Voucher của tôi" title="Voucher của tôi">
      {!signedIn ? (
        <LoginRequired what="voucher của bạn" />
      ) : list.length === 0 ? (
        <p className="py-10 text-center font-light">Hiện bạn chưa có voucher riêng nào. Mã theo dịp (ví dụ Black Friday, 20/10…) sẽ được thông báo trên website, nhập tại giỏ hàng.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {list.map((v) => (
            <li key={v.code} className="flex items-center justify-between gap-4 border border-black px-5 py-4">
              <div className="flex min-w-0 flex-col gap-1">
                <b className="text-[clamp(15px,calc(var(--vw)*1.2),20px)]">{v.title}</b>
                {v.description && <span className="text-sm font-light">{v.description}</span>}
                <span className="text-xs font-extralight">Mã {v.code} · còn {v.remaining} lượt{v.auto ? " · tự động áp dụng" : ""}</span>
              </div>
              <span className="shrink-0 text-[clamp(18px,calc(var(--vw)*1.6),28px)] font-bold">{v.percent ? `-${v.percent}%` : v.fixed ? `-${v.fixed.toLocaleString("vi-VN")}đ` : ""}</span>
            </li>
          ))}
        </ul>
      )}
      <Link href="/gio-hang" className="mt-6 inline-block underline">Đến giỏ hàng để dùng voucher</Link>
    </AccountShell>
  );
}
