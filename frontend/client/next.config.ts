import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Wyłączamy sprawdzanie ESLint podczas budowania
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
