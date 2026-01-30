import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8080",
        pathname: "/api/images/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "5050",
        pathname: "/api/images/**",
      },
      {
        protocol: "https",
        hostname: "api.lucidwavestudios.com",
        pathname: "/api/images/**",
      },
      
    ],
  },
};

export default nextConfig;
