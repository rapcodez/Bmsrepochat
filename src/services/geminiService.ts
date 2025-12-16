import { GoogleGenerativeAI } from '@google/generative-ai';
import { ITEMS, INVENTORY, SALES_FORECAST, KNOWLEDGE_BASE, ORDERS } from '../data/mockDb';
import { chatWithAI as mockChatWithAI } from './aiService';

// Initialize Gemini Client
// Note: This relies on VITE_GEMINI_API_KEY being set in .env
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

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

export const chatWithGemini = async (query: string): Promise<string> => {
    // 1. Fallback to Mock if no API Key
    if (!genAI) {
        console.warn("No API Key found. Falling back to Mock Engine.");
        return mockChatWithAI(query);
    }

    try {
        // 2. Prepare Model
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: generateContext()
        });

        // 3. Generate Content
        const result = await model.generateContent(query);
        const response = await result.response;
        return response.text();

    } catch (error) {
        console.error("Gemini API Error:", error);
        // 4. Fallback to Mock on Error
        return mockChatWithAI(query);
    }
};
