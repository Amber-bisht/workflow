import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || "http://localhost:4000";
    return [
      {
        source: "/api/workflow/run",
        destination: `${backendUrl}/api/workflow/run`,
      },
      {
        source: "/api/workflow/stream/:path*",
        destination: `${backendUrl}/api/workflow/stream/:path*`,
      },
    ];
  },
};

export default nextConfig;
