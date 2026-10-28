import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Keep Next.js from writing its own blocks into AGENTS.md.
  agentRules: false,
  experimental: {
    agentFeedback: false,
  },
};

export default nextConfig;
