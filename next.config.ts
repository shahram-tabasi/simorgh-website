import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: { unoptimized: true },
  // A self-contained server (.next/standalone) carrying only the modules it
  // imports: what the container image runs. `npm start` still works locally.
  output: 'standalone',
};

export default nextConfig;
