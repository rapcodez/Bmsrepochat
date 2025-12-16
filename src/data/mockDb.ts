import { Item, Inventory, Order, SalesForecast, KnowledgeBaseDoc } from '../types';

// --- Constants ---
const LOCATIONS = [
    'Houston DC', 'Chicago RDC', 'Atlanta RDC', 'Los Angeles DC', 'Seattle DC',
    'Miami DC', 'New York DC', 'Denver DC', 'Toronto DC', 'Vancouver DC'
];

const COMPETITORS = ['Cummins', 'Caterpillar', 'Detroit Diesel', 'Volvo Penta'];

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

    return {
        id,
        name: `${category} - Series ${String.fromCharCode(65 + i)}`,
        category,
        price: basePrice,
        stock: Math.floor(Math.random() * 1000), // Added required stock
        description: `High performance ${category.toLowerCase()} for industrial applications.`, // Added description (optional in types but good to have)
        competitorRef: {
            name: COMPETITORS[i % COMPETITORS.length],
            price: basePrice * (0.9 + Math.random() * 0.3), // Competitor price +/- 10-20%
            lastUpdated: '2024-05-15'
        }
    };
});

// --- 2. Inventory (Distributed across 10 locations) ---
export const INVENTORY: Inventory[] = [];
ITEMS.forEach(item => {
    LOCATIONS.forEach(loc => {
        // Randomize inventory: some locations might be empty
        if (Math.random() > 0.2) {
            const qty = Math.floor(Math.random() * 500);
            let status: 'In Stock' | 'Low Stock' | 'Out of Stock' = 'In Stock';
            if (qty === 0) status = 'Out of Stock';
            else if (qty < 50) status = 'Low Stock';

            INVENTORY.push({
                itemId: item.id,
                location: loc,
                quantity: qty,
                status: status // Added required status
            });
        }
    });
});

// --- 3. Orders (< 2000 records, mixed status) ---
export const ORDERS: Order[] = Array.from({ length: 1850 }, (_, i) => {
    const item = ITEMS[Math.floor(Math.random() * ITEMS.length)];
    const qty = Math.floor(Math.random() * 10) + 1;
    const statusOptions: Order['status'][] = ['Pending', 'Shipped', 'Delivered', 'Backordered', 'Cancelled'];
    const status = statusOptions[Math.floor(Math.random() * statusOptions.length)];
    const date = getRandomDate(new Date('2023-01-01'), new Date());

    return {
        orderId: `ORD-24-${(1000 + i)}`,
        customerId: `CUST-${Math.floor(Math.random() * 100) + 100}`,
        customerName: `Customer ${Math.floor(Math.random() * 100) + 100}`, // Added optional customerName
        itemId: item.id,
        quantity: qty,
        status,
        value: item.price * qty,
        date: date.toISOString().split('T')[0]
    };
});

// --- 4. Sales Forecast (5 Years History + Forecast) ---
export const SALES_FORECAST: SalesForecast[] = [];
ITEMS.forEach(item => {
    // Generate data for 2020-2024 (History) and 2025 (Forecast)
    for (let year = 2020; year <= 2025; year++) {
        const isForecast = year === 2025;
        const baseDemand = Math.floor(Math.random() * 5000) + 1000;

        SALES_FORECAST.push({
            itemId: item.id,
            month: `${year}-01`, // Added required month (using YYYY-MM format as placeholder)
            region: 'North America', // Simplified for chart aggregation
            forecastQty: baseDemand,
            actualQty: isForecast ? 0 : baseDemand * (0.8 + Math.random() * 0.4), // +/- 20% variance
            accuracy: isForecast ? 0 : Math.floor(Math.random() * 20) + 80, // 80-100%
            trend: Math.random() > 0.5 ? 'Up' : 'Down'
        });
    }
});

// --- 5. Knowledge Base (Market Analysis) ---
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
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 50); // Return top 50 recent
};

export const getForecast = (itemId: string) => {
    return SALES_FORECAST.filter(f => f.itemId === itemId);
};
