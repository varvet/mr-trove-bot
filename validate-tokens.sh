#!/bin/bash

echo "🧪 ======== TOKEN VALIDATION TEST ========"
echo "📅 Testing your tokens without deploying..."
echo ""

# Load environment variables
if [ ! -f ".env" ]; then
    echo "❌ No .env file found!"
    echo "Run: npm run setup"
    exit 1
fi

source .env

echo "🔍 Checking token formats..."

# Test token formats
valid_tokens=0
total_tokens=0

# Test SLACK_BOT_TOKEN
total_tokens=$((total_tokens + 1))
if [[ $SLACK_BOT_TOKEN =~ ^xoxb- ]] && [[ $SLACK_BOT_TOKEN != *"your-bot-token-here"* ]]; then
    echo "✅ SLACK_BOT_TOKEN: Valid format"
    valid_tokens=$((valid_tokens + 1))
else
    echo "❌ SLACK_BOT_TOKEN: Invalid or placeholder"
fi

# Test SLACK_APP_TOKEN
total_tokens=$((total_tokens + 1))
if [[ $SLACK_APP_TOKEN =~ ^xapp- ]] && [[ $SLACK_APP_TOKEN != *"your-app-token-here"* ]]; then
    echo "✅ SLACK_APP_TOKEN: Valid format"
    valid_tokens=$((valid_tokens + 1))
else
    echo "❌ SLACK_APP_TOKEN: Invalid or placeholder"
fi

# Test SLACK_SIGNING_SECRET
total_tokens=$((total_tokens + 1))
if [[ ! -z $SLACK_SIGNING_SECRET ]] && [[ $SLACK_SIGNING_SECRET != *"your-signing-secret-here"* ]] && [[ ${#SLACK_SIGNING_SECRET} -gt 10 ]]; then
    echo "✅ SLACK_SIGNING_SECRET: Valid format"
    valid_tokens=$((valid_tokens + 1))
else
    echo "❌ SLACK_SIGNING_SECRET: Invalid or placeholder"
fi

# Test OPENAI_API_KEY
total_tokens=$((total_tokens + 1))
if [[ $OPENAI_API_KEY =~ ^sk- ]] && [[ $OPENAI_API_KEY != *"your-openai-key-here"* ]]; then
    echo "✅ OPENAI_API_KEY: Valid format"
    valid_tokens=$((valid_tokens + 1))
else
    echo "❌ OPENAI_API_KEY: Invalid or placeholder"
fi

echo ""
echo "📊 Token Validation Results: $valid_tokens/$total_tokens tokens valid"

if [ $valid_tokens -eq $total_tokens ]; then
    echo "🎉 All tokens look good!"
    echo ""
    echo "🚀 Ready to deploy! Run:"
    echo "   npm run deploy"
    echo ""
    echo "🧪 Or test locally first:"
    echo "   npm run dev"
else
    echo "⚠️  Some tokens need attention"
    echo ""
    echo "🔧 Get help with tokens:"
    echo "   npm run setup"
    echo ""
    echo "📝 Or edit .env directly:"
    echo "   code .env"
fi

echo ""
echo "💡 Token format reference:"
echo "   SLACK_BOT_TOKEN:     starts with xoxb-"
echo "   SLACK_APP_TOKEN:     starts with xapp-"
echo "   SLACK_SIGNING_SECRET: any string (32+ chars recommended)"
echo "   OPENAI_API_KEY:      starts with sk-"
