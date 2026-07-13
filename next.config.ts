import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emit a self-contained server (.next/standalone) so the VPS/Docker image
  // ships only the files actually needed to run — no full node_modules,
  // dramatically smaller and faster to start. Serve with `node server.js`.
  output: "standalone",

  // These packages use Node built-ins / native assets and must not be bundled
  // by the compiler; they are loaded from node_modules at runtime instead.
  serverExternalPackages: [
    'pdf-parse',
    'tesseract.js',
    '@napi-rs/canvas',
  ],
};

export default nextConfig;
