#!/bin/bash

# FitFi Backend - Blockchain Integration Commit Script
# This script stages the necessary files for the blockchain integration commit

echo "🚀 Preparing FitFi Backend for commit..."

# Stage core blockchain integration files
echo "📄 Staging core integration files..."
git add .gitignore
git add .env.example
git add README.md
git add package.json
git add tsconfig.json

# Stage enhanced models and types
echo "📊 Staging database models and types..."
git add types/Schema.d.ts
git add models/DuelsModel.ts
git add models/DuelModel.ts

# Stage blockchain service
echo "⛓️ Staging blockchain services..."
git add services/DuelStakingService.ts
git add utils/FitFiWeb3Service.ts

# Stage enhanced controllers
echo "🎮 Staging controllers..."
git add controllers/DuelController.ts
git add controllers/Duels/search-opponent.ts
git add controllers/Duels/stake-duel.ts
git add controllers/Duels/update-duel.ts

# Stage routes
echo "🛤️ Staging routes..."
git add routes/DuelRoutes.ts
git add routes/Duel.ts

# Stage server enhancements
echo "🖥️ Staging server..."
git add server.ts

# Stage utility scripts (keep useful ones)
echo "🔧 Staging utility scripts..."
git add scripts/create-admin-account.ts
git add scripts/dummy-wallet.ts

# Stage Docker configuration
echo "🐳 Staging Docker configuration..."
git add docker-compose.yaml
git add Dockerfile
git add Dockerfile.docs

# Show status
echo "📋 Current git status:"
git status

echo "✅ Files staged for commit!"
echo ""
echo "To commit, run:"
echo "git commit -m 'feat: comprehensive blockchain integration for FitFi dueling platform'"
echo ""
echo "Commit message will include:"
echo "- Smart contract integration with Core Testnet 2"
echo "- Real-time blockchain transaction monitoring"
echo "- WebSocket events for match notifications"
echo "- Comprehensive database logging and Redis caching"
echo "- JWT-based wallet authentication"
echo "- Automated settlement system with fee distribution"
echo "- Production-ready Docker setup"
