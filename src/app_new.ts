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

// Handle direct messages
app.event('message', async ({ event, say, client }) => {
  console.log('📩 MESSAGE EVENT RECEIVED:', JSON.stringify(event, null, 2));
  
  // Check if it's a DM and not from a bot
  if (event.subtype === undefined && event.channel_type === 'im' && 'user' in event && event.user) {
    console.log('💬 Processing DM from user:', event.user);
    console.log('📝 Message text:', 'text' in event ? event.text : 'No text');
    console.log('📍 Channel:', event.channel);
    console.log('⚡ Processing with Fast OpenAI Chat...');
    
    try {
      const messageText = 'text' in event ? event.text || '' : '';
      const response = await assistantService.generateResponse(messageText, event.user);
      console.log('🤖 Generated response:', response);
      
      await say(response);
      console.log('✅ Response sent successfully');
      
    } catch (error) {
      console.error('❌ Error processing message:', error);
      try {
        await say('Sorry, I encountered an unexpected error. Please try again.');
      } catch (errorSayError) {
        console.error('❌ Error sending error message:', errorSayError);
      }
    }
  } else {
    console.log('⏭️ Skipping message - not a DM or from bot');
    console.log('   - subtype:', event.subtype);
    console.log('   - channel_type:', event.channel_type);
    console.log('   - has user:', 'user' in event);
    console.log('   - has text:', 'text' in event);
    console.log('   - event type:', event.type);
  }
});

// Handle app mentions
app.event('app_mention', async ({ event, say }) => {
  console.log('📢 App mention received:', JSON.stringify(event, null, 2));
  
  try {
    const text = event.text.replace(/<@[^>]+>/g, '').trim();
    const response = await assistantService.generateResponse(text, event.user || 'unknown');
    console.log('🤖 Generated response for mention:', response);
    
    await say(response);
    console.log('✅ Mention response sent successfully');
  } catch (error) {
    console.error('❌ Error processing mention:', error);
    await say('Sorry, I encountered an error. Please try again.');
  }
});

// Add connection event logging
app.event('hello', async ({ event }) => {
  console.log('👋 Hello event received - connection established');
});

// Add error logging
app.error(async (error) => {
  console.error('❌ App error occurred:', error);
});

app.start().then(() => {
  console.log('⚡️ Mr Trove Advisor bot is running with Fast OpenAI Chat!');
  console.log('🚀 Bot is connected and ready to receive messages');
  console.log('🤖 Using optimized OpenAI Chat Completions for fast responses');
  console.log('📱 Socket Mode:', !!process.env.SLACK_APP_TOKEN);
  console.log('🔑 Bot Token:', process.env.SLACK_BOT_TOKEN?.substring(0, 20) + '...');
  console.log('🔐 App Token:', process.env.SLACK_APP_TOKEN?.substring(0, 20) + '...');
  console.log('🤖 OpenAI configured:', !!process.env.OPENAI_API_KEY);
  
  console.log('\n🔧 Configuration Check:');
  console.log('   - Bot Token starts with:', process.env.SLACK_BOT_TOKEN?.substring(0, 5));
  console.log('   - App Token starts with:', process.env.SLACK_APP_TOKEN?.substring(0, 5));
  console.log('   - Signing Secret length:', process.env.SLACK_SIGNING_SECRET?.length);
  console.log('   - OpenAI Key configured:', !!process.env.OPENAI_API_KEY);
  
  console.log('\n🔍 Debug mode: Will log ALL messages received');
  console.log('📧 Send a DM to the bot to test the Fast Assistant!');
}).catch((error) => {
  console.error('❌ Failed to start app:', error);
});
