import { Item, Inventory, Order, SalesForecast, KnowledgeBaseDoc, MarketTrend, CompetitorData } from '../types';

// --- Constants ---
const LOCATIONS = [
    { name: 'Chicago RDC', type: 'RDC' },
    { name: 'Atlanta RDC', type: 'RDC' },
    { name: 'Houston DC', type: 'DC' },
    { name: 'Los Angeles DC', type: 'DC' },
    { name: 'Seattle DC', type: 'DC' },
    { name: 'Miami DC', type: 'DC' },
    { name: 'New York DC', type: 'DC' },
    { name: 'Denver DC', type: 'DC' },
    { name: 'Toronto DC', type: 'DC' },
    { name: 'Vancouver DC', type: 'DC' },
    { name: 'Dallas DC', type: 'DC' },
    { name: 'Phoenix DC', type: 'DC' }
] as const;

const COMPETITORS = ['Cummins', 'Caterpillar', 'Detroit Diesel', 'Volvo Penta', 'John Deere', 'Navistar'];

// --- Helper to generate dates ---
const getRandomDate = (start: Date, end: Date) => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// --- 1. Items (20 Items) ---
export const ITEMS: Item[] = Array.from({ length: 20 }, (_, i) => {
    const id = `BMS${(i + 1).toString().padStart(4, '0')}`;
    const categories = ['Engine Parts', 'Transmission', 'Hydraulics', 'Electronics', 'Filters'];
    const category = categories[i % categories.length];
    const basePrice = 500 + (i * 150);
    const cumminsPrice = basePrice * (1.1 + Math.random() * 0.2); // Cummins 10-30% higher

    const competitors: CompetitorData[] = COMPETITORS.filter(c => c !== 'Cummins').map(comp => ({
        name: comp,
        price: basePrice * (0.9 + Math.random() * 0.3), // +/- 10-20%
        lastUpdated: '2024-05-15'
    }));

    return {
        id,
        name: `${category} - Series ${String.fromCharCode(65 + i)}`,
        category,
        price: basePrice,
        stock: 0, // Calculated from inventory
        description: `High performance ${category.toLowerCase()} for industrial applications.`,
        cumminsPrice,
        competitors
    };
});

// --- 2. Inventory (Distributed across 12 locations) ---
export const INVENTORY: Inventory[] = [];
ITEMS.forEach(item => {
    let totalStock = 0;
    LOCATIONS.forEach(loc => {
        // RDCs have more stock
        const isRDC = loc.type === 'RDC';
        const probability = isRDC ? 0.9 : 0.4; // RDCs almost always have stock

        if (Math.random() < probability) {
            const maxQty = isRDC ? 2000 : 500;
            const qty = Math.floor(Math.random() * maxQty);
            let status: 'In Stock' | 'Low Stock' | 'Out of Stock' = 'In Stock';
            if (qty === 0) status = 'Out of Stock';
            else if (qty < 50) status = 'Low Stock';

            INVENTORY.push({
                itemId: item.id,
                location: loc.name,
                type: loc.type,
                quantity: qty,
                status
            });
            totalStock += qty;
        }
    });
    item.stock = totalStock; // Update total stock in item definition
});

// --- 3. Orders (5 Years History) ---
export const ORDERS: Order[] = [];
const startDate = new Date('2020-01-01');
const endDate = new Date();

// Generate ~5000 orders
for (let i = 0; i < 5000; i++) {
    const item = ITEMS[Math.floor(Math.random() * ITEMS.length)];
    const qty = Math.floor(Math.random() * 20) + 1;
    const statusOptions: Order['status'][] = ['Pending', 'Shipped', 'Delivered', 'Backordered', 'Cancelled'];
    // Older orders are mostly delivered
    const date = getRandomDate(startDate, endDate);
    let status: Order['status'] = 'Delivered';

    const daysDiff = (new Date().getTime() - date.getTime()) / (1000 * 3600 * 24);
    if (daysDiff < 7) status = 'Pending';
    else if (daysDiff < 14) status = 'Shipped';
    else if (Math.random() < 0.05) status = 'Cancelled';
    else if (Math.random() < 0.05) status = 'Backordered';

    ORDERS.push({
        orderId: `ORD-${date.getFullYear()}-${(1000 + i)}`,
        customerId: `CUST-${Math.floor(Math.random() * 100) + 100}`,
        customerName: `Customer ${Math.floor(Math.random() * 100) + 100}`,
        itemId: item.id,
        quantity: qty,
        status,
        value: item.price * qty,
        date: date.toISOString().split('T')[0]
    });
}

// --- 4. Market Trends (5 Years: 2020-2024) ---
export const MARKET_TRENDS: MarketTrend[] = [];
ITEMS.forEach(item => {
    for (let year = 2020; year <= 2024; year++) {
        for (let month = 1; month <= 12; month++) {
            const dateStr = `${year}-${month.toString().padStart(2, '0')}`;

            // Base demand with some seasonality and growth
            const growthFactor = 1 + (year - 2020) * 0.05; // 5% growth per year
            const seasonality = 1 + Math.sin(month / 2) * 0.2; // Simple seasonality
            const baseDemand = 100 * growthFactor * seasonality;

            const competitorPrices: Record<string, number> = {
                'Cummins': item.cumminsPrice * (1 + (Math.random() * 0.1 - 0.05)) // Fluctuate slightly
            };
            const competitorSales: Record<string, number> = {
                'Cummins': baseDemand * 1.2 // Cummins sells more
            };

            item.competitors.forEach(comp => {
                competitorPrices[comp.name] = comp.price * (1 + (Math.random() * 0.1 - 0.05));
                competitorSales[comp.name] = baseDemand * (0.5 + Math.random() * 0.5);
            });

            MARKET_TRENDS.push({
                itemId: item.id,
                month: dateStr,
                bmsPrice: item.price,
                bmsSales: Math.floor(baseDemand * (0.8 + Math.random() * 0.4)),
                competitorPrices,
                competitorSales
            });
        }
    }
});

// --- 5. Sales Forecast (Next 12 Months) ---
export const SALES_FORECAST: SalesForecast[] = [];
ITEMS.forEach(item => {
    // Forecast for 2025
    for (let month = 1; month <= 12; month++) {
        const dateStr = `2025-${month.toString().padStart(2, '0')}`;
        const baseDemand = 120 * (1 + Math.sin(month / 2) * 0.2); // Projected demand

        SALES_FORECAST.push({
            itemId: item.id,
            month: dateStr,
            forecastQty: Math.floor(baseDemand),
            actualQty: 0, // Future
            accuracy: 0,
            trend: Math.random() > 0.5 ? 'Up' : 'Down',
            region: 'North America'
        });
    }
});

// --- 6. Knowledge Base ---
export const KNOWLEDGE_BASE: KnowledgeBaseDoc[] = [
    {
        id: 'KB001',
        title: 'Heavy Duty Engine Market Analysis 2024',
        content: 'The market for heavy-duty engines is seeing a 5% CAGR. Competitor Cummins is aggressively pricing their X15 series. BMS0001 remains competitive due to higher durability ratings.',
        tags: ['market', 'engine', 'competitor']
    },
    {
        id: 'KB002',
        title: 'Supply Chain Disruptions - Electronics',
        content: 'Global chip shortages are affecting BMS0004 and BMS0009 availability. Lead times have increased by 4 weeks. Recommend increasing safety stock in Chicago RDC.',
        tags: ['supply chain', 'risk', 'electronics']
    },
    {
        id: 'KB003',
        title: 'Competitor Pricing Strategy - Q3',
        content: 'Caterpillar has lowered prices on hydraulic components by 8% to capture market share. BMS needs to review pricing for BMS0003 and BMS0008 to maintain margins.',
        tags: ['pricing', 'competitor', 'strategy']
    }
];

// --- Helper Functions ---

export const getInventory = (itemId: string) => {
    return INVENTORY.filter(i => i.itemId === itemId);
};

export const getItem = (itemId: string) => {
    return ITEMS.find(i => i.id === itemId);
};

export const getOrders = (filter?: { itemId?: string; status?: string }) => {
    let filtered = ORDERS;
    if (filter?.itemId) filtered = filtered.filter(o => o.itemId === filter.itemId);
    if (filter?.status) filtered = filtered.filter(o => o.status === filter.status);
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 50);
};

export const getForecast = (itemId: string) => {
    return SALES_FORECAST.filter(f => f.itemId === itemId);
};

export const getMarketTrends = (itemId: string) => {
    return MARKET_TRENDS.filter(t => t.itemId === itemId).sort((a, b) => a.month.localeCompare(b.month));
};
