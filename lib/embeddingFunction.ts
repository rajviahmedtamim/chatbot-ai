import { EmbeddingFunction } from "chromadb";
import { embedText } from "./embed";

export class CustomEmbeddingFunction implements EmbeddingFunction {
  async generate(texts: string[]): Promise<number[][]> {
    const embeddings = await Promise.all(texts.map((text) => embedText(text)));
    return embeddings as number[][];
  }
}
