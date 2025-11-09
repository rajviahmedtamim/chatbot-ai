#!/bin/bash

echo "🚀 TechCorp RAG System - Setup & Test Script"
echo "=============================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "✨ Using in-memory ChromaDB - No Python required!"
echo ""

# Check for .env.local
echo ""
echo "🔐 Step 1: Checking environment variables..."
if [ -f ".env.local" ]; then
    if grep -q "your_openai_api_key_here" .env.local; then
        echo -e "${YELLOW}⚠ Please update your OPENAI_API_KEY in .env.local${NC}"
        exit 1
    else
        echo -e "${GREEN}✓ Environment variables configured${NC}"
    fi
else
    echo -e "${YELLOW}⚠ .env.local not found!${NC}"
    echo "Creating .env.local from template..."
    cp .env.local.example .env.local
    echo -e "${YELLOW}Please edit .env.local and add your OpenAI API key${NC}"
    exit 1
fi

# Check if data exists
echo ""
echo "📁 Step 2: Checking documents..."
if [ -d "data" ] && [ "$(ls -A data)" ]; then
    file_count=$(find data -type f | wc -l)
    echo -e "${GREEN}✓ Found $file_count documents in data/ folder${NC}"
else
    echo -e "${RED}✗ No documents found in data/ folder${NC}"
    exit 1
fi

# Ingest documents
echo ""
echo "📥 Step 3: Ingesting documents into ChromaDB..."
echo "This will chunk and embed all documents..."
npx tsx scripts/ingest.ts

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Documents successfully ingested${NC}"
else
    echo -e "${RED}✗ Document ingestion failed${NC}"
    exit 1
fi

echo ""
echo "✅ Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Run 'npm run dev' to start the development server"
echo "2. Open http://localhost:3000 in your browser"
echo "3. Start asking questions about TechCorp!"
echo ""
echo "Example queries:"
echo "  - What is TechCorp's revenue?"
echo "  - How many vacation days do employees get?"
echo "  - Tell me about CloudVault"
echo ""
