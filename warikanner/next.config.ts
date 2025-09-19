import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config) => {
    // テスト環境またはNEXT_PUBLIC_USE_MOCK=trueの場合、walletServicesをmockServicesにエイリアス
    if (
      process.env.NODE_ENV === "test" ||
      process.env.NEXT_PUBLIC_USE_MOCK === "true"
    ) {
      config.resolve.alias = {
        ...config.resolve.alias,
        "@/services/walletServices": "@/services/mockServices",
      };
    }

    return config;
  },
};

export default nextConfig;
