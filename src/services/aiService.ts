
import { mockChatWithAI } from './mockService';
import { chatWithGroq } from './groqService';
// import { chatWithHF } from './huggingFaceService'; // Disabled

export const chatWithAI = async (query: string, history: { role: string, content: string }[] = [], role: string = 'Admin'): Promise<string> => {
    // 1. Check for Offline/Mock Mode first (if explicitly selected)
    const provider = localStorage.getItem('user_ai_provider') || 'groq';

    if (provider === 'mock') {
        return await mockChatWithAI(query);
    }

    // 2. Route to Online Providers
    try {
        console.log(`Connecting to AI Provider: ${provider}...`);

        if (provider === 'groq') {
            return await chatWithGroq(query, history, role);
        } else if (provider === 'huggingface') {
            // HF Disabled -> Fallback to Groq
            return await chatWithGroq(query, history, role);
        } else if (provider === 'gemini') {
            return "Google Gemini integration coming soon! Please select Groq or Hugging Face for now.";
        } else {
            // Default to Groq if unknown
            return await chatWithGroq(query, history, role);
        }
    } catch (error) {
        console.error("Online AI Failed:", error);
        // 3. Global Fallback to Mock
        return await mockChatWithAI(query);
    }
};
