import { ChromaClient } from 'chromadb';
import { DefaultEmbeddingFunction } from '@chroma-core/default-embed';

const chromaUrl = process.env.CHROMA_URL || 'http://localhost:8000';
export const chromaClient = new ChromaClient({ path: chromaUrl });

export const COLLECTION_NAME = 'rag_docs';

// Local ONNX (all-MiniLM-L6-v2) embeddings — no API key required.
// chromadb v3 no longer bundles a default embedding function, so it must be
// provided explicitly for both indexing (add) and querying.
const embeddingFunction = new DefaultEmbeddingFunction();

/**
 * Ensures the ChromaDB collection exists and returns it.
 */
export async function getCollection() {
  return await chromaClient.getOrCreateCollection({
    name: COLLECTION_NAME,
    embeddingFunction,
  });
}
