import type { NextConfig } from "next";
import dotenv from "dotenv";
import path from "path";

// Load root .env file into process.env during Node.js server startup
dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });
dotenv.config({ path: path.resolve(process.cwd(), "../../.env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const nextConfig: NextConfig = {
  async rewrites() {
    const defaultUrl =
      process.env.NODE_ENV === "production"
        ? "https://api-automation.amberbisht.me"
        : "http://localhost:4000";
    const backendUrl = (process.env.BACKEND_URL || defaultUrl).replace(/\/+$/, "");
    return [
      {
        source: "/api/workflow/:path*",
        destination: `${backendUrl}/api/workflow/:path*`,
      },
      {
        source: "/api/billing/:path*",
        destination: `${backendUrl}/api/billing/:path*`,
      },
      {
        source: "/api/credentials/:path*",
        destination: `${backendUrl}/api/credentials/:path*`,
      },
    ];
  },
};

export default nextConfig;
