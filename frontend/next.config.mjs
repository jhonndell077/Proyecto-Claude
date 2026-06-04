/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:4000/api/:path*",
      },
      {
        source: "/socket.io/:path*",
        destination: "http://localhost:4000/socket.io/:path*",
      },
    ];
  },
};

export default nextConfig;
