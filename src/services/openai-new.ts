import dotenv from 'dotenv';
dotenv.config();

import OpenAI from 'openai';
import { SYSTEM_PROMPT } from '../prompts/system';
import { PDFProvider } from './pdf-provider';

class OpenAIService {
  private openai: OpenAI | null = null;
  private conversationHistory: Map<string, OpenAI.Chat.ChatCompletionMessageParam[]> = new Map();
  private pdfProvider: PDFProvider;

  constructor() {
    console.log('🔧 OpenAI Service Debug Info:');
    console.log('   API Key debug: Exists:', !!process.env.OPENAI_API_KEY);
    console.log('   Length:', process.env.OPENAI_API_KEY?.length || 0);
    console.log('   Starts with sk-:', process.env.OPENAI_API_KEY?.startsWith('sk-') || false);

    // Initialize PDF provider
    this.pdfProvider = PDFProvider.getInstance();

    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey || apiKey === 'sk-your-openai-api-key-here') {
      console.log('⚠️ OpenAI API key not configured');
      return;
    }

    try {
      this.openai = new OpenAI({
        apiKey: apiKey,
      });
      console.log('✅ OpenAI service initialized with GPT-4o and comprehensive PDF support');
      
      // Log PDF status with size warnings
      if (this.pdfProvider.hasPDFs()) {
        console.log(`📚 PDF Library: ${this.pdfProvider.getPDFCount()} documents available`);
        const metadata = this.pdfProvider.getPDFMetadata();
        let totalSize = 0;
        
        metadata.forEach(pdf => {
          const sizeInMB = parseFloat(pdf.size.replace(/[^\d.]/g, ''));
          totalSize += sizeInMB;
          console.log(`📄 ${pdf.name}: ${pdf.size}`);
          if (sizeInMB > 10) {
            console.log(`⚠️  WARNING: ${pdf.name} is large (${pdf.size}) - may cause API issues`);
          }
        });
        
        if (totalSize > 20) {
          console.log(`⚠️  WARNING: Total PDF size (${totalSize.toFixed(2)}MB) is large - may cause API timeouts`);
        }
      } else {
        console.log('📁 No PDFs found. Add PDFs to:', this.pdfProvider.getPDFDirectory());
      }
      
    } catch (error) {
      console.error('❌ Failed to initialize OpenAI service:', error);
    }
  }

  private buildChatGPTMessageWithAllPDFs(userMessage: string, history: OpenAI.Chat.ChatCompletionMessageParam[]): OpenAI.Chat.ChatCompletionMessageParam[] {
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: SYSTEM_PROMPT }
    ];

    // Add conversation history (keep it shorter when including PDFs due to token limits)
    if (this.pdfProvider.hasPDFs()) {
      messages.push(...history.slice(-5)); // Reduced to 5 when PDFs are included
    } else {
      messages.push(...history.slice(-15)); // More history when no PDFs
    }

    // Check PDF count before including them
    const pdfCount = this.pdfProvider.getPDFCount();
    const metadata = this.pdfProvider.getPDFMetadata();

    // Build user message with extracted PDF text content
    if (this.pdfProvider.hasPDFs()) {
      console.log(`📎 Including ${pdfCount} PDF texts in ChatGPT request`);
      
      // Get all PDF texts
      const pdfTexts = this.pdfProvider.getAllPDFTextsForChatGPT();
      
      messages.push({
        role: 'user',
        content: `${userMessage}${pdfTexts}`
      });

      console.log(`✅ Message built with ${pdfCount} PDF texts included`);
    } else {
      // No PDFs available, send regular text message
      messages.push({
        role: 'user',
        content: userMessage
      });
      console.log('📝 Message built without PDFs (none available)');
    }

    return messages;
  }

  async generateResponse(message: string, userId: string): Promise<string> {
    if (!this.openai) {
      return '🤖 I\'m currently running without OpenAI integration. Your message was: "' + message + '". Please configure the OPENAI_API_KEY environment variable for AI responses.';
    }

    try {
      // Get or create conversation history for this user
      let history = this.conversationHistory.get(userId) || [];

      console.log(`🤖 Generating response for user ${userId} with ${this.pdfProvider.getPDFCount()} PDFs`);
      
      // Build messages with PDFs (includes size checking)
      const messages = this.buildChatGPTMessageWithAllPDFs(message, history);
      
      console.log(`📤 Sending request to OpenAI with ${messages.length} messages`);
      
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o', // Using GPT-4o which supports vision capabilities
        messages: messages,
        max_tokens: 1500,
        temperature: 0.7,
      });

      const response = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
      
      // Add user message and assistant response to history
      history.push({ role: 'user', content: message });
      history.push({ role: 'assistant', content: response });
      this.conversationHistory.set(userId, history);
      
      console.log(`✅ Response generated successfully: ${response.substring(0, 100)}...`);
      return response;

    } catch (error: any) {
      console.error('❌ ===== DETAILED OPENAI API ERROR =====');
      console.error('Error type:', error?.error?.type);
      console.error('Error code:', error?.error?.code);
      console.error('Error message:', error?.error?.message);
      console.error('Full error:', error);
      console.error('=====================================');
      
      if (error?.error?.type === 'insufficient_quota') {
        return '🚫 I\'m unable to respond right now because my OpenAI quota has been exceeded. Please contact the administrator to add more credits.';
      }
      
      if (error?.error?.type === 'rate_limit_exceeded') {
        return '⏰ I\'m receiving too many requests right now. Please wait a moment and try again.';
      }

      if (error?.error?.code === 'model_not_found' || error?.error?.code === 'invalid_request_error') {
        console.log('⚠️ GPT-4o model issue, falling back to GPT-4');
        const conversationHistory = this.conversationHistory.get(userId) || [];
        return this.fallbackToGPT4(message, userId, conversationHistory);
      }

      if (error?.message?.includes('exceeded maximum context length') || 
          error?.message?.includes('Invalid MIME type') ||
          error?.code === 'invalid_image_format') {
        console.log('⚠️ Context too long or PDF format issue, trying without PDFs');
        const conversationHistory = this.conversationHistory.get(userId) || [];
        return this.fallbackWithoutPDFs(message, userId, conversationHistory);
      }
      
      return `❌ OpenAI API Error: ${error?.error?.message || error?.message || 'Unknown error'}. Please try again or contact support if this persists.`;
    }
  }

  // Fallback to regular GPT-4 without PDF support
  private async fallbackToGPT4(message: string, userId: string, history: OpenAI.Chat.ChatCompletionMessageParam[]): Promise<string> {
    try {
      console.log('🔄 Using regular GPT-4 as fallback (PDFs not supported)');
      
      let fallbackMessage = message;
      if (this.pdfProvider.hasPDFs()) {
        fallbackMessage += `\n\nNote: I have ${this.pdfProvider.getPDFCount()} PDF documents available (${this.pdfProvider.getPDFNames().join(', ')}) but cannot access them in fallback mode.`;
      }
      
      const completion = await this.openai!.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...history.slice(-15),
          { role: 'user', content: fallbackMessage }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      });

      const response = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
      
      // Add to history
      const userHistory = this.conversationHistory.get(userId) || [];
      userHistory.push({ role: 'user', content: message });
      userHistory.push({ role: 'assistant', content: response });
      this.conversationHistory.set(userId, userHistory);
      
      console.log(`✅ GPT-4 fallback response generated`);
      return response;

    } catch (fallbackError) {
      console.error('❌ Fallback also failed:', fallbackError);
      return '❌ I encountered an error while processing your request. Please try again.';
    }
  }

  // Fallback without PDFs for context length issues
  private async fallbackWithoutPDFs(message: string, userId: string, history: OpenAI.Chat.ChatCompletionMessageParam[]): Promise<string> {
    try {
      console.log('🔄 Retrying without PDFs due to context length');
      
      const completion = await this.openai!.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...history.slice(-8),
          { role: 'user', content: `${message}\n\nNote: PDF documents available but not included due to context limits.` }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      });

      const response = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
      
      // Add to history
      const userHistory = this.conversationHistory.get(userId) || [];
      userHistory.push({ role: 'user', content: message });
      userHistory.push({ role: 'assistant', content: response });
      this.conversationHistory.set(userId, userHistory);
      
      console.log(`✅ Response generated without PDFs`);
      return response;

    } catch (error: any) {
      console.error('❌ Fallback without PDFs also failed:', error);
      return `❌ Unable to process request. Error: ${error?.error?.message || error?.message}`;
    }
  }

  // PDF management methods
  public reloadPDFs(): void {
    this.pdfProvider.reloadAllPDFs();
    console.log('🔄 PDF library reloaded');
  }

  public getPDFStatus(): {
    count: number;
    names: string[];
    directory: string;
    metadata: Array<{name: string; fileName: string; size: string; lastModified: string}>;
  } {
    return {
      count: this.pdfProvider.getPDFCount(),
      names: this.pdfProvider.getPDFNames(),
      directory: this.pdfProvider.getPDFDirectory(),
      metadata: this.pdfProvider.getPDFMetadata()
    };
  }

  public startPDFWatcher(): void {
    this.pdfProvider.watchForChanges();
  }

  // Legacy method for backward compatibility
  async getChatCompletionWithContext(message: string, history: any[], systemPrompt?: string): Promise<string> {
    return this.generateResponse(message, 'legacy-user');
  }

  async getChatCompletion(message: string, systemPrompt?: string): Promise<string> {
    return this.generateResponse(message, 'command-user');
  }

  // Method to switch prompts dynamically
  setPromptMode(mode: 'default' | 'casual' | 'technical' | 'brief') {
    console.log(`📝 Switching to ${mode} prompt mode`);
  }
}

export { OpenAIService };
export default OpenAIService;
