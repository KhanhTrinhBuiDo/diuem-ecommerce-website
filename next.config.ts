import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Ảnh sản phẩm lưu ở Cloudinary, DB chỉ giữ link https://res.cloudinary.com/...
  images: { remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }] },
};

export default nextConfig;
