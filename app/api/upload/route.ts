import { NextResponse } from "next/server";
import { parseDocument, detectDocumentType } from "@/lib/parsers";
import { vectorDB } from "@/lib/vectordb";

/**
 * Chunk text into smaller pieces with overlap
 */
function chunk(text: string, chunkSize = 500, overlap = 100): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    start += chunkSize - overlap;
  }

  return chunks;
}

/**
 * Handle file uploads (PDF, DOCX, TXT)
 */
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const url = formData.get("url") as string | null;

    let text: string;
    let sourceName: string;
    let docType: "pdf" | "docx" | "txt" | "url" | null;

    // Handle URL input
    if (url) {
      docType = "url";
      sourceName = new URL(url).hostname;
      console.log(`Processing URL: ${url}`);
      text = await parseDocument(url, "url");
    }
    // Handle file upload
    else if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      docType = detectDocumentType(file.name, file.type);

      if (!docType) {
        return NextResponse.json(
          {
            error:
              "Unsupported file type. Please upload PDF, DOCX, or TXT files.",
          },
          { status: 400 }
        );
      }

      sourceName = file.name;
      console.log(`Processing file: ${file.name} (${docType})`);
      text = await parseDocument(buffer, docType);
    } else {
      return NextResponse.json(
        { error: "Please provide either a file or URL" },
        { status: 400 }
      );
    }

    // Validate extracted text
    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Could not extract text from the document" },
        { status: 400 }
      );
    }

    console.log(`Extracted ${text.length} characters from ${sourceName}`);

    // Chunk the text
    const chunks = chunk(text, 500, 100);
    console.log(`Created ${chunks.length} chunks`);

    // Add to vector database
    let addedCount = 0;
    for (let i = 0; i < chunks.length; i++) {
      const chunkText = chunks[i].trim();
      if (chunkText.length > 50) {
        // Skip very small chunks
        await vectorDB.add({
          id: `${sourceName}-chunk-${i}`,
          document: chunkText,
          metadata: {
            source: sourceName,
            chunk: i,
            type: docType,
          },
        });
        addedCount++;
      }
    }

    console.log(`✅ Added ${addedCount} chunks to vector database`);

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${sourceName}`,
      stats: {
        source: sourceName,
        type: docType,
        textLength: text.length,
        chunksCreated: chunks.length,
        chunksAdded: addedCount,
      },
    });
  } catch (error) {
    console.error("Upload API Error:", error);
    return NextResponse.json(
      {
        error: "Failed to process document",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
