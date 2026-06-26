import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    'pdf-parse',
    'tesseract.js',
    '@napi-rs/canvas',
    'chromadb',
    '@chroma-core/default-embed',
    '@chroma-core/ai-embeddings-common',
    'onnxruntime-node',
  ],
};

export default nextConfig;
