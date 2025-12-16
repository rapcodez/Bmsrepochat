import { HfInference } from '@huggingface/inference';
import { ITEMS, INVENTORY, KNOWLEDGE_BASE, ORDERS } from '../data/mockDb';
import { chatWithAI as mockChatWithAI } from './aiService';

// Initialize Hugging Face Client
// Priority: 1. Environment Variable (Vercel) 2. Local Storage (User Settings)
const getToken = () => {
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

// --- Context Generation (RAG) ---
// We condense the database into a text prompt for the AI
const generateContext = () => {
    const itemsList = ITEMS.map(i =>
        `- ${i.id}: ${i.name} ($${i.price}) [Competitor: ${i.competitorRef?.name} @ $${i.competitorRef?.price}]`
    ).join('\n');

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

    return `
You are the BMS Cognitive ERP Assistant. You have access to the following REAL-TIME enterprise data:

### Product Catalog & Pricing
${itemsList}

### Current Inventory Levels (Total across all locations)
${inventoryText}

### Recent Orders
${recentOrders}

### Market Knowledge
${KNOWLEDGE_BASE.map(k => `- ${k.title}: ${k.content}`).join('\n')}

### Instructions
1. Answer user queries based STRICTLY on the data above.
2. If the user asks for a table, format your response using Markdown tables.
3. If you don't know the answer (e.g., an item not listed), say "I don't have that information in my database."
4. Be professional, concise, and helpful.
`;
};

export const chatWithHF = async (query: string): Promise<string> => {
    const token = getToken();
    const hf = token ? new HfInference(token) : null;

    // 1. Fallback to Mock if no Token
    if (!hf) {
        console.warn("No HF Token found. Falling back to Mock Engine.");
        return mockChatWithAI(query);
    }

    try {
        // 2. Call Inference API
        const chatCompletion = await hf.chatCompletion({
            model: "mistralai/Mistral-7B-Instruct-v0.3",
            messages: [
                { role: "system", content: generateContext() },
                { role: "user", content: query }
            ],
            max_tokens: 500,
            temperature: 0.7
        });

        return chatCompletion.choices[0].message.content || "I couldn't generate a response.";

    } catch (error) {
        console.error("Hugging Face API Error:", error);
        // 3. Fallback to Mock on Error
        return mockChatWithAI(query);
    }
};
