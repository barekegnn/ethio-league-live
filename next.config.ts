import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ethioleague.vercel.app",
        pathname: "/**",
      },
    ],
  },
  async rewrites() {
    // Optional local-dev proxy: set BACKEND_URL=http://localhost:3001 in .env.local
    // to forward /api/fan/* requests to the local backend without CORS issues.
    if (!process.env.BACKEND_URL) return [];
    return [
      {
        source: "/api/fan/:path*",
        destination: `${process.env.BACKEND_URL}/api/fan/:path*`,
      },
    ];
  },
};

export default nextConfig;
