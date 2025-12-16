
import { ITEMS, INVENTORY, KNOWLEDGE_BASE, ORDERS } from '../data/mockDb';
// import { getSalesAnalysis } from './analysisService';

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

### Market Trends
${marketTrends}

### Market Knowledge
${KNOWLEDGE_BASE.map(k => `- ${k.title}: ${k.content}`).join('\n')}

### Instructions
1. **Role:** Act as a **Senior ERP Strategy Consultant**.
   - **Tone:** Professional, authoritative, and insight-driven.
   - **Goal:** Don't just give data; give *intelligence*. Explain *why* the data matters.
   
2. **Response Structure:**
   - **Executive Summary:** Start with a 1-sentence high-level insight.
   - **Data Analysis:** Provide the requested data (Inventory, Price, etc.).
   - **Strategic Recommendation:** End with a specific action item (e.g., "Recommend restocking RDC-01 due to high demand velocity").

3. **Data Presentation (CRITICAL):**
   - **Tables:** ALWAYS use Markdown tables for comparisons, lists, or multi-variable data.
   - **Price Comparison:** When asked about price, show a table comparing BMS vs Competitors, highlighting the variance.
   - **Format:**
     | Item | Our Price | Competitor | Variance |
     |---|---|---|---|
     | BMS001 | $500 | $550 | -9% (Cheaper) |

4. **Reports:** If the user asks to **generate a report** or **download PDF**:
   - Generate a detailed Markdown table.
   - Provide a "Key Findings" bullet list below the table.
   - **ALWAYS** append the tag \`<<GENERATE_REPORT>>\` at the very end.

5. **Unknowns:** If data is missing, state it clearly and suggest a related query.
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
