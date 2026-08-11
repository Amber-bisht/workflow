import type { NextConfig } from "next";
import dotenv from "dotenv";
import path from "path";

// Load root .env file into process.env during Node.js server startup
dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });
dotenv.config({ path: path.resolve(process.cwd(), "../../.env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

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
