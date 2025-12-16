import { HfInference } from '@huggingface/inference';
import { ITEMS, INVENTORY, KNOWLEDGE_BASE, ORDERS } from '../data/mockDb';
import { chatWithAI as mockChatWithAI } from './aiService';

// Initialize Hugging Face Client
// Priority: 1. Environment Variable (Vercel) 2. Local Storage (User Settings)
const getToken = () => {
    // Priority: 1. Environment Variable 2. Local Storage 3. Hardcoded Fallback (for debugging)
    return import.meta.env.VITE_HF_TOKEN || localStorage.getItem('user_hf_token');
};

// Helper to refresh client if token changes in localStorage
export const refreshHFClient = () => {
    const newToken = getToken();
    if (newToken) {
        // We can't easily re-instantiate the const 'hf' module-level variable without a refactor.
        // For this POC, we'll just reload the page in the UI component, or we can make 'hf' a let.
        // Let's make 'hf' a let for better UX, but for now, page reload is safer/simpler.
        return true;
    }
    return false;
};

import { getMarketAnalysis, getSalesAnalysis } from './analysisService';

// --- Context Generation (RAG) ---
// We condense the database into a text prompt for the AI
const generateContext = () => {
    const itemsList = ITEMS.map(i => {
        const analysis = getMarketAnalysis(i.id);
        return `- ${i.id}: ${i.name} ($${i.price}) [Cummins: $${analysis?.cumminsPrice.toFixed(2)}] [${i.competitorRef?.name}: $${i.competitorRef?.price.toFixed(2)}]`;
    }).join('\n');

    const inventorySummary = INVENTORY.reduce((acc, curr) => {
        acc[curr.itemId] = (acc[curr.itemId] || 0) + curr.quantity;
        return acc;
    }, {} as Record<string, number>);

    const inventoryText = Object.entries(inventorySummary).map(([id, qty]) =>
        `- ${id}: ${qty} units total`
    ).join('\n');

    const recentOrders = ORDERS.slice(0, 10).map(o =>
        `- ${o.orderId}: ${o.itemId} (${o.status})`
    ).join('\n');

    // Generate brief sales analysis for top items
    const salesInsights = ITEMS.slice(0, 5).map(i => {
        const analysis = getSalesAnalysis(i.id);
        return `- ${i.id}: Market Share ${analysis?.marketShare}%, Trend ${analysis?.trend}`;
    }).join('\n');

    return `
You are the BMS AI Assistant. You have access to the following REAL-TIME enterprise data:

### Product Catalog & Pricing (Benchmarked against Cummins)
${itemsList}

### Sales & Market Analysis
${salesInsights}

### Current Inventory Levels (Total across all locations)
${inventoryText}

### Recent Orders
${recentOrders}

### Market Knowledge
${KNOWLEDGE_BASE.map(k => `- ${k.title}: ${k.content}`).join('\n')}

### Instructions
1. Answer user queries based STRICTLY on the data above.
2. If the user asks for a table, format your response using Markdown tables.
3. If the user asks to **generate a report** or **download PDF**, say: "You can download the inventory report by clicking the **PDF icon** in the top right corner of the chat."
4. If you don't know the answer (e.g., an item not listed), say "I don't have that information in my database."
5. Be professional, concise, and helpful.
`;
};

export const chatWithHF = async (query: string): Promise<string> => {
    const token = getToken();
    const endpoint = localStorage.getItem('user_hf_endpoint');

    // 1. Fallback to Mock if no Token
    if (!token && !endpoint) {
        console.warn("No HF Token found. Falling back to Mock Engine.");
        return mockChatWithAI(query);
    }

    try {
        const model = endpoint || "deepseek-ai/DeepSeek-V3.2";
        const messages = [
            { role: "system", content: generateContext() },
            { role: "user", content: query }
        ];

        // 2. Use Backend Proxy to avoid CORS/Firewall issues
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages,
                model,
                token // Pass token to proxy (it will use it in Auth header)
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Proxy Error: ${response.status}`);
        }

        const data = await response.json();

        // Handle different response formats (Chat Completion vs Text Generation)
        if (data.choices && data.choices[0]?.message?.content) {
            return data.choices[0].message.content;
        } else if (Array.isArray(data) && data[0]?.generated_text) {
            // Clean up generated text if it includes the prompt
            let text = data[0].generated_text;
            // Simple cleanup: if it contains the last user query, try to split? 
            // Usually Mistral instruction tuned models output the answer after [/INST]
            if (text.includes('[/INST]')) {
                text = text.split('[/INST]').pop();
            }
            return text.trim();
        } else {
            return "I couldn't generate a response (Unknown format).";
        }

    } catch (error: any) {
        console.error("Hugging Face API Error:", error);
        // 3. Return Error directly instead of silent fallback
        return `**Error:** Unable to connect to the AI model. \n\n*Technical Details:* ${error.message || 'Unknown error'}\n\nI can still help you with basic queries using my offline database. Try asking about stock or orders.`;
    }
};
