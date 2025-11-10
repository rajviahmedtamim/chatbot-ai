# TechCorp RAG AI Assistant 🤖

A production-ready **Retrieval-Augmented Generation (RAG)** system built with Next.js, custom vector database, and Ollama. This AI assistant can answer questions about TechCorp using semantic search over company documents.

> **Full Setup Guide**: See [docs/FREE_RAG_SETUP.md](docs/FREE_RAG_SETUP.md) for detailed instructions
> 
> **Ollama Setup**: See [docs/OLLAMA_SETUP.md](docs/OLLAMA_SETUP.md) for Ollama installation guide

## What You've Built ✨

✅ **Vector Database** - Custom file-based vector store (100% JavaScript, no dependencies!)  
✅ **Document Chunking** - Optimal 500-char chunks with 100-char overlap  
✅ **Embeddings** - Text to 384D vectors using `all-MiniLM-L6-v2`  
✅ **Semantic Search** - Find by meaning with cosine similarity  
✅ **RAG Pipeline** - Retrieval → Augmentation → Generation  
✅ **Production System** - Complete working AI assistant

## Architecture 🏗️

```
User Query
    ↓
Text Embedding (384D vector)
    ↓
Vector Database Search (Cosine Similarity, Top 5)
    ↓
Context Augmentation
    ↓
OpenAI GPT-4o-mini (Answer Generation)
    ↓
Response + Sources
```

## Quick Start  🚀 

### Prerequisites

- Node.js 18+ and npm
- **Ollama** (free local LLM - installation instructions below)
- **100% FREE - No API keys needed!**

### 1. Install Dependencies

```bash
npm install
```

### 2. Install and Start Ollama

**Install Ollama:**

Visit [https://ollama.ai/download](https://ollama.ai/download) or use Homebrew:

```bash
brew install ollama
```

**Start Ollama server** (in a separate terminal):

```bash
ollama serve
```

**Pull a model** (in another terminal):

```bash
# Recommended: Fast and good quality
ollama pull llama3.2

# Other options:
# ollama pull mistral (higher quality, slower)
# ollama pull gemma2:2b (fastest)
```

### 3. Ingest Documents

This will chunk and embed all documents in the `data/` folder:

```bash
npx tsx scripts/ingest.ts
```

You should see output like:
```
Indexing data/company_overview.txt (15 chunks)
Indexing data/employee_policies.txt (22 chunks)
Indexing data/technical_documentation.txt (35 chunks)
Indexing data/financial_reports.txt (28 chunks)
```

### 4. Run the Application

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) and start asking questions!

**Important**: Make sure Ollama is running (`ollama serve`) before asking questions!

## Example Queries 📚

Try asking:
- "What is TechCorp's revenue?"
- "How many vacation days do employees get?"
- "What is CloudVault?"
- "Tell me about the AI Insights platform"
- "What are the company values?"
- "How does the employee stock purchase plan work?"

## How It Works 🔧

### Document Chunking

Documents are split into 500-character chunks with 100-character overlap to preserve context across boundaries:

```typescript
// scripts/ingest.ts
function chunk(text, chunkSize = 500, overlap = 100)
```

### Embedding Generation
Text is converted to 384-dimensional vectors using the `all-MiniLM-L6-v2` model:

```typescript
// lib/embed.ts
const embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
const embedding = await embedder(text, { pooling: "mean", normalize: true });
```

### Vector Search

Custom vector database performs cosine similarity search to find the 5 most relevant chunks:

```typescript
// lib/vectordb.ts
const result = await vectorDB.query(query, 5);
```

### Answer Generation

Retrieved context is sent to Ollama (running locally) to generate accurate answers:

```typescript
const response = await ollama.generate({
  model: "llama3.2",
  prompt: prompt,
});
```

## Project Structure 📁

```
fin-ai/
├── app/
│   ├── api/rag/route.ts      # RAG API endpoint
│   ├── components/Chat.tsx    # Chat UI component
│   └── page.tsx               # Main page
├── lib/
│   ├── vectordb.ts            # Simple vector database
│   ├── embed.ts               # Text embedding function
│   └── rag.ts                 # RAG pipeline with Ollama
├── scripts/
│   └── ingest.ts              # Document ingestion script
├── data/                      # Your documents to search
│   ├── company_overview.txt
│   ├── employee_policies.txt
│   ├── technical_documentation.txt
│   └── financial_reports.txt
├── docs/                      # Documentation
│   ├── FREE_RAG_SETUP.md      # Complete setup guide
│   ├── OLLAMA_SETUP.md        # Ollama installation
│   └── MISSION_ACCOMPLISHED.md # What you've built
├── .vectordb/                 # Vector database storage
│   └── vectors.json
└── package.json
```

## Adding Your Own Documents 🎨

1. Add `.txt`, `.md`, or other text files to the `data/` folder
2. Run the ingestion script: `npx tsx scripts/ingest.ts`
3. Your documents are now searchable!

## Environment Variables  🔐

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | Your OpenAI API key | Yes |

## Tech Stack 🛠️

- **Framework**: Next.js 16 with App Router
- **Vector DB**: Custom file-based vector store (no external dependencies!)
- **Embeddings**: Xenova Transformers (all-MiniLM-L6-v2)
- **LLM**: Ollama with Llama 3.2 (100% free & local!)
- **Styling**: Tailwind CSS 4
- **Language**: TypeScript 5

## Key Metrics 📊

- **Embedding Dimensions**: 384
- **Chunk Size**: 500 characters
- **Chunk Overlap**: 100 characters (20% overlap for better context)
- **Top-K Results**: 5
- **Distance Metric**: Cosine similarity

## Deployment 🚀

To deploy this to production:

1. Deploy to Vercel/Netlify/your preferred host
2. Host Ollama on a server or use Ollama cloud service
3. Update the Ollama host URL in `lib/rag.ts`
4. The vector database will be created automatically on first ingestion
5. Run `npm run ingest` after deployment to index your documents

## License 📝

MIT

## What You've Mastered 🙌

Congratulations! You now have a complete understanding of:

- **Vector Databases**: Storing and querying high-dimensional embeddings
- **Semantic Search**: Finding documents by meaning, not just keywords
- **RAG Architecture**: Combining retrieval with generative AI
- **Production AI Systems**: Building real-world AI applications

---

Built with ❤️ using RAG technology
