import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* static export for Cafe24 */
  output: 'export',
  basePath: '/housingcalendar',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
