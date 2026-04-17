import { getInventory, getOrders, ITEMS, getForecast, ORDERS, saveOrders } from '../data/mockDb';

// Helper to format data as Markdown Table
const formatTable = (headers: string[], rows: any[][]) => {
    const headerRow = `| ${headers.join(' | ')} |`;
    const separatorRow = `| ${headers.map(() => '---').join(' | ')} |`;
    const dataRows = rows.map(row => `| ${row.join(' | ')} |`).join('\n');
    return `\n${headerRow}\n${separatorRow}\n${dataRows}\n`;
};

export const mockChatWithAI = async (query: string): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const lowerQuery = query.toLowerCase();

    // Extract Year if specified (e.g., "in 2025")
    const yearMatch = lowerQuery.match(/\b(20\d{2})\b/);
    const requestedYear = yearMatch ? yearMatch[1] : null;

    // --- 1. Robust Entity Extraction ---
    const matchedItems = ITEMS.filter(i => 
        lowerQuery.includes(i.id.toLowerCase()) || 
        lowerQuery.includes(i.name.toLowerCase())
    );

    const matchedItem = matchedItems.length > 0 ? matchedItems[0] : null;

    const customerMatch = lowerQuery.match(/customer\s+([a-z0-9-]+)/i);
    const customerId = customerMatch ? customerMatch[1].toUpperCase() : 'CUST-DEFAULT';

    const locationMatch = lowerQuery.match(/(?:to|location|at)\s+([a-z0-9\s]+?)(?=\s+and|\s+items|\s+qty|\s+quanity|$)/i);
    const location = locationMatch ? locationMatch[1].trim().toUpperCase() : 'MAIN WAREHOUSE';

    let orderType: 'Pick Order' | 'Stock Order' | 'Daily Order' | undefined;
    if (lowerQuery.includes('pick')) orderType = 'Pick Order';
    else if (lowerQuery.includes('stock')) orderType = 'Stock Order';
    else if (lowerQuery.includes('daily')) orderType = 'Daily Order';

    const shipViaMatch = lowerQuery.match(/ship\s+via\s+([a-z\s]+)(?=\s+|$)/i);
    const shipVia = shipViaMatch ? shipViaMatch[1].trim() : undefined;

    // --- 2. Navigation Queries ---
    if (lowerQuery.includes('navigation') || lowerQuery.includes('navigate') || lowerQuery.includes('where is') || lowerQuery.includes('which screen')) {
        if (lowerQuery.includes('inventory') || lowerQuery.includes('item') || lowerQuery.includes('stock')) {
            return `### 🧭 ERP Navigation Path\nTo access Item and Inventory information, go to:\n**Inventory Replenishment** ➔ **Items**`;
        }
        if (lowerQuery.includes('order') || lowerQuery.includes('create')) {
            return `### 🧭 ERP Navigation Path\nTo manage or create orders, go to:\n**Order Management** ➔ **Sales Orders**`;
        }
        return `### 🧭 ERP Navigation Guide\n- **Inventory:** Inventory Replenishment ➔ Items\n- **Orders:** Order Management ➔ Sales Orders`;
    }

    // --- 3. Inventory Report ---
    if (lowerQuery.includes('inventory') && lowerQuery.includes('report')) {
        const knownCategories = Array.from(new Set(ITEMS.map(i => i.category.toLowerCase())));
        const matchedCategory = knownCategories.find(cat => lowerQuery.includes(cat));
        
        let itemsToReport = ITEMS;
        if (matchedCategory) {
            itemsToReport = ITEMS.filter(i => i.category.toLowerCase() === matchedCategory);
        }

        const headers = ['Item ID', 'Name', 'Category', 'Total Stock'];
        const rows = itemsToReport.map(item => {
            const inv = getInventory(item.id);
            const total = inv.reduce((sum, i) => sum + i.quantity, 0);
            return [item.id, item.name, item.category, total.toString()];
        });
        
        return `### Inventory Report ${matchedCategory ? `(Category: ${matchedCategory.toUpperCase()})` : '(Global)'}\n${formatTable(headers, rows)}\n\n<<GENERATE_REPORT>>`;
    }

    // --- 4. Create Order ---
    if (lowerQuery.match(/(?:create|place).*(?:an\s+)?order/i) || (lowerQuery.includes('order') && (lowerQuery.includes('create') || lowerQuery.includes('place')))) {
        if (matchedItems.length === 0) return "Please specify Item IDs to create an order.";

        const orderEntries: any[] = [];
        let totalOrderValue = 0;
        const newOrderId = `ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

        matchedItems.forEach(item => {
            const itemEscaped = item.id.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
            const pattern = new RegExp(`(?:${itemEscaped}).*?(?:qty|quanity|quantity|for)\\s*(\\d+)|(\\d+)\\s*(?:of|units?\\s+of)?\\s*${itemEscaped}`, 'i');
            const match = lowerQuery.match(pattern);
            const qty = match ? parseInt(match[1] || match[2], 10) : 1;
            const value = item.price * qty;
            totalOrderValue += value;

            const entry = {
                orderId: newOrderId,
                customerId,
                customerName: `Customer ${customerId}`,
                itemId: item.id,
                quantity: qty,
                status: 'Processing' as const,
                date: new Date().toISOString().split('T')[0],
                value,
                location,
                orderType,
                shipVia
            };
            ORDERS.unshift(entry);
            orderEntries.push(entry);
        });

        saveOrders(); // PERSIST TO LOCALSTORAGE

        const breakdown = orderEntries.map(e => `- **${e.itemId}:** ${e.quantity} units ($${e.value.toFixed(2)})`).join('\n');
        let response = `### Order Created Successfully 🎉\n- **Order ID:** ${newOrderId}\n- **Customer:** ${customerId}\n- **Location:** ${location}\n- **Total Value:** $${totalOrderValue.toFixed(2)}\n\n**Items Breakdown:**\n${breakdown}\n\n- **Status:** Processing`;
        
        if (!orderType) response += `\n\n> [!TIP]\n> Order logged. Please specify if this is a **Pick Order**, **Stock Order**, or **Daily Order**.`;
        else response += `\n- **Order Type:** ${orderType}`;
        if (shipVia) response += `\n- **Ship Via:** ${shipVia}`;

        return response;
    }

    // --- 5. Order Status ---
    if (lowerQuery.includes('order') || lowerQuery.includes('status')) {
        const orderMatch = lowerQuery.match(/ord-\d{4}-\d{3,4}/i) || lowerQuery.match(/ord-\d{2}-\d{3,4}/i);
        if (orderMatch) {
            const orderId = orderMatch[0].toUpperCase();
            const matchingOrders = getOrders().filter(o => o.orderId === orderId);

            if (matchingOrders.length > 0) {
                const totalValue = matchingOrders.reduce((sum, o) => sum + o.value, 0);
                const itemsList = matchingOrders.map(o => `- **${o.itemId}:** ${o.quantity} units ($${o.value.toFixed(2)})`).join('\n');
                const firstOrder = matchingOrders[0];
                return `### Order Details: ${orderId}\n- **Customer:** ${firstOrder.customerId}\n- **Status:** ${firstOrder.status}\n- **Location:** ${firstOrder.location || 'N/A'}\n- **Total Value:** $${totalValue.toFixed(2)}\n\n**Items in this Order:**\n${itemsList}\n\n- **Tracking:** ${firstOrder.trackingNumber || 'Pending'}`;
            }
            return `I couldn't find order **${orderId}**.`;
        }
    }

    // --- 6. Sales & Forecast (with Year filtering) ---
    if (lowerQuery.includes('sales') || lowerQuery.includes('forecast') || lowerQuery.includes('demand')) {
        if (matchedItem) {
            let forecast = getForecast(matchedItem.id);
            if (requestedYear) {
                forecast = forecast.filter(f => f.month.startsWith(requestedYear));
            } else {
                forecast = forecast.slice(0, 6);
            }

            if (forecast.length === 0) return `I don't have forecast data for **${matchedItem.id}** in **${requestedYear}**.`;

            const headers = ['Month', 'Forecast Qty', 'Trend'];
            const rows = forecast.map(f => [f.month, f.forecastQty.toString(), f.trend]);
            return `### Demand Forecast: ${matchedItem.name} (${matchedItem.id}) ${requestedYear ? `for ${requestedYear}` : ''}\n${formatTable(headers, rows)}\n\n<<GENERATE_REPORT>>`;
        }
    }

    // --- 7. Pricing Analysis ---
    if (lowerQuery.includes('market') || lowerQuery.includes('competitor') || lowerQuery.includes('compare') || lowerQuery.includes('price')) {
        if (matchedItem) {
            const headers = ['Competitor', 'Price'];
            const rows = matchedItem.competitors.map(c => [c.name, `$${c.price.toFixed(2)}`]);
            return `### Pricing Analysis: ${matchedItem.name} (${matchedItem.id})\n- **BMS Price:** $${matchedItem.price.toFixed(2)}\n- **Cummins:** $${matchedItem.cumminsPrice.toFixed(2)}\n\n**Other Competitors:**\n${formatTable(headers, rows)}`;
        }
    }

    // --- 8. Fallback ---
    if (matchedItem) {
        return `### Item Details: ${matchedItem.name} (${matchedItem.id})\n- **Category:** ${matchedItem.category}\n- **Stock:** ${matchedItem.stock} total\n- **Price:** $${matchedItem.price.toFixed(2)}\n- **Description:** ${matchedItem.description}`;
    }

    return `I am your BMS ERP Assistant. Try asking:\n- "Create order for customer 10002 for items 6303173 qty 4"\n- "What is the status of order ORD-2026-1001?"\n- "Show sales forecast for 4969424E in 2025"`;
};
