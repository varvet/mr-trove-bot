# Slack Bot

This project is # Slack ChatGPT Bot

A Slack bot that integrates with OpenAI's ChatGPT to provide AI-powered conversations directly in your Slack workspace.

## Features

- 🤖 Direct message conversations with ChatGPT
- 💬 Responds when mentioned in channels (`@botname`)
- ⚡ Slash command support (`/chat`)
- 🧠 Maintains conversation context per user
- 🔒 Secure environment variable configuration

## Setup

### Prerequisites

- Node.js 16+ installed
- A Slack workspace where you have permission to add apps
- OpenAI API account and API key

### 1. Clone and Install

```bash
git clone <your-repo>
cd slack-bot
npm install
```

### 2. Create Slack App

1. Go to [Slack API](https://api.slack.com/apps)
2. Click "Create New App" → "From scratch"
3. Name your app (e.g., "ChatGPT Bot") and select your workspace

### 3. Configure Slack App

#### Bot Token Scopes
In your Slack app settings, go to "OAuth & Permissions" and add these scopes:
- `app_mentions:read`
- `chat:write`
- `commands`
- `im:history`
- `im:read`
- `im:write`

#### Event Subscriptions
1. Enable Events and set Request URL to your server (e.g., `https://your-domain.com/slack/events`)
2. Subscribe to these bot events:
   - `app_mention`
   - `message.im`

#### Slash Commands
Create a slash command:
- Command: `/chat`
- Request URL: `https://your-domain.com/slack/commands`
- Description: "Chat with AI"

#### Socket Mode (for development)
1. Go to "Socket Mode" and enable it
2. Generate an App Token with `connections:write` scope

### 4. Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Fill in:
- `SLACK_BOT_TOKEN`: From "OAuth & Permissions" (starts with `xoxb-`)
- `SLACK_SIGNING_SECRET`: From "Basic Information"
- `SLACK_APP_TOKEN`: From "Basic Information" → App Token (starts with `xapp-`)
- `OPENAI_API_KEY`: Your OpenAI API key (starts with `sk-`)

### 5. Install Bot to Workspace

1. Go to "OAuth & Permissions" in your Slack app
2. Click "Install to Workspace"
3. Authorize the app

### 6. Run the Bot

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

## Usage

### Direct Messages
Simply send a direct message to the bot and it will respond using ChatGPT.

### Channel Mentions
Mention the bot in any channel: `@botname How can you help me?`

### Slash Commands
Use the slash command: `/chat What is the weather like?`

## Project Structure

```
src/
├── app.ts              # Main application entry point
├── services/
│   └── openai.ts       # OpenAI service integration
├── handlers/
│   └── events.ts       # Slack event handlers
├── commands/
│   └── index.ts        # Slash command handlers
└── types/
    └── index.ts        # TypeScript type definitions
```

## Features & Configuration

### Conversation Memory
The bot maintains conversation context per user for more natural interactions. This is stored in memory (for production, consider using a database).

### OpenAI Settings
You can modify the OpenAI parameters in `src/services/openai.ts`:
- Model: Currently using `gpt-3.5-turbo`
- Max tokens: 1000
- Temperature: 0.7

### System Prompts
The bot uses different system prompts for different contexts (DMs, mentions, slash commands) to provide appropriate responses.

## Deployment

### Environment Variables for Production
Ensure all environment variables are set in your production environment.

### Recommended Hosting
- Heroku
- Railway
- DigitalOcean App Platform
- AWS Lambda (with serverless framework)

### HTTPS Required
Slack requires HTTPS for event subscriptions and slash commands in production.

## Troubleshooting

### Common Issues

1. **Bot doesn't respond**: Check that the bot token has the correct scopes
2. **Events not received**: Verify the request URL is accessible and uses HTTPS
3. **OpenAI errors**: Check your API key and ensure you have credits

### Logs
The bot logs all interactions to the console. Check these for debugging.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License It is built using TypeScript and utilizes the Slack API to interact with Slack workspaces.

## Project Structure

```
slack-bot
├── src
│   ├── app.ts               # Entry point of the Slack bot application
│   ├── handlers
│   │   └── events.ts        # Handles various Slack events
│   ├── commands
│   │   └── index.ts         # Defines bot commands
│   └── types
│       └── index.ts         # Type definitions for the application
├── package.json              # npm configuration file
├── tsconfig.json             # TypeScript configuration file
└── README.md                 # Project documentation
```

## Setup Instructions

1. **Clone the repository:**
   ```
   git clone <repository-url>
   cd slack-bot
   ```

2. **Install dependencies:**
   ```
   npm install
   ```

3. **Configure your Slack app:**
   - Create a new Slack app at [Slack API](https://api.slack.com/apps).
   - Add the necessary permissions and event subscriptions.
   - Obtain your bot token.

4. **Set environment variables:**
   Create a `.env` file in the root directory and add your Slack bot token:
   ```
   SLACK_BOT_TOKEN=your-bot-token
   ```

5. **Run the bot:**
   ```
   npm start
   ```

## Usage Examples

- The bot listens for messages and can respond to specific commands.
- You can define custom commands in the `src/commands/index.ts` file.

## Contributing

Feel free to submit issues or pull requests for improvements or bug fixes.