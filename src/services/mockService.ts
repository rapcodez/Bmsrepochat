import { getOrders, ITEMS, getForecast, ORDERS, saveOrders } from '../data/mockDb';

// Helper to format data as Markdown Table
const formatTable = (headers: string[], rows: any[][]) => {
    const headerRow = `| ${headers.join(' | ')} |`;
    const separatorRow = `| ${headers.map(() => '---').join(' | ')} |`;
    const dataRows = rows.map(row => `| ${row.join(' | ')} |`).join('\n');
    return `\n${headerRow}\n${separatorRow}\n${dataRows}\n`;
};

// Simple Persistence for Multi-Turn Conversation
const getPendingOrder = () => {
    const saved = localStorage.getItem('PENDING_ORDER');
    return saved ? JSON.parse(saved) : null;
};

const savePendingOrder = (data: any) => {
    localStorage.setItem('PENDING_ORDER', JSON.stringify(data));
};

const clearPendingOrder = () => {
    localStorage.removeItem('PENDING_ORDER');
};

export const mockChatWithAI = async (query: string): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const lowerQuery = query.toLowerCase();
    let pending = getPendingOrder();

    // --- 1. Conversational Order Finalization ---
    if (pending) {
        // Checking for Customer ID
        if (!pending.customerId) {
            const customerMatch = lowerQuery.match(/customer\s+([a-z0-9-]+)/i) || lowerQuery.match(/\b(c?u?s?t?-?\d{3,5})\b/i);
            if (customerMatch) {
                pending.customerId = customerMatch[1].toUpperCase();
                pending.customerName = `Customer ${pending.customerId}`;
                savePendingOrder(pending);
                return `Got it. Customer set to **${pending.customerId}**. \n\nOne last thing: is this a **Pick Order**, **Stock Order**, or **Daily Order**?`;
            }
            return `I have the items ready, but I need to know: **Which Customer ID** should I assign this order to?`;
        }

        // Checking for Order Type
        if (!pending.orderType) {
            if (lowerQuery.includes('pick')) pending.orderType = 'Pick Order';
            else if (lowerQuery.includes('stock')) pending.orderType = 'Stock Order';
            else if (lowerQuery.includes('daily')) pending.orderType = 'Daily Order';

            if (pending.orderType) {
                // FINALIZE ORDER
                const newOrderId = `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
                let totalValue = 0;
                
                pending.items.forEach((itemEntry: any) => {
                    const item = ITEMS.find(i => i.id === itemEntry.id);
                    const val = (item?.price || 0) * itemEntry.qty;
                    totalValue += val;
                    
                    ORDERS.unshift({
                        orderId: newOrderId,
                        customerId: pending.customerId,
                        customerName: pending.customerName,
                        itemId: itemEntry.id,
                        quantity: itemEntry.qty,
                        status: 'Processing',
                        date: new Date().toISOString().split('T')[0],
                        value: val,
                        location: 'ATLANTA RDC',
                        orderType: pending.orderType,
                        shipVia: 'BMS LOGISTICS'
                    });
                });

                saveOrders();
                clearPendingOrder();

                return `### Order Finalized: ${newOrderId} 🎉\n\nAll mandatory ERP fields have been validated and the record is now live.\n\n- **Customer:** ${pending.customerId}\n- **Type:** ${pending.orderType}\n- **Total Items:** ${pending.items.length}\n- **Total Value:** $${totalValue.toFixed(2)}\n\n[Open in BMS ERP (Order Management)](/erp/${newOrderId})\n\n<<GENERATE_REPORT>>`;
            }
            return `Order type is required for ERP processing. Please specify: **Pick**, **Stock**, or **Daily**?`;
        }
    }

    // --- 2. Initial Order Trigger ---
    if (lowerQuery.match(/(?:create|place).*(?:an\s+)?order/i)) {
        const matchedItems = ITEMS.filter(i => lowerQuery.includes(i.id.toLowerCase()) || lowerQuery.includes(i.name.toLowerCase()));
        if (matchedItems.length === 0) return "Which items would you like to order? Please provide Item IDs.";

        const itemsToOrder = matchedItems.map(item => {
            const itemEscaped = item.id.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
            const pattern = new RegExp(`(?:${itemEscaped}).*?(?:qty|quanity|quantity|for)\\s*(\\d+)|(\\d+)\\s*(?:of|units?\\s+of)?\\s*${itemEscaped}`, 'i');
            const match = lowerQuery.match(pattern);
            return { id: item.id, qty: match ? parseInt(match[1] || match[2], 10) : 1 };
        });

        // Check if customer/type already in this first message
        const customerMatch = lowerQuery.match(/customer\s+([a-z0-9-]+)/i);
        let orderType: any = null;
        if (lowerQuery.includes('pick')) orderType = 'Pick Order';
        else if (lowerQuery.includes('stock')) orderType = 'Stock Order';
        else if (lowerQuery.includes('daily')) orderType = 'Daily Order';

        const newPending = {
            items: itemsToOrder,
            customerId: customerMatch ? customerMatch[1].toUpperCase() : null,
            customerName: customerMatch ? `Customer ${customerMatch[1].toUpperCase()}` : null,
            orderType: orderType
        };

        if (newPending.customerId && newPending.orderType) {
            // If they provided EVERYTHING in one go, just create it
            const newOrderId = `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
            let totalValue = 0;
            newPending.items.forEach(itemEntry => {
                const item = ITEMS.find(i => i.id === itemEntry.id);
                const val = (item?.price || 0) * itemEntry.qty;
                totalValue += val;
                ORDERS.unshift({
                    orderId: newOrderId,
                    customerId: newPending.customerId!,
                    customerName: newPending.customerName!,
                    itemId: itemEntry.id,
                    quantity: itemEntry.qty,
                    status: 'Processing',
                    date: new Date().toISOString().split('T')[0],
                    value: val,
                    location: 'ATLANTA RDC',
                    orderType: newPending.orderType!,
                    shipVia: 'BMS LOGISTICS'
                });
            });
            saveOrders();
            return `### Order Created: ${newOrderId}\n\n[Open in BMS ERP (Order Management)](/erp/${newOrderId})\n\n<<GENERATE_REPORT>>`;
        }

        savePendingOrder(newPending);
        if (!newPending.customerId) return `I'll start that order for you. **Which Customer ID** is this for?`;
        return `Got the customer. Is this a **Pick Order**, **Stock Order**, or **Daily Order**?`;
    }

    // --- 3. Normal Queries ---
    const matchedItem = ITEMS.find(i => lowerQuery.includes(i.id.toLowerCase()) || lowerQuery.includes(i.name.toLowerCase()));
    const yearMatch = lowerQuery.match(/\b(20\d{2})\b/);
    const requestedYear = yearMatch ? yearMatch[1] : null;

    if (lowerQuery.includes('recent') && lowerQuery.includes('order')) {
        const orders = getOrders().slice(0, 5);
        const headers = ['Order ID', 'Item', 'Status', 'Value'];
        const rows = orders.map(o => [o.orderId, o.itemId, o.status, `$${o.value.toFixed(2)}`]);
        return `### Recent ERP Transactions\n${formatTable(headers, rows)}`;
    }

    if (lowerQuery.includes('sales') || lowerQuery.includes('forecast')) {
        if (matchedItem) {
            let forecast = getForecast(matchedItem.id);
            if (requestedYear) forecast = forecast.filter(f => f.month.startsWith(requestedYear));
            else forecast = forecast.slice(0, 6);
            const headers = ['Month', 'Forecast Qty', 'Trend'];
            const rows = forecast.map(f => [f.month, f.forecastQty.toString(), f.trend]);
            return `### Demand Forecast: ${matchedItem.name} (${matchedItem.id})\n${formatTable(headers, rows)}\n\n<<GENERATE_REPORT>>`;
        }
    }

    if (lowerQuery.includes('inventory') && lowerQuery.includes('report')) {
        const headers = ['Item ID', 'Name', 'Stock'];
        const rows = ITEMS.slice(0, 10).map(i => [i.id, i.name, i.stock.toString()]);
        return `### Global Inventory Report\n${formatTable(headers, rows)}\n\n<<GENERATE_REPORT>>`;
    }

    if (matchedItem) {
        return `### Item Details: ${matchedItem.name} (${matchedItem.id})\n- **Category:** ${matchedItem.category}\n- **Current Stock:** ${matchedItem.stock}\n- **Unit Price:** $${matchedItem.price.toFixed(2)}`;
    }

    return `I am your BMS AI Assistant. You can:\n- "Create order for 6303173"\n- "Show recent orders"\n- "Generate inventory report"`;
};
