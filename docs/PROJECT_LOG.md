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
| `TODO(reviews)` | `data/reviews.ts`, `ProductReviews.tsx` | 12 đánh giá mẫu; thích/báo cáo chưa hoạt động; điểm TB tính từ dữ liệu mẫu | Bảng `reviews` + RLS (chỉ người đã mua) |
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
