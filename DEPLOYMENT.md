# 🚀 Slack Bot Deployment Guide

## 🎯 Quick Start (3 Steps)

### **Step 1: Get Your Tokens**
```bash
npm run setup
```
This will guide you through getting all 4 required tokens from Slack and OpenAI.

### **Step 2: Validate Your Tokens** 
```bash
npm run validate
```
This checks if your tokens are properly formatted before deploying.

### **Step 3: Deploy**
```bash
npm run deploy
```
Choose your hosting platform and deploy!

## 📋 Available Commands

| Command | Description |
|---------|-------------|
| `npm run setup` | 🔑 Interactive guide to get all tokens |
| `npm run validate` | 🧪 Test your tokens without deploying |
| `npm run deploy` | 🚀 Deploy to your chosen platform |
| `npm run dev` | 💻 Run locally for testing |
| `npm run build` | 🔨 Build for production |

## Environment Variables Required

| Variable | Description | Example |
|----------|-------------|---------|
| `SLACK_BOT_TOKEN` | Bot User OAuth Token | `xoxb-1234567890123-1234567890123-abcd1234...` |
| `SLACK_APP_TOKEN` | App-Level Token | `xapp-1-A1234567890-1234567890123-abcd1234...` |
| `SLACK_SIGNING_SECRET` | Signing Secret | `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6` |
| `OPENAI_API_KEY` | OpenAI API Key | `sk-abcd1234efgh5678ijkl9012mnop3456...` |

## Deployment Platforms

### 🚄 Railway (Recommended)
- **Cost**: Free tier (500 hours/month)
- **Setup**: Automatic with CLI
- **Features**: Git integration, environment variables, logs

### 🎨 Render
- **Cost**: Free tier (750 hours/month)  
- **Setup**: GitHub integration
- **Features**: Auto-deploy, SSL, managed services

### 🟣 Heroku
- **Cost**: $7/month minimum
- **Setup**: CLI deployment
- **Features**: Established platform, add-ons

### 📋 Manual
- **Cost**: Varies by provider
- **Setup**: Use provided commands
- **Features**: Full control

## Features Included

✅ **Slack Integration**
- Direct messages support
- Channel mentions (@mr-trove-advisor)
- Slash commands (/chat)
- Thread support

✅ **AI Features**
- GPT-4o integration
- PDF document processing (4 Trove project documents)
- Conversational memory
- Error handling with fallbacks

✅ **Trove Project Knowledge**
- Complete project documentation
- 20% discount pricing (2,668,800 SEK)
- Team allocation details
- Working days focus (233-273 days)

## Testing Your Deployment

1. **Send a DM** to @mr-trove-advisor
2. **Ask about the project**: "Tell me about the Trove project"
3. **Test budget questions**: "What's the total cost with discount?"
4. **Verify PDF knowledge**: "How many working days for UX phase?"

## Troubleshooting

### Bot not responding
- Check environment variables are set correctly
- Verify tokens have correct permissions
- Check application logs

### Build failures
- Ensure TypeScript compiles: `npm run build`
- Check all dependencies are installed: `npm install`
- Verify Node.js version: `node --version` (requires >=16.0.0)

### Token issues
- Bot Token needs: `chat:write`, `im:read`, `im:write`, `app_mentions:read`
- App Token needs: `connections:write`
- Signing Secret: Found in "Basic Information" tab

## Monitoring

- **Railway**: `railway logs`
- **Render**: Dashboard logs  
- **Heroku**: `heroku logs --tail`

## Support

For issues with:
- **Slack Bot**: Check Slack API documentation
- **OpenAI**: Verify API key and quotas
- **Deployment**: Check platform-specific documentation

---

🤖 **Mr. Trove Advisor** - Powered by Varvet
