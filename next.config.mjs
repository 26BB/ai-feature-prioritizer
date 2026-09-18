/** @type {import('next').NextConfig} */
const nextConfig = {
  // ponytail: silences workspace-root warning from parent-dir lockfile detection
  turbopack: {
    root: import.meta.dirname,
  },
};

export default nextConfig;
