/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
        port: "",
        pathname: "/**",
      },
    ],
  },
  devIndicators: {
    allowedDevOrigins: [
      "9000-firebase-studio-1753083471050.cluster-xpmcxs2fjnhg6xvn446ubtgpio.cloudworkstations.dev",
    ],
  },
};

export default nextConfig;
