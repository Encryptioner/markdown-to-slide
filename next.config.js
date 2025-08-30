/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true
  },
  basePath: process.env.NODE_ENV === 'production' ? '/markdown-to-slide' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/markdown-to-slide/' : '',
  trailingSlash: true,
}

module.exports = nextConfig