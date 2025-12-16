
import { getInventory, getOrders, KNOWLEDGE_BASE, ITEMS } from '../data/mockDb';

// Helper to format data as Markdown Table
const formatTable = (headers: string[], rows: any[][]) => {
    const headerRow = `| ${headers.join(' | ')} |`;
    const separatorRow = `| ${headers.map(() => '---').join(' | ')} |`;
    const dataRows = rows.map(row => `| ${row.join(' | ')} |`).join('\n');
    return `\n${headerRow}\n${separatorRow}\n${dataRows}\n`;
};

export const mockChatWithAI = async (query: string): Promise<string> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const lowerQuery = query.toLowerCase();

    // --- 1. Inventory Check ---
    if (lowerQuery.includes('stock') || lowerQuery.includes('inventory') || lowerQuery.includes('available')) {
        const itemMatch = lowerQuery.match(/bms\d{4}/i);
        if (itemMatch) {
            const itemId = itemMatch[0].toUpperCase();
            const item = ITEMS.find(i => i.id === itemId);
            const inventory = getInventory(itemId);
            const total = inventory.reduce((sum, i) => sum + i.quantity, 0);

            if (!item) return `I couldn't find an item with ID **${itemId}**. Please check the ID and try again.`;

            const headers = ['Location', 'Quantity'];
            const rows = inventory.map(i => [i.location, i.quantity.toString()]);
            return `### Inventory Status: ${item.name} (${itemId})\n**Total Available:** ${total} units\n\n${formatTable(headers, rows)}`;
        }
        return "Please specify an Item ID (e.g., BMS0001) to check inventory.";
    }

    // --- 2. Order Status ---
    if (lowerQuery.includes('order') || lowerQuery.includes('status')) {
        const orderMatch = lowerQuery.match(/ord-\d{2}-\d{4}/i);
        if (orderMatch) {
            const orderId = orderMatch[0].toUpperCase();
            const order = getOrders().find(o => o.orderId === orderId);

            if (order) {
                if (lowerQuery.includes('table')) {
                    const headers = ['Order ID', 'Item', 'Status', 'Date'];
                    const rows = [[order.orderId, order.itemId, order.status, order.date]];
                    return `### Order Details\n${formatTable(headers, rows)}`;
                }
                return `### Order Status: ${orderId}\n- **Item:** ${order.itemId}\n- **Status:** ${order.status}\n- **Date:** ${order.date}\n- **Value:** $${order.value}`;
            }
            return `I couldn't find order **${orderId}**.`;
        }

        // List recent orders if no specific ID
        if (lowerQuery.includes('recent') || lowerQuery.includes('list')) {
            const orders = getOrders().slice(0, 5);
            const headers = ['Order ID', 'Item', 'Status', 'Value'];
            const rows = orders.map(o => [o.orderId, o.itemId, o.status, `$${o.value}`]);
            return `### Recent Orders\n${formatTable(headers, rows)}`;
        }
    }

    // --- 3. Market Analysis / Competitor ---
    if (lowerQuery.includes('market') || lowerQuery.includes('competitor') || lowerQuery.includes('analysis') || lowerQuery.includes('price')) {
        const relevantDocs = KNOWLEDGE_BASE.filter(doc =>
            doc.tags.some(tag => lowerQuery.includes(tag))
        );

        if (relevantDocs.length > 0) {
            const summary = relevantDocs.map(d => `- **${d.title}:** ${d.content}`).join('\n\n');

            // Add Competitor Price Table if asking about price
            if (lowerQuery.includes('price') || lowerQuery.includes('competitor')) {
                const headers = ['Item', 'BMS Price', 'Cummins Price', 'Cheapest Competitor'];
                const rows = ITEMS.slice(0, 5).map(i => {
                    const cheapest = i.competitors.reduce((prev, curr) => prev.price < curr.price ? prev : curr);
                    return [
                        i.id,
                        `$${i.price}`,
                        `$${i.cumminsPrice.toFixed(2)}`,
                        `${cheapest.name} ($${cheapest.price.toFixed(2)})`
                    ];
                });
                return `### Market Analysis\n${summary}\n\n### Competitor Pricing Analysis\n${formatTable(headers, rows)}`;
            }

            return `### Market Insights\n${summary}`;
        }
        return "I don't have specific market data on that topic yet. Try asking about 'engine market', 'competitor pricing', or 'supply chain'.";
    }

    // --- 4. Report Generation ---
    if (lowerQuery.includes('report') || lowerQuery.includes('pdf') || lowerQuery.includes('download')) {
        return "You can download the **Inventory Report** by clicking the **PDF icon** (📄) in the top right corner of the chat window.";
    }

    // --- 5. General Help / Fallback ---
    return `I didn't quite understand that query. I can help you with:
- **Inventory:** "Check stock for BMS0001"
- **Orders:** "Status of order ORD-24-1001"
- **Market:** "Compare price of BMS0001 vs Cummins"
- **Sales:** "Show sales analysis for BMS0001"

Try asking one of these or check the **Help & Guide** for more examples.`;
};
