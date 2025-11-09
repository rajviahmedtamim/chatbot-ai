import { ChromaClient } from "chromadb";
import { CustomEmbeddingFunction } from "./embeddingFunction";

// In-memory ChromaDB - No Python required!
// We'll use our own embeddings from embed.ts
export const chroma = new ChromaClient();

const embeddingFunction = new CustomEmbeddingFunction();

export async function getCollection() {
  try {
    return await chroma.getCollection({
      name: "techcorp_docs",
      embeddingFunction,
    });
  } catch {
    return await chroma.createCollection({
      name: "techcorp_docs",
      embeddingFunction,
      metadata: { "hnsw:space": "cosine" },
    });
  }
}
