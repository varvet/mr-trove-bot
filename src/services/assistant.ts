import OpenAI from 'openai';

export class AssistantService {
    private openai: OpenAI | null = null;
    private conversationHistory: Map<string, any[]> = new Map();

    constructor() {
        const apiKey = process.env.OPENAI_API_KEY;
        
        if (!apiKey || apiKey === 'sk-your-openai-api-key-here') {
            console.log('⚠️ OpenAI API key not found. Assistant service disabled.');
            return;
        }

        try {
            this.openai = new OpenAI({
                apiKey: apiKey,
            });
            console.log('✅ OpenAI Fast Assistant service initialized');
        } catch (error) {
            console.error('❌ Failed to initialize OpenAI service:', error);
        }
    }

    async generateResponse(message: string, userId: string): Promise<string> {
        if (!this.openai) {
            return this.getErrorMessage('service_unavailable', 'OpenAI service is not available');
        }

        try {
            // Get or create conversation history for this user
            let history = this.conversationHistory.get(userId) || [];
            
            // Add user message to history
            history.push({ role: 'user', content: message });
            
            // Keep only last 6 messages to avoid token limits but maintain context
            if (history.length > 6) {
                history = history.slice(-6);
            }

            console.log(`⚡ Generating fast response for user ${userId}`);
            
            const completion = await this.openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                    { 
                        role: 'system', 
                        content: `You are Mr Trove Advisor, a helpful and intelligent AI assistant integrated into a Slack workspace.

**Your Role & Personality:**
- You are a knowledgeable, friendly, and professional assistant
- You help with coding questions, technical explanations, problem-solving, and general knowledge
- You maintain a warm but professional tone suitable for a workplace environment
- You're concise but thorough in your explanations

**Communication Style:**
- Keep responses under 500 words for readability in Slack
- Use clear, accessible language that's appropriate for all skill levels
- Include practical examples when explaining technical concepts
- Use **bold** for emphasis and proper formatting for code blocks
- Use emojis sparingly but appropriately (1-2 per message max)

**Technical Expertise:**
- You excel at explaining programming concepts, debugging, and best practices
- You can help with web development, APIs, databases, DevOps, and general software engineering
- You provide code examples with clear explanations
- You suggest multiple approaches when appropriate

**Workplace Guidelines:**
- Always maintain a professional and respectful tone
- If asked about sensitive topics, politely redirect to work-related matters
- Encourage learning and growth through your responses
- Be helpful while being mindful of time and context

**Response Format:**
- Start with a brief, direct answer to the main question
- Provide additional context or examples if helpful
- End with actionable next steps when appropriate
- Use proper Slack formatting (markdown) for better readability

Remember: You're here to make the team more productive and help solve problems efficiently!` 
                    },
                    ...history
                ],
                max_tokens: 500, // Good balance of detail and speed
                temperature: 0.7,
            });

            const response = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
            
            // Add assistant response to history
            history.push({ role: 'assistant', content: response });
            this.conversationHistory.set(userId, history);
            
            console.log(`✅ Fast response generated for user ${userId} (${response.length} chars)`);
            return response;

        } catch (error: any) {
            console.error('❌ Fast chat error:', error);
            return this.handleError(error);
        }
    }

    private handleError(error: any): string {
        // Handle specific OpenAI errors
        if (error?.error?.type === 'insufficient_quota') {
            return this.getErrorMessage('quota_exceeded', error.error.message);
        }
        
        if (error?.error?.type === 'rate_limit_exceeded') {
            return this.getErrorMessage('rate_limit', error.error.message);
        }
        
        if (error?.error?.type === 'invalid_api_key') {
            return this.getErrorMessage('invalid_key', error.error.message);
        }
        
        // Model not found error
        if (error?.error?.code === 'model_not_found') {
            return this.getErrorMessage('model_error', error.error.message);
        }
        
        // Generic error
        if (error?.error) {
            return this.getErrorMessage('api_error', error.error.message, error.error.type);
        }
        
        // Network or other errors
        return this.getErrorMessage('connection_error', error.message);
    }

    private getErrorMessage(type: string, details: string, errorType?: string): string {
        const errorMessages = {
            quota_exceeded: {
                emoji: '🚫',
                title: 'OpenAI Quota Exceeded',
                description: 'I\'m unable to process your request because my OpenAI account has exceeded its usage quota.',
                solution: 'Please check the billing details at https://platform.openai.com/account/billing and add more credits or upgrade the plan.'
            },
            rate_limit: {
                emoji: '⏰',
                title: 'Rate Limit Exceeded',
                description: 'I\'m receiving too many requests right now. Please wait a moment and try again.',
                solution: 'Try your request again in a few seconds.'
            },
            invalid_key: {
                emoji: '🔑',
                title: 'Invalid API Key',
                description: 'There\'s an issue with my OpenAI API key configuration.',
                solution: 'Please contact the administrator to fix the API key.'
            },
            model_error: {
                emoji: '🤖',
                title: 'Model Not Available',
                description: 'The requested AI model is not available with this account.',
                solution: 'I\'ve switched to an available model. Your request should work now.'
            },
            service_unavailable: {
                emoji: '🔧',
                title: 'Service Unavailable',
                description: 'The AI assistant service is currently unavailable.',
                solution: 'Please try again later or contact the administrator.'
            },
            api_error: {
                emoji: '❌',
                title: 'OpenAI API Error',
                description: 'I encountered an error while trying to process your request.',
                solution: 'Please try again later or contact the administrator.'
            },
            connection_error: {
                emoji: '🌐',
                title: 'Connection Error',
                description: 'I\'m having trouble connecting to OpenAI\'s servers right now.',
                solution: 'Please try again in a few moments.'
            }
        };

        const errorInfo = errorMessages[type as keyof typeof errorMessages] || errorMessages.api_error;
        
        return `${errorInfo.emoji} **${errorInfo.title}**\n\n${errorInfo.description}\n\n**Error details:** ${details}${errorType ? `\n**Error type:** ${errorType}` : ''}\n\n**Solution:** ${errorInfo.solution}`;
    }

    // Clean up old conversations (optional maintenance)
    cleanupOldConversations() {
        if (this.conversationHistory.size > 100) {
            // Keep only the 50 most recent conversations
            const entries = Array.from(this.conversationHistory.entries());
            const recent = entries.slice(-50);
            this.conversationHistory.clear();
            recent.forEach(([key, value]) => this.conversationHistory.set(key, value));
            console.log('🧹 Cleaned up old conversation history');
        }
    }
}

export const assistantService = new AssistantService();
