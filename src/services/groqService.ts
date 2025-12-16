
import { ITEMS, INVENTORY, KNOWLEDGE_BASE, ORDERS } from '../data/mockDb';
// import { getSalesAnalysis } from './analysisService';

// --- Context Generation (RAG) ---
const generateContext = (role: string) => {
    const isCustomer = role === 'Customer';

    // 1. Product Catalog & Pricing
    const itemsList = ITEMS.map(i => {
        if (isCustomer) {
            // Customers only see their price, no competitor data
            return `- ${i.id}: ${i.name} ($${i.price})`;
        } else {
            // Admin/Sales see everything
            const compPrices = i.competitors.map(c => `${c.name}: $${c.price.toFixed(2)}`).join(', ');
            return `- ${i.id}: ${i.name} ($${i.price}) [Cummins: $${i.cumminsPrice.toFixed(2)}] [${compPrices}]`;
        }
    }).join('\n');

    // 2. Inventory (Aggregated by Item)
    const inventoryText = ITEMS.map(item => {
        const stock = INVENTORY.filter(inv => inv.itemId === item.id);
        const total = stock.reduce((sum, s) => sum + s.quantity, 0);

        if (isCustomer) {
            // Customers only see "In Stock" or "Out of Stock"
            const status = total > 0 ? "In Stock" : "Out of Stock";
            return `- ${item.id}: ${status}`;
        } else {
            // Admin/Sales see detailed counts
            const lowStockLocs = stock.filter(s => s.status === 'Low Stock' || s.status === 'Out of Stock')
                .map(s => `${s.location} (${s.quantity})`).join(', ');
            return `- ${item.id}: ${total} units total. ${lowStockLocs ? `Alert: ${lowStockLocs}` : ''}`;
        }
    }).join('\n');

    // 3. Recent Orders (Last 5)
    // Customers should only see THEIR orders (simulated here by showing none or generic for now)
    const recentOrders = isCustomer
        ? "No recent orders found for your account."
        : ORDERS.slice(0, 5).map(o => `- ${o.orderId}: ${o.itemId} (${o.status}) - ${o.customerName}`).join('\n');

    // 4. Market Analysis (Trends) - HIDDEN for Customers
    const marketTrends = isCustomer
        ? "Market Trend data is restricted to internal staff."
        : ITEMS.slice(0, 5).map(i => `- ${i.id}: Market Trend is Dynamic. Competitor pressure from ${i.competitors[0].name}.`).join('\n');

    return `
You are the BMS AI Assistant.
Current User Role: **${role}**

### Product Catalog
${itemsList}

### Inventory Status
${inventoryText}

### Historical Orders
${recentOrders}

### Market Trends
${marketTrends}

### Enterprise Knowledge Base (Strategic Policies)
${KNOWLEDGE_BASE.map(k => `- **${k.title}:** ${k.content}`).join('\n')}

### Instructions
1. **Role & Tone:**
   - **Customer:** Be helpful, polite, and service-oriented. Focus on placing orders and checking status.
   - **Admin/Sales:** Be strategic, data-driven, and detailed.

2. **Data Privacy (CRITICAL):**
   - **Customers:** NEVER reveal Competitor Prices, Market Trends, or exact Stock Counts (only say "In Stock" or "Out of Stock").
   - **Admin/Sales:** Show full data including competitor analysis.

3. **Order Processing Protocol (For Customers):**
   - **Trigger:** When a customer says "Order X" or "Buy X".
   - **Internal Logic (Silent):** Check the "Inventory Status" provided above.
     - If status is "In Stock" (or count > 0): The order is **Successful**.
     - If status is "Out of Stock" (or count == 0): The order is **Backordered**.
   - **Response:**
     - **Success:** "Order confirmed! **Order ID: [Generate Random ID, e.g., ORD-2025-1092]**. Your items have been reserved. Estimated Delivery: [Insert Date 3-5 days from now]."
     - **Backorder:** "Order placed. **Order ID: [Generate Random ID]**. However, this item is currently on backorder. We will ship it as soon as stock arrives. Estimated Delivery: [Insert Date 10-14 days from now]."
   - **Constraint:** Do NOT explain the internal check (e.g., "I checked the inventory and..."). Just give the result.

4. **Data Presentation:**
   - **Tables:** Use Markdown tables for lists.
   - **Price:** If Customer asks for price, just show OUR price.

5. **Reports:**
   - If user asks for a report, generate a Markdown table and append \`<<GENERATE_REPORT>>\`.
`;
};

export const chatWithGroq = async (query: string, history: { role: string, content: string }[] = [], role: string = 'Admin'): Promise<string> => {
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
                    { role: "system", content: generateContext(role) },
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
