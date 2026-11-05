type Props = {
  title: string;
  note?: string;
};

/** Khung hiển thị cho trang CHƯA xây. Xóa/thay khi trang thật hoàn thành. */
export function PlaceholderPage({ title, note }: Props) {
  return (
    <section className="mx-auto flex min-h-[50vh] w-full max-w-[1200px] flex-col items-center justify-center gap-4 px-6 py-20 text-center">
      <p className="text-sm font-light uppercase tracking-widest text-brand">Đang xây dựng</p>
      <h1 className="text-[clamp(24px,3vw,44px)] font-medium leading-tight">{title}</h1>
      <div className="w-full max-w-[640px] rounded-3xl border-2 border-dashed border-brand/40 px-6 py-10 text-base font-light text-black/60">
        {note ?? "Trang này chưa được thiết kế. Nội dung sẽ được bổ sung ở các bước tiếp theo."}
      </div>
    </section>
  );
}
