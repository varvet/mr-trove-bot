#!/bin/bash

echo "🔑 ======== SLACK BOT TOKEN SETUP GUIDE ========"
echo "📅 This will help you get all the tokens needed for your bot"
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ Created .env file"
    echo ""
fi

echo "🎯 You need to get 4 tokens. Follow these steps:"
echo ""

echo "📱 STEP 1: Go to your Slack App"
echo "   🌐 Open: https://api.slack.com/apps"
echo "   🔍 Find and click on 'Mr Trove Advisor' (or your app name)"
echo ""

echo "🤖 STEP 2: Get Bot User OAuth Token"
echo "   📋 In your app dashboard, go to: OAuth & Permissions"
echo "   📝 Copy the 'Bot User OAuth Token' (starts with xoxb-)"
echo "   ✏️  Paste it in .env as SLACK_BOT_TOKEN="
echo ""

echo "🔐 STEP 3: Get App-Level Token" 
echo "   📋 In your app dashboard, go to: Basic Information"
echo "   📝 Scroll to 'App-Level Tokens' section"
echo "   🔑 If you don't have one, click 'Generate Token and Scopes'"
echo "      - Name it 'socket-token'"
echo "      - Add scope: connections:write"
echo "   📝 Copy the token (starts with xapp-)"
echo "   ✏️  Paste it in .env as SLACK_APP_TOKEN="
echo ""

echo "🔒 STEP 4: Get Signing Secret"
echo "   📋 Still in 'Basic Information'"
echo "   📝 Find 'Signing Secret' section"
echo "   👁️  Click 'Show' and copy the secret"
echo "   ✏️  Paste it in .env as SLACK_SIGNING_SECRET="
echo ""

echo "🧠 STEP 5: Get OpenAI API Key"
echo "   🌐 Open: https://platform.openai.com/api-keys"
echo "   🔑 Click 'Create new secret key'"
echo "   📝 Copy the key (starts with sk-)"
echo "   ✏️  Paste it in .env as OPENAI_API_KEY="
echo ""

echo "💡 Quick .env edit command:"
echo "   nano .env"
echo "   (or use your preferred editor)"
echo ""

echo "✅ When done, test with:"
echo "   npm run deploy"
echo ""

echo "🆘 Need help? Check DEPLOYMENT.md for detailed instructions"
echo ""

# Optional: Open the .env file for editing
read -p "🤔 Do you want me to open the .env file for editing now? (y/n): " open_env

if [[ $open_env =~ ^[Yy]$ ]]; then
    echo "📝 Opening .env file..."
    
    # Try different editors in order of preference
    if command -v code &> /dev/null; then
        code .env
        echo "✅ Opened in VS Code"
    elif command -v nano &> /dev/null; then
        nano .env
    elif command -v vim &> /dev/null; then
        vim .env
    else
        echo "❌ No suitable editor found. Please edit .env manually"
    fi
fi

echo ""
echo "🎉 Token setup guide complete!"
echo "📝 Remember to save your .env file after adding the tokens"
echo "🚀 Then run: npm run deploy"
