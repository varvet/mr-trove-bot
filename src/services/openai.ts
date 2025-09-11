import OpenAI from 'openai';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

export class OpenAIService {
    private openai: OpenAI | null;

    constructor() {
        const apiKey = process.env.OPENAI_API_KEY;
        console.log('🔧 OpenAI API Key debug:');
        console.log('   - Exists:', !!apiKey);
        console.log('   - Length:', apiKey?.length || 0);
        console.log('   - Starts with sk-:', apiKey?.startsWith('sk-') || false);
        console.log('   - First 20 chars:', apiKey?.substring(0, 20) || 'none');
        
        if (apiKey && apiKey.startsWith('sk-') && apiKey.length > 20) {
            this.openai = new OpenAI({
                apiKey: apiKey,
            });
            console.log('✅ OpenAI service initialized successfully');
        } else {
            this.openai = null;
            console.warn('⚠️ OpenAI API key not configured properly. Expected format: sk-...');
            console.warn('   Current key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'missing');
        }
    }

    async getChatCompletion(message: string, systemPrompt?: string): Promise<string> {
        if (!this.openai) {
            return `🤖 I'm currently running without OpenAI integration. Your message was: "${message}". Please configure the OPENAI_API_KEY environment variable for AI responses.`;
        }

        try {
            const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];
            
            if (systemPrompt) {
                messages.push({
                    role: 'system',
                    content: systemPrompt
                });
            }

            messages.push({
                role: 'user',
                content: message
            });

            console.log('🧠 Sending request to OpenAI...');

            const completion = await this.openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: messages,
                max_tokens: 500,
                temperature: 0.7,
            });

            const response = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
            console.log('✅ OpenAI response generated successfully');
            return response;

        } catch (error: any) {
            console.error('❌ OpenAI API Error:', error);
            return this.handleOpenAIError(error);
        }
    }

    async getChatCompletionWithContext(
        message: string, 
        conversationHistory: Array<{role: 'user' | 'assistant', content: string}>,
        systemPrompt?: string
    ): Promise<string> {
        if (!this.openai) {
            return `🤖 I'm currently running without OpenAI integration. Your message was: "${message}". Please configure the OPENAI_API_KEY environment variable for AI responses.`;
        }

        try {
            const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];
            
            if (systemPrompt) {
                messages.push({
                    role: 'system',
                    content: systemPrompt
                });
            }

            // Add conversation history (keep only last 10 exchanges to avoid token limits)
            const recentHistory = conversationHistory.slice(-10);
            recentHistory.forEach(msg => {
                messages.push({
                    role: msg.role,
                    content: msg.content
                });
            });

            // Add current message
            messages.push({
                role: 'user',
                content: message
            });

            console.log('🧠 Sending request to OpenAI with context...');

            const completion = await this.openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: messages,
                max_tokens: 500,
                temperature: 0.7,
            });

            const response = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
            console.log('✅ OpenAI response with context generated successfully');
            return response;

        } catch (error: any) {
            console.error('❌ OpenAI API Error:', error);
            return this.handleOpenAIError(error);
        }
    }

    private handleOpenAIError(error: any): string {
        // Handle specific OpenAI errors
        if (error?.error?.type === 'insufficient_quota') {
            return `🚫 **OpenAI Quota Exceeded**\n\nI'm unable to process your request because my OpenAI account has exceeded its usage quota.\n\n**Error details:** ${error?.error?.message || 'Insufficient quota'}\n\n**What this means:** The OpenAI API credits have been exhausted.\n\n**To fix this:** Please check the billing details at https://platform.openai.com/account/billing and add more credits or upgrade the plan.`;
        }
        
        if (error?.error?.type === 'rate_limit_exceeded') {
            return `⏰ **Rate Limit Exceeded**\n\nI'm receiving too many requests right now. Please wait a moment and try again.\n\n**Error details:** ${error?.error?.message || 'Rate limit exceeded'}`;
        }
        
        if (error?.error?.type === 'invalid_api_key') {
            return `🔑 **Invalid API Key**\n\nThere's an issue with my OpenAI API key configuration.\n\n**Error details:** ${error?.error?.message || 'Invalid API key'}`;
        }
        
        if (error?.error?.type === 'model_not_found') {
            return `🤖 **Model Not Found**\n\nThe AI model I'm trying to use is not available.\n\n**Error details:** ${error?.error?.message || 'Model not found'}`;
        }
        
        if (error?.error?.type === 'context_length_exceeded') {
            return `📝 **Message Too Long**\n\nYour message or our conversation history is too long for me to process.\n\n**Error details:** ${error?.error?.message || 'Context length exceeded'}\n\nTry starting a new conversation or sending a shorter message.`;
        }
        
        // Generic OpenAI error
        if (error?.error) {
            return `❌ **OpenAI API Error**\n\nI encountered an error while trying to process your request.\n\n**Error type:** ${error.error.type || 'unknown'}\n**Error details:** ${error.error.message || 'Unknown error'}\n\nPlease try again later or contact the administrator.`;
        }
        
        // Network or other errors
        return `🌐 **Connection Error**\n\nI'm having trouble connecting to OpenAI's servers right now.\n\n**Error:** ${error.message || 'Unknown connection error'}\n\nPlease try again in a few moments.`;
    }
}
