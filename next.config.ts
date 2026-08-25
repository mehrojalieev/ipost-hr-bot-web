import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Telegram Mini App iframe ichida ochilishi uchun cheklovlarni bo'shatamiz
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
    ];
  },
};

export default nextConfig;
