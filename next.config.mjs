
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [],
    unoptimized: false,
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    optimizePackageImports: [
      'lucide-react', 
      'recharts', 
      'framer-motion', 
      'date-fns',
      '@radix-ui/react-icons'
    ],
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },
  // Desabilita logs de desenvolvimento em produção para ganho de performance
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

export default nextConfig;
