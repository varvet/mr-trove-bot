import { App, LogLevel } from '@slack/bolt';
import dotenv from 'dotenv';
import { handleMessageEvent, handleAppMention } from './handlers/events';
import { handleCommand } from './commands';
import { OpenAIService } from './services/openai-new';
import { PDFProvider } from './services/pdf-provider';

dotenv.config();

console.log('🚀 ======== STARTING SLACK BOT WITH COMPREHENSIVE PDF SUPPORT ========');
console.log('📅 Timestamp:', new Date().toISOString());
console.log('🔧 Using handlers from events.ts with enhanced PDF integration');
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

// Initialize services
const openaiService = new OpenAIService();
const pdfProvider = PDFProvider.getInstance();

// Get PDF status for startup logging
const pdfStatus = openaiService.getPDFStatus();
console.log('📚 ======== PDF LIBRARY STATUS ========');
console.log(`   Directory: ${pdfStatus.directory}`);
console.log(`   PDFs Found: ${pdfStatus.count}`);

if (pdfStatus.count > 0) {
  console.log('   📄 Available Documents:');
  pdfStatus.metadata.forEach(pdf => {
    console.log(`      • ${pdf.name} (${pdf.size}, modified: ${pdf.lastModified})`);
  });
  console.log('   🔄 File watcher: Will be activated');
  console.log('   🤖 GPT-4 Vision: Ready for PDF processing');
} else {
  console.log(`   💡 To add PDFs: Place PDF files in ${pdfStatus.directory}`);
  console.log('   📁 Directory will be created automatically when PDFs are added');
}
console.log('=====================================');
console.log('');

// Start PDF file watcher
openaiService.startPDFWatcher();

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
    console.log('✅ ======== BOT WITH COMPREHENSIVE PDF SUPPORT STARTED ========');
    console.log('📅 Timestamp:', new Date().toISOString());
    console.log('🚀 Bot is running with enhanced PDF integration');
    console.log('📱 Socket Mode: ENABLED');
    console.log('🔍 Debug Mode: ENABLED');
    console.log('🎯 Slash Commands: /chat enabled');
    console.log('🤖 AI Features:');
    console.log('   • GPT-4 Vision with direct PDF access');
    console.log('   • Comprehensive Trove project knowledge');
    console.log('   • 20% discount pricing integration');
    console.log('   • Automatic PDF discovery and loading');
    console.log('   • Real-time PDF updates via file watcher');
    
    if (pdfStatus.count > 0) {
      console.log(`   • ${pdfStatus.count} PDF documents automatically attached to all conversations`);
      console.log('   • PDFs are directly processed by GPT-4 Vision (no text extraction needed)');
    }
    
    console.log('📧 Send a DM to test with real handlers!');
    console.log('📢 Mention me in channels: @mr-trove-advisor');
    console.log('⚡ Use slash command: /chat your message');
    console.log('📚 All interactions include full PDF context automatically');
    console.log('===========================================================');
    console.log('');
    
    // Heartbeat every 30 seconds with PDF status
    setInterval(() => {
      const currentPDFCount = pdfProvider.getPDFCount();
      console.log(`💓 Bot heartbeat - ${new Date().toISOString()} - Still listening for events... (${currentPDFCount} PDFs loaded)`);
    }, 30000);
  })
  .catch((error) => {
    console.error('❌ Failed to start bot with PDF support:', error);
    process.exit(1);
  });

// Process termination handlers
process.on('SIGINT', () => {
  console.log('');
  console.log('🛑 ======== BOT SHUTTING DOWN ========');
  console.log('📅 Timestamp:', new Date().toISOString());
  console.log('📚 Final PDF count:', pdfProvider.getPDFCount());
  console.log('👋 Goodbye!');
  console.log('=====================================');
  process.exit(0);
});
