import { getOrders, ITEMS, getForecast, ORDERS, saveOrders, getMarketTrends, getInventory } from '../data/mockDb';

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

                return `### Order Created Successfully ✅\n\nYour order has been placed and is now live in the ERP system.\n\n- **Order ID:** ${newOrderId}\n- **Customer:** ${pending.customerId}\n- **Type:** ${pending.orderType}\n- **Total Value:** $${totalValue.toFixed(2)}\n\n<<OPEN_ORDER:${newOrderId}>>`;
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
            return `### Order Created: ${newOrderId}\n\n<<OPEN_ORDER:${newOrderId}>>`;
        }

        savePendingOrder(newPending);
        if (!newPending.customerId) return `I'll start that order for you. **Which Customer ID** is this for?`;
        return `Got the customer. Is this a **Pick Order**, **Stock Order**, or **Daily Order**?`;
    }

    // --- 3. Normal Queries ---
    let matchedItem = ITEMS.find(i => lowerQuery.includes(i.id.toLowerCase()) || lowerQuery.includes(i.name.toLowerCase()));
    
    // Expert Mapping: Map generic industry terms to specific Part IDs
    if (lowerQuery.includes('x15')) {
        matchedItem = ITEMS.find(i => i.id === '6303173');
    }

    const yearMatch = lowerQuery.match(/\b(20\d{2})\b/);
    const requestedYear = yearMatch ? yearMatch[1] : null;

    if (lowerQuery.includes('order') || lowerQuery.includes('status')) {
        const orderMatch = lowerQuery.match(/ord-(?:20)?\d{2}-\d{3,5}/i);
        if (orderMatch) {
            const orderId = orderMatch[0].toUpperCase();
            // Use local ORDERS array directly to ensure we find newly seeded orders
            const matchingOrders = ORDERS.filter(o => o.orderId === orderId);

            if (matchingOrders.length > 0) {
                const totalValue = matchingOrders.reduce((sum, o) => sum + o.value, 0);
                const itemsList = matchingOrders.map(o => `- **${o.itemId}:** ${o.quantity} units ($${o.value.toFixed(2)})`).join('\n');
                const firstOrder = matchingOrders[0];
                return `### ERP Order Details: ${orderId}\n- **Customer:** ${firstOrder.customerId}\n- **Status:** ${firstOrder.status}\n- **Location:** ${firstOrder.location || 'N/A'}\n- **Total Value:** $${totalValue.toFixed(2)}\n\n**Items in this Order:**\n${itemsList}\n\n<<OPEN_ORDER:${orderId}>>`;
            }
            return `I couldn't find order **${orderId}** in the ERP database. Please verify the ID.`;
        }
    }

    if (lowerQuery.includes('recent') && lowerQuery.includes('order')) {
        const orders = getOrders().slice(0, 5);
        const headers = ['Order ID', 'Item', 'Status', 'Value'];
        const rows = orders.map(o => [o.orderId, o.itemId, o.status, `$${o.value.toFixed(2)}`]);
        return `### Recent ERP Transactions\n${formatTable(headers, rows)}`;
    }

    // --- 3. Market Comparison & Price Analysis ---
    if (lowerQuery.includes('compare') || lowerQuery.includes('price') || lowerQuery.includes('market')) {
        if (matchedItem) {
            const trends = getMarketTrends(matchedItem.id);
            const latestTrend = trends[trends.length - 1]; // Get latest market data
            
            if (latestTrend) {
                const headers = ['Entity', 'Price Index', 'Market Share'];
                const rows = [
                    ['Cummins', `$${latestTrend.bmsPrice.toFixed(2)}`, '48%'],
                    ['Caterpillar', `$${(latestTrend.competitorPrices['Caterpillar'] || 0).toFixed(2)}`, '35%'],
                    ['Others', 'Market Average', '17%']
                ];
                return `### Market Price Comparison: ${matchedItem.name}\nAnalysis of **${matchedItem.id}** (Cummins Engine Business) vs. Primary Industry Benchmark:\n\n${formatTable(headers, rows)}\n\n<<GENERATE_REPORT>>`;
            }
        }
    }

    // --- 4. Sales Analysis & Forecasting ---
    if (lowerQuery.includes('sales') || lowerQuery.includes('forecast') || lowerQuery.includes('analysis')) {
        if (matchedItem) {
            let forecast = getForecast(matchedItem.id);
            const currentYear = 2026;
            const currentMonth = 4; // April

            // Expert Timeline: "Forecast" looks forward, "Analysis" looks at specific year
            if (lowerQuery.includes('forecast')) {
                forecast = forecast.filter(f => {
                    const [y, m] = f.month.split('-').map(Number);
                    return y > currentYear || (y === currentYear && m >= currentMonth);
                }).slice(0, 6);
            } else if (requestedYear) {
                forecast = forecast.filter(f => f.month.startsWith(requestedYear));
            } else {
                forecast = forecast.slice(0, 6);
            }
            
            const headers = ['Month', 'Forecast Qty', 'Market Trend'];
            const rows = forecast.map(f => [f.month, f.forecastQty.toString(), f.trend]);
            return `### Strategic Forecast: ${matchedItem.name} (${matchedItem.id})\nProjected demand and industry trend indicators starting from ${currentYear}-04:\n\n${formatTable(headers, rows)}\n\n<<GENERATE_REPORT>>`;
        }
    }

    // --- 5. Global Inventory ---
    if (lowerQuery.includes('inventory')) {
        let itemsToReport = ITEMS;
        let reportTitle = "Global Inventory Audit (Cummins Engine Parts)";

        // Expert Filtering: Check for specific categories in the query
        if (lowerQuery.includes('ceco')) {
            itemsToReport = ITEMS.filter(i => i.category === 'CECO');
            reportTitle = "Inventory Audit: CECO Category";
        } else if (lowerQuery.includes('other')) {
            itemsToReport = ITEMS.filter(i => i.category.includes('OTHER'));
            reportTitle = "Inventory Audit: Miscellaneous Parts";
        }

        const headers = ['Part Name', 'Category', 'Primary Location', 'Total Stock'];
        const rows = itemsToReport.slice(0, 10).map(i => {
            const inv = getInventory(i.id);
            const primaryLoc = inv.sort((a,b) => b.quantity - a.quantity)[0]?.location || 'N/A';
            return [i.name, i.category, primaryLoc, i.stock.toString()];
        });
        return `### ${reportTitle}\nDetailed stock levels for active Cummins engine business lines:\n\n${formatTable(headers, rows)}\n\n<<GENERATE_REPORT>>`;
    }

    // --- 6. Basic Item Lookup (Fallback) ---
    if (matchedItem) {
        const inv = getInventory(matchedItem.id);
        const headers = ['Location', 'Stock Level', 'Status'];
        const rows = inv.map(l => [l.location, l.quantity.toString(), l.status]);

        return `### Item Technical Details: ${matchedItem.name}\n- **Part Number:** ${matchedItem.id}\n- **Category:** ${matchedItem.category}\n- **Total System Stock:** ${matchedItem.stock}\n- **Unit Price:** $${matchedItem.price.toFixed(2)}\n\n**Warehouse Breakdown:**\n${formatTable(headers, rows)}`;
    }

    return `I am your BMS AI Assistant. I can help with:\n- "Create order for 6303173"\n- "Check status of ORD-2026-1001"\n- "Market analysis for X15 Engine"\n- "Inventory report for CECO"`;
};
