# Railway Deployment Guide

## Required Environment Variables

Set these environment variables in your Railway project:

- `SLACK_BOT_TOKEN` - Your Slack app's bot user OAuth token (starts with `xoxb-`)
- `SLACK_APP_TOKEN` - Your Slack app's app-level token (starts with `xapp-`)
- `SLACK_SIGNING_SECRET` - Your Slack app's signing secret
- `OPENAI_API_KEY` - Your OpenAI API key
- `NODE_ENV` - Set to `production` (automatically set by Railway config)

## Deployment Steps

1. Install Railway CLI: `npm install -g @railway/cli`
2. Login to Railway: `railway login`
3. Initialize project: `railway init`
4. Set environment variables: `railway variables set SLACK_BOT_TOKEN=your_token`
5. Deploy: `railway up`

## Notes

- The app uses Socket Mode, so no public URL is required
- Railway will automatically build and start the app using the configured scripts
- The bot will connect to Slack via WebSocket, not HTTP webhooks