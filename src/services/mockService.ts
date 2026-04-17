
import { getInventory, getOrders, KNOWLEDGE_BASE, ITEMS, getForecast, ORDERS } from '../data/mockDb';

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

    // --- Entity Extraction ---
    const itemIds = ITEMS.map(i => i.id.toLowerCase());
    const regexStr = `\\b(${itemIds.join('|')})\\b`;
    const itemMatch = lowerQuery.match(new RegExp(regexStr, 'i'));
    
    let matchedItem = null;
    if (itemMatch) {
        matchedItem = ITEMS.find(i => i.id === itemMatch[0].toUpperCase());
    } else {
        // Try to match by name or description
        matchedItem = ITEMS.find(i => lowerQuery.includes(i.name.toLowerCase()) || (i.description && lowerQuery.includes(i.description.toLowerCase())));
    }

    // --- 1. List All Items ---
    if (lowerQuery.includes('list') && (lowerQuery.includes('item') || lowerQuery.includes('product'))) {
        const headers = ['Item ID', 'Name', 'Category', 'Price'];
        const rows = ITEMS.map(i => [i.id, i.name, i.category, `$${i.price}`]);
        return `### All Available Items\n${formatTable(headers, rows)}`;
    }

    // --- 2. Item Information / Details ---
    if ((lowerQuery.includes('info') || lowerQuery.includes('detail') || lowerQuery.includes('what is')) && matchedItem) {
        return `### Item Details: ${matchedItem.name}\n- **ID:** ${matchedItem.id}\n- **Category:** ${matchedItem.category}\n- **Price:** $${matchedItem.price}\n- **Description:** ${matchedItem.description}`;
    }

    // --- 2.5. Full Inventory Report ---
    if (lowerQuery.includes('inventory') && lowerQuery.includes('report')) {
        const headers = ['Item ID', 'Name', 'Category', 'Total Stock'];
        const rows = ITEMS.map(item => {
            const inv = getInventory(item.id);
            const total = inv.reduce((sum, i) => sum + i.quantity, 0);
            return [item.id, item.name, item.category, total.toString()];
        });
        return `### Full Enterprise Inventory Report\n${formatTable(headers, rows)}\n\n<<GENERATE_REPORT>>`;
    }

    // --- 3. Inventory Check ---
    if ((lowerQuery.includes('stock') || lowerQuery.includes('inventory') || lowerQuery.includes('available')) && !lowerQuery.includes('report')) {
        if (matchedItem) {
            const inventory = getInventory(matchedItem.id);
            const total = inventory.reduce((sum, i) => sum + i.quantity, 0);

            const headers = ['Location', 'Quantity'];
            const rows = inventory.map(i => [i.location, i.quantity.toString()]);
            return `### Inventory Status: ${matchedItem.name} (${matchedItem.id})\n**Total Available:** ${total} units\n\n${formatTable(headers, rows)}\n\n<<GENERATE_REPORT>>`;
        }
        return "Please specify an Item ID (e.g., 6303173) or name to check inventory.";
    }

    // --- 3.5. Create Order ---
    if (lowerQuery.includes('create order') || lowerQuery.includes('place order')) {
        if (!matchedItem) {
            return "Please specify an Item ID (e.g., 6303173) or name to create an order.";
        }
        const qtyMatch = lowerQuery.match(/(\d+)\s*(unit|piece|item)/i) || lowerQuery.match(/(?:for\s+)?(\d+)/i);
        const qty = qtyMatch ? parseInt(qtyMatch[1], 10) : 1;
        const newOrderId = `ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        
        ORDERS.unshift({
            orderId: newOrderId,
            customerId: 'CUST-101',
            customerName: 'Enterprise Client',
            itemId: matchedItem.id,
            quantity: qty,
            status: 'Processing',
            date: new Date().toISOString().split('T')[0],
            value: matchedItem.price * qty
        });

        return `### Order Created Successfully 🎉\n- **Order ID:** ${newOrderId}\n- **Item:** ${matchedItem.name} (${matchedItem.id})\n- **Quantity:** ${qty}\n- **Total Value:** $${(matchedItem.price * qty).toLocaleString()}\n- **Status:** Processing\n\n<<GENERATE_REPORT>>`;
    }

    // --- 4. Order Status ---
    if (lowerQuery.includes('order') || lowerQuery.includes('status')) {
        const orderMatch = lowerQuery.match(/ord-\d{4}-\d{3,4}/i) || lowerQuery.match(/ord-\d{2}-\d{3,4}/i);
        if (orderMatch) {
            const orderId = orderMatch[0].toUpperCase();
            // Try to find order, might need to normalize 24 to 2024 if mock DB generates full years
            let order = getOrders().find(o => o.orderId === orderId);
            if (!order && orderId.startsWith('ORD-24-')) {
                order = getOrders().find(o => o.orderId === orderId.replace('ORD-24-', 'ORD-2024-'));
            }

            if (order) {
                if (lowerQuery.includes('table')) {
                    const headers = ['Order ID', 'Item', 'Status', 'Date'];
                    const rows = [[order.orderId, order.itemId, order.status, order.date]];
                    return `### Order Details\n${formatTable(headers, rows)}\n\n<<GENERATE_REPORT>>`;
                }
                return `### Order Status: ${order.orderId}\n- **Item:** ${order.itemId}\n- **Status:** ${order.status}\n- **Date:** ${order.date}\n- **Value:** $${order.value}`;
            }
            return `I couldn't find order **${orderId}**.`;
        }

        // List recent orders if no specific ID
        if (lowerQuery.includes('recent') || lowerQuery.includes('list')) {
            const orders = getOrders().slice(0, 5);
            const headers = ['Order ID', 'Item', 'Status', 'Value'];
            const rows = orders.map(o => [o.orderId, o.itemId, o.status, `$${o.value}`]);
            return `### Recent Orders\n${formatTable(headers, rows)}\n\n<<GENERATE_REPORT>>`;
        }
    }

    // --- 5. Sales Data & Demand Forecast ---
    if (lowerQuery.includes('sales') || lowerQuery.includes('forecast') || lowerQuery.includes('demand')) {
        if (matchedItem) {
            const forecast = getForecast(matchedItem.id);
            const headers = ['Month', 'Forecast Qty', 'Trend', 'Region'];
            const rows = forecast.slice(0, 6).map(f => [f.month, f.forecastQty.toString(), f.trend, f.region]);
            return `### Demand Forecast: ${matchedItem.name} (${matchedItem.id})\n${formatTable(headers, rows)}\n\n<<GENERATE_REPORT>>`;
        }
        return "Please specify an Item ID or name to see its sales/forecast data.";
    }

    // --- 6. Market Analysis / Competitor ---
    if (lowerQuery.includes('market') || lowerQuery.includes('competitor') || lowerQuery.includes('compare') || lowerQuery.includes('price')) {
        if (matchedItem) {
            const headers = ['Competitor', 'Price', 'Last Updated'];
            const rows = matchedItem.competitors.map(c => [c.name, `$${c.price.toFixed(2)}`, c.lastUpdated]);
            return `### Pricing Analysis: ${matchedItem.name} (${matchedItem.id})\n- **BMS Price:** $${matchedItem.price}\n- **Cummins Price:** $${matchedItem.cumminsPrice.toFixed(2)}\n\n**Other Competitors:**\n${formatTable(headers, rows)}\n\n<<GENERATE_REPORT>>`;
        }

        const relevantDocs = KNOWLEDGE_BASE.filter(doc =>
            doc.tags.some(tag => lowerQuery.includes(tag))
        );

        if (relevantDocs.length > 0) {
            const summary = relevantDocs.map(d => `- **${d.title}:** ${d.content}`).join('\n\n');
            return `### Market Insights\n${summary}\n\n<<GENERATE_REPORT>>`;
        }
        return "I don't have specific market data on that topic yet. Try asking 'compare price of 6303173' or 'engine market'.";
    }

    // --- 7. Report Generation ---
    if (lowerQuery.includes('report') || lowerQuery.includes('pdf') || lowerQuery.includes('download')) {
        return "You can download the **Report** by clicking the **PDF icon** (📄) in the top right corner of the chat window if data is available above.";
    }

    // --- 8. General Help / Fallback ---
    return `I didn't quite understand that query. I can help you with:
- **Inventory:** "Check stock for 6303173"
- **Orders:** "Status of order ORD-2024-1001"
- **Market:** "Compare price of 6303173 vs Cummins"
- **Sales:** "Show sales analysis for 6303173"
- **General:** "List all items" or "What is 4955827?"

Try asking one of these or check the **Help & Guide** for more examples.`;
};
