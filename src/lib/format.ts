/** Định dạng giá theo Figma: 250000 → "250.000 VND" */
export function formatVND(amount: number): string {
  return `${new Intl.NumberFormat("vi-VN").format(amount)} VND`;
}
