#!/bin/bash

echo "🎉 100% FREE RAG System - Final Setup!"
echo "======================================"
echo ""

# Check if Ollama is installed
if ! command -v ollama &> /dev/null; then
    echo "❌ Ollama is not installed"
    echo ""
    echo "Please install Ollama:"
    echo "  Visit: https://ollama.ai/download"
    echo "  OR run: brew install ollama"
    echo ""
    exit 1
fi

echo "✅ Ollama is installed"
echo ""

# Check if Ollama is running
if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "✅ Ollama server is running"
else
    echo "⚠️  Ollama server is not running"
    echo ""
    echo "Please start Ollama in a separate terminal:"
    echo "  ollama serve"
    echo ""
    exit 1
fi

echo ""

# Check if llama3.2 model is available
if ollama list | grep -q "llama3.2"; then
    echo "✅ llama3.2 model is installed"
else
    echo "📥 Downloading llama3.2 model (this may take a few minutes)..."
    ollama pull llama3.2
    
    if [ $? -eq 0 ]; then
        echo "✅ llama3.2 model downloaded successfully!"
    else
        echo "❌ Failed to download model"
        exit 1
    fi
fi

echo ""
echo "✅ All set! Your RAG system is 100% FREE and runs locally!"
echo ""
echo "Next steps:"
echo "1. Run: npm run dev"
echo "2. Open: http://localhost:3000"
echo "3. Start asking questions!"
echo ""
echo "🎊 No API keys needed! Everything runs on your computer!"
