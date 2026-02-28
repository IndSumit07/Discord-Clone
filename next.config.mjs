/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/channels/@me",
        destination: "/channels/me",
      },
      {
        source: "/channels/@me/:conversationId",
        destination: "/channels/me/:conversationId",
      },
    ];
  },
};

export default nextConfig;
