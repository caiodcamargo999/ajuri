
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [],
    unoptimized: false,
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse', 'pdfjs-dist'],
    optimizePackageImports: [
      'lucide-react', 
      'recharts', 
      'framer-motion', 
      'date-fns',
      '@radix-ui/react-icons'
    ],
    serverActions: {
      allowedOrigins: ['localhost:3000'],
      bodySizeLimit: '20mb',
    },
  },
  // Desabilita logs de desenvolvimento em produção para ganho de performance
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

export default nextConfig;
