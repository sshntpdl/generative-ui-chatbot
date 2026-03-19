/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for Docker multi-stage builds — produces a minimal standalone server
  output: "standalone",

  experimental: {
    serverComponentsExternalPackages: [
      "@langchain/core",
      "@langchain/groq",
      "@langchain/community",
      "@langchain/langgraph",
      "groq-sdk",
    ],
  },

  webpack: (config, { isServer }) => {
    // Stub Node.js built-ins that break in webpack context
    config.resolve.alias = {
      ...config.resolve.alias,
      "node:async_hooks": false,
    };

    // Prevent server-only modules from leaking into client bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }

    return config;
  },

  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
        ],
      },
    ];
  },
};

export default nextConfig;
