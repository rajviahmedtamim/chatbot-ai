import { runRAG } from "@/lib/rag";
import { vectorDB } from "@/lib/vectordb";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const query: string = body.query;
    const stream: boolean = body.stream || false;

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return Response.json(
        { error: "Query is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    // If streaming is requested
    if (stream) {
      let sources: Array<{ source: string; chunk: number }> = [];

      const readable = new ReadableStream({
        async start(controller) {
          await runRAG(query, (chunk: string) => {
            controller.enqueue(
              new TextEncoder().encode(`data: ${JSON.stringify({ chunk })}\n\n`)
            );
          });

          // After streaming completes, send sources
          const results = await vectorDB.query(query, 3);
          const metadatas = results.metadatas[0] || [];
          sources = metadatas.map((meta) => ({
            source: meta.source as string,
            chunk: meta.chunk as number,
          }));

          controller.enqueue(
            new TextEncoder().encode(
              `data: ${JSON.stringify({ done: true, sources })}\n\n`
            )
          );
          controller.close();
        },
      });

      return new Response(readable, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    // Non-streaming response (fallback)
    const answer = await runRAG(query);
    const results = await vectorDB.query(query, 3);
    const metadatas = results.metadatas[0] || [];
    const sources = metadatas.map((meta) => ({
      source: meta.source as string,
      chunk: meta.chunk as number,
    }));

    return Response.json({ answer, sources });
  } catch (error) {
    console.error("RAG API Error:", error);
    return Response.json(
      {
        error: "Failed to process query",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
