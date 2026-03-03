import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep fast defaults for local iteration. Enable with NEXT_REACT_COMPILER=1 when needed.
  reactCompiler: process.env.NEXT_REACT_COMPILER === "1",
};

export default nextConfig;
