import { App, LogLevel } from '@slack/bolt';
import dotenv from 'dotenv';

dotenv.config();

console.log('🚀 ======== STARTING SLACK BOT ========');
console.log('📅 Timestamp:', new Date().toISOString());
console.log('');

console.log('🔧 Environment Variables Check:');
console.log('   NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('   Bot Token exists:', !!process.env.SLACK_BOT_TOKEN);
console.log('   App Token exists:', !!process.env.SLACK_APP_TOKEN);
console.log('   Signing Secret exists:', !!process.env.SLACK_SIGNING_SECRET);
console.log('   Bot Token starts with:', process.env.SLACK_BOT_TOKEN?.substring(0, 10));
console.log('   App Token starts with:', process.env.SLACK_APP_TOKEN?.substring(0, 10));
console.log('   Signing Secret length:', process.env.SLACK_SIGNING_SECRET?.length);
console.log('');

console.log('🔨 Creating Slack App instance...');
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  logLevel: LogLevel.DEBUG // Maximum logging
});
console.log('✅ Slack App instance created');
console.log('');

// Log every single event type
app.event('message', async ({ event, say }) => {
  console.log('📨 ======== MESSAGE EVENT RECEIVED ========');
  console.log('📅 Timestamp:', new Date().toISOString());
  console.log('📋 Event data:', JSON.stringify(event, null, 2));
  console.log('==========================================');
  
  try {
    await say('I got your message!');
    console.log('✅ Reply sent successfully');
  } catch (error) {
    console.error('❌ Error sending reply:', error);
  }
});

app.event('app_mention', async ({ event, say }) => {
  console.log('📢 ======== APP MENTION EVENT ========');
  console.log('📅 Timestamp:', new Date().toISOString());
  console.log('📋 Event data:', JSON.stringify(event, null, 2));
  console.log('====================================');
  
  try {
    await say('I saw your mention!');
    console.log('✅ Mention reply sent successfully');
  } catch (error) {
    console.error('❌ Error sending mention reply:', error);
  }
});

app.event('hello', async ({ event }) => {
  console.log('👋 ======== HELLO EVENT (SOCKET CONNECTED) ========');
  console.log('📅 Timestamp:', new Date().toISOString());
  console.log('📋 Event data:', JSON.stringify(event, null, 2));
  console.log('=================================================');
});

// Catch ALL events
app.event(/.+/, async ({ event }) => {
  console.log('🔍 ======== ANY EVENT RECEIVED ========');
  console.log('📅 Timestamp:', new Date().toISOString());
  console.log('🏷️ Event type:', event.type);
  console.log('📋 Full event data:', JSON.stringify(event, null, 2));
  console.log('=====================================');
});

// Connection events
app.error(async (error) => {
  console.error('❌ ======== SLACK BOT ERROR ========');
  console.error('📅 Timestamp:', new Date().toISOString());
  console.error('💥 Error details:', error);
  console.error('===================================');
});

// Start the app
console.log('🎬 Starting Slack app...');
app.start()
  .then(() => {
    console.log('');
    console.log('✅ ======== BOT SUCCESSFULLY STARTED ========');
    console.log('📅 Timestamp:', new Date().toISOString());
    console.log('🚀 Bot is running and connected to Slack');
    console.log('📱 Socket Mode: ENABLED');
    console.log('🔍 Debug Mode: ENABLED');
    console.log('');
    console.log('📡 The bot is now listening for ALL events...');
    console.log('📧 Send a DM to test direct messages');
    console.log('📢 Mention the bot in a channel to test mentions');
    console.log('');
    console.log('⏰ Waiting for events...');
    console.log('===========================================');
    console.log('');
    
    // Log every 30 seconds that we're still alive
    setInterval(() => {
      console.log(`💓 Bot heartbeat - ${new Date().toISOString()} - Still listening for events...`);
    }, 30000);
  })
  .catch((error) => {
    console.error('');
    console.error('❌ ======== FAILED TO START BOT ========');
    console.error('📅 Timestamp:', new Date().toISOString());
    console.error('💥 Startup error:', error);
    console.error('======================================');
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

process.on('uncaughtException', (error) => {
  console.error('');
  console.error('💥 ======== UNCAUGHT EXCEPTION ========');
  console.error('📅 Timestamp:', new Date().toISOString());
  console.error('💥 Error:', error);
  console.error('=====================================');
});
