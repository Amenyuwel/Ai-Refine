import packageJson from "./package.json" with { type: "json" };

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Inlined at build time so the client gets only the version, not the whole package.json
  env: { APP_VERSION: packageJson.version },
  // The e2e run builds into its own folder, so a `next build` elsewhere cannot
  // replace the chunks its server is still serving
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
};

export default nextConfig;
