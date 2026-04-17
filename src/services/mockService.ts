import { getInventory, getOrders, ITEMS, getForecast, ORDERS } from '../data/mockDb';

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

    // --- 1. Robust Entity Extraction ---
    
    // Extract ALL matched items by scanning the query for known item IDs or names
    const matchedItems = ITEMS.filter(i => 
        lowerQuery.includes(i.id.toLowerCase()) || 
        lowerQuery.includes(i.name.toLowerCase())
    );

    // Primary matched item (first one found)
    const matchedItem = matchedItems.length > 0 ? matchedItems[0] : null;

    // Extract Customer ID (look for "customer 12345")
    const customerMatch = lowerQuery.match(/customer\s+([a-z0-9-]+)/i);
    const customerId = customerMatch ? customerMatch[1].toUpperCase() : 'CUST-DEFAULT';

    // Extract Location (look for "to [location]" or "location [location]")
    const locationMatch = lowerQuery.match(/(?:to|location|at)\s+([a-z0-9\s]+?)(?=\s+and|\s+items|\s+qty|\s+quanity|$)/i);
    const location = locationMatch ? locationMatch[1].trim().toUpperCase() : 'MAIN WAREHOUSE';

    // Extract Order Type
    let orderType: 'Pick Order' | 'Stock Order' | 'Daily Order' | undefined;
    if (lowerQuery.includes('pick')) orderType = 'Pick Order';
    else if (lowerQuery.includes('stock')) orderType = 'Stock Order';
    else if (lowerQuery.includes('daily')) orderType = 'Daily Order';

    // Extract Ship Via
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
        return `### 🧭 ERP Navigation Guide\nHere are common paths:\n- **Inventory:** Inventory Replenishment ➔ Items\n- **Orders:** Order Management ➔ Sales Orders`;
    }

    // --- 3. Inventory Report (Categorized) ---
    if (lowerQuery.includes('inventory') && lowerQuery.includes('report')) {
        // Find category explicitly by scanning query for known category IDs
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

    // --- 4. Create Order (Multi-Item & ERP Ready) ---
    if (lowerQuery.match(/(?:create|place).*(?:an\s+)?order/i) || (lowerQuery.includes('order') && (lowerQuery.includes('create') || lowerQuery.includes('place')))) {
        if (matchedItems.length === 0) {
            return "Please specify Item IDs (e.g., 6303173) to create an order.";
        }

        const orderEntries: any[] = [];
        let totalOrderValue = 0;
        const newOrderId = `ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

        matchedItems.forEach(item => {
            // Find quantity specifically for THIS item
            const itemEscaped = item.id.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
            // Look for patterns like "6303173 quantity 4" or "4 units of 6303173"
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

        const breakdown = orderEntries.map(e => `- **${e.itemId}:** ${e.quantity} units ($${e.value.toLocaleString()})`).join('\n');
        
        let response = `### Order Created Successfully 🎉\n- **Order ID:** ${newOrderId}\n- **Customer:** ${customerId}\n- **Location:** ${location}\n- **Total Value:** $${totalOrderValue.toLocaleString()}\n\n**Items Breakdown:**\n${breakdown}\n\n- **Status:** Processing`;
        
        if (!orderType) {
            response += `\n\n> [!TIP]\n> This order has been logged. Please specify if this is a **Pick Order**, **Stock Order**, or **Daily Order** to update the shipment profile.`;
        } else {
            response += `\n- **Order Type:** ${orderType}`;
        }
        
        if (shipVia) response += `\n- **Ship Via:** ${shipVia}`;

        return response;
    }

    // --- 5. Order Status ---
    if (lowerQuery.includes('order') || lowerQuery.includes('status')) {
        const orderMatch = lowerQuery.match(/ord-\d{4}-\d{3,4}/i) || lowerQuery.match(/ord-\d{2}-\d{3,4}/i);
        if (orderMatch) {
            const orderId = orderMatch[0].toUpperCase();
            const order = getOrders().find(o => o.orderId === orderId);

            if (order) {
                return `### Order Status: ${order.orderId}\n- **Item:** ${order.itemId}\n- **Status:** ${order.status}\n- **Location:** ${order.location || 'N/A'}\n- **Value:** $${order.value.toLocaleString()}\n- **Tracking:** ${order.trackingNumber || 'Pending'}`;
            }
            return `I couldn't find order **${orderId}**.`;
        }
        
        if (lowerQuery.includes('recent') || lowerQuery.includes('list')) {
            const orders = getOrders().slice(0, 5);
            const headers = ['Order ID', 'Item', 'Status', 'Value'];
            const rows = orders.map(o => [o.orderId, o.itemId, o.status, `$${o.value}`]);
            return `### Recent Orders\n${formatTable(headers, rows)}`;
        }
    }

    // --- 6. Sales & Forecast ---
    if (lowerQuery.includes('sales') || lowerQuery.includes('forecast') || lowerQuery.includes('demand')) {
        if (matchedItem) {
            const forecast = getForecast(matchedItem.id);
            const headers = ['Month', 'Forecast Qty', 'Trend'];
            const rows = forecast.slice(0, 6).map(f => [f.month, f.forecastQty.toString(), f.trend]);
            return `### Demand Forecast: ${matchedItem.name}\n${formatTable(headers, rows)}\n\n<<GENERATE_REPORT>>`;
        }
    }

    // --- 7. Pricing Analysis ---
    if (lowerQuery.includes('market') || lowerQuery.includes('competitor') || lowerQuery.includes('compare') || lowerQuery.includes('price')) {
        if (matchedItem) {
            const headers = ['Competitor', 'Price'];
            const rows = matchedItem.competitors.map(c => [c.name, `$${c.price.toFixed(2)}`]);
            return `### Pricing Analysis: ${matchedItem.name}\n- **BMS Price:** $${matchedItem.price}\n- **Cummins:** $${matchedItem.cumminsPrice}\n${formatTable(headers, rows)}`;
        }
    }

    // --- 8. Fallback / Item Details ---
    if (matchedItem) {
        return `### Item Details: ${matchedItem.name}\n- **ID:** ${matchedItem.id}\n- **Category:** ${matchedItem.category}\n- **Stock:** ${matchedItem.stock} total\n- **Description:** ${matchedItem.description}`;
    }

    return `I am your BMS ERP Assistant. I can help with:\n- **Orders:** "Create order for customer 10002 to Chicago RDC for items 6303173 qty 4 and 4969424E qty 2"\n- **Inventory:** "Generate inventory report for CECO"\n- **Analysis:** "Show sales forecast for 6303173"`;
};
