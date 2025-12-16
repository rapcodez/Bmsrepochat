import { getInventory, getOrders, KNOWLEDGE_BASE, ITEMS } from '../data/mockDb';

interface ToolResponse {
    text: string;
}

// --- Mock AI Engine ---
// This replaces the Gemini API with a local rule-based system for the demo.
export const chatWithAI = async (query: string): Promise<ToolResponse> => {
    // Simulate network delay for realism
    await new Promise(resolve => setTimeout(resolve, 800));

    const lowerQuery = query.toLowerCase();

    // 1. Check Inventory
    if (lowerQuery.includes('stock') || lowerQuery.includes('inventory') || lowerQuery.includes('available') || lowerQuery.includes('have')) {
        const itemMatch = ITEMS.find(i => lowerQuery.includes(i.id.toLowerCase()) || lowerQuery.includes(i.name.toLowerCase()));
        if (itemMatch) {
            const stock = getInventory(itemMatch.id);
            const total = stock.reduce((sum, s) => sum + s.quantity, 0);
            const details = stock.map(s => `*   **${s.location}:** ${s.quantity}`).join('\n');
            return {
                text: `### Inventory Check: ${itemMatch.name} (${itemMatch.id})\n\n**Total Available:** ${total} units\n\n**Location Breakdown:**\n${details}`
            };
        }
        return { text: "I couldn't identify the specific item you're asking about. Please specify a valid BMS ID (e.g., **BMS0001**) or product name." };
    }

    // 2. Check Orders
    if (lowerQuery.includes('order') || lowerQuery.includes('status')) {
        // Extract something that looks like an order ID
        const orderMatch = query.match(/ORD-\d{2}-\d{4}/);
        if (orderMatch) {
            const orders = getOrders();
            const order = orders.find(o => o.orderId === orderMatch[0]);
            if (order) {
                return {
                    text: `### Order Status: ${order.orderId}\n\n*   **Status:** ${order.status}\n*   **Item:** ${order.itemId}\n*   **Quantity:** ${order.qty}\n*   **Value:** $${order.value.toLocaleString()}`
                };
            }
            return { text: `I couldn't find an order with ID **${orderMatch[0]}**. Please check the ID and try again.` };
        }
        // If asking about customer orders
        if (lowerQuery.includes('my orders') || lowerQuery.includes('customer')) {
            // Simulating a specific customer for offline demo
            const orders = getOrders('CUST-001');
            const orderList = orders.map(o => `*   **${o.orderId}:** ${o.status} (${o.itemId})`).join('\n');
            return { text: `### Recent Orders for CUST-001\n\n${orderList}` };
        }
    }

    // 3. Market Analysis / Knowledge Base
    if (lowerQuery.includes('market') || lowerQuery.includes('analysis') || lowerQuery.includes('competitor') || lowerQuery.includes('compare')) {
        const itemMatch = ITEMS.find(i => lowerQuery.includes(i.id.toLowerCase()) || lowerQuery.includes(i.name.toLowerCase()));
        if (itemMatch) {
            const doc = KNOWLEDGE_BASE.find(d => d.content.includes(itemMatch.id) || d.title.includes(itemMatch.id));
            if (doc) {
                return { text: `### Market Analysis: ${itemMatch.name}\n\n${doc.content}\n\n*Tags: ${doc.tags.join(', ')}*` };
            }
        }
    }

    // 4. General Greetings / Fallback
    if (lowerQuery.includes('hello') || lowerQuery.includes('hi')) {
        return { text: "Hello! I am your BMS Cognitive ERP Assistant. I can help you check inventory, track orders, and analyze market data. What would you like to do?" };
    }

    return {
        text: "I'm a demo AI trained on specific enterprise data. Try asking me to:\n\n*   Check stock for **BMS0001**\n*   Check status of order **ORD-24-1001**\n*   Show market analysis for **X15 Engine**"
    };
};
