import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Type checking done separately; skipped here to avoid OOM on low-memory machines
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
