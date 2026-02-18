import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.openfoodfacts.org',
      },
    ],
  },
};

// Dynamic import for next-pwa to avoid require
const withPWA = async () => {
  const nextPWA = await import("next-pwa");
  return nextPWA.default({
    dest: "public",
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === "development",
  });
};

export default async function PWAConfig() {
  const pwa = await withPWA();
  return pwa(nextConfig);
}