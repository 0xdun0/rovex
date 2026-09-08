import type {NextConfig} from 'next';

// Standalone output is only needed for the Docker image (deploy.sh / Dockerfile
// set NEXT_STANDALONE=true). A local `pnpm build && pnpm start` uses the normal
// output so it works on macOS/Windows without the build-trace step failing.
const standaloneOutput = process.env.NEXT_STANDALONE === 'true';

const nextConfig: NextConfig = {
  ...(standaloneOutput ? {output: 'standalone'} : {}),
  // desativa os badges e overlays de desenvolvimento do nextjs conforme pedido
  devIndicators: false, // oculta o icone N e o toast estatico no canto inferior
  // `pnpm dev` writes to `.next-dev`; `pnpm build` / `pnpm start` use `.next`.
  // Separate directories let a production build coexist with a dev server, so
  // you can switch between `pnpm dev` and `pnpm build && pnpm start` without
  // rebuilding. Docker/CI run `next build` (NODE_ENV=production) and use `.next`.
  distDir:
    process.env.NEXT_DIST_DIR ||
    (process.env.NODE_ENV === 'development' ? '.next-dev' : '.next'),
  eslint: {
    // Warnings from ESLint can cause `next build` to fail inside Docker.
    // Ignore lint during build in containerized deployments to ensure image creation.
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**',
      }
    ],
  },
  async redirects() {
    return [
      { source: '/report/projects', destination: '/report/9a4f2c1b8e7d3a6e', permanent: true },
      { source: '/report/findings', destination: '/report/5e1d8c2a9b4f7e3d', permanent: true },
      { source: '/report/clients', destination: '/report/7f3a9c2e81d44b6a', permanent: true },
      { source: '/report/targets', destination: '/report/7f3a9c2e81d44b6a', permanent: true },
      { source: '/report/vulnerabilities', destination: '/report/3b8e4f1a9c2d7e6f', permanent: true },
      { source: '/report/templates', destination: '/report/6c2a9e4f1d8b7e3a', permanent: true },
      { source: '/report/backup', destination: '/report/4f8b2c1e9a7d3e6a', permanent: true },
      { source: '/report/profile', destination: '/report/1e9a7c3b8f2d4e6a', permanent: true },
      { source: '/report/themes', destination: '/report/8a3f1c9e4b7d2e6a', permanent: true },
      { source: '/report/mcp', destination: '/report/2d7e9a4f1c8b3e6a', permanent: true },
      { source: '/report/settings', destination: '/report/0f4a8b1c2e6d3a9e', permanent: true },
      { source: '/report/doc', destination: '/report/e3b8a1c9f4d27e5a', permanent: true },
      { source: '/report/docs', destination: '/report/e3b8a1c9f4d27e5a', permanent: true },
      // Redirecionamento permanente com integridade referencial de proj-htb-haze para o padrao novo
      { source: '/report/9a4f2c1b8e7d3a6e/proj-htb-haze', destination: '/report/9a4f2c1b8e7d3a6e/proj-writeup-haze-2026', permanent: true },
      { source: '/report/9a4f2c1b8e7d3a6e/proj-htb-haze/report', destination: '/report/9a4f2c1b8e7d3a6e/proj-writeup-haze-2026/report', permanent: true },
      { source: '/report/9a4f2c1b8e7d3a6e/proj-htb-haze/:path*', destination: '/report/9a4f2c1b8e7d3a6e/proj-writeup-haze-2026/:path*', permanent: true },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/report/9a4f2c1b8e7d3a6e/:id/view',
        destination: '/report/9a4f2c1b8e7d3a6e/:id/report',
      },
      {
        source: '/report/9a4f2c1b8e7d3a6e/:id/dossier',
        destination: '/report/9a4f2c1b8e7d3a6e/:id/report',
      },
      {
        source: '/report/9a4f2c1b8e7d3a6e/:id/evidence/:findingId',
        destination: '/report/9a4f2c1b8e7d3a6e/:id/findings/:findingId',
      },
    ];
  },
};

export default nextConfig;

