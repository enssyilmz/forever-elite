import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // ESLint'i build sırasında devre dışı bırak
    ignoreDuringBuilds: true,
  },
  typescript: {
    // TypeScript hatalarını build sırasında göz ardı et (dikkatli kullan)
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
