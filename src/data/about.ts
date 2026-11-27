import { postHref, posts } from "@/data/posts";
import { siteImage } from "@/data/site-images";

/**
 * Nội dung trang "Về Dịu Em – Câu chuyện thương hiệu" (Figma). Ảnh: public/images/About_Diu_Em/ (xem docs/BAN_DO_ANH.md).
 * TODO(content): đây là nội dung từ bản thiết kế; sửa chữ ngay trong file này.
 */
const img = (n: number) => siteImage(`About_Diu_Em/Image_${n}`);

export const about = {
  banner: siteImage("About_Diu_Em/Banner"),
  intro: {
    image: img(1),
    title: "DỊU EM",
    tagline: "Dịu dàng với em, như cách em dịu dàng với cả thế giới.",
    text: "Dịu Em là thương hiệu chăm sóc cơ thể có nguồn gốc thiên nhiên, thuộc Công ty TNHH Dịu Em, ra đời năm 2026. Chúng mình làm ra những sản phẩm lành, rõ thành phần, để người phụ nữ đang mang thai, vừa sinh con hay đang nuôi con nhỏ có thể yên tâm chăm sóc chính mình, ngay cả khi bé đang nằm trong vòng tay.",
  },
  band: { image: img(2), text: "Mẹ ơi, con thương mẹ..." },
  journey: {
    image: img(3),
    title: "Hành trình bắt đầu từ",
    subtitle: "...những điều bình dị nhất",
    text: "Dịu Em bắt đầu từ một câu hỏi rất nhỏ: mẹ lo cho cả nhà, vậy còn em thì sao? Những người mẹ chúng mình gặp thường gác lại mái tóc rụng sau sinh, làn da khô vì thức đêm, chỉ vì sợ mỹ phẩm không an toàn khi bế con. Nhớ đến nồi nước gội hoa bưởi bà ngoại nấu ngày xưa, chúng mình tìm về những nguyên liệu quen thuộc của quê nhà, để việc chăm sóc bản thân lại trở thành một điều bình dị và an tâm.",
  },
  pride: {
    image: img(4),
    kicker: "Tự hào",
    title: "Vùng nguyên liệu từ địa phương",
    text: "Hoa bưởi được hái từ những vườn miền Tây. Dịu Em làm việc trực tiếp với 100+ hộ nông dân, thu hái đúng mùa và sơ chế ngay trong ngày để giữ trọn hương thơm, đồng thời góp một phần thu nhập ổn định cho những người phụ nữ làm vườn ở địa phương.",
  },
  tech: {
    image: img(5),
    title: "Công nghệ và máy móc hiện đại",
    text: "Nguyên liệu mộc mạc được chiết xuất bằng Công nghệ chiết lạnh để giữ lại dưỡng chất mà không cần dung môi mạnh. Sản phẩm được sản xuất tại Việt Nam trên dây chuyền khép kín, từ khâu phối trộn đến chiết rót, giúp từng chai Dịu Em đến tay mẹ luôn đồng đều và sạch sẽ.",
  },
  process: {
    image: img(6),
    title: "Quy trình kiểm soát nghiêm ngặt",
    text: "Mỗi công thức của Dịu Em đều nói không với paraben, MIT, retinoid và hương liệu tổng hợp. Sản phẩm được kiểm nghiệm kích ứng da, đạt chuẩn CGMP-ASEAN / ISO 22716. Từng lô hàng đều được lưu mẫu và kiểm tra trước khi xuất xưởng, vì sự an toàn của mẹ và bé là điều chúng mình không thỏa hiệp.",
  },
  journeyHead: { kicker: "Dịu em", title: "Hành trình đồng hành", sub: "cùng Triệu Phụ nữ Việt" },
  // Thứ tự khớp posts[0..2]; ảnh hàng = About_Diu_Em/Image_7–9; nút "Xem chi tiết" dẫn tới bài viết.
  rows: [
    { lead: "Dịu Em đồng hành cùng 50 nữ sinh viên với", title: "Quỹ học bổng Cống Hiến", text: "Với chương trình học bổng Cùng Em Vững Bước, Dịu Em mong muốn tiếp sức cho những nữ sinh viên có hoàn cảnh khó khăn, không chỉ bằng hỗ trợ tài chính mà còn thông qua các hoạt động hướng nghiệp và phát triển kỹ năng." },
    { lead: "Dịu Em đồng hành cùng bệnh viện phụ sản Từ Dũ", title: "Dự án vì Mẹ, thương con.", text: "Bên cạnh các chương trình học bổng cho nữ sinh, Dịu Em tiếp tục lan tỏa sự quan tâm đến phụ nữ thông qua những phần quà chăm sóc và hoạt động thăm hỏi bệnh nhân nữ, đặc biệt là những người mẹ sau sinh và bệnh nhân có hoàn cảnh khó khăn." },
    { lead: "Dịu Em đồng hành cùng 4 trường tiểu học", title: "Dự án Áo ấm, trường em.", text: "Thông qua học bổng, dụng cụ học tập và những buổi trò chuyện về chăm sóc bản thân tuổi dậy thì, Dịu Em mong muốn tiếp thêm động lực để các em gái vùng cao tự tin theo đuổi việc học và lựa chọn tương lai của mình." },
  ].map((r, i) => ({ ...r, image: img(7 + i), href: postHref(posts[i].slug) })),
  closing: { line1: "Và hành trình ấy của Dịu em", line2: "chỉ mới bắt đầu..." },
};
