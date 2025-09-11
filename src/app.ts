import 'dotenv/config';
import { App } from '@slack/bolt';
import { AssistantService } from './services/assistant';

const assistantService = new AssistantService();

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
});

// Log ALL events to debug what we're receiving
app.event(/.+/, async ({ event }) => {
  console.log('🔍 ANY EVENT RECEIVED:', event.type, JSON.stringify(event, null, 2));
});

// Test with more specific event listeners
app.event('message', async ({ event, say }) => {
  console.log('📩 MESSAGE EVENT:', JSON.stringify(event, null, 2));
});

app.event('app_mention', async ({ event, say }) => {
  console.log('📢 APP MENTION EVENT:', JSON.stringify(event, null, 2));
});

app.event('hello', async ({ event }) => {
  console.log('👋 HELLO EVENT (connection):', JSON.stringify(event, null, 2));
});

// Add error handling
app.error(async (error) => {
  console.error('❌ Slack app error:', error);
});

app.start().then(() => {
  console.log('⚡️ Mr Trove Advisor bot is running!');
  console.log('🚀 Bot is connected and ready to receive events');
  console.log('📱 Socket Mode enabled:', !!process.env.SLACK_APP_TOKEN);
  console.log('🔑 Bot Token configured:', !!process.env.SLACK_BOT_TOKEN);
  console.log('');
  console.log('� DEBUGGING MODE: Will log ALL events received');
  console.log('📧 Try sending a DM to see if ANY events are received');
  console.log('');
  
  // Log token details for debugging
  console.log('� Token Details:');
  console.log('   Bot Token starts with:', process.env.SLACK_BOT_TOKEN?.substring(0, 10));
  console.log('   App Token starts with:', process.env.SLACK_APP_TOKEN?.substring(0, 10));
  console.log('   Signing Secret length:', process.env.SLACK_SIGNING_SECRET?.length);
  
}).catch((error) => {
  console.error('❌ Failed to start app:', error);
});
