/** Kiểu dữ liệu đánh giá (dữ liệu thật lấy từ bảng `reviews` qua `src/lib/reviews.ts`). */

export type Review = {
  id: string;
  /** Tên đã che bớt, vd "L*** Thịnh" */
  author: string;
  /** 1–5 */
  rating: number;
  /** Giờ Việt Nam dạng "YYYY-MM-DDTHH:mm" */
  date: string;
  /** Phân loại hàng, vd "450 ml" ("" nếu không rõ) */
  variant: string;
  content: string;
};

export const ratingLabel = (n: number) => (n >= 5 ? "Rất tốt" : n === 4 ? "Tốt" : n === 3 ? "Bình thường" : n === 2 ? "Chưa tốt" : "Rất tệ");
