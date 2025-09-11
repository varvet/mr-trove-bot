import { AllMiddlewareArgs, SlackEventMiddlewareArgs } from '@slack/bolt';
import OpenAIService from '../services/openai-new';

const openaiService = new OpenAIService();

export const handleMessageEvent = async ({ 
    event, 
    say, 
    client 
}: SlackEventMiddlewareArgs<'message'> & AllMiddlewareArgs) => {
    // Skip bot messages and messages without text
    if (event.subtype === 'bot_message' || !('text' in event) || !event.text || !('user' in event)) {
        return;
    }

    console.log(`📩 Message received from ${event.user}: ${event.text}`);
    console.log(`📍 Channel: ${event.channel}, Type: ${event.channel_type}`);

    let shouldRespond = false;
    let messageText = event.text;

    // Handle different message types
    if (event.channel_type === 'im') {
        // Direct messages - always respond
        shouldRespond = true;
        console.log('💬 Direct message - will respond');
    } else if (event.channel_type === 'channel' || event.channel_type === 'group') {
        // Channel messages - only respond if mentioned
        // Get bot info to find the correct bot user ID
        try {
            const authTest = await client.auth.test();
            const botUserId = authTest.user_id;
            console.log(`🤖 Bot User ID: ${botUserId}`);
            
            // Check if bot is mentioned in the message
            const botMentionPattern = new RegExp(`<@${botUserId}>`, 'g');
            if (botMentionPattern.test(event.text)) {
                shouldRespond = true;
                // Remove mention from message text
                messageText = event.text.replace(botMentionPattern, '').trim();
                console.log('📢 Bot mentioned in channel - will respond');
                console.log(`🔍 Original: "${event.text}"`);
                console.log(`✏️ Cleaned: "${messageText}"`);
            } else {
                console.log('⏭️ Channel message without mention - skipping');
                console.log(`🔍 Looking for: <@${botUserId}> in "${event.text}"`);
            }
        } catch (error) {
            console.error('❌ Error getting bot user ID:', error);
            // Fallback to old method
            const botMention = /<@U09E9N541NJ>/;
            if (botMention.test(event.text)) {
                shouldRespond = true;
                messageText = event.text.replace(/<@U09E9N541NJ>/g, '').trim();
                console.log('📢 Bot mentioned in channel (fallback) - will respond');
            } else {
                console.log('⏭️ Channel message without mention (fallback) - skipping');
            }
        }
    }

    if (!shouldRespond) {
        return;
    }

    try {
        console.log('🤖 Generating response...');
        const response = await openaiService.generateResponse(messageText, event.user);
        
        const sayOptions: any = {
            text: response
        };

        // Respond in thread if original message was in a thread
        if ('thread_ts' in event && event.thread_ts) {
            sayOptions.thread_ts = event.thread_ts;
            console.log('🧵 Responding in thread:', event.thread_ts);
        }

        await say(sayOptions);
        console.log('✅ Response sent successfully');
        
    } catch (error) {
        console.error('❌ Error generating response:', error);
        const errorMessage = 'Sorry, I encountered an error while processing your request. Please try again.';
        
        const sayOptions: any = {
            text: errorMessage
        };

        if ('thread_ts' in event && event.thread_ts) {
            sayOptions.thread_ts = event.thread_ts;
        }

        await say(sayOptions);
    }
};

export const handleAppMention = async ({ 
    event, 
    say, 
    context,
    client 
}: SlackEventMiddlewareArgs<'app_mention'> & AllMiddlewareArgs) => {
    console.log(`📢 App mention from ${event.user}: ${event.text}`);
    
    if (!event.user) {
        console.log('No user ID found in app mention event');
        return;
    }

    try {
        // Get bot info to properly remove mentions
        const authTest = await client.auth.test();
        const botUserId = authTest.user_id;
        console.log(`🤖 Removing mention for Bot User ID: ${botUserId}`);
        
        // Remove the mention from the text
        const botMentionPattern = new RegExp(`<@${botUserId}>`, 'g');
        const messageText = event.text.replace(botMentionPattern, '').trim();
        console.log(`🔍 Original: "${event.text}"`);
        console.log(`✏️ Cleaned: "${messageText}"`);
        console.log('🤖 Generating response for mention...');
        
        const response = await openaiService.generateResponse(messageText, event.user);
        
        const sayOptions: any = {
            text: response
        };

        // Respond in thread if mentioned in a thread
        if ('thread_ts' in event && event.thread_ts) {
            sayOptions.thread_ts = event.thread_ts;
            console.log('🧵 Responding to mention in thread:', event.thread_ts);
        }

        await say(sayOptions);
        console.log('✅ App mention response sent');
        
    } catch (error) {
        console.error('❌ Error responding to app mention:', error);
        const errorMessage = 'Sorry, I encountered an error. Please try again.';
        
        const sayOptions: any = {
            text: errorMessage
        };

        if ('thread_ts' in event && event.thread_ts) {
            sayOptions.thread_ts = event.thread_ts;
        }

        await say(sayOptions);
    }
};