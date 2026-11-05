import { mockUser } from "@/data/account";

/** Figma "Hồ sơ thông tin": bảng nhãn–giá trị + nút đen "CẬP NHẬT THÔNG TIN CÁ NHÂN". */
export function ProfileView() {
  const rows = [
    ["Họ và tên:", mockUser.name],
    ["Số điện thoại:", mockUser.phone],
    ["Giới tính:", mockUser.gender],
    ["Email", mockUser.email],
    ["Ngày sinh:", mockUser.birthday],
  ];
  return (
    <div>
      <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 gap-y-5 text-[clamp(15px,1.27vw,22px)] leading-tight sm:gap-x-12 lg:px-[50px]">
        {rows.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="font-bold lg:w-[279px]">{k}</dt>
            <dd className="break-words font-normal">{v}</dd>
          </div>
        ))}
      </dl>
      {/* TODO(auth): mở form sửa hồ sơ (họ tên, SĐT, giới tính, ngày sinh) → cập nhật bảng `profiles`. Email đổi qua Supabase Auth. */}
      <button
        type="button"
        disabled
        title="Chức năng cập nhật hồ sơ chờ kết nối Supabase"
        className="mt-10 flex h-[59px] w-full max-w-[714px] items-center justify-center rounded-full border border-black bg-black px-6 text-[clamp(15px,1.27vw,22px)] font-bold text-white disabled:cursor-not-allowed disabled:opacity-90"
      >
        CẬP NHẬT THÔNG TIN CÁ NHÂN
      </button>
      <div aria-hidden="true" className="mt-9 h-[5px] w-full bg-black" />
      <p className="mt-4 text-sm text-black/60">Dữ liệu hiển thị là tài khoản mẫu; sẽ lấy từ tài khoản đăng nhập khi kết nối Supabase.</p>
    </div>
  );
}
