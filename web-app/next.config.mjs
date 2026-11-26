import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: path.resolve(__dirname, '..'),
    resolveAlias: {
      '@backend': path.resolve(__dirname, '../backend'),
    },
  },
  webpack: (config) => {
    config.resolve.alias['@backend'] = path.resolve(__dirname, '../backend');
    return config;
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
    ],
  },
  async headers() {
    return [
      {
        // Public and protected API endpoints with safe CORS headers supporting Chrome Extension, Web, and Native Android
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PATCH, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Authorization, Content-Type, X-Requested-With, x-admin-key' },
        ],
      },
    ];
  },
};

export default nextConfig;
