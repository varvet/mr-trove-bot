#!/bin/bash

# Railway Deployment Script for Slack Bot
set -e  # Exit on any error

echo "🚀 Starting Railway deployment..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Check if user is logged in
if ! railway whoami &> /dev/null; then
    echo "🔐 Please login to Railway..."
    railway login
fi

# Check if project is initialized
if [ ! -f "railway.json" ]; then
    echo "📦 Initializing Railway project..."
    railway init
fi

# Check for required environment variables
echo "🔍 Checking environment variables..."

missing_vars=()

if [ -z "$SLACK_BOT_TOKEN" ]; then
    missing_vars+=("SLACK_BOT_TOKEN")
fi

if [ -z "$SLACK_APP_TOKEN" ]; then
    missing_vars+=("SLACK_APP_TOKEN")
fi

if [ -z "$SLACK_SIGNING_SECRET" ]; then
    missing_vars+=("SLACK_SIGNING_SECRET")
fi

if [ -z "$OPENAI_API_KEY" ]; then
    missing_vars+=("OPENAI_API_KEY")
fi

if [ ${#missing_vars[@]} -ne 0 ]; then
    echo "❌ Missing environment variables:"
    for var in "${missing_vars[@]}"; do
        echo "   - $var"
    done
    echo ""
    echo "Please set them in your .env file or export them:"
    echo "   export SLACK_BOT_TOKEN=your_token"
    echo "   export SLACK_APP_TOKEN=your_app_token"
    echo "   export SLACK_SIGNING_SECRET=your_secret"
    echo "   export OPENAI_API_KEY=your_key"
    echo ""
    echo "Or set them directly in Railway:"
    for var in "${missing_vars[@]}"; do
        echo "   railway variables set $var=your_value"
    done
    exit 1
fi

# Set environment variables in Railway
echo "⚙️ Setting environment variables in Railway..."
railway variables set SLACK_BOT_TOKEN="$SLACK_BOT_TOKEN"
railway variables set SLACK_APP_TOKEN="$SLACK_APP_TOKEN"
railway variables set SLACK_SIGNING_SECRET="$SLACK_SIGNING_SECRET"
railway variables set OPENAI_API_KEY="$OPENAI_API_KEY"
railway variables set NODE_ENV="production"

# Build the project locally to catch any errors
echo "🔨 Building project locally..."
npm run build

# Deploy to Railway
echo "🚂 Deploying to Railway..."
railway up

echo "✅ Deployment complete!"
echo "📱 Your Slack bot should now be running on Railway"
echo "🔍 Check logs with: railway logs"
echo "⚙️ Manage variables with: railway variables"