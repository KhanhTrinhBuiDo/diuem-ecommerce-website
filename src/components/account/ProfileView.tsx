"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { updateProfile } from "@/app/(site)/tai-khoan/actions";
import { LoginRequired } from "@/components/account/LoginRequired";
import type { Profile } from "@/data/account";

const fmtDate = (iso: string) => (iso ? iso.split("-").reverse().join("/") : "Chưa cập nhật");

/** Figma "Hồ sơ thông tin": bảng nhãn–giá trị + nút đen "CẬP NHẬT THÔNG TIN CÁ NHÂN". Email đổi qua Supabase Auth (TODO(auth): luồng đổi email). */
export function ProfileView({ profile, signedIn }: { profile: Profile; signedIn: boolean }) {
  const router = useRouter();
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState(profile);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  if (!signedIn) return <LoginRequired what="hồ sơ của bạn" />;

  async function save(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setErr("");
    const r = await updateProfile(form).catch(() => ({ ok: false as const, error: "Không kết nối được máy chủ." }));
    setBusy(false);
    if (!r.ok) return setErr(r.error);
    setEdit(false);
    setMsg("Đã cập nhật thông tin cá nhân.");
    router.refresh();
  }

  const rows: [string, string][] = [
    ["Họ và tên:", profile.name || "Chưa cập nhật"],
    ["Số điện thoại:", profile.phone || "Chưa cập nhật"],
    ["Giới tính:", profile.gender || "Chưa cập nhật"],
    ["Email", profile.email || "—"],
    ["Ngày sinh:", fmtDate(profile.birthday)],
  ];
  const input = "h-12 w-full rounded-[5px] border border-black bg-white px-4 text-[clamp(14px,calc(var(--vw)*1.04),18px)] font-light";

  return (
    <div>
      {edit ? (
        <form onSubmit={save} noValidate className="flex max-w-[714px] flex-col gap-4 lg:px-[50px]">
          <div className="flex flex-col gap-1.5"><label htmlFor="pf-name" className="text-sm font-bold">Họ và tên</label>
            <input id="pf-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" className={input} /></div>
          <div className="flex flex-col gap-1.5"><label htmlFor="pf-phone" className="text-sm font-bold">Số điện thoại</label>
            <input id="pf-phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} autoComplete="tel" className={input} /></div>
          <div className="flex flex-col gap-1.5"><label htmlFor="pf-gender" className="text-sm font-bold">Giới tính</label>
            <select id="pf-gender" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value as Profile["gender"] })} className={input}>
              <option value="">Không chọn</option><option>Nam</option><option>Nữ</option><option>Khác</option>
            </select></div>
          <div className="flex flex-col gap-1.5"><label htmlFor="pf-bd" className="text-sm font-bold">Ngày sinh</label>
            <input id="pf-bd" type="date" value={form.birthday} max={new Date().toISOString().slice(0, 10)} onChange={(e) => setForm({ ...form, birthday: e.target.value })} className={input} /></div>
          <p className="text-sm text-black/60">Email: {profile.email} (không đổi được tại đây).</p>
          {err && <p role="alert" className="text-sm text-red-600">{err}</p>}
          <div className="flex gap-3">
            <button type="button" onClick={() => { setEdit(false); setForm(profile); setErr(""); }} className="h-[48px] rounded-full border-2 border-black px-8 font-light">Hủy</button>
            <button type="submit" disabled={busy} className="h-[48px] rounded-full bg-black px-8 font-bold text-white disabled:opacity-50">{busy ? "Đang lưu…" : "Lưu thông tin"}</button>
          </div>
        </form>
      ) : (
        <>
          <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 gap-y-5 text-[clamp(15px,calc(var(--vw)*1.27),22px)] leading-tight sm:gap-x-12 lg:px-[50px]">
            {rows.map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="font-bold lg:w-[279px]">{k}</dt>
                <dd className="break-words font-normal">{v}</dd>
              </div>
            ))}
          </dl>
          {msg && <p role="status" className="mt-6 text-sm text-brand lg:px-[50px]">{msg}</p>}
          <button type="button" onClick={() => { setForm(profile); setMsg(""); setEdit(true); }} className="mt-10 flex h-[59px] w-full max-w-[714px] items-center justify-center rounded-full border border-black bg-black px-6 text-[clamp(15px,calc(var(--vw)*1.27),22px)] font-bold text-white hover:opacity-80">
            CẬP NHẬT THÔNG TIN CÁ NHÂN
          </button>
        </>
      )}
      <div aria-hidden="true" className="mt-9 h-[5px] w-full bg-black" />
    </div>
  );
}
