import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  // @ts-ignore - turbopack is a valid but potentially untyped key in this version
  turbopack: {
    root: path.resolve(__dirname, ".."),
  },
};

export default nextConfig;
