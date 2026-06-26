import { Index } from '@upstash/vector';

/**
 * Upstash Vector data layer.
 *
 * The index must be created in the Upstash console with a built-in embedding
 * model selected (e.g. `mixedbread-ai/mxbai-embed-large-v1`). That lets us send
 * raw text via the `data` field and have Upstash compute embeddings server-side
 * — so there is no local embedding runtime (onnxruntime) to bundle, which is
 * what makes this work on Vercel's serverless functions.
 */

const url = process.env.UPSTASH_VECTOR_REST_URL;
const token = process.env.UPSTASH_VECTOR_REST_TOKEN;

if (!url || !token) {
  // Surfaced at request time via getIndex() so the build itself doesn't fail.
  console.warn(
    'UPSTASH_VECTOR_REST_URL / UPSTASH_VECTOR_REST_TOKEN are not set. ' +
      'Set them in .env (local) and in your Vercel project settings.'
  );
}

let index: Index | null = null;

export function getIndex(): Index {
  if (!url || !token) {
    throw new Error(
      'Upstash Vector is not configured. Set UPSTASH_VECTOR_REST_URL and ' +
        'UPSTASH_VECTOR_REST_TOKEN environment variables.'
    );
  }
  if (!index) {
    index = new Index({ url, token });
  }
  return index;
}
