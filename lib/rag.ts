import { vectorDB } from "./vectordb";
import { Ollama } from "ollama";

const ollama = new Ollama({ host: "http://localhost:11434" });

export async function runRAG(
  query: string,
  streamCallback?: (chunk: string) => void
) {
  console.time("Total RAG Time");

  // 1. Retrieve from vector database
  console.time("Vector Search");
  const result = await vectorDB.query(query, 5);
  console.timeEnd("Vector Search");

  const docs = result.documents[0] || [];
  const context = docs.join("\n\n---\n\n");

  // Debug: Log the context being sent
  console.log("\n=== CONTEXT BEING SENT TO LLM ===");
  console.log(context.substring(0, 500) + "...");
  console.log("=================================\n");

  if (!context) {
    return {
      answer: "I couldn't find any relevant information in the knowledge base.",
      sources: [],
    };
  }

  // 2. Augment + generate answer via Ollama (100% FREE!)
  const prompt = `You are a helpful AI assistant for TechCorp. Answer questions using ONLY the information in the context below.

IMPORTANT INSTRUCTIONS:
- Read the entire context carefully
- If the answer exists in the context, provide it clearly
- If you're not sure or the context doesn't contain the answer, say "I don't have that information"
- Be concise and direct

CONTEXT:
${context}

QUESTION: ${query}

ANSWER:`;

  console.time("Ollama Generation");

  // Use streaming if callback provided
  if (streamCallback) {
    let fullResponse = "";
    const stream = await ollama.generate({
      model: "llama3.2",
      prompt: prompt,
      stream: true,
      options: {
        temperature: 0.3,
        num_predict: 300,
      },
    });

    for await (const chunk of stream) {
      if (chunk.response) {
        fullResponse += chunk.response;
        streamCallback(chunk.response);
      }
    }

    console.timeEnd("Ollama Generation");
    console.timeEnd("Total RAG Time");

    return {
      answer: fullResponse,
      sources: result.metadatas[0] || [],
    };
  } else {
    // Non-streaming (original behavior)
    const response = await ollama.generate({
      model: "llama3.2",
      prompt: prompt,
      stream: false,
      options: {
        temperature: 0.3,
        num_predict: 300,
      },
    });

    console.timeEnd("Ollama Generation");
    console.timeEnd("Total RAG Time");

    return {
      answer: response.response,
      sources: result.metadatas[0] || [],
    };
  }
}
