import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Ảnh sản phẩm lưu ở Cloudinary, DB chỉ giữ link https://res.cloudinary.com/...
  images: { remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }] },
  // Cho phép tải file Excel nhập sản phẩm (Vercel giới hạn thân request ~4,5MB)
  experimental: { serverActions: { bodySizeLimit: "4mb" } },
};

export default nextConfig;
