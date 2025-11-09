import fs from "fs";
import { glob } from "glob";
import { vectorDB } from "../lib/vectordb";

// Optimal chunking: 500 chars with 100 char overlap for better context preservation
function chunk(text: string, chunkSize = 500, overlap = 100) {
  const chunks = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    const chunkText = text.slice(start, end);

    if (chunkText.trim().length > 0) {
      chunks.push(chunkText);
    }

    // Move forward by (chunkSize - overlap) to create overlap
    start += chunkSize - overlap;
  }

  return chunks;
}

async function ingest() {
  const files = await glob("data/**/*.*");

  console.log(`📁 Found ${files.length} files to process\n`);

  // Clear existing data
  vectorDB.clear();

  for (const file of files) {
    const text = fs.readFileSync(file, "utf8");
    const chunks = chunk(text);

    console.log(`📄 Indexing ${file} (${chunks.length} chunks)`);

    for (let i = 0; i < chunks.length; i++) {
      await vectorDB.add({
        id: `${file}_${i}`,
        document: chunks[i],
        metadata: { source: file, chunk: i },
      });
    }
  }

  console.log(`\n✅ Successfully indexed ${vectorDB.count()} chunks!`);
}

ingest();
