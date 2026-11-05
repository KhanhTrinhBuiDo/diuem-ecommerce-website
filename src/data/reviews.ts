/**
 * DỮ LIỆU TẠM đánh giá sản phẩm (12 đánh giá mẫu).
 * TODO(supabase): bảng `reviews` (product_id, user_id, rating, content, media[], created_at, like_count) + RLS:
 *   ai cũng đọc được; chỉ người đã mua mới được ghi (kiểm tra qua `orders`).
 * TODO(reviews): tên, nội dung, ảnh là mẫu – thay bằng dữ liệu thật.
 */

export type Review = {
  id: string;
  author: string;
  avatar: string | null;
  /** 1–5 */
  rating: number;
  /** ISO date */
  date: string;
  /** Phân loại hàng, vd "450ml" */
  variant: string;
  /** Nhận xét "Chất lượng sản phẩm" */
  quality: string;
  content: string;
  images: (string | null)[];
  likes: number;
};

const ratings = [5, 5, 5, 5, 5, 5, 5, 4, 4, 4, 4, 3];

export const reviews: Review[] = ratings.map((rating, i) => ({
  id: `rv-${i + 1}`,
  author: `Khách hàng ${i + 1}`,
  avatar: null,
  rating,
  date: `2026-10-${String(28 - i).padStart(2, "0")}T11:48:00`,
  variant: "450ml",
  quality: rating >= 5 ? "Rất tốt" : rating === 4 ? "Tốt" : "Bình thường",
  content: "Nội dung đánh giá mẫu – sẽ thay bằng đánh giá thật của khách hàng khi có dữ liệu.",
  // Mẫu: 5 đánh giá đầu có 3 ảnh, 2 đánh giá cuối không có bình luận kèm ảnh
  images: i < 5 ? [null, null, null] : [],
  likes: 12 - i,
}));
