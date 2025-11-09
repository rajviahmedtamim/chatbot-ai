import fs from "fs";
import path from "path";
import { embedText } from "./embed";

const VECTOR_DB_PATH = path.join(process.cwd(), ".vectordb");
const DB_FILE = path.join(VECTOR_DB_PATH, "vectors.json");

interface VectorEntry {
  id: string;
  embedding: number[];
  document: string;
  metadata: Record<string, string | number>;
}

class SimpleVectorDB {
  private vectors: VectorEntry[] = [];

  constructor() {
    this.load();
  }

  private load() {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      this.vectors = JSON.parse(data);
    } else {
      fs.mkdirSync(VECTOR_DB_PATH, { recursive: true });
      this.vectors = [];
    }
  }

  private save() {
    fs.writeFileSync(DB_FILE, JSON.stringify(this.vectors, null, 2));
  }

  async add(entry: Omit<VectorEntry, "embedding">) {
    const embedding = await embedText(entry.document);
    this.vectors.push({
      ...entry,
      embedding: embedding as number[],
    });
    this.save();
  }

  async query(queryText: string, nResults: number = 5) {
    const queryEmbedding = await embedText(queryText);

    // Calculate cosine similarity
    const results = this.vectors.map((vector) => {
      const similarity = this.cosineSimilarity(
        queryEmbedding as number[],
        vector.embedding
      );
      return { ...vector, similarity };
    });

    // Sort by similarity (highest first)
    results.sort((a, b) => b.similarity - a.similarity);

    // Return top N
    const topResults = results.slice(0, nResults);

    return {
      documents: [topResults.map((r) => r.document)],
      metadatas: [topResults.map((r) => r.metadata)],
      distances: [topResults.map((r) => 1 - r.similarity)], // Convert similarity to distance
    };
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  clear() {
    this.vectors = [];
    this.save();
  }

  count() {
    return this.vectors.length;
  }
}

export const vectorDB = new SimpleVectorDB();
