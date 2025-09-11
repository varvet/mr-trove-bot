import { App } from '@slack/bolt';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔧 ======== CONNECTION TEST ========');
console.log('📅 Timestamp:', new Date().toISOString());
console.log('🔑 Bot Token:', process.env.SLACK_BOT_TOKEN?.substring(0, 20) + '...');
console.log('🔐 App Token:', process.env.SLACK_APP_TOKEN?.substring(0, 20) + '...');
console.log('');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
});

app.start().then(async () => {
  console.log('✅ Slack App started successfully');
  
  try {
    // Test bot identity and permissions
    const auth = await app.client.auth.test();
    console.log('🤖 Bot Identity Test:');
    console.log('   User ID:', auth.user_id);
    console.log('   User:', auth.user);
    console.log('   Team ID:', auth.team_id);
    console.log('   Team:', auth.team);
    console.log('   Bot ID:', auth.bot_id);
    console.log('');
    
    // Test conversations list to see if bot has access
    const conversations = await app.client.conversations.list({
      types: 'im',
      limit: 5
    });
    console.log('💬 DM Conversations Access Test:');
    console.log('   Can list conversations:', !!conversations.channels);
    console.log('   Number of conversations found:', conversations.channels?.length || 0);
    console.log('');
    
    // Test users list
    const users = await app.client.users.list({
      limit: 5
    });
    console.log('👥 Users Access Test:');
    console.log('   Can list users:', !!users.members);
    console.log('   Number of users found:', users.members?.length || 0);
    console.log('');
    
  } catch (error) {
    console.error('❌ API Test failed:', error);
  }
  
  console.log('📡 Now listening for events...');
  console.log('🔍 Send a DM to see if events are received');
  console.log('');
});

// Minimal event listeners
app.event('message', async ({ event }) => {
  console.log('🎉 SUCCESS! MESSAGE EVENT RECEIVED!');
  console.log('📅 Timestamp:', new Date().toISOString());
  console.log('📋 Event:', JSON.stringify(event, null, 2));
});

app.event('hello', async ({ event }) => {
  console.log('👋 HELLO EVENT - Socket Mode connected');
  console.log('📅 Timestamp:', new Date().toISOString());
});

app.error(async (error) => {
  console.error('❌ CONNECTION ERROR:', error);
});

// Heartbeat
setInterval(() => {
  console.log(`💓 Connection alive - ${new Date().toISOString()}`);
}, 30000);
