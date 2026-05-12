import type { NextConfig } from 'next';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  reactStrictMode: true,
  /** Monorepo: Expo lockfile at repo root + web/package-lock — trace from repo root */
  outputFileTracingRoot: path.join(__dirname, '..'),
};

export default nextConfig;
