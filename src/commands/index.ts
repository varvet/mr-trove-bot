import { SlashCommand, AllMiddlewareArgs, SlackCommandMiddlewareArgs } from '@slack/bolt';
import OpenAIService from '../services/openai-new';

const openaiService = new OpenAIService();

export const handleCommand = async ({ 
    command, 
    ack, 
    respond 
}: SlackCommandMiddlewareArgs & AllMiddlewareArgs) => {
    await ack();

    const userMessage = command.text;

    if (!userMessage) {
        await respond({
            text: "Please provide a message to chat with me! Usage: `/chat How can you help me?`",
            response_type: 'ephemeral'
        });
        return;
    }

    try {
        console.log(`💬 Slash command from ${command.user_id}: ${userMessage}`);
        const response = await openaiService.generateResponse(userMessage, command.user_id);

        await respond({
            text: response,
            response_type: 'in_channel'
        });

        console.log('✅ Slash command response sent');

    } catch (error) {
        console.error('Error handling slash command:', error);
        await respond({
            text: 'Sorry, I encountered an error while processing your request.',
            response_type: 'ephemeral'
        });
    }
};