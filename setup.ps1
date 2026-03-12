# AgentVerse Next.js Setup Script (Windows PowerShell)

Write-Host "🚀 AgentVerse Next.js Setup" -ForegroundColor Green
Write-Host "============================" -ForegroundColor Green
Write-Host ""

# Check Node.js version
Write-Host "Checking Node.js version..." -ForegroundColor Yellow
$NODE_VERSION = node --version
$VERSION_MAJOR = $NODE_VERSION.Substring(1).Split('.')[0]

if ([int]$VERSION_MAJOR -lt 18) {
    Write-Host "❌ Node.js 18 or higher is required. Current version: $NODE_VERSION" -ForegroundColor Red
    exit 1
}
Write-Host "✅ $NODE_VERSION" -ForegroundColor Green

# Install dependencies
Write-Host ""
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

# Create data directory
Write-Host ""
Write-Host "📁 Creating data directory..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path data

# Copy environment files
Write-Host ""
Write-Host "⚙️  Setting up environment files..." -ForegroundColor Yellow
if (-not (Test-Path .env.local)) {
    Copy-Item .env.example .env.local
    Write-Host "✅ Created .env.local" -ForegroundColor Green
    Write-Host "⚠️  Please edit .env.local and set your ADMIN_KEY" -ForegroundColor Yellow
} else {
    Write-Host "⚠️  .env.local already exists, skipping..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "To start development:" -ForegroundColor Cyan
Write-Host "  npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "The application will be available at http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Don't forget to:" -ForegroundColor Yellow
Write-Host "  1. Set your ADMIN_KEY in .env.local" -ForegroundColor Yellow
Write-Host "  2. Install dependencies: npm install" -ForegroundColor Yellow
Write-Host ""
