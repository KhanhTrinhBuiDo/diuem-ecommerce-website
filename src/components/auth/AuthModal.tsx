"use client";

import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { resolveAfterLogin } from "@/lib/after-login";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { LogoMark } from "@/components/ui/LogoMark";
import { CloseIcon } from "@/components/ui/icons";
import { EyeIcon, FacebookLogo, GiftIcon, GoogleLogo } from "@/components/ui/icons2";

export type AuthMode = "login" | "register";

type Props = { mode: AuthMode | null; onModeChange: (m: AuthMode) => void; onClose: () => void };

const benefits: { title: ReactNode; icon: ReactNode }[] = [
  { title: <>Ưu đãi<br />Độc quyền</>, icon: <span className="text-[44px] font-bold leading-none">%</span> },
  { title: <>Quà tặng<br />Giới hạn</>, icon: <GiftIcon className="h-10 w-11" /> },
  {
    title: <>Sự kiện<br />Đặc biệt</>,
    // TODO(icon): icon lịch/sự kiện từ Figma
    icon: (
      <svg viewBox="0 0 55 55" className="size-12" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
        <rect x="6" y="10" width="43" height="38" rx="3" />
        <path d="M6 20h43M17 4v10M38 4v10M18 33l7 7 12-13" />
      </svg>
    ),
  },
];

const inputCls = "h-[52px] w-full rounded-[30px] border-2 border-black/50 bg-white px-6 text-[clamp(15px,1.04vw,18px)] font-light placeholder:text-black/50 lg:px-[50px]";

function PasswordInput({ name, label, autoComplete }: { name: string; label: string; autoComplete: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input name={name} type={show ? "text" : "password"} aria-label={label} placeholder={label} autoComplete={autoComplete} required minLength={8} className={`${inputCls} pr-16`} />
      <button type="button" aria-label={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"} aria-pressed={show} onClick={() => setShow((s) => !s)} className="absolute right-5 top-1/2 grid size-8 -translate-y-1/2 place-items-center text-black/40 hover:text-black lg:right-[50px]">
        <EyeIcon off={show} className="size-6" />
      </button>
    </div>
  );
}

/**
 * Popup đăng nhập / đăng ký (Figma "Authen"): hộp trắng bo 30px, nút đóng đen tròn lệch góc phải-trên,
 * 3 quyền lợi, đăng nhập Google/Facebook, form email/SĐT + mật khẩu.
 *
 * Đã nối Supabase Auth: email + mật khẩu (signInWithPassword / signUp) và Google (OAuth).
 * Sau đăng nhập: tài khoản admin → chuyển vào trang quản trị bí mật; khách → ở lại cửa hàng.
 * TODO(auth): đăng nhập bằng SĐT (cần SMS provider); luồng quên mật khẩu (resetPasswordForEmail + trang đặt lại).
 * TODO(auth): Facebook có trong Figma nhưng chưa bật – cần xác nhận có làm không.
 */
export function AuthModal({ mode, onModeChange, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [notice, setNotice] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const isRegister = mode === "register";

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (mode && !d.open) d.showModal();
    if (!mode && d.open) d.close();
    setNotice(null);
  }, [mode]);

  const [busy, setBusy] = useState(false);
  const soon = (what: string) => setNotice({ kind: "ok", text: `${what} sẽ có sớm.` });

  async function afterSession() {
    const { redirect } = await resolveAfterLogin();
    if (redirect) window.location.assign(redirect);
    else {
      onClose();
      window.location.reload(); // làm mới dữ liệu theo phiên đăng nhập
    }
  }

  async function google() {
    if (!isSupabaseConfigured()) return setNotice({ kind: "err", text: "Chưa cấu hình Supabase (thiếu biến môi trường)." });
    const { error } = await createClient().auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/auth/callback` } });
    if (error) setNotice({ kind: "err", text: "Không thể đăng nhập bằng Google. Vui lòng thử lại." });
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const identity = String(f.get("identity") ?? "").trim();
    const password = String(f.get("password") ?? "");
    if (isRegister && password !== f.get("confirm")) return setNotice({ kind: "err", text: "Mật khẩu nhập lại chưa khớp." });
    if (!identity.includes("@")) return setNotice({ kind: "err", text: "Hiện chỉ hỗ trợ đăng nhập bằng email." });
    if (!isSupabaseConfigured()) return setNotice({ kind: "err", text: "Chưa cấu hình Supabase (thiếu biến môi trường)." });
    setBusy(true);
    setNotice(null);
    try {
      const sb = createClient();
      if (isRegister) {
        const { data, error } = await sb.auth.signUp({
          email: identity,
          password,
          options: { data: { full_name: String(f.get("name") ?? "").trim() }, emailRedirectTo: `${window.location.origin}/auth/callback` },
        });
        if (error) return setNotice({ kind: "err", text: error.message.includes("registered") ? "Email này đã được đăng ký." : "Không thể đăng ký. Vui lòng kiểm tra thông tin." });
        if (data.session) return await afterSession();
        return setNotice({ kind: "ok", text: "Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản." });
      }
      const { error } = await sb.auth.signInWithPassword({ email: identity, password });
      if (error) return setNotice({ kind: "err", text: "Email hoặc mật khẩu không đúng." });
      await afterSession();
    } finally {
      setBusy(false);
    }
  }

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className="m-auto w-[calc(100%-32px)] max-w-[1068px] overflow-visible rounded-[30px] bg-transparent p-0 backdrop:bg-black/30"
    >
      {mode && (
        <div className="relative rounded-[30px] bg-white">
          <button type="button" onClick={onClose} aria-label="Đóng" className="absolute -top-3 right-2 z-10 grid size-[50px] place-items-center rounded-full border-2 border-white bg-black text-white shadow-[0_4px_20px_rgba(0,0,0,0.5)] lg:-right-[35px] lg:-top-[35px] lg:size-[70px]">
            <CloseIcon className="size-[22px]" />
          </button>

          <div className="max-h-[90vh] overflow-y-auto rounded-[30px] px-6 pb-12 pt-10 lg:px-[100px] lg:pb-[100px] lg:pt-[50px]">
            <div className="flex flex-col gap-[25px]">
              <header className="flex flex-col gap-[15px]">
                <div className="flex items-center gap-3 text-brand">
                  <LogoMark className="h-[64px] w-[72px]" />
                  <span className="text-[clamp(28px,2.6vw,44px)] font-normal leading-none">Dịu Em</span>
                </div>
                <h2 id={titleId} className="text-[clamp(24px,2.55vw,44px)] font-medium leading-[1.25]">
                  Vô số đặc quyền và quyền lợi mua sắm đang chờ bạn
                </h2>
              </header>

              <section aria-label="Quyền lợi thành viên" className="flex flex-col gap-3">
                <p className="text-[clamp(14px,1.04vw,18px)] font-light">
                  Quyền lời dành riêng cho bạn khi tham gia <strong className="font-bold">Dịu Em</strong>
                </p>
                <ul className="grid gap-3 sm:grid-cols-3 lg:gap-5">
                  {benefits.map((b, i) => (
                    <li key={i} className="flex h-[108px] items-center gap-3 border-[10px] border-line bg-white px-3">
                      <span className="grid w-[60px] flex-none place-items-center text-black/70 blur-[1px]">{b.icon}</span>
                      <span className="text-[clamp(16px,1.27vw,22px)] font-bold leading-[1.4]">{b.title}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section aria-label="Đăng nhập nhanh" className="flex flex-col gap-[11px]">
                <h3 className="text-[clamp(14px,1.04vw,18px)] font-medium">Đăng nhập hoặc đăng ký (miễn phí)</h3>
                <div className="flex gap-5">
                  <button type="button" onClick={google} aria-label="Tiếp tục với Google" className="grid size-[70px] place-items-center rounded-[10px] border border-[#db7a6a] transition-colors hover:bg-black/5">
                    <GoogleLogo className="size-[49px]" />
                  </button>
                  <button type="button" onClick={() => soon("Đăng nhập Facebook")} aria-label="Tiếp tục với Facebook" className="grid size-[70px] place-items-center rounded-[10px] border border-[#db7a6a] transition-colors hover:bg-black/5">
                    <FacebookLogo className="size-[50px]" />
                  </button>
                </div>
              </section>

              <div role="separator" className="flex items-center gap-2.5">
                <span className="h-0.5 w-[120px] max-w-[20%] bg-rule" />
                <span className="text-[clamp(14px,1.04vw,18px)] font-light">Hoặc</span>
                <span className="h-0.5 flex-1 bg-rule" />
              </div>

              <form key={mode} onSubmit={onSubmit} className="flex flex-col gap-4" noValidate={false}>
                {isRegister ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    <input name="name" aria-label="Họ và tên" placeholder="Họ và tên" autoComplete="name" required className={inputCls} />
                    <input name="identity" aria-label="Email/SĐT của bạn" placeholder="Email/SĐT của bạn" autoComplete="email" required className={inputCls} />
                  </div>
                ) : (
                  <input name="identity" aria-label="Email/SĐT của bạn" placeholder="Email/SĐT của bạn" autoComplete="username" required className={inputCls} />
                )}
                <PasswordInput name="password" label="Mật khẩu" autoComplete={isRegister ? "new-password" : "current-password"} />
                {isRegister && <PasswordInput name="confirm" label="Nhập lại mật khẩu" autoComplete="new-password" />}

                <button type="submit" disabled={busy} className="h-[52px] w-full rounded-[30px] border-2 border-white/50 bg-black text-[clamp(15px,1.04vw,18px)] font-bold text-white outline outline-1 outline-black/50 transition-opacity hover:opacity-80 disabled:opacity-50">
                  {busy ? "Đang xử lý..." : isRegister ? "Đăng ký" : "Đăng nhập"}
                </button>

                {notice && (
                  <p role={notice.kind === "err" ? "alert" : "status"} className={`text-sm ${notice.kind === "err" ? "text-red-600" : "text-brand"}`}>
                    {notice.text}
                  </p>
                )}

                <div className="flex items-center justify-between gap-4 text-[clamp(14px,1.04vw,18px)] font-medium underline">
                  <button type="button" onClick={() => onModeChange(isRegister ? "login" : "register")} className="text-left underline hover:text-brand">
                    {isRegister ? "Đăng nhập ngay" : "Đăng ký tài khoản"}
                  </button>
                  {/* TODO(auth): trang/flow quên mật khẩu (resetPasswordForEmail) */}
                  <button type="button" onClick={() => soon("Tính năng quên mật khẩu")} className="text-right underline hover:text-brand">
                    Quên mật khẩu
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </dialog>
  );
}
