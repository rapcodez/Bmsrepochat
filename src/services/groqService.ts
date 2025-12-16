
import { ITEMS, INVENTORY, KNOWLEDGE_BASE, ORDERS } from '../data/mockDb';
import { getMarketAnalysis, getSalesAnalysis } from './analysisService';

// --- Context Generation (RAG) ---
const generateContext = () => {
    // 1. Product Catalog & Pricing (Summary)
    const itemsList = ITEMS.map(i => {
        const compPrices = i.competitors.map(c => `${c.name}: $${c.price.toFixed(2)}`).join(', ');
        return `- ${i.id}: ${i.name} ($${i.price}) [Cummins: $${i.cumminsPrice.toFixed(2)}] [${compPrices}]`;
    }).join('\n');

    // 2. Inventory (Aggregated by Item)
    const inventoryText = ITEMS.map(item => {
        const stock = INVENTORY.filter(inv => inv.itemId === item.id);
        const total = stock.reduce((sum, s) => sum + s.quantity, 0);
        // Only show detailed breakdown if stock is low to save tokens
        const lowStockLocs = stock.filter(s => s.status === 'Low Stock' || s.status === 'Out of Stock')
            .map(s => `${s.location} (${s.quantity})`).join(', ');

        return `- ${item.id}: ${total} units total. ${lowStockLocs ? `Alert: ${lowStockLocs}` : ''}`;
    }).join('\n');

    // 3. Recent Orders (Last 5)
    const recentOrders = ORDERS.slice(0, 5).map(o =>
        `- ${o.orderId}: ${o.itemId} (${o.status}) - ${o.customerName}`
    ).join('\n');

    // 4. Market Analysis (Trends)
    const marketTrends = ITEMS.slice(0, 5).map(i => {
        const trend = getSalesAnalysis(i.id); // We'll need to update analysisService too, but for now let's use what we have or mock it here
        // Actually, let's just grab the latest trend from MARKET_TRENDS if available, or generic
        return `- ${i.id}: Market Trend is Dynamic. Competitor pressure from ${i.competitors[0].name}.`;
    }).join('\n');

    return `
You are the BMS AI Assistant, an expert in ERP systems and inventory management.
You have access to the following REAL-TIME enterprise data:

### Product Catalog & Pricing (Benchmarked against Competitors)
${itemsList}

### Current Inventory Levels
${inventoryText}

### Recent Orders
${recentOrders}

### Market Knowledge
${KNOWLEDGE_BASE.map(k => `- ${k.title}: ${k.content}`).join('\n')}

### Instructions
1. **Role:** Act as a senior ERP consultant. Be precise, professional, and data-driven.
2. **Data Presentation:**
   - If the user asks for "stock" or "inventory", provide the total and a brief summary.
   - **CRITICAL:** If the user asks for a **table**, **breakdown**, or **format**, you MUST use a Markdown table.
   - **Inventory Table Format:**
     | Item ID | Name | Location | Quantity | Status |
     |---|---|---|---|---|
     | BMS... | ... | ... | ... | ... |
   - Do NOT show the "Product Catalog" table unless explicitly asked for pricing. Focus on the *Inventory* data provided above.
3. **Reports:** If the user asks to **generate a report** or **download PDF**:
   - Look at the **previous conversation context**.
   - Generate a **Markdown table** containing the relevant data discussed (e.g., if discussing pricing, show a price comparison table; if inventory, show an inventory table).
   - Provide a brief summary of the data.
   - **ALWAYS** append the tag \`<<GENERATE_REPORT>>\` at the very end of your response.
4. **Unknowns:** If you don't know the answer, say "I don't have that information in my database."
5. **Table Rules:**
   - **NEVER** dump the entire inventory unless explicitly asked for "all items".
   - If user asks for "Table for BMS0001", show a table with **ONLY** BMS0001 rows.
`;
};

export const chatWithGroq = async (query: string, history: { role: string, content: string }[] = []): Promise<string> => {
    // SECURE: Only use key from Local Storage. Never hardcode.
    const apiKey = localStorage.getItem('user_groq_key');
    // Use user-selected model, or default to 70B
    const model = localStorage.getItem('user_groq_model') || "llama-3.3-70b-versatile";

    if (!apiKey) {
        throw new Error("Missing Groq API Key. Please add it in Settings.");
    }

    // Format history for Groq (limit to last 10 messages to save tokens)
    const recentHistory = history.slice(-10).map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content.replace('<<GENERATE_REPORT>>', '') // Clean up internal tags
    }));

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
                    ...recentHistory,
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
