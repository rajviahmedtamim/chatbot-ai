# 🚀 Setting Up Ollama (Free Local LLM)

## Step 1: Install Ollama

### macOS Installation:
```bash
# Download and install from the official website
open https://ollama.ai/download

# OR use Homebrew
brew install ollama
```

After installation, verify:
```bash
ollama --version
```

## Step 2: Start Ollama Service

```bash
# Start Ollama server (keep this running)
ollama serve
```

## Step 3: Pull a Model

Open a new terminal and run:

```bash
# Recommended: Llama 3.2 (3B - fast and good quality)
ollama pull llama3.2

# OR other options:
# ollama pull mistral        # 7B - high quality
# ollama pull phi3          # 3.8B - Microsoft's model
# ollama pull gemma2:2b     # 2B - very fast
```

## Step 4: Test It

```bash
ollama run llama3.2 "Hello, how are you?"
```

## Step 5: Return to VS Code

Once Ollama is running and you've pulled a model, come back and I'll update your code automatically!

---

## Model Recommendations:

| Model | Size | Speed | Quality | Best For |
|-------|------|-------|---------|----------|
| **llama3.2** | 3B | ⚡⚡⚡ | ⭐⭐⭐⭐ | **Recommended** |
| gemma2:2b | 2B | ⚡⚡⚡⚡ | ⭐⭐⭐ | Fastest |
| mistral | 7B | ⚡⚡ | ⭐⭐⭐⭐⭐ | Best quality |
| phi3 | 3.8B | ⚡⚡⚡ | ⭐⭐⭐⭐ | Balanced |

Choose based on your computer's RAM and speed preference!
