#!/bin/bash

# AgentVerse Next.js Setup Script
echo "🚀 AgentVerse Next.js Setup"
echo "============================"
echo ""

# Check Node.js version
echo "Checking Node.js version..."
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 18 or higher is required. Current version: $(node --version)"
    exit 1
fi
echo "✅ Node.js $(node --version)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Create data directory
echo ""
echo "📁 Creating data directory..."
mkdir -p data

# Copy environment files
echo ""
echo "⚙️  Setting up environment files..."
if [ ! -f .env.local ]; then
    cp .env.example .env.local
    echo "✅ Created .env.local"
    echo "⚠️  Please edit .env.local and set your ADMIN_KEY"
else
    echo "⚠️  .env.local already exists, skipping..."
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start development:"
echo "  npm run dev"
echo ""
echo "The application will be available at http://localhost:3000"
echo ""
echo "Don't forget to:"
echo "  1. Set your ADMIN_KEY in .env.local"
echo "  2. Install dependencies: npm install"
echo ""
