# Bản đồ vị trí ảnh

**Cách dùng:** sao chép nguyên các thư mục Materials của bạn (`About_Diu_Em`, `General`, `Homepage`, `Product_Catalog`) vào `public/images/`, giữ đúng tên thư mục và tên file, rồi commit + push. Không cần sửa code: `scripts/scan-images.mjs` tự chạy trước `npm run dev` / `npm run build` (kể cả trên Vercel). Chạy `npm run images` để xem còn thiếu ảnh nào.

- Không phân biệt hoa/thường; đuôi nhận `png`, `jpg`, `webp`, `avif`, `svg` (trùng tên thì ưu tiên webp > avif > jpg > png > svg).
- Kích thước là kích thước thiết kế; Next.js tự nén/đổi cỡ ảnh khi hiển thị.
- Ảnh sản phẩm thật nằm ở database (link Cloudinary), không nằm ở đây.
- Mục "Chưa gán vị trí": đã khai báo tên nhưng chưa hiển thị ở đâu (chờ xác nhận).

## Header / chung

| File (trong public/images/) | Vị trí | Kích thước |
|---|---|---|
| `General/Logo.png` | Logo ở Header (và mọi nơi dùng LogoMark). Nên PNG/SVG nền trong suốt | 88×78 (nên xuất gấp đôi) |

## Trang chủ

| File (trong public/images/) | Vị trí | Kích thước |
|---|---|---|
| `General/Cau_chuyen_thuong_hieu.png` | Ảnh nền khối 'Câu chuyện thương hiệu' | 1528×450 |
| `General/Cung_Diu_Em_Dong_Hanh/1.png` | 'Cùng Dịu Em đồng hành' – bài 1 | 479×350 |
| `General/Cung_Diu_Em_Dong_Hanh/2.png` | 'Cùng Dịu Em đồng hành' – bài 2 | 479×350 |
| `General/Cung_Diu_Em_Dong_Hanh/3.png` | 'Cùng Dịu Em đồng hành' – bài 3 | 479×350 |
| `Homepage/Banner/1.png` | Banner đầu trang, slide 1 | 1729×615 |
| `Homepage/Banner/2.png` | Banner đầu trang, slide 2 (tùy chọn – có file thì tự thêm slide) | 1729×615 |
| `Homepage/Banner/3.png` | Banner đầu trang, slide 3 (tùy chọn) | 1729×615 |
| `Homepage/Catology/mat.png` | Thẻ danh mục 1: Chăm sóc mặt | tỉ lệ 2:3 |
| `Homepage/Catology/toc.png` | Thẻ danh mục 2: Chăm sóc tóc | tỉ lệ 2:3 |
| `Homepage/Catology/cothe.png` | Thẻ danh mục 3: Chăm sóc cơ thể | tỉ lệ 2:3 |
| `Homepage/Catology/khac.png` | Thẻ danh mục 4: Ngành khác | tỉ lệ 2:3 |
| `Homepage/Sub_banner/1.png` | Banner nền 'BÁN CHẠY NHẤT' | 1728×410 |
| `Homepage/Sub_banner/2.png` | Banner nền 'SẢN PHẨM MỚI' | 1728×410 |
| `Homepage/Sub_banner/3.png` | Banner nền 'QUÀ TẶNG NGƯỜI THƯƠNG' | 1728×410 |

## Trang danh mục sản phẩm

| File (trong public/images/) | Vị trí | Kích thước |
|---|---|---|
| `Product_Catalog/0.San_pham.png` | Banner trang /san-pham ('Banner Sản phẩm') | 1729×615 |
| `Product_Catalog/0.New_arrivals.png` | Banner trang /new-arrivals | 1729×615 |
| `Product_Catalog/1.Cham_soc_toc.png` | Banner /san-pham/cham-soc-toc | 1729×615 |
| `Product_Catalog/2.Cham_soc_co_the.png` | Banner /san-pham/cham-soc-co-the | 1729×615 |
| `Product_Catalog/3.Cham_soc_mat.png` | Banner /san-pham/cham-soc-mat | 1729×615 |
| `Product_Catalog/4.Cham_soc_em_be.png` | Banner /san-pham/cham-soc-em-be (danh mục mới thêm) | 1729×615 |
| `Product_Catalog/5.Qua_tang.png` | Banner /san-pham/qua-tang-nguoi-thuong | 1729×615 |

## Về Dịu Em (trang /ve-diu-em)

| File (trong public/images/) | Vị trí | Kích thước |
|---|---|---|
| `About_Diu_Em/Banner.png` | Banner đầu trang /ve-diu-em (cả chiều rộng, cao ~360px, ảnh 2 mẹ con nằm trên giường hoa) | 1729×~400 |
| `About_Diu_Em/Image_1.png` | Ảnh nghiêng (viền trắng, bóng hồng) cạnh chữ 'DỊU EM' | 484×605 |
| `About_Diu_Em/Image_2.png` | Dải ảnh ngang có chữ 'Mẹ ơi, con thương mẹ...' | 1729×~480 |
| `About_Diu_Em/Image_3.png` | Ảnh cạnh 'Hành trình bắt đầu từ những điều bình dị nhất' | 591×419 |
| `About_Diu_Em/Image_4.png` | Banner nền 'Tự hào – Vùng nguyên liệu từ địa phương' | 1729×~560 |
| `About_Diu_Em/Image_5.png` | Ảnh 'Công nghệ và máy móc hiện đại' (bên trái) | 562×374 |
| `About_Diu_Em/Image_6.png` | Ảnh 'Quy trình kiểm soát nghiêm ngặt' (bên phải) | 562×374 |
| `About_Diu_Em/Image_7.png` | Ảnh hàng 1 'Hành trình đồng hành' – Quỹ học bổng Cống Hiến (cũng dùng làm ảnh thu nhỏ bài viết 1) | 656×478 |
| `About_Diu_Em/Image_8.png` | Ảnh hàng 2 – Bệnh viện Từ Dũ (cũng dùng làm ảnh thu nhỏ bài viết 2) | 656×478 |
| `About_Diu_Em/Image_9.png` | Ảnh hàng 3 – Nữ sinh vùng cao / Áo ấm trường em (cũng dùng làm ảnh thu nhỏ bài viết 3) | 656×478 |

## Bài viết (trang /bai-viet/…)

| File (trong public/images/) | Vị trí | Kích thước |
|---|---|---|
| `Posts/Banner_1.png` | Banner bài 'Dịu Em đồng hành cùng 50 sinh viên nữ…' (/bai-viet/hoc-bong-cung-em-vung-buoc) | 1729×615 |
| `Posts/Banner_2.png` | Banner bài 'Dịu Em đồng hành cùng những người mẹ, người bà… Từ Dũ' (/bai-viet/dong-hanh-benh-vien-tu-du) | 1729×615 |
| `Posts/Banner_3.png` | Banner bài 'Dịu Em đồng hành cùng nữ sinh dân tộc Thái…' (/bai-viet/nu-sinh-thai-thanh-hoa) | 1729×615 |

## Chưa gán vị trí

| File (trong public/images/) | Vị trí | Kích thước |
|---|---|---|
| `General/Catology/1.Cham_soc_mat.png` | Chưa rõ dùng ở đâu – chờ bạn xác nhận | — |
| `General/Catology/2.Cham_soc_toc.png` | Chưa rõ dùng ở đâu – chờ bạn xác nhận | — |
| `General/Catology/3.Cham_soc_co_the.png` | Chưa rõ dùng ở đâu – chờ bạn xác nhận | — |
| `General/Catology/4.Cham_soc_khac.png` | Chưa rõ dùng ở đâu – chờ bạn xác nhận | — |

## Ngoài cấu trúc hiện có

| File (trong public/images/) | Vị trí | Kích thước |
|---|---|---|
| `header/menu-1.png` | Menu lớn 'Sản phẩm' – ảnh phải trên (chỉ hiện ≥1280px) | 320×262 |
| `header/menu-2.png` | Menu lớn 'Sản phẩm' – ảnh phải dưới | 320×262 |
| `detail/gallery-1.png` | Trang chi tiết: ảnh sản phẩm 1 (cũng là ảnh thẻ sản phẩm mẫu) | 650×975 |
| `detail/gallery-2.png` | Trang chi tiết: ảnh sản phẩm 2 | 650×975 |
| `detail/description.png` | Trang chi tiết: ảnh khối 'Mô tả sản phẩm' | 862×534 |
| `footer/moit-badge.png` | Huy hiệu 'Đã thông báo Bộ Công Thương' | 180×65 |
