/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['@anthropic-ai/sdk'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'inkonchain.com',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_INK_CHAIN_ID: process.env.NEXT_PUBLIC_INK_CHAIN_ID,
    NEXT_PUBLIC_INK_RPC_URL: process.env.NEXT_PUBLIC_INK_RPC_URL,
  },
}

module.exports = nextConfig