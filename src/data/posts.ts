import { siteImage } from "@/data/site-images";

/**
 * Bài viết "Đồng hành Cùng Em" (nội dung lấy từ Figma Post 1–3).
 * TODO(supabase): khi cần admin tự viết bài thì chuyển sang bảng `posts`; hiện 3 bài cố định nằm trong code.
 * Ảnh banner: public/images/Posts/Banner_<n>.png; ảnh thu nhỏ dùng About_Diu_Em/Image_7–9 (xem docs/BAN_DO_ANH.md).
 */
export type Post = {
  slug: string;
  title: string;
  /** Tiêu đề rút gọn cho thẻ (trang chủ, danh sách) */
  shortTitle: string;
  /** Câu trích nổi bật (thanh hồng bên trái, chữ Momo Signature) */
  quote: string;
  /** Các đoạn thân bài; đoạn bắt đầu bằng dấu ngoặc kép “ là lời trích dẫn nhân vật */
  paragraphs: string[];
  /** Ngày đăng (YYYY-MM-DD) */
  date: string;
  banner: string | null;
  thumb: string | null;
};

export const postSeries = { name: "Đồng hành Cùng Em", crumb: "Đồng hành Cùng Em" } as const;

export const posts: Post[] = [
  {
    slug: "hoc-bong-cung-em-vung-buoc",
    title: "Dịu Em đồng hành cùng 50 sinh viên nữ vượt khó trên hành trình chinh phục giảng đường",
    shortTitle: "Dịu Em đồng hành cùng 50 sinh viên nữ vượt khó...",
    quote: "Có các chương trình chuyên biệt như Học bổng cho nữ sinh dân tộc thiểu số, hỗ trợ tài chính giáo dục chính quy cùng các hoạt động hướng nghiệp và tập huấn phát triển kỹ năng cho nữ sinh, Dịu Em mong các em vững bước đến ngày tốt nghiệp.",
    paragraphs: [
      "Ngày 15/09/2026, tại Trường Đại học Cần Thơ, thương hiệu Dịu Em phối hợp cùng Hội Liên hiệp Phụ nữ TP. Cần Thơ tổ chức lễ trao học bổng “Cùng Em Vững Bước” cho 50 sinh viên nữ có hoàn cảnh khó khăn. Mỗi suất học bổng trị giá 5.000.000 đồng, với tổng ngân sách 250 triệu đồng, ưu tiên các bạn đến từ vùng sâu, vùng xa và gia đình có hoàn cảnh đặc biệt.",
      "Không dừng lại ở hỗ trợ tài chính, chương trình còn đồng hành cùng các bạn trong suốt năm học. Mỗi hai sinh viên được kết nối với một cố vấn đang làm việc trong lĩnh vực chuyên môn tương ứng. Bên cạnh đó, 6 buổi hướng nghiệp và tập huấn kỹ năng được tổ chức với các chủ đề thiết thực như viết CV, phỏng vấn, quản lý chi tiêu cá nhân và chăm sóc sức khỏe tinh thần.",
      "“Ngày nhận giấy báo nhập học, mẹ em vừa mừng vừa lo vì không biết lấy tiền đâu để em tiếp tục đi học. Học bổng này giúp em yên tâm hơn, và em biết mình không phải đi một mình,” Nguyễn Thị Minh Anh, sinh viên năm nhất ngành Công nghệ thông tin, chia sẻ.",
      "Đại diện Dịu Em cho biết, thương hiệu được tạo ra với mong muốn nhắc nhở mỗi người phụ nữ rằng họ luôn xứng đáng được yêu thương và chăm sóc.",
      "“Chúng mình tin rằng một cô gái được tiếp sức hôm nay sẽ có thêm cơ hội trở thành người phụ nữ vững vàng ngày mai. Đó là lý do Dịu Em muốn bắt đầu từ giảng đường.”",
      "Chương trình dự kiến được duy trì hằng năm, với 2% doanh thu từ dòng sản phẩm Dịu Em – Chăm Sóc Mẹ được trích đóng góp cho các hoạt động hỗ trợ nữ sinh. Thông tin đăng ký cho năm học tiếp theo sẽ được cập nhật trên website và fanpage chính thức của Dịu Em.",
    ],
    date: "2026-09-15",
    banner: siteImage("Posts/Banner_1"),
    thumb: siteImage("About_Diu_Em/Image_7"),
  },
  {
    slug: "dong-hanh-benh-vien-tu-du",
    title: "Dịu Em đồng hành cùng những người mẹ, người bà đang điều trị tại Bệnh viện Từ Dũ",
    shortTitle: "Dịu Em đồng hành cùng những người mẹ, người bà tại Bệnh viện Từ Dũ",
    quote: "Bên cạnh các chương trình học bổng cho nữ sinh, Dịu Em tiếp tục lan tỏa sự quan tâm đến phụ nữ thông qua những phần quà chăm sóc và hoạt động thăm hỏi bệnh nhân nữ, đặc biệt là những người mẹ sau sinh và bệnh nhân có hoàn cảnh khó khăn.",
    paragraphs: [
      "Ngày 20/10/2026, đội ngũ Dịu Em cùng 20 tình nguyện viên đã đến thăm Khoa Sản, Bệnh viện Từ Dũ (TP.HCM). Chuyến thăm hướng đến 100 bệnh nhân nữ đang điều trị tại bệnh viện, trong đó có những người mẹ sau sinh và các trường hợp phải nằm viện dài ngày.",
      "Mỗi bệnh nhân nhận một bộ quà “Cho Em” gồm dầu gội hoa bưởi, sữa tắm và khăn mềm, với tổng giá trị khoảng 350.000 đồng mỗi bộ.",
      "Đặc biệt, Dịu Em dành ngân sách 45 triệu đồng để hỗ trợ viện phí cho 15 trường hợp có hoàn cảnh đặc biệt khó khăn, mỗi trường hợp nhận 3.000.000 đồng thông qua sự giới thiệu của bệnh viện.",
      "Không chỉ trao tặng những món quà vật chất, chương trình còn tổ chức hoạt động gội đầu và chăm sóc cá nhân nhẹ nhàng ngay tại giường bệnh, giúp các bệnh nhân cảm thấy thoải mái hơn trong thời gian điều trị.",
      "“Nằm viện cả tháng, hôm nay mới được gội đầu với cảm giác dễ chịu như vậy. Những điều nhỏ thôi nhưng khiến tôi thấy được quan tâm và nhẹ lòng hơn nhiều,” cô Nguyễn Thị Hồng, 62 tuổi, chia sẻ.",
      "Đại diện điều dưỡng Khoa Sản, bà Trần Thị Thu Hà, cho biết: “Sự quan tâm và động viên từ cộng đồng có ý nghĩa rất lớn đối với tinh thần người bệnh. Những hoạt động chăm sóc thiết thực như thế này góp phần giúp bệnh nhân cảm thấy được sẻ chia trong quá trình điều trị.”",
      "Với thông điệp “Chăm con bắt đầu từ chăm mẹ”, Dịu Em dự kiến duy trì chương trình mỗi quý tại các bệnh viện phụ sản và đa khoa ở TP.HCM cùng các tỉnh phía Nam. Thương hiệu cũng mong muốn tạo thêm cơ hội để khách hàng cùng tham gia lan tỏa sự quan tâm thông qua những lời chúc gửi đến các bệnh nhân.",
    ],
    date: "2026-10-20",
    banner: siteImage("Posts/Banner_2"),
    thumb: siteImage("About_Diu_Em/Image_8"),
  },
  {
    slug: "nu-sinh-thai-thanh-hoa",
    title: "Dịu Em đồng hành cùng nữ sinh dân tộc Thái tại Thanh Hóa trên con đường đến trường",
    shortTitle: "Dịu Em đồng hành cùng nữ sinh dân tộc Thái tại Thanh Hóa",
    quote: "Thông qua học bổng, dụng cụ học tập và những buổi trò chuyện về chăm sóc bản thân tuổi dậy thì, Dịu Em mong muốn tiếp thêm động lực để các em gái vùng cao tự tin theo đuổi việc học và lựa chọn tương lai của mình.",
    paragraphs: [
      "Ngày 05/09/2026, tại Trường PTDTBT THCS Mường Lát, huyện Mường Lát, tỉnh Thanh Hóa, Dịu Em phối hợp cùng Hội Liên hiệp Phụ nữ huyện Mường Lát tổ chức chương trình trao học bổng cho 30 nữ sinh dân tộc Thái có thành tích học tập tốt và hoàn cảnh gia đình khó khăn.",
      "Mỗi em nhận học bổng trị giá 2.000.000 đồng cùng một bộ dụng cụ học tập trị giá 500.000 đồng, bao gồm cặp sách, vở viết và các vật dụng học đường thiết yếu.",
      "Đặc biệt, chương trình hướng đến việc hỗ trợ lâu dài, với cam kết tiếp tục đồng hành cùng các em đến hết bậc THPT nếu duy trì việc học.",
      "Tại buổi trao quà, các tình nguyện viên Dịu Em còn tổ chức hoạt động trò chuyện về vệ sinh cá nhân và chăm sóc cơ thể trong giai đoạn dậy thì. Đây là những chủ đề thiết thực nhưng đôi khi còn khiến các em e ngại khi chia sẻ. Mỗi nữ sinh cũng được tặng một bộ sản phẩm chăm sóc cá nhân cơ bản để sử dụng hằng ngày.",
      "“Em muốn học hết lớp 12 để trở thành cô giáo, sau này có thể quay về bản dạy chữ cho các em nhỏ,” Lò Thị Mai, học sinh lớp 8A, rụt rè chia sẻ khi ôm chiếc cặp mới trong tay.",
      "Với Dịu Em, mỗi em gái được tiếp tục đến trường là một người phụ nữ có thêm cơ hội lựa chọn con đường tương lai. Thương hiệu tin rằng việc chăm sóc và trao quyền cho phụ nữ cần bắt đầu từ những điều gần gũi nhất: tạo điều kiện để các em được học tập, phát triển và tự tin với ước mơ của mình. Trong năm 2027, Dịu Em đặt mục tiêu mở rộng chương trình đến 10 điểm trường vùng cao, tiếp tục hành trình để không em gái nào phải từ bỏ ước mơ học tập vì hoàn cảnh khó khăn.",
    ],
    date: "2026-09-05",
    banner: siteImage("Posts/Banner_3"),
    thumb: siteImage("About_Diu_Em/Image_9"),
  },
];

export const postHref = (slug: string) => `/bai-viet/${slug}`;
export const getPost = (slug: string) => posts.find((p) => p.slug === slug) ?? null;

/** Bật/tắt huy hiệu "Dịu Em × Đồng hành CÙNG EM" vẽ đè lên banner bài viết. Tắt nếu ảnh banner của bạn đã có sẵn huy hiệu này. */
export const postBannerBadge = false;
