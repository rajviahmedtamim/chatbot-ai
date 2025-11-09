# ⚡ Performance Guide

## Why RAG Queries Take Time

Your RAG system has **3 main steps**, each with different performance characteristics:

### 📊 Performance Breakdown

```
User Question → RAG Pipeline → Answer
     ↓
┌────────────────────────────────────────┐
│ 1. Embedding (3-5s first time only)   │  ← Loads ML model into memory
│ 2. Vector Search (< 100ms)            │  ← Very fast!
│ 3. Ollama Generation (5-15s)          │  ← Main bottleneck
└────────────────────────────────────────┘
```

### Detailed Timing:

| Step | First Request | Subsequent Requests | Notes |
|------|---------------|---------------------|-------|
| **Embedding Model Load** | 3-5 seconds | 0ms (cached) | One-time per server restart |
| **Text Embedding** | 50-100ms | 50-100ms | Very consistent |
| **Vector Search** | 50-100ms | 50-100ms | Fast cosine similarity |
| **Ollama Generation** | 5-15 seconds | 5-15 seconds | Depends on answer length |
| **TOTAL** | **8-20 seconds** | **5-15 seconds** | Most time is Ollama |

---

## 🚀 Why Ollama Takes Time

Llama 3.2 (3B parameters) generates text **token by token** on your CPU:

- Faster with better CPU (Apple Silicon M1/M2 is faster)
- Slower on older Intel CPUs
- Answer length affects time (longer answers = more time)

**This is normal for local LLM inference!**

---

## ⚡ How to Speed It Up

### Option 1: Use a Smaller Model (Faster)

```bash
# Download a smaller, faster model
ollama pull gemma2:2b

# Update lib/rag.ts line 35:
model: "gemma2:2b"  // 2B params instead of 3.2B
```

**Expected improvement:** 30-50% faster

### Option 2: Limit Response Length

Already implemented in the updated code:

```typescript
options: {
  num_predict: 200,  // Max 200 tokens (~150 words)
}
```

**Expected improvement:** 20-40% faster for long answers

### Option 3: Use Streaming (Better UX)

Show answers as they're generated (like ChatGPT):

```typescript
stream: true  // Enable in lib/rag.ts
```

Users see text appearing immediately instead of waiting!

### Option 4: Upgrade Hardware

- **Apple Silicon (M1/M2/M3)**: 2-3x faster than Intel
- **More RAM**: Better for larger models
- **GPU**: If you have NVIDIA GPU, use ollama with GPU acceleration

---

## 🎯 Current Optimizations Applied

✅ **Embedding model caching** - Only loads once  
✅ **Response length limiting** - Max 200 tokens  
✅ **Quantized embeddings** - Faster loading  
✅ **Console timing logs** - See where time is spent  

---

## 📊 Benchmark: Expected Times

### Your Current Setup (Llama 3.2 - 3.2B)

| Hardware | First Query | Subsequent Queries |
|----------|-------------|-------------------|
| M1/M2 Mac | 5-8 seconds | 3-5 seconds |
| Intel i5/i7 | 10-15 seconds | 7-12 seconds |
| Intel i3 | 15-25 seconds | 12-20 seconds |

### With Smaller Model (gemma2:2b)

| Hardware | First Query | Subsequent Queries |
|----------|-------------|-------------------|
| M1/M2 Mac | 3-5 seconds | 2-3 seconds |
| Intel i5/i7 | 6-10 seconds | 5-8 seconds |
| Intel i3 | 10-15 seconds | 8-12 seconds |

---

## 💡 Understanding the Trade-offs

```
Speed ⚡ ←→ Quality ⭐ ←→ Cost 💰

Local (Ollama):
  Speed: Medium (5-15s)
  Quality: Good ⭐⭐⭐⭐
  Cost: FREE! 💚

Cloud (OpenAI):
  Speed: Fast (1-2s)
  Quality: Excellent ⭐⭐⭐⭐⭐
  Cost: $$$ per query 💸
```

**You chose the FREE path - slight wait is the trade-off for $0 cost!**

---

## 🔍 Monitor Performance

Your updated code now logs timing information:

```
🔄 Loading embedding model...
✅ Embedding model loaded! (3.2s)
Vector Search: 87ms
Ollama Generation: 8.4s
Total RAG Time: 8.5s
```

Check your browser console or terminal to see where time is spent!

---

## ✨ Is This Normal?

**YES!** 5-15 seconds for local LLM inference is **completely normal** for:
- Running on CPU (not GPU)
- 3B parameter models
- No cloud dependencies
- FREE usage

This is the same speed you'd get from:
- Running Llama locally with llama.cpp
- Using Hugging Face transformers locally
- Other local LLM solutions

**If you need faster responses, you'd need to:**
1. Use cloud APIs (OpenAI, Anthropic) - costs money
2. Get a GPU - costs money
3. Use smaller models - lower quality

Your current setup is **optimal for free local inference!** 🎉
