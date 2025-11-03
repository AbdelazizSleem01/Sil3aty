/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "tse4.mm.bing.net",
      },
      {
        protocol: "https",
        hostname: "*.mm.bing.net",
      },
      {
        protocol: "https",
        hostname: "media.istockphoto.com",
      },
      {
        protocol: "https",
        hostname: "*.istockphoto.com",
      },
      {
        protocol: "https",
        hostname: "i.pinimg.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
    qualities: [75, 90], 
  },
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
  },
  async rewrites() {
    return [];
  },
};

export default nextConfig;
