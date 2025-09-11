import { App, LogLevel } from '@slack/bolt';
import dotenv from 'dotenv';
import { handleMessageEvent, handleAppMention } from './handlers/events';
import { handleCommand } from './commands';

dotenv.config();

console.log('🚀 ======== STARTING SLACK BOT WITH HANDLERS ========');
console.log('📅 Timestamp:', new Date().toISOString());
console.log('🔧 Using handlers from events.ts');
console.log('');

console.log('🔧 Environment Variables Check:');
console.log('   Bot Token exists:', !!process.env.SLACK_BOT_TOKEN);
console.log('   App Token exists:', !!process.env.SLACK_APP_TOKEN);
console.log('   Signing Secret exists:', !!process.env.SLACK_SIGNING_SECRET);
console.log('   OpenAI API Key exists:', !!process.env.OPENAI_API_KEY);
console.log('   Bot Token starts with:', process.env.SLACK_BOT_TOKEN?.substring(0, 10));
console.log('   App Token starts with:', process.env.SLACK_APP_TOKEN?.substring(0, 10));
console.log('   OpenAI API Key starts with:', process.env.OPENAI_API_KEY?.substring(0, 20));
console.log('');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  logLevel: LogLevel.DEBUG
});

// Use your existing event handlers
app.event('message', handleMessageEvent);
app.event('app_mention', handleAppMention);

// Add slash command handler
app.command('/chat', handleCommand);

// Debug logging for ALL events
app.event(/.+/, async ({ event }) => {
  console.log('🔍 ======== ANY EVENT RECEIVED ========');
  console.log('📅 Timestamp:', new Date().toISOString());
  console.log('🏷️ Event type:', event.type);
  console.log('📋 Full event data:', JSON.stringify(event, null, 2));
  console.log('=====================================');
});

app.event('hello', async ({ event }) => {
  console.log('👋 ======== HELLO EVENT (SOCKET CONNECTED) ========');
  console.log('📅 Timestamp:', new Date().toISOString());
  console.log('📋 Event data:', JSON.stringify(event, null, 2));
  console.log('=================================================');
});

app.error(async (error) => {
  console.error('❌ ======== SLACK BOT ERROR ========');
  console.error('📅 Timestamp:', new Date().toISOString());
  console.error('💥 Error details:', error);
  console.error('===================================');
});

app.start()
  .then(() => {
    console.log('');
    console.log('✅ ======== BOT WITH HANDLERS STARTED ========');
    console.log('📅 Timestamp:', new Date().toISOString());
    console.log('🚀 Bot is running with your event handlers');
    console.log('📱 Socket Mode: ENABLED');
    console.log('🔍 Debug Mode: ENABLED');
    console.log('� Slash Commands: /chat enabled');
    console.log('�📧 Send a DM to test with real handlers!');
    console.log('📢 Mention me in channels: @mr-trove-advisor');
    console.log('⚡ Use slash command: /chat your message');
    console.log('🤖 OpenAI integration ready!');
    console.log('===========================================');
    console.log('');
    
    // Heartbeat every 30 seconds
    setInterval(() => {
      console.log(`💓 Bot heartbeat - ${new Date().toISOString()} - Still listening for events...`);
    }, 30000);
  })
  .catch((error) => {
    console.error('❌ Failed to start bot with handlers:', error);
    process.exit(1);
  });

// Process termination handlers
process.on('SIGINT', () => {
  console.log('');
  console.log('🛑 ======== BOT SHUTTING DOWN ========');
  console.log('📅 Timestamp:', new Date().toISOString());
  console.log('👋 Goodbye!');
  console.log('=====================================');
  process.exit(0);
});
