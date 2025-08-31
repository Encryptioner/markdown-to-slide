import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === 'production';
const basePath = isProduction ? '/markdown-to-slide' : '';

const nextConfig: NextConfig = {
  basePath,
  assetPrefix: basePath,
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
