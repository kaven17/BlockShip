/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  eslint: { ignoreDuringBuilds: true },
  images: { unoptimized: true },
  experimental: {
    optimizePackageImports: [],  // Disable barrel optimization
  },
};

module.exports = nextConfig;