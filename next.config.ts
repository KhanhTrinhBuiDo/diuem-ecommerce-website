import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // TODO(ảnh): khi dùng ảnh từ Supabase Storage, thêm images.remotePatterns tại đây.
};

export default nextConfig;
