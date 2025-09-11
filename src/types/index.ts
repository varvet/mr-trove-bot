export interface SlackEvent {
    type: string;
    user: string;
    text?: string;
    channel: string;
    timestamp: string;
    subtype?: string;
    bot_id?: string;
}

export interface ConversationMessage {
    role: 'user' | 'assistant';
    content: string;
}

export interface OpenAIResponse {
    content: string;
    error?: string;
}