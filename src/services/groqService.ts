
import { ITEMS, INVENTORY, KNOWLEDGE_BASE, ORDERS } from '../data/mockDb';
import { getMarketAnalysis, getSalesAnalysis } from './analysisService';

// --- Context Generation (RAG) ---
const generateContext = () => {
    const itemsList = ITEMS.map(i => {
        const analysis = getMarketAnalysis(i.id);
        return `- ${i.id}: ${i.name} ($${i.price}) [Cummins: $${analysis?.cumminsPrice.toFixed(2)}] [${i.competitorRef?.name}: $${i.competitorRef?.price.toFixed(2)}]`;
    }).join('\n');

    // Detailed Inventory with Location Breakdown
    const inventoryText = ITEMS.map(item => {
        const stock = INVENTORY.filter(inv => inv.itemId === item.id);
        const total = stock.reduce((sum, s) => sum + s.quantity, 0);
        const locations = stock.map(s => `${s.location}: ${s.quantity}`).join(', ');
        return `- ${item.id}: ${total} units total (${locations})`;
    }).join('\n');

    const recentOrders = ORDERS.slice(0, 10).map(o =>
        `- ${o.orderId}: ${o.itemId} (${o.status})`
    ).join('\n');

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

export const chatWithGroq = async (query: string): Promise<string> => {
    // SECURE: Only use key from Local Storage. Never hardcode.
    const apiKey = localStorage.getItem('user_groq_key');
    const model = "llama-3.3-70b-versatile"; // Updated to supported model

    if (!apiKey) {
        throw new Error("Missing Groq API Key. Please add it in Settings.");
    }

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                messages: [
                    { role: "system", content: generateContext() },
                    { role: "user", content: query }
                ],
                model: model,
                temperature: 0.5,
                max_tokens: 1024,
                top_p: 1,
                stop: null,
                stream: false
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || `Groq API Error: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0]?.message?.content || "No response generated.";

    } catch (error: any) {
        console.error("Groq API Error:", error);
        return `**Error:** Unable to connect to Groq AI. \n\n*Technical Details:* ${error.message}`;
    }
};
