import type { Metadata } from "next";
import { Unbounded } from "next/font/google";
import { siteConfig } from "@/config/site";
import "./globals.css";

// Unbounded là variable font → dùng được mọi độ đậm 300–800 như Figma.
const unbounded = Unbounded({
  subsets: ["latin", "vietnamese"],
  variable: "--font-unbounded",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: `${siteConfig.name} – Motherhood & Women Care`, template: `%s | ${siteConfig.name}` },
  description: siteConfig.description,
  // TODO(seo): thêm openGraph image, favicon thật khi có logo.
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={unbounded.variable}>
      <head>
        {/* TODO(font): next/font (v15.5) chưa hỗ trợ Momo Signature → nạp qua Google Fonts.
            Khi muốn tự host: tải font về src/fonts và dùng next/font/local. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Momo+Signature&display=swap" rel="stylesheet" />
      </head>
      <body className="flex min-h-screen flex-col font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
