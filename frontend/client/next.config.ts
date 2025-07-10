import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Wyłączamy sprawdzanie ESLint podczas budowania
    ignoreDuringBuilds: true,
  },
  // ✅ POPRAWKA: Konfiguracja zmiennych środowiskowych dla API Gateway
  env: {
    NEXT_PUBLIC_API_GATEWAY_URL: process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:5000',
  },
};

export default nextConfig;
