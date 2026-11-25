# NHẬT KÝ DỰ ÁN – Dịu Em E-commerce

> File này do Trình và Claude cùng cập nhật. Mỗi lần làm xong một việc: tick vào lộ trình, ghi một dòng vào "Nhật ký thay đổi", cập nhật bảng "Placeholder".
> Quy ước: thành phần chưa rõ / chưa được tạo → để **placeholder** có đánh dấu `TODO(tên)` trong code, và liệt kê ở mục 4.

## 1. Thông tin chung

| Mục | Giá trị |
|---|---|
| Thương hiệu | Dịu Em – Motherhood & Women Care ("Woman First. Mother Always.") |
| Framework | Next.js 15 (App Router) + React 19 + TypeScript |
| Giao diện | Tailwind CSS v4, font Unbounded (next/font) + Momo Signature (chữ viết tay, nạp qua Google Fonts) |
| Database / Auth | Supabase (Postgres; đăng nhập email-mật khẩu + Google) – **chưa tích hợp** |
| Hosting | Vercel – **chưa deploy** |
| Thư mục dự án | `diuem-web/` |

### Design token (từ Figma)
| Token | Giá trị | Dùng cho |
|---|---|---|
| `brand` | `#CC3F78` | chữ logo, hover |
| `line` | `#FF66C4` | line 14px dưới header |
| `ink` | `#160E13` | viền ô tìm kiếm |
| `rule` | `#D9D9D9` | đường kẻ footer |

### Chạy dự án
```bash
cd diuem-web
npm install
cp .env.example .env.local   # điền giá trị khi bắt đầu tích hợp Supabase
npm run dev                  # http://localhost:3000
npm run typecheck && npm run build
```

## 2. Quyết định kỹ thuật

| Ngày | Quyết định | Lý do |
|---|---|---|
| 2026-11-03 | Dùng Next.js thay vì React thuần | Cần SEO cho trang sản phẩm/bài viết; deploy Vercel mượt; có API ngay trong project |
| 2026-11-03 | Supabase Auth cho email + Google | Có sẵn, không phải tự làm bảo mật mật khẩu |
| 2026-11-03 | Nội dung menu/link/liên hệ gom vào `src/config/site.ts` | Sửa một chỗ, header và footer cùng cập nhật |
| 2026-11-03 | Link chưa có trang → route catch-all hiển thị placeholder | Bấm vào không bị 404 trong lúc phát triển |
| 2026-11-03 | Route danh mục: `/san-pham` (tất cả) và `/san-pham/[collection]` (danh mục, combo, bộ sưu tập) | Một component `CatalogPage` dùng chung; slug lấy từ `src/data/catalog.ts` (sau này từ Supabase) |
| 2026-11-03 | Banner trang chủ tự chuyển 6s, tạm dừng khi rê chuột/focus, tắt khi người dùng bật "giảm chuyển động" | Theo yêu cầu: tự chuyển hoặc bấm "<" ">" |

## 3. Lộ trình

### Giai đoạn 0 – Chuẩn bị
- [x] Ý tưởng thương hiệu (`Ý TƯỞNG TMDT.md`)
- [x] Figma Header
- [x] Figma Footer
- [x] Figma khối "Lắng nghe" (component dùng lại)
- [x] Prototype HTML tĩnh của header/footer (`header.html`, `footer.html`)
- [x] Figma trang chủ (Banner, Danh mục, Sản phẩm, Hoạt động, Câu chuyện thương hiệu)
- [x] Figma trang danh mục sản phẩm (Product - Catalog)
- [x] Figma trang chi tiết sản phẩm
- [x] Figma giỏ hàng / thanh toán, popup đăng nhập / đăng ký
- [ ] Figma trang tài khoản, lịch sử đơn hàng, quên mật khẩu
- [ ] Figma bài viết (blog) và trang "Về Dịu Em"
- [ ] Logo, icon gốc (SVG/PNG), huy hiệu Bộ Công Thương

### Giai đoạn 1 – Nền tảng
- [x] Khởi tạo project Next.js + Tailwind (`diuem-web/`)
- [x] Header (desktop + mobile menu), Footer (responsive)
- [x] `config/site.ts` và trang placeholder
- [x] Component dùng lại `ListenBanner` (khối "Lắng nghe")
- [x] Trang chủ dựng đủ 10 khối theo Figma, dữ liệu tạm ở `src/data/home.ts`
- [x] Trang danh mục sản phẩm `/san-pham` và `/san-pham/[collection]` (bộ lọc, lưới, Xem thêm), dữ liệu tạm ở `src/data/catalog.ts`
- [x] Trang chi tiết sản phẩm `/san-pham/[collection]/[slug]` (gallery, chọn dung tích, số lượng, thêm giỏ, mô tả, gợi ý, đánh giá có lọc + Xem thêm), dữ liệu tạm `src/data/products.ts`, `src/data/reviews.ts`
- [x] Giỏ hàng + thanh toán `/gio-hang` (form vận chuyển, danh sách, chọn/xóa, mã ưu đãi, tóm tắt, phương thức), giỏ lưu localStorage (`CartProvider`), huy hiệu số lượng trên Header
- [x] Popup đăng nhập / đăng ký (`AuthModal`, mở từ icon tài khoản) – **giao diện + kiểm tra form, chưa nối Supabase**
- [ ] Chạy `npm install` + `npm run build` trên máy Trình và xác nhận hiển thị đúng
- [ ] Đẩy code lên GitHub, kết nối Vercel (deploy bản preview)
- [ ] Tạo project Supabase (chọn region Singapore), điền `.env.local` và biến môi trường trên Vercel

### Giai đoạn 2 – Database & đăng nhập
- [ ] Thiết kế schema (`profiles`, `addresses`, `categories`, `products`, `product_variants`, `product_images`, `orders`, `order_items`, `posts`, `collections`)
- [ ] Bật RLS cho mọi bảng + viết policy
- [ ] Cài `@supabase/ssr`, tạo client server/browser, middleware làm mới session
- [ ] Đăng ký / đăng nhập email-mật khẩu, quên mật khẩu
- [ ] Đăng nhập Google (Google Cloud OAuth + cấu hình Supabase + redirect URL của Vercel)
- [ ] Header hiển thị trạng thái đăng nhập (đổi icon tài khoản → `/tai-khoan`)
- [ ] Admin: cột `profiles.role` ('customer'|'staff'|'admin'); sau đăng nhập role admin → `redirect('/admin')`; thay guard tạm `ADMIN_PREVIEW` trong `app/admin/layout.tsx` bằng kiểm tra session + role ở server; RLS cho mọi bảng ghi từ admin

### Giai đoạn 3 – Cửa hàng
- [ ] Nhập dữ liệu sản phẩm thật
- [ ] Trang chi tiết sản phẩm, New Arrivals; nối trang danh mục với dữ liệu thật
- [ ] Tìm kiếm (`/tim-kiem`)
- [ ] Giỏ hàng (khách chưa đăng nhập lưu localStorage, gộp khi đăng nhập), số lượng trên icon giỏ ở Header
- [ ] Checkout + tạo đơn (COD trước), tính giá ở server
- [ ] Trang tài khoản, lịch sử đơn hàng

### Giai đoạn 4 – Nội dung & vận hành
- [ ] "Về Dịu Em", Blog (trang chủ đã dựng với dữ liệu/ảnh tạm)
- [ ] Các trang chính sách / hỗ trợ (nội dung do Trình cung cấp)
- [ ] Cổng thanh toán online (PayOS/VNPay/MoMo/SePay – chọn một)
- [ ] Email giao dịch (Resend)
- [ ] Trang quản trị `/admin`
- [ ] SEO (metadata, sitemap, Open Graph), tối ưu ảnh, kiểm thử trước khi mở bán

## 4. Placeholder đang chờ (cập nhật khi thay thế)

| Mã | Ở đâu | Hiện trạng | Cần gì để thay |
|---|---|---|---|
| `TODO(logo)` | `src/components/ui/LogoMark.tsx` | SVG tạm | File logo thật → `public/images/`, đổi `LOGO_SRC` |
| `TODO(badge)` | `src/components/ui/MoitBadge.tsx` | SVG tạm, link `online.gov.vn` chung | Ảnh huy hiệu gốc + link xác nhận của shop |
| `TODO(icon)` | `src/components/ui/icons.tsx` | Icon vẽ lại bằng SVG | Icon xuất từ Figma (nếu muốn khớp 100%) |
| `TODO(auth)` | `config/site.ts`, `Header.tsx` | Icon tài khoản luôn → `/dang-nhap` | Giai đoạn 2 |
| `TODO(cart)` | `Header.tsx` | Icon giỏ chưa có số lượng | Giai đoạn 3 |
| Mạng xã hội | `config/site.ts` → `socialLinks` | `href: "#"` | URL Facebook / TikTok / Instagram |
| Trang đích | `config/site.ts` (`ready: false`) | Tất cả link hiện trang "Đang xây dựng" | Làm từng trang rồi đặt `ready: true` |
| `TODO(seo)` | `src/app/layout.tsx` | Chưa có favicon, ảnh Open Graph | Logo thật |
| `TODO(font)` | `src/app/layout.tsx` | Momo Signature nạp bằng `<link>` Google Fonts (next/font 15.5 chưa hỗ trợ) | Tùy chọn: tải font về `src/fonts` + `next/font/local` để tự host |
| Ảnh trang chủ | `src/data/home.ts` (`image: null`) | Khung gradient hồng kèm nhãn kích thước | Ảnh banner (1729×615), 4 ảnh danh mục (300×450), 3 banner danh mục (1728×410), ảnh sản phẩm, 3 ảnh hoạt động (479×350), ảnh nền câu chuyện → đặt vào `public/images/home/` rồi điền đường dẫn |
| Dữ liệu sản phẩm trang chủ | `src/data/home.ts` | 12 sản phẩm mẫu "Dầu Gội Hoa Bưởi Thế Hệ Mới – 250.000 VND" (như Figma) | Bảng `products` Supabase (Giai đoạn 3) |
| `TODO(catalog)` | `src/data/home.ts` | 3 thẻ danh mục lớn: Chăm sóc mặt / tóc / cơ thể; thẻ thứ 4 tên tạm "Danh mục 4" trỏ `/san-pham` | Tên và link thẻ thứ 4 |
| Bài hoạt động | `src/data/home.ts` | 3 bản sao cùng một bài mẫu, link `/bai-viet` | Nội dung 3 bài thật / bảng `posts` |
| `TODO(hero)` | `HeroBanner.tsx` | Tự chuyển + 2 mũi tên; chưa có chấm chỉ báo (Figma không có) | Quyết định có cần không |
| `TODO(product-detail)` | `data/products.ts` | Đã có trang; URL tạm `/san-pham/[danh-mục]/[slug]`; mọi thẻ mẫu trỏ về 1 sản phẩm mẫu | Chốt URL cuối cùng; dữ liệu sản phẩm thật |
| Ảnh banner danh mục | `src/data/catalog.ts` (`banner: null`) | Khung gradient | Banner 1729×615 cho từng danh mục → `public/images/catalog/` |
| `TODO(filter)` | `FilterSidebar.tsx` | 4 mục xổ xuống (Dòng sản phẩm, Dung tích, Giá, Phù hợp với) hiện placeholder | Danh sách tùy chọn của từng mục; lọc theo query string/Supabase |
| `TODO(supabase)` | `ProductGrid.tsx`, `data/catalog.ts` | 32 sản phẩm mẫu, "Xem thêm" cắt mảng trên trình duyệt | Phân trang phía server khi có bảng `products` |
| Danh mục mẫu | `data/catalog.ts` | 7 danh mục/bộ sưu tập tạm (3 chăm sóc, combo tóc, bán chạy, quà tặng, combo tặng) | Danh sách danh mục thật |
| `TODO(ảnh)` | `next.config.ts` | Chưa cấu hình ảnh từ Supabase Storage | Khi có Storage |
| `TODO(auth)` | `AuthModal.tsx` | Gửi form chỉ kiểm tra rồi báo "chưa kết nối"; Google/Facebook/Quên mật khẩu chưa chạy; "Email/SĐT" thực tế mới chỉ email | Giai đoạn 2 (Supabase Auth, Google OAuth) |
| `TODO(checkout)` | `CartPage.tsx`, `CartProvider.tsx` | "THANH TOÁN NGAY" chỉ kiểm tra form, chưa tạo đơn; giá chỉ để hiển thị | Server tạo đơn, tính lại giá từ DB, tồn kho |
| `TODO(payment)` | `OrderSummary.tsx` | Chọn OnePay nội địa/quốc tế chỉ là radio | Chốt cổng thanh toán, webhook |
| `TODO(voucher)` | `OrderSummary.tsx` | "Áp dụng" luôn báo mã chưa hợp lệ; giảm giá = 0 | Bảng `vouchers` + kiểm tra server |
| `TODO(shipping)` | `OrderSummary.tsx` | Freeship từ 300.000 VND; dưới mức đó hiện "Tính khi giao", chưa cộng phí | Bảng phí vận chuyển |
| `TODO(address)` | `ShippingForm.tsx` | Tỉnh/Thành, Quận/Huyện là ô nhập tay | Danh sách hành chính VN (dropdown) |
| `TODO(policy)` | `ShippingForm.tsx` | "Các chính sách mua hàng" hiện "Nội dung đang cập nhật" | Nội dung chính sách |
| `TODO(variants)` | `data/products.ts` | Figma có 2 nút "450ml" (1 xám); tạm đặt nút xám là "250ml" hết hàng | Danh sách dung tích + giá thật |
| `TODO(content)` | `data/products.ts` | Bảng mô tả (thành phần, HSD, bảo quản...) = "Nội dung đang cập nhật" | Nội dung mô tả thật |
| `TODO(reviews)` | `ProductReviews.tsx`, `MyReviewsView.tsx` | Nút thích / báo cáo đánh giá chưa hoạt động (đã ẩn) | Bảng like/report + đăng nhập |
| `TODO(media)` | `ReviewModal.tsx`, `v11_reviews.sql` | Ảnh/video trong đánh giá chưa làm (đã ẩn ô tải lên và bộ lọc "Có hình ảnh") | Luồng upload Cloudinary cho khách + kiểm duyệt |
| `TODO(reviews-policy)` | `v11_reviews.sql`, `OrderPanel.tsx` | Chưa giới hạn thời hạn được đánh giá sau khi nhận hàng | Khách chốt câu hỏi #18/#21 |
| Supabase env | `.env.example` | Giá trị để trống | Tạo project Supabase |

## 5. Câu hỏi mở

1. Footer có cần ô đăng ký nhận tin (email) không? Figma hiện chưa có.
2. (Đã trả lời 2026-11-03) Giữ nguyên "Hướng dẫn chọn size / giặt là" vì thiết kế gấp, sẽ sửa khi thống nhất dự án. [cũ] Footer có mục "Hướng dẫn chọn size / giặt là" – shop có bán quần áo không, hay chỉ mỹ phẩm và đồ dùng mẹ & bé? (Ảnh hưởng schema `product_variants`.)
3. Nhóm sản phẩm chính: Cho Em / Cho Con / Cho Nhau có làm thành danh mục trên menu không?
4. Nội dung các trang chính sách: Trình tự soạn hay cần mẫu?
5. Tên miền dự kiến (`diuem.com`?) – cần để cấu hình Vercel, Google OAuth và email.
6. Mục "Xéo Hội / Xéo Xọ" xuất hiện trong tên layer của Figma (có vẻ là tên layer cũ copy từ dự án khác) – cần xác nhận không còn sót chữ nào ngoài giao diện.
7. (Đã trả lời 2026-11-03) Shop không bán thời trang → bỏ banner "Áo đầm - Váy", dùng "BÁN CHẠY NHẤT" theo ảnh Figma mới. Footer vẫn còn "Hướng dẫn chọn size / giặt là" – giữ hay bỏ?
8. (Đã trả lời) 4 thẻ đầu trang chủ là danh mục lớn (chăm sóc mặt, tóc, cơ thể, ...). Còn thẻ thứ 4 tên gì? Đầy đủ danh sách danh mục lớn là gì?
9. (Đã trả lời) Banner chính nhiều slide, tự chuyển + bấm "<" ">" → đã làm. Cần biết số slide và link của từng slide.
10. (Đã trả lời) "SẢN PHẨM MỚI VỀ" là đúng, đã sửa.
11. (Đã trả lời) "Cùng Em" là chính xác. [cũ] Footer: ảnh trang chủ mới ghi tiêu đề cột đầu là "Xéo Hội" (có vẻ tên cũ), ảnh footer riêng ghi "Cùng Em". Đang dùng "Cùng Em" – xác nhận?
12. (Trình sẽ gửi sau) Trang danh mục: 4 mục bộ lọc (Dòng sản phẩm, Dung tích, Giá, Phù hợp với) gồm những tùy chọn nào? Bộ lọc có áp dụng được cho mọi danh mục không?
13. Bộ sưu tập "Combo Chăm sóc tóc" gồm những sản phẩm nào – là danh mục riêng hay gộp theo sản phẩm combo?
15. Đăng nhập: Figma có Google + Facebook, Trình chỉ yêu cầu Google → có làm Facebook không? Ô "Email/SĐT": đăng nhập bằng SĐT cần dịch vụ SMS (tốn phí) – có cần không?
16. Giỏ hàng: dưới 300.000 VND phí giao hàng là bao nhiêu? Có voucher nào ngay từ đầu không? Cổng thanh toán OnePay đã có tài khoản chưa (và có COD không)?
17. URL trang chi tiết sản phẩm: dùng `/san-pham/[danh-mục]/[slug]` hay `/san-pham/[slug]`? Sản phẩm thuộc nhiều danh mục thì chọn thế nào?
18. Đánh giá: ai được đánh giá (chỉ người đã mua?), có kiểm duyệt trước khi hiện, có cho đăng ảnh/video không?
19. Menu trái trang tài khoản: Figma ghi lẫn "Chính sách chúng tôi" và "Câu hỏi thường gặp" — đang dùng "Câu hỏi thường gặp".
20. Figma còn sót chữ "Xéo Hội / Xéo Xọ" trong tên layer và câu hỏi FAQ — cần nội dung FAQ thật.
21. Đánh giá lại / sửa đánh giá: giới hạn mấy lần, thời hạn bao lâu? (Figma làm mờ "Đánh giá lại" ở đánh giá đầu).
22. Tra cứu đơn khách vãng lai: giới hạn số lần thử, che bớt thông tin trả về?
23. Vận chuyển: đơn vị vận chuyển/mã vận đơn lấy từ đâu (API hay nhập tay)?
24. Hồ sơ: trường nào cho sửa, danh sách giới tính, có ảnh đại diện không? Sổ địa chỉ: dùng danh mục hành chính mới (Tỉnh/Phường).
26. Mega menu SẢN PHẨM: Figma có 2 trạng thái; đang làm "rê vào tiêu đề nhóm → hiện 4 sản phẩm của nhóm". Đúng ý chưa? Mục con (Son Dưỡng, Dầu Gội...) chưa có trang → tạm trỏ /san-pham.
27. Menu tài khoản: mục 3 Figma ghi "Chính sách Câu hỏi thường gặp" (dùng "Câu hỏi thường gặp"); thêm hàng "Đăng nhập / Đăng ký" tạm (không có trong Figma) để còn mở được popup đăng nhập.
31. Schema Supabase v0.3 đã có (`staff_members`, `roles` admin/catalog/orders, `products`+`product_variants`, `storefront_categories` 2 cấp, `orders`, `coupons`...). UI admin đang bám theo: role = admin/catalog/orders; voucher `percent|fixed`. **Chưa có bảng** cho: đánh giá (reviews), banner, cài đặt cửa hàng, trạng thái đơn "hoàn hàng" (enum order_status chỉ có pending/confirmed/shipping/completed/cancelled) → cần bổ sung schema hoặc bỏ khỏi UI. Trạng thái sản phẩm DB: draft/active/discontinued (UI đang dùng active/draft/hidden).
29. Admin – phân quyền: đăng nhập chung với khách; sau khi đăng nhập, `profiles.role = 'admin'` → chuyển vào `/admin` (layout riêng). Role `staff` được vào những mục nào? (đang giả định: đơn hàng, sản phẩm, đánh giá; không đổi cài đặt/phân quyền).
30. Admin – cần quản lý thêm gì (bài viết/blog, trang tĩnh, kho/nhập hàng, báo cáo xuất Excel, thông báo email)? Hiện có: dashboard, đơn hàng, sản phẩm, danh mục, voucher, khách hàng, đánh giá, banner, nhân viên, cài đặt.
28. Follow bar chi tiết sản phẩm: chỉ hiện ≥ desktop (lg); "Đã bán" đang là số mẫu 1014.
25. Trang đánh giá "chưa có": hiện tại xem bằng `?trang-thai=trong`; sau này theo đăng nhập/số đánh giá thật.
14. Nút trên banner danh mục/câu chuyện thương hiệu: ảnh Figma mới ghi "Xem chi tiết" (file CSS ghi "Khám phá") → đang dùng "Xem chi tiết".

## 5b. Thư viện component dùng lại

| Component | Đường dẫn | Props chính | Dùng ở |
|---|---|---|---|
| `ListenBanner` | `src/components/sections/ListenBanner.tsx` | `brand`, `title`, `text`, `as` (h1/h2/h3), `className` | Trang chủ (xem trước); dự kiến: sản phẩm, liên hệ, góp ý |
| `PlaceholderPage` | `src/components/ui/PlaceholderPage.tsx` | `title`, `note` | Mọi trang chưa xây |
| `ImageOrPlaceholder` | `src/components/ui/ImageOrPlaceholder.tsx` | `src` (null = placeholder), `alt`, `label`, `tone` | Mọi chỗ có ảnh |
| `ExploreButton` | `src/components/ui/ExploreButton.tsx` | `href`, `children` | Banner danh mục, câu chuyện thương hiệu |
| `ArrowRight` | `src/components/ui/ArrowRight.tsx` | `width` | Nút có mũi tên |
| `HeroBanner` | `src/components/home/HeroBanner.tsx` | `slides[]` | Trang chủ |
| `CategoryTiles` | `src/components/home/CategoryTiles.tsx` | `items[]` | Trang chủ |
| `CategoryBanner` | `src/components/home/CategoryBanner.tsx` | `title`, `image`, `cta` | Trang chủ ×3; dùng được cho trang danh mục |
| `ProductSection` / `ProductCard` | `src/components/home/` | `ProductCard`: `product`, `variant` ("home"/"catalog") | Trang chủ ×3; trang danh mục dùng variant "catalog" |
| `CatalogPage` | `src/components/catalog/CatalogPage.tsx` | `collection`, `products`, `crumbs` | `/san-pham`, `/san-pham/[collection]` |
| `Breadcrumb` | `src/components/catalog/Breadcrumb.tsx` | `items[]` ({label, href?}) | Trang danh mục; dùng lại cho trang chi tiết/bài viết |
| `FilterSidebar` | `src/components/catalog/FilterSidebar.tsx` | `total` | Trang danh mục |
| `ProductGrid` | `src/components/catalog/ProductGrid.tsx` | `products`, `pageSize` | Trang danh mục |
| `ActivitySection` | `src/components/home/ActivitySection.tsx` | `title`, `items[]` | Trang chủ |
| `BrandStory` | `src/components/home/BrandStory.tsx` | `kicker`, `title`, `paragraphs`, `image`, `cta` | Trang chủ |
| `Checkbox`, `Stepper`, `RatingStars`, `PinkBar`, `Field`/`TextAreaField` | `src/components/ui/` | xem file | Giỏ hàng, chi tiết sản phẩm, đánh giá |
| `icons2.tsx` | `src/components/ui/icons2.tsx` | Icon SVG vẽ tạm (giỏ+, chia sẻ, xe, quà, thùng rác, mắt, logo Google/Facebook) | Chi tiết sản phẩm, giỏ hàng, popup đăng nhập |
| `CartProvider` / `useCart` | `src/components/cart/CartProvider.tsx` | `items`, `count`, `add`, `setQty`, `setVariant`, `toggle`, `remove`, `clear` | Header, chi tiết sản phẩm, giỏ hàng |
| `AuthProvider` / `useAuthModal` | `src/components/auth/AuthProvider.tsx` | `open("login"/"register")`, `close` | Header; dùng được ở footer/nút cần đăng nhập |
| `ProductDetailPage` + `ProductGallery`/`ProductInfo`/`ProductDescription`/`ProductReviews`/`MiniProductCard` | `src/components/product/` | `product`, `collection`, `href`, `suggestions`, `related` | `/san-pham/[collection]/[slug]` |
| `CartPage` + `ShippingForm`/`OrderSummary`/`CartItemRow` | `src/components/cart/` | – | `/gio-hang` |

## 6. Nhật ký thay đổi

| Ngày | Ai | Việc đã làm |
|---|---|---|
| 2026-11-03 | Trình | Gửi Figma Header + Footer, chốt stack: Vercel + Supabase + đăng nhập email/Google + React |
| 2026-11-03 | Claude | Dựng prototype HTML `header.html`, `footer.html` |
| 2026-11-03 | Claude | Tư vấn stack (Next.js, Supabase Auth, RLS, lộ trình) |
| 2026-11-03 | Claude | Tạo project `diuem-web/`: cấu hình Next.js/Tailwind, font Unbounded, `config/site.ts`, `Header`, `MobileMenu`, `SearchBox`, `Footer`, `LogoMark`/`MoitBadge` (placeholder), route placeholder, file log này |
| 2026-11-03 | Trình | Gửi Figma khối "Lắng nghe" (component dùng lại nhiều nơi) |
| 2026-11-03 | Claude | Thêm `ListenBanner` (nội dung ghi đè được bằng props), font Momo Signature, token `font-script`; cập nhật log |
| 2026-11-03 | Trình | Gửi Figma trang chủ |
| 2026-11-03 | Claude | Dựng trang chủ: `HeroBanner`, `CategoryTiles`, `CategoryBanner`, `ProductSection`/`ProductCard`, `ActivitySection`, `BrandStory`, `ExploreButton`, `ImageOrPlaceholder`; dữ liệu tạm `src/data/home.ts`; thêm 4 route placeholder; build + chụp màn hình desktop/mobile, sửa lỗi tràn ngang trên mobile |
| 2026-11-03 | Trình | Trả lời 4 câu hỏi mở; gửi ảnh trang chủ hoàn chỉnh + Figma trang danh mục sản phẩm |
| 2026-11-03 | Claude | Áp dụng trả lời: sửa "MỚI VỀ", đổi "ÁO ĐẦM - VÁY" → "BÁN CHẠY NHẤT", tên 3 danh mục lớn, banner tự chuyển (có tạm dừng/giảm chuyển động), nút "Xem chi tiết" |
| 2026-11-03 | Claude | Dựng trang danh mục sản phẩm: `CatalogPage`, `Breadcrumb`, `FilterSidebar`, `ProductGrid` (Xem thêm), `ProductCard` variant catalog; route `/san-pham`, `/san-pham/[collection]`; `src/data/catalog.ts`; nối link trang chủ/nav/footer; build + test tương tác + chụp desktop/mobile |
| 2026-11-03 | Trình | Trả lời: "Cùng Em" đúng; giữ nguyên footer size/giặt là; thiếu thì placeholder; bộ lọc gửi sau. Gửi Figma Chi tiết sản phẩm, Giỏ hàng, popup Đăng nhập/Đăng ký |
| 2026-11-04 | Claude | Dựng trang chi tiết sản phẩm, giỏ hàng + thanh toán, popup đăng nhập/đăng ký; `CartProvider` (localStorage) + huy hiệu giỏ; `AuthProvider`; UI dùng chung (Checkbox, Stepper, RatingStars, Field...); nối link thẻ sản phẩm → trang chi tiết; sửa Breadcrumb (mục giữa không link không in đậm). Kiểm thử: build OK, thêm giỏ/đánh giá/popup/validate form chạy đúng, không tràn ngang desktop/mobile; sửa lỗi form lồng form gây hydration error |
| 2026-11-04 | Trình | Gửi Figma nhóm tài khoản (hồ sơ, lịch sử mua hàng, sổ địa chỉ, đánh giá 2 trạng thái, FAQ, popup đánh giá, tra cứu đơn, chi tiết đơn) |
| 2026-11-04 | Claude | Dựng nhóm trang tài khoản: `/tai-khoan/{ho-so,lich-su-mua-hang,so-dia-chi,danh-gia,cau-hoi-thuong-gap,don-hang/[id]}` và `/tra-cuu-don-hang`; component `AccountShell`, `ProfileView`, `OrdersView`, `OrderPanel`, `OrderParts`, `ReviewModal`, `AddressesView`, `MyReviewsView`, `FaqView`, `OrderLookup`; dữ liệu mẫu `src/data/account.ts` (chưa có auth/Supabase → TODO(auth), TODO(supabase)). Sửa footer tràn ngang 48px ở màn 1440. Kiểm thử: build OK, tab đơn, thêm địa chỉ + validate, FAQ, popup đánh giá, Mua lại → giỏ, tra cứu đúng/sai, không tràn ngang desktop/mobile |
| 2026-11-04 | Trình | Gửi thêm layer: popup thêm giỏ hàng, follow bar, mega menu SẢN PHẨM (2 trạng thái), menu tài khoản |
| 2026-11-05 | Claude | Dựng `NavMenu` (mega menu + xem sản phẩm nhóm, Esc/rê chuột/focus), `AccountButton` thành menu nhỏ, `CartToast` (CartProvider thêm `lastAdded`, tự ẩn 5s), `FollowBar` trong `ProductInfo` (IntersectionObserver); `src/data/menu.ts`. Bỏ dòng "Đã thêm vào giỏ hàng" cũ. Kiểm thử: build OK, menu mở/đóng, toast, follow bar thêm giỏ, huy hiệu giỏ cập nhật, test trang tài khoản vẫn đạt |
| 2026-11-05 | Trình | Yêu cầu trang admin: đăng nhập bình thường, role admin ra layout riêng; dashboard + quản lý tất cả |
| 2026-11-05 | Claude | Tách route group `(site)` (header/footer/giỏ hàng) và `admin` (layout riêng `AdminShell`). Dựng `/admin` (dashboard: KPI, biểu đồ doanh thu SVG, trạng thái đơn, bán chạy, cảnh báo tồn kho) + `/admin/{don-hang,san-pham,danh-muc,voucher,khach-hang,danh-gia,banner,nhan-vien,cai-dat}`; component `ResourceManager` (CRUD dùng chung), `Operations`, `Managers`, `ui`/`shared`; dữ liệu mẫu `src/data/admin.ts`. **Guard tạm:** production trả 404 cho /admin trừ khi đặt `ADMIN_PREVIEW=1` (lúc build + chạy) – CHƯA có đăng nhập thật. Sửa lỗi `sr-only` trong bảng gây tràn ngang mobile. Kiểm thử: build OK, 10 trang 200, thêm/sửa/xóa/tìm sản phẩm, đổi trạng thái đơn, duyệt đánh giá, lưu cài đặt, không tràn ngang desktop/mobile, trang khách không bị ảnh hưởng |
| 2026-11-05 | Trình | Đã có database Supabase (schema v0.3 + seed 30 sản phẩm); yêu cầu đường dẫn admin mã hóa thay vì /admin |
| 2026-11-05 | Claude | Admin chuyển sang URL bí mật `/<ADMIN_PATH_SLUG>/...`: route thật `app/internal-admin`, `src/middleware.ts` rewrite + chặn `/admin` & `/internal-admin` (404), header `noindex, no-store`; slug đọc từ biến môi trường (không NEXT_PUBLIC), thiếu/sai → admin tắt hẳn ở production; `AdminBaseProvider` cấp tiền tố cho menu/link. `.env.example` thêm `ADMIN_PATH_SLUG`, `ADMIN_PREVIEW`. Role/voucher trong UI khớp schema (admin/catalog/orders; percent/fixed). Kiểm thử: /admin, /internal-admin → 404; /<slug>/... → 200; menu active đúng cả khi tải thẳng; hồi quy trang khách/tài khoản đạt |
| 2026-11-06 | Claude | **Nối Supabase + admin thật.** Hai role: customer/admin (`is_admin()`); migration `20261105_v04_admin_auth.sql` (đổi `storage_path`→`image_url` Cloudinary, trigger tạo `customers`); `scripts/seed-admins.mjs` tạo 5 admin (mật khẩu qua biến `ADMIN_SEED_PASSWORD`, không nằm trong mã). Client/server Supabase (`@supabase/ssr`), middleware refresh session, `/auth/callback`, AuthModal đăng nhập/đăng ký/Google thật; sau đăng nhập admin → URL bí mật. Admin dùng dữ liệu thật: dashboard, sản phẩm (xóa mềm, biến thể, ảnh link Cloudinary), đơn hàng, danh mục, voucher, khách hàng (xem), quản trị viên (xem); server action đều `requireAdmin()` + RLS. Bỏ trang đánh giá/banner/cài đặt (chưa có bảng) và `ADMIN_PREVIEW`. Hướng dẫn: `docs/HUONG_DAN_SUPABASE_VERCEL.md`. Kiểm thử: tsc + build OK; /admin, /internal-admin, /<slug> (chưa đăng nhập) → 404; hồi quy trang khách/tài khoản/menu đạt. **CHƯA kiểm thử luồng thật với Supabase** (sandbox không truy cập được) |

## Câu hỏi mở bổ sung (2026-11-06)
- #32 Storefront (danh sách/chi tiết sản phẩm, giỏ, đặt hàng) vẫn dùng dữ liệu mẫu → cần nối 30 sản phẩm Supabase để admin sửa là khách thấy.
- #33 Trang `/tai-khoan/*` vẫn hiển thị dữ liệu mẫu (TODO(auth)).
- #34 Schema chưa có bảng đánh giá/banner/cài đặt; `order_status` chưa có "returned".
- #35 Chưa trừ tồn kho khi đặt/hủy đơn và chưa xử lý thanh toán online.
- #36 Mật khẩu admin chung `Admin@123` yếu → đổi sau lần đăng nhập đầu.
| 2026-11-06 | Claude | **Tăng tốc admin + nhập sản phẩm bằng Excel.** Tốc độ: `getAdmin()` dùng `cache()` (layout/page/action chỉ kiểm tra 1 lần) và chạy `is_admin` + tên song song; middleware chỉ làm mới phiên khi có cookie `sb-*` và dùng `getClaims()` (xác thực JWT tại chỗ); dashboard gộp truy vấn; `saveProduct` ghi phiên bản song song/chèn hàng loạt. Khuyến nghị đặt Function Region Vercel gần Supabase (mục 7 hướng dẫn). Nhập Excel: `exceljs`; file mẫu động `/<slug>/san-pham/mau-nhap` (cột hồng bắt buộc/hiển thị, cột xám tùy chọn, danh sách chọn danh mục/đơn vị/trạng thái, sheet Hướng dẫn); server action `importProducts` (kiểm tra thử → nhập, gộp dòng cùng slug thành nhiều phiên bản, upsert theo slug/SKU, ảnh tách bằng dấu cách/phẩy/xuống dòng, ảnh đầu là ảnh chính, chỉ link Cloudinary, ≤500 dòng, ≤3MB). Kiểm thử: tsc + build OK; bộ đọc file thử với dữ liệu đúng/sai (báo lỗi theo dòng, tách link giữ dấu phẩy trong link Cloudinary); route mẫu 404 khi chưa đăng nhập. **Chưa thử với Supabase thật.** Lưu ý: nhập không nằm trong 1 transaction (PostgREST) nên đã kiểm tra kỹ trước khi ghi |

- #37 Nhập Excel chưa hỗ trợ combo (bundle_items) và chưa có chế độ xuất danh sách sản phẩm hiện có ra Excel.
| 2026-11-07 | Claude | **Hệ thống ảnh cố định theo mã vị trí.** `src/data/image-slots.json` (21 vị trí: header/logo, header/menu-1,2, home/hero-1..3, category-1..4, banner-best/new/gift, activity-1..3, brand-story, detail/gallery-1,2, detail/description, footer/moit-badge); `scripts/scan-images.mjs` chạy trước dev/build/typecheck (`predev`, `prebuild`) → `src/data/image-manifest.json`; `siteImage(key)` trả đường dẫn hoặc null (placeholder). Nối vào home.ts, products.ts, NavMenu, LogoMark, MoitBadge. Quy trình: bỏ file đúng tên vào `public/images/<thư mục>/` rồi push. `npm run images` liệt kê ảnh còn thiếu; cảnh báo file sai tên. Bản đồ: `docs/BAN_DO_ANH.md`. Kiểm thử: tsc + build OK, thử với ảnh giả: logo/hero/gallery/badge hiện đúng, ảnh tối ưu 200, tên sai bị cảnh báo. |

- #38 Trang Về Dịu Em (About) chưa dựng → chưa có mã ảnh; cần bố cục Figma. Banner danh mục `/san-pham/*`, banner quyền lợi thành viên (tài khoản) chưa có mã ảnh (dễ thêm).
| 2026-11-08 | Claude | **Ảnh theo đúng cấu trúc thư mục Materials của khách.** Sao chép `About_Diu_Em/ General/ Homepage/ Product_Catalog/` vào `public/images/` là đủ. Slot mới (40, không phân biệt hoa/thường): General/Logo → logo; General/Cau_chuyen_thuong_hieu → khối câu chuyện thương hiệu; General/Cung_Diu_Em_Dong_Hanh/1-3 → hoạt động; Homepage/Banner/1(-3) → hero (chỉ hiện slide có ảnh); Homepage/Catology/{mat,toc,cothe,khac} → 4 thẻ danh mục (thẻ 4 = "Ngành khác"); Homepage/Sub_banner/1-3 → banner Bán chạy / Mới / Quà tặng (thứ tự theo trang, giả định); Product_Catalog/1-5 → banner danh mục; thêm collection `cham-soc-em-be`. Khai báo nhưng chưa hiển thị: About_Diu_Em/* (trang chưa dựng), General/Catology/1-4 (chưa rõ vị trí). Giữ vị trí ngoài cấu trúc: header/menu-1,2, detail/*, footer/moit-badge. Kiểm thử: tsc + build OK, ảnh giả đúng cấu trúc hiện đúng ở trang chủ + 2 trang danh mục. |

- #39 Cần xác nhận: General/Catology/1-4 dùng ở đâu; thứ tự Sub_banner 1-3; Product_Catalog/Qua_tang có dùng cho cả combo-tang-nguoi-thuong không; thiết kế trang Về Dịu Em (About).
| 2026-11-10 | Claude | **Nhập sản phẩm + kéo thả ảnh tự tải lên Cloudinary.** Luồng 3 bước trong "Nhập từ Excel": chọn file → Kiểm tra (danh sách sản phẩm sắp nhập, Mới/Cập nhật, SKU) → kéo thả ảnh/thư mục (`ImageImporter`): tự ghép theo `SKU_n.jpg`/`slug_n` hoặc thư mục SKU/slug (số 1 = ảnh chính), khay "Chưa gán", gán tay, đổi thứ tự (←/→/★/✕), xử lý trùng với ảnh đã có: Giữ để sửa (mặc định) / Replace / Skip (chung + riêng từng sản phẩm) → Nhập. Trình duyệt nén ảnh (≤2000px, WebP) và tải thẳng Cloudinary (unsigned preset, 4 luồng, public_id = hash nội dung nên ảnh trùng không tải lại), rồi mới ghi link vào DB. Cột ảnh trong Excel thành tùy chọn (có thể dán link hoặc bỏ trống). Thêm nút "Tải ảnh hàng loạt" ở trang Sản phẩm (không cần Excel). Server: `importProducts` nhận bản đồ ảnh cuối cùng, `saveProductImages`, kiểm tra link thuộc đúng cloud (`isOwnImage`). Env mới: `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`. Kiểm thử: tsc + build OK; test logic ghép tên ảnh; test giao diện (ảnh giả: ghép đúng, khay chưa gán, thứ tự, báo thiếu cấu hình). **Chưa thử tải thật lên Cloudinary/Supabase.** |

- #40 (đã giải quyết 2026-11-10: dùng signed upload)
- #41 Ảnh bị Replace/xóa vẫn còn trên Cloudinary (chưa có công cụ dọn ảnh mồ côi).
| 2026-11-10 | Claude | **Chuyển sang tải ảnh signed.** Dùng preset signed sẵn có của khách. Server action `signUploads` (chỉ admin) cấp chữ ký SHA-1 cho từng ảnh (folder `diuem/products/<slug>`, public_id = hash, 1 lần gọi cho cả lô); trình duyệt: nén+băm → xin chữ ký → tải 4 luồng. Env: `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `CLOUDINARY_UPLOAD_PRESET` (bỏ `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`). Giải quyết #40. Chưa thử với Cloudinary thật. |
| 2026-11-10 | Claude | **Sửa mega menu + trang New Arrivals + nhãn "Sản phẩm mới".** (1) Hai mega menu tách riêng: hover "SẢN PHẨM" chỉ hiện menu danh mục (chăm sóc mặt/tóc/cơ thể...), hover "NEW ARRIVALS" chỉ hiện menu sản phẩm mới (4 sản phẩm + "XEM TẤT CẢ SẢN PHẨM MỚI >"); bỏ việc rê vào tiêu đề nhóm đổi sang chế độ 2; đóng menu sau 350ms. (2) Route `/new-arrivals` (ready: true). (3) `/san-pham` và `/new-arrivals`: khối "SẢN PHẨM MỚI" (nhãn admin gán) rồi "TẤT CẢ SẢN PHẨM" phía sau (không lặp sản phẩm); `CatalogPage` nhận `newProducts`, `ProductGrid` nhận `title`. (4) Admin gán nhãn: migration `20261110_v05_product_new_flag.sql` (cột `products.is_new`), công tắc trong form sản phẩm, badge "Mới" trong bảng, cột "Sản phẩm mới" trong Excel. Kiểm thử: tsc + build OK; Playwright: hover SẢN PHẨM chỉ hiện menu danh mục, hover NEW chỉ hiện menu mới và menu danh mục đóng, rời chuột thì đóng, 2 trang hiển thị đủ 2 khối. Storefront vẫn dùng dữ liệu mẫu (8 sản phẩm đầu = "mới") → TODO(supabase): lọc `is_new`. Giả định: menu NEW ARRIVALS dùng bố cục chế độ 2 của Figma (4 sản phẩm); chưa có menu con "combo chăm sóc tóc..." riêng. |
| 2026-11-22 | Claude | **Nạp sản phẩm thật (CSV 52 SKU → 18 sản phẩm), xóa 30 sản phẩm demo.** Migration `20261122_v06_real_products.sql` (sinh bởi `scripts/gen-real-products-sql.py`, idempotent): thêm cột `products.ingredients/suitable_for/region/product_line`, `product_variants.label/is_default`, `product_images.variant_id` (ảnh riêng từng size; index ảnh chính chỉ xét ảnh chung), bảng `product_variant_costs` (giá vốn, RLS chỉ admin); xóa hẳn 30 SP demo (DỪNG nếu còn đơn hàng tham chiếu); nạp 18 SP/52 biến thể/52 giá vốn, bộ quà = sản phẩm đơn vị `set` ở danh mục `qua-tu-500k`; HSD/PAO tách từ chữ (bộ quà lấy giá trị nhỏ nhất); tồn kho = 0. Admin: `saveProduct`/`applyImages` không còn xóa ảnh riêng từng size; `saveProductImages` nhận khóa `slug::SKU`; `listProducts` đọc cột mới; `ImageImporter` + `matchCatalog` hiểu tên `CPM_/CPP_/ST_<mã dòng>` (ảnh chung 1/2/3) và `PI_ <mã dòng>_<size>` (ảnh từng size, ghép nhỏ→lớn, refill cuối; lệch số lượng thì chỉ ghép đuôi trùng SKU, còn lại vào khay Chưa gán). Kiểm thử: SQL chạy trên Postgres giả lập (PGlite) với schema v0.3+seed+v0.4/0.5, chạy 2 lần không nhân đôi; tsc OK; test hàm ghép ảnh. **Chưa chạy trên Supabase/Cloudinary thật.** |
| 2026-11-22 | Claude | **Storefront đọc sản phẩm thật từ Supabase.** `src/lib/storefront.ts`: đọc danh mục + sản phẩm đang bán (anon/RLS), cache 60s (tag `catalog`, admin lưu → xóa cache + `revalidatePath`), lọc/ghép trong bộ nhớ. Nối: `/san-pham`, `/new-arrivals` (khối Mới = `is_new`, không lặp), `/san-pham/[danh-mục]` (cha hoặc con, lấy từ `storefront_categories`), chi tiết `/san-pham/[danh-mục]/[slug]` (nhãn size, ảnh gallery gồm ảnh từng size, bảng mô tả từ thành phần/HSD/phù hợp/hướng dẫn/bảo quản/lưu ý, giá theo size, hết hàng khi `stock_qty = 0`), mega menu (liên kết danh mục thật; NEW ARRIVALS lấy 4 SP mới), trang chủ (Bán chạy = `is_featured` + bù; Mới = `is_new`; Quà tặng = danh mục bo-qua-tang), `/tim-kiem` (không phân biệt dấu). Bỏ dữ liệu mẫu sản phẩm. Nhãn size ẩn ghi chú nội bộ "(mini/du lịch)", "chính". Kiểm thử: tsc OK; chạy dev với server PostgREST giả dùng dữ liệu SQL thật (PGlite): đủ 18 SP, danh mục cha/con, 404 slug sai, tìm kiếm, đổi size đổi giá, size hết hàng bị khóa, menu NEW. `next build` không chạy được trong sandbox (không tải được Google Fonts). **Chưa thử với Supabase thật.** |
| 2026-11-23 | Claude | **Luồng đặt hàng COD hoàn chỉnh.** Migration `20261123_v07_orders.sql`: hàm `place_order(jsonb)` (SECURITY DEFINER, anon+authenticated gọi được, KHÔNG dùng service_role): nhận SKU+SL+thông tin giao hàng, tự khóa dòng tồn kho, kiểm tra SP đang bán/đủ hàng, tính lại giá + phí ship, trừ kho, tạo `orders`+`order_items`+`payments`(cod/pending) trong 1 giao dịch; lỗi trả mã `empty/invalid/unavailable/out_of_stock/price_changed/rate_limited`; chống spam 5 đơn chờ/SĐT/giờ. Trigger `orders_status_effects`: hủy đơn → hoàn kho 1 lần + payment failed; hoàn thành + COD → đã thu tiền; không cho mở lại đơn đã hủy. Bảng `stock_movements` (nhật ký kho, admin đọc), `customer_carts` (giỏ theo tài khoản, RLS chính chủ). App: `src/lib/checkout.ts`, `gio-hang/actions.ts` (`placeOrder`, `lookupCartItems`, `loadMyCart`, `saveMyCart`), `CartProvider` (khóa dòng = SKU; đối chiếu catalog khi mở giỏ: cập nhật giá/kho, bỏ SP ngừng bán + thông báo; đăng nhập → gộp giỏ trình duyệt với giỏ server, lưu lại sau 0,8s; đăng xuất xóa giỏ cục bộ), `AuthProvider` bọc ngoài `CartProvider`, `CartPage` (gửi đơn, màn "Đặt hàng thành công", xử lý hết hàng/đổi giá), `OrderSummary` (COD mặc định, OnePay khóa "sắp ra mắt", phí ship thật), `ShippingForm` (tự điền tên/email), `CartItemRow` (nhãn hết hàng). Kiểm thử: SQL trên PGlite (23 tình huống: trừ kho, gộp SKU trùng, vượt tồn, nguyên tử khi 1 dòng thiếu, SP nháp, SĐT sai, giá đổi, spam, hủy→hoàn kho, mở lại bị chặn, COD→đã thu, quyền anon); UI e2e với dev server + PostgREST giả gọi đúng hàm SQL: thêm giỏ → điền form → đặt đơn → kho 100→99, đơn đúng số liệu, giỏ được dọn; kho về 0 sau khi trang đã hiện → báo "còn 0", giữ giỏ. tsc OK. **Chưa thử: Supabase thật, đăng nhập + đồng bộ giỏ (cần Auth thật), `next build`.** |
| 2026-11-23 | Claude | **Nối đơn hàng thật vào khu tài khoản.** Migration `20261123_v08_order_tracking.sql`: cột mốc `confirmed_at/shipped_at/completed_at/cancelled_at` (trigger ghi khi đổi trạng thái), hàm `lookup_order(mã đơn, SĐT/email)` cho khách vãng lai (SECURITY DEFINER, chuẩn hóa SĐT +84/0, không phân biệt sai mã/sai SĐT, khóa 15 phút khi thử sai ≥8 lần/mã hoặc ≥20 lần/liên hệ; bảng `order_lookup_attempts` đóng với anon; chỉ trả trường tối thiểu). App: `src/lib/orders.ts` (server-only: `listMyOrders` lọc theo `current_customer_id` — vì admin đọc được mọi đơn qua RLS, `getMyOrder`, `lookupOrderPublic`; ghép ảnh/link từ catalog theo SKU, SP đã ngừng bán vẫn hiện theo snapshot), `/tai-khoan/lich-su-mua-hang` và `/tai-khoan/don-hang/[mã đơn]` (dynamic, chưa đăng nhập → `LoginRequired`; mã đơn không của mình → 404), `/tra-cuu-don-hang` (server action). Thanh tiến trình: Đặt hàng → Xác nhận → Giao ĐVVC → Đã nhận (đơn hủy chỉ giữ mốc đặt). Tab lịch sử: Tất cả / Vận chuyển (chờ XN + đã XN + đang giao) / Hoàn thành / Đã hủy — **bỏ tab "Hoàn hàng"** vì DB chưa có trạng thái này (#34). "Mua lại" thêm SKU vào giỏ, trang giỏ tự đối chiếu giá/tồn kho khi mở. Bỏ `mockOrders` khỏi `data/account.ts`. Kiểm thử: SQL trên PGlite (tra cứu theo SĐT/+84/email/hoa-thường, sai thông tin, khóa khi thử nhiều, mốc thời gian theo từng trạng thái, idempotent); UI e2e (dev + PostgREST giả gọi SQL thật): đặt 2 đơn → lịch sử đúng mã/nhãn/tab, chi tiết đúng địa chỉ/COD/mốc giờ, mã lạ 404, Mua lại, tra cứu ok/sai/bị khóa, đăng xuất hiện nút đăng nhập; tsc OK. **Chưa thử: Supabase/Auth thật (đăng nhập thật + RLS), `next build`.** |
| 2026-11-23 | Claude | **Voucher áp dụng vào đơn.** Migration `20261123_v09_coupons.sql`: cột `coupons.max_uses/used_count/max_discount_vnd`; `coupon_check` (nội bộ) + `quote_coupon` (anon xem trước mức giảm); `place_order` v2 áp mã: khóa dòng coupon, kiểm tra hoạt động/thời gian/lượt dùng/đơn tối thiểu, giảm % (có trần) hoặc cố định (không vượt tiền hàng), không giảm phí ship (phí ship tính theo tiền hàng TRƯỚC giảm), lưu `coupon_code/discount_vnd`, tăng `used_count`; hủy đơn hoàn lượt dùng. Thông báo lỗi mã chung cho "không tồn tại/tắt" để không lộ danh sách mã. App: `quoteCoupon`, ô nhập mã ở giỏ (tính lại khi đổi giỏ, tự gỡ nếu hết điều kiện, nút Gỡ mã), màn thành công hiện ưu đãi; Admin Voucher thêm "Giảm tối đa", "Số lượt tối đa" (0 = không giới hạn) và cột "Đã dùng". Kiểm thử: SQL PGlite (%, trần, cố định, vượt tiền hàng, đơn tối thiểu, tắt/hết hạn/chưa tới hạn, mã dùng 1 lần, hủy hoàn lượt, expected_total lệch, mã sai không trừ kho); UI e2e (mã sai/đơn tối thiểu/áp dụng/đổi số lượng tính lại/đặt đơn/mã bị dùng hết giữa lúc đặt). **Chưa có:** giới hạn mỗi khách 1 lần; chống dò mã bằng captcha.
| 2026-11-23 | Claude | **Hồ sơ + sổ địa chỉ dùng dữ liệu thật.** Migration `20261123_v10_profile_addresses.sql`: `customers.gender/birthday`; hàm SECURITY INVOKER `upsert_address` (địa chỉ đầu tiên tự mặc định, tối đa 20), `set_default_address` (bỏ mặc định cũ trước vì index duy nhất), `delete_address` (xóa mặc định → địa chỉ mới nhất lên mặc định) — RLS `addresses_self` vẫn là lớp bảo vệ chính. App: `src/lib/account.ts`, `tai-khoan/actions.ts` (`updateProfile`, `saveAddress`, `setDefaultAddress`, `removeAddress`, `getCheckoutDefaults`), `ProfileView` (xem/sửa họ tên, SĐT, giới tính, ngày sinh; email chỉ hiển thị), `AddressesView` (form 5 ô: họ tên, SĐT, tỉnh/thành, quận/huyện, địa chỉ cụ thể — thay ô địa chỉ 1 dòng của Figma để khớp trang thanh toán), trang thanh toán tự điền hồ sơ + địa chỉ mặc định. Bỏ `mockUser/mockAddresses`. Kiểm thử: SQL với RLS thật (role authenticated): khách B không thấy/sửa/xóa/đặt mặc định địa chỉ của khách A, SĐT/giới tính sai bị chặn, trùng SĐT bị chặn, không chiếm hàng khách khác; UI e2e có phiên đăng nhập giả lập (cookie): sửa hồ sơ, thêm/sửa/đặt mặc định/xóa địa chỉ, tự điền khi thanh toán, **đồng bộ giỏ khi đăng nhập (gộp giỏ trình duyệt + giỏ server rồi lưu lại)**. **Chưa thử với Supabase Auth thật.**
| 2026-11-23 | Claude | **Bộ lọc danh mục thật + Đánh giá thật.** (1) Bộ lọc sidebar `/san-pham`: `lib/catalog-filters.ts` + `CatalogBrowser.tsx` (lọc phía trình duyệt, AND giữa nhóm / OR trong nhóm: dòng sản phẩm, dung tích, khoảng giá, "phù hợp với" theo từ khóa — `suitable_for` là văn bản tự do nên dùng thẻ từ khóa, TODO(content)); có số lượng từng mục, "Xóa bộ lọc", thông báo kết quả. (2) Form SP Admin thêm các ô còn thiếu (xem #44). (3) Migration `20261123_v11_reviews.sql`: bảng `reviews` (1 đánh giá / dòng đơn, 1–5 sao, ≤1000 ký tự, `edit_count`, `is_hidden`), RLS (khách chỉ đọc của mình; nhân sự toàn quyền; **không có policy ghi trực tiếp**), hàm `submit_review(p_item,p_rating,p_content)` SECURITY DEFINER (đúng chủ đơn, đơn phải `completed`, sửa tối đa 1 lần), view công khai `public_reviews` (tên che bớt "L*** Thịnh"; ẩn đánh giá `is_hidden`). App: `lib/reviews.ts` (đánh giá công khai cache 60s không dùng cookie nên trang SP vẫn ISR; `listMyReviews`), `submitReview` action, `ReviewModal` ghi thật (sửa 1 lần, hiện "Đã sửa 1 lần"), `OrderPanel` (nút Đánh giá cần đơn hoàn thành + đã đăng nhập), `MyReviewsView` + trang `tai-khoan/danh-gia` dữ liệu thật (bỏ `?trang-thai=trong`), `ProductDetailPage/ProductReviews` dùng đánh giá + điểm TB thật. Bỏ `data/reviews.ts` mẫu và `mockMyReviews`. Kiểm thử: SQL với RLS thật (chưa hoàn thành/sai chủ đơn/0 sao/quá dài bị chặn; sửa lần 2 bị chặn; anon không đọc được bảng gốc, chỉ đọc view; ghi trực tiếp bị chặn; ẩn đánh giá → biến mất khỏi view); UI e2e với server giả: đặt đơn → hoàn thành → đánh giá → sửa → trang "Đánh giá của tôi" → trang sản phẩm. **Chưa thử với Supabase thật; server giả không lọc `product_id` nên chưa kiểm được việc lọc theo sản phẩm ở UI (code có `.eq("product_id")`).**
| 2026-11-24 | Claude | **Admin: màn Kho hàng.** Migration `20261123_v12_stock_adjust.sql`: `stock_movements` thêm lý do `adjust`, cột `note`, `created_by`; hàm `adjust_stock(p_changes jsonb, p_note)` SECURITY DEFINER (chỉ `is_admin()`, khóa dòng theo id, SKU sai/số không hợp lệ → hủy cả lần, chỉ ghi dòng thật sự đổi). App: `/kho` (`StockAdmin.tsx`): bảng SKU với ô "Tồn mới", hiện chênh lệch, tìm kiếm, lọc tồn ≤ 5, ghi chú, lưu hàng loạt; tab "Nhật ký biến động" (300 dòng gần nhất: đặt hàng/hoàn kho/điều chỉnh, mã đơn). Test: SQL (khách bị chặn, lỗi → rollback, nhật ký đúng, khách không đọc được nhật ký) + giao diện với dữ liệu mẫu. **Chưa test nối server action với Supabase thật.**
- #42 Tồn kho thật chưa có trong CSV: đang để 0 → nhập trong Admin (hoặc đổi `DEFAULT_STOCK` trong script sinh SQL).
- #43 (đã xử lý 22/11) Storefront đã nối Supabase cho danh sách/chi tiết/menu/trang chủ/tìm kiếm. Còn mẫu: đánh giá (`data/reviews.ts`), giỏ hàng/thanh toán/đơn (chưa ghi DB), bộ lọc sidebar (chưa lọc), "Đã bán" ở thanh theo dõi.
- #44 (đã xử lý 23/11) Form sản phẩm Admin đã có: Dòng sản phẩm, Vùng nguyên liệu, Thành phần, Phù hợp với; mỗi biến thể có "Nhãn hiển thị" + chọn "Chính" (chỉ 1 biến thể mặc định đang bán). **Chưa test e2e form này** (mới qua tsc).
- #45 Ảnh size lệch số lượng so với CSV (OIL-BEL: 4 ảnh/3 size; LOT-BOD: 2 ảnh/3 size; son dưỡng: thiếu ảnh CB2) → admin gán tay trong khay "Chưa gán".
- #46 Tồn kho = 0 → mọi size hiện "hết hàng", không thêm giỏ được. Cần nhập tồn (Admin) hoặc chạy `update product_variants set stock_qty = N;`.
- #47 (đã xử lý) Nhãn `is_new`/`is_featured` đã có công tắc trong form sản phẩm Admin; chỉ cần gán cho sản phẩm.
- #48 Phí giao hàng khi đơn < 300.000đ đang để TẠM 30.000đ (SQL `shipping_fee_vnd` + `src/lib/checkout.ts` — sửa cả hai). Cần khách chốt mức phí.
- #49 Chưa có: thanh toán online OnePay, captcha (đặt đơn, tra cứu đơn, dò mã voucher), email/SMS xác nhận đơn, voucher giới hạn theo khách. (Voucher áp dụng vào đơn: xong 23/11.)
- #50 (đã xử lý 23/11) Lịch sử/chi tiết/tra cứu đơn đã dùng dữ liệu thật. Còn mẫu: hồ sơ, sổ địa chỉ, đánh giá (ReviewModal chỉ mô phỏng), FAQ. Hạn đổi trả chưa có (TODO(content)). Chưa có captcha cho tra cứu đơn. (23/11: hồ sơ, sổ địa chỉ, đánh giá đã dùng dữ liệu thật; còn mẫu: FAQ.)
- #51 (đã xử lý 24/11) Admin có màn **Kho hàng** (nhập tồn hàng loạt + nhật ký biến động). Còn: sửa tồn trực tiếp trong form sản phẩm chưa ghi nhật ký (TODO(stock-audit)).
