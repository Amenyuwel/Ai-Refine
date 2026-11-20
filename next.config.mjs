/** @type {import('next').NextConfig} */
const nextConfig = {
  // The e2e run builds into its own folder, so a `next build` elsewhere cannot
  // replace the chunks its server is still serving
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
};

export default nextConfig;
