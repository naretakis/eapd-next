import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable static export for GitHub Pages deployment
  output: 'export',

  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },

  // Set base path based on environment
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',

  // Set asset prefix for GitHub Pages
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH || '',

  // Enable trailing slash for better GitHub Pages compatibility
  trailingSlash: true,

  // Disable server-side features for static export
  experimental: {
    // Disable features that require server-side rendering
  },

  // Environment-specific configuration
  env: {
    NEXT_PUBLIC_ENVIRONMENT:
      process.env.NEXT_PUBLIC_ENVIRONMENT || 'development',
    NEXT_PUBLIC_VERSION: process.env.npm_package_version || '0.2.0',
  },

  // Webpack configuration for better bundle analysis
  webpack: (config, { dev, isServer }) => {
    // Bundle analyzer in development
    if (dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
          },
        },
      };
    }

    return config;
  },

  // TypeScript configuration
  typescript: {
    // Type checking is handled by CI/CD pipeline
    ignoreBuildErrors: false,
  },

  // ESLint configuration
  eslint: {
    // Linting is handled by CI/CD pipeline
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
