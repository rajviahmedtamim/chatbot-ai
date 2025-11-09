import { pipeline } from "@xenova/transformers";

let embedder: any = null;
let isLoading = false;

export async function embedText(text: string) {
  if (!embedder && !isLoading) {
    isLoading = true;
    console.log(
      "🔄 Loading embedding model (first time only, ~3-5 seconds)..."
    );
    console.time("Model Loading");

    embedder = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2",
      { quantized: true } // Use quantized version for faster loading
    );

    console.timeEnd("Model Loading");
    console.log("✅ Embedding model loaded and cached!");
    isLoading = false;
  }

  // Wait if model is being loaded by another request
  while (isLoading) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  const output = await embedder(text, {
    pooling: "mean",
    normalize: true,
  });

  return Array.from(output.data);
}
