"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { removeAddress, saveAddress, setDefaultAddress, type Result } from "@/app/(site)/tai-khoan/actions";
import { LoginRequired } from "@/components/account/LoginRequired";
import type { Address } from "@/data/account";

type Form = { id: string | null; name: string; phone: string; province: string; district: string; street: string };
const BLANK: Form = { id: null, name: "", phone: "", province: "", district: "", street: "" };
const PHONE_RE = /^(0|\+84)\d{9}$/;
const FIELDS = [
  ["name", "Họ và tên", "text"],
  ["phone", "Số điện thoại", "tel"],
  ["province", "Tỉnh/Thành phố", "text"],
  ["district", "Quận/Huyện", "text"],
  ["street", "Địa chỉ cụ thể (số nhà, đường)", "text"],
] as const;

/**
 * Figma "Sổ địa chỉ" — dữ liệu thật (bảng `customer_addresses`, thao tác qua hàm SQL, RLS theo tài khoản).
 * TODO(address): chọn Tỉnh/Phường từ danh mục hành chính mới (Figma ghi "cập nhật theo thông tin hành chính mới").
 */
export function AddressesView({ addresses, signedIn }: { addresses: Address[]; signedIn: boolean }) {
  const router = useRouter();
  const [form, setForm] = useState<Form | null>(null);
  const [err, setErr] = useState<Partial<Record<keyof Form, string>>>({});
  const [serverErr, setServerErr] = useState("");
  const [busy, setBusy] = useState(false);
  if (!signedIn) return <LoginRequired what="sổ địa chỉ của bạn" />;

  async function run(p: Promise<Result>): Promise<boolean> {
    setBusy(true);
    setServerErr("");
    const r = await p.catch(() => ({ ok: false as const, error: "Không kết nối được máy chủ." }));
    setBusy(false);
    if (!r.ok) { setServerErr(r.error); return false; }
    router.refresh();
    return true;
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form || busy) return;
    const er: typeof err = {};
    if (!form.name.trim()) er.name = "Vui lòng nhập họ tên";
    if (!PHONE_RE.test(form.phone.replace(/[\s.-]/g, ""))) er.phone = "Số điện thoại không hợp lệ";
    if (!form.province.trim()) er.province = "Vui lòng nhập tỉnh/thành phố";
    if (!form.district.trim()) er.district = "Vui lòng nhập quận/huyện";
    if (!form.street.trim()) er.street = "Vui lòng nhập địa chỉ cụ thể";
    setErr(er);
    if (Object.keys(er).length) return;
    if (await run(saveAddress(form))) setForm(null);
  }

  const list = addresses;
  const setDefault = (id: string) => void run(setDefaultAddress(id));
  const remove = (id: string) => { if (window.confirm("Xóa địa chỉ này?")) void run(removeAddress(id)); };
  const toForm = (a: Address): Form => ({ id: a.id, name: a.name, phone: a.phone, province: a.province, district: a.district, street: a.street });

  const input = "h-12 w-full rounded-[5px] border border-black bg-white px-4 text-[clamp(14px,calc(var(--vw)*1.04),18px)] font-light";

  return (
    <div className="flex flex-col gap-[35px]">
      {!form && serverErr && <p role="alert" className="text-sm text-red-600">{serverErr}</p>}
      {list.length === 0 && <p className="text-[clamp(14px,calc(var(--vw)*1.04),18px)] font-light">Bạn chưa có địa chỉ nào.</p>}
      {list.map((a) => (
        <article key={a.id} className="border border-black py-5">
          <div className="px-5 py-2.5 shadow-[0_4px_30px_rgba(0,0,0,0.05)] sm:px-[30px]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="flex flex-wrap items-center gap-x-5">
                <strong className="text-[clamp(16px,calc(var(--vw)*1.27),22px)]">{a.name}</strong>
                <span aria-hidden="true" className="text-2xl opacity-50">|</span>
                <span className="text-[clamp(14px,calc(var(--vw)*1.16),20px)] text-black/50">{a.phone}</span>
              </p>
              <p className="flex items-center gap-3 text-[13px] text-line underline">
                <button type="button" onClick={() => { setErr({}); setForm(toForm(a)); }} className="underline">
                  Cập nhật
                </button>
                {!a.isDefault && (
                  <>
                    <span aria-hidden="true" className="no-underline">|</span>
                    <button type="button" onClick={() => remove(a.id)} className="underline">
                      Xóa
                    </button>
                  </>
                )}
              </p>
            </div>
            <p className="mt-2.5 border-b-2 border-rule pb-3 text-[clamp(14px,calc(var(--vw)*1.04),18px)]">{a.line}</p>
          </div>
          <div className="flex items-center justify-between gap-3 px-5 pt-5 sm:px-[30px]">
            {a.isDefault ? (
              <span className="rounded-[5px] border-2 border-line px-10 py-2.5 text-[clamp(14px,calc(var(--vw)*1.04),18px)] font-light text-line">Mặc định</span>
            ) : (
              <span />
            )}
            <button
              type="button"
              disabled={a.isDefault}
              onClick={() => setDefault(a.id)}
              className="rounded-[5px] border-2 border-black px-8 py-2.5 text-[clamp(14px,calc(var(--vw)*1.04),18px)] font-light disabled:cursor-not-allowed disabled:opacity-50"
            >
              Thiết lập mặc định
            </button>
          </div>
        </article>
      ))}

      {form && (
        <form onSubmit={save} noValidate className="flex flex-col gap-4 border border-black p-5 sm:p-[30px]">
          <h2 className="text-[clamp(16px,calc(var(--vw)*1.27),22px)] font-bold">{form.id ? "Cập nhật địa chỉ" : "Thêm địa điểm"}</h2>
          {FIELDS.map(([k, label, type]) => (
            <div key={k} className="flex flex-col gap-1.5">
              <label htmlFor={`ad-${k}`} className="text-sm">{label}</label>
              <input id={`ad-${k}`} type={type} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} aria-invalid={err[k] ? true : undefined} className={input} />
              {err[k] && <p role="alert" className="text-sm text-red-600">{err[k]}</p>}
            </div>
          ))}
          {serverErr && <p role="alert" className="text-sm text-red-600">{serverErr}</p>}
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => { setForm(null); setErr({}); setServerErr(""); }} className="h-[42px] rounded-[5px] border-2 border-black px-6 font-light">
              Hủy
            </button>
            <button type="submit" disabled={busy} className="h-[42px] rounded-[5px] bg-black px-6 font-bold text-white disabled:opacity-50">
              Lưu
            </button>
          </div>
        </form>
      )}

      <div className="flex justify-end">
        <button type="button" onClick={() => { setErr({}); setServerErr(""); setForm(BLANK); }} className="h-[42px] rounded-[5px] border-2 border-black bg-black px-10 text-[clamp(14px,calc(var(--vw)*1.04),18px)] font-bold text-white [text-shadow:0_4px_10px_rgba(0,0,0,0.5)]">
          Thêm Địa điểm
        </button>
      </div>
    </div>
  );
}
