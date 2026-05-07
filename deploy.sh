#!/bin/bash
# Phoenix AI Platform - Railway Deployment Helper

set -e

echo "🔥 Phoenix AI Platform - Railway Deployment"
echo "=============================================="

# Check if railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Install with: npm install -g @railway/cli"
    exit 1
fi

# Check if logged in
if ! railway whoami &> /dev/null; then
    echo "🔑 Please login to Railway first:"
    railway login
fi

# Create project if not exists
echo "📦 Creating Railway project..."
railway init --name phoenix-ai-platform

# Link project
echo "🔗 Linking project..."
railway link

# Add services
echo "🏗️ Creating services..."

echo "  → API Service"
cd apps/api
railway up --detach
cd ../..

echo "  → Website Service"
cd apps/website
railway up --detach
cd ../..

echo "  → Admin Service"
cd apps/admin
railway up --detach
cd ../..

echo "  → WebSocket Service"
cd apps/websocket
railway up --detach
cd ../..

echo "  → Workers Service"
cd apps/workers
railway up --detach
cd ../..

echo "  → Docs Service"
cd apps/docs
railway up --detach
cd ../..

echo ""
echo "✅ All services deployed!"
echo ""
echo "Next steps:"
echo "1. Add environment variables in Railway dashboard"
echo "2. Add Neon database connection string"
echo "3. Add Redis URL"
echo "4. Configure custom domains"
echo "5. Set Paystack webhook URL"
echo ""
echo "📖 See DEPLOYMENT.md for detailed instructions"
