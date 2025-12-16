import { Item, Inventory, Order, SalesForecast, KnowledgeBaseDoc } from '../types';

export const ITEMS: Item[] = [
    { id: 'BMS0001', name: 'X15 Performance Engine', category: 'Engine', price: 15000, competitorRef: 'Cummins X15' },
    { id: 'BMS0002', name: 'Filtration Unit Pro', category: 'Filters', price: 250, competitorRef: 'Fleetguard FS' },
    { id: 'BMS0003', name: 'Heavy Duty Axle', category: 'Drivetrain', price: 3200, competitorRef: 'Meritor 14X' },
    { id: 'BMS0004', name: 'Transmission Control Module', category: 'Electronics', price: 850, competitorRef: 'Allison TCM' },
    { id: 'BMS0005', name: 'Heavy Duty Tire 295/75R22.5', category: 'Tires', price: 450, competitorRef: 'Michelin X Line' },
    { id: 'BMS0006', name: 'Radiator Assembly', category: 'Cooling', price: 1200, competitorRef: 'Modine 500' },
    { id: 'BMS0007', name: 'Alternator 24V', category: 'Electrical', price: 300, competitorRef: 'Delco Remy 40SI' },
    { id: 'BMS0008', name: 'Air Brake Compressor', category: 'Brakes', price: 900, competitorRef: 'Bendix BA-921' },
    { id: 'BMS0009', name: 'Fuel Injector Kit', category: 'Fuel System', price: 1800, competitorRef: 'Bosch CRIN' },
    { id: 'BMS0010', name: 'Turbocharger GT45', category: 'Engine', price: 2100, competitorRef: 'Garrett GT45' },
];

export const INVENTORY: Inventory[] = [
    { itemId: 'BMS0001', location: 'Houston DC', quantity: 5 },
    { itemId: 'BMS0001', location: 'Mexico City Plant', quantity: 12 },
    { itemId: 'BMS0002', location: 'Toronto RSC', quantity: 150 },
    { itemId: 'BMS0002', location: 'New York WH', quantity: 80 },
    { itemId: 'BMS0003', location: 'Houston DC', quantity: 8 },
    { itemId: 'BMS0005', location: 'New York WH', quantity: 200 },
    { itemId: 'BMS0010', location: 'Mexico City Plant', quantity: 3 },
];

export const ORDERS: Order[] = [
    { orderId: 'ORD-24-1001', customerId: 'CUST-001', itemId: 'BMS0001', qty: 2, status: 'Shipped', value: 30000, date: '2024-10-15' },
    { orderId: 'ORD-24-1002', customerId: 'CUST-002', itemId: 'BMS0005', qty: 20, status: 'Pending', value: 9000, date: '2024-10-16' },
    { orderId: 'ORD-24-1003', customerId: 'CUST-001', itemId: 'BMS0002', qty: 50, status: 'Shipped', value: 12500, date: '2024-10-14' },
    { orderId: 'ORD-24-1004', customerId: 'CUST-003', itemId: 'BMS0010', qty: 1, status: 'Backordered', value: 2100, date: '2024-10-17' },
];

export const SALES_FORECAST: SalesForecast[] = [
    { itemId: 'BMS0001', region: 'North America', forecastQty: 50, actualQty: 48, accuracy: 96, trend: 'Up' },
    { itemId: 'BMS0002', region: 'North America', forecastQty: 500, actualQty: 520, accuracy: 96, trend: 'Up' },
    { itemId: 'BMS0005', region: 'Europe', forecastQty: 200, actualQty: 150, accuracy: 75, trend: 'Down' },
];

export const KNOWLEDGE_BASE: KnowledgeBaseDoc[] = [
    {
        id: 'DOC-001',
        title: 'Market Analysis: BMS0001 vs Cummins X15',
        content: 'The BMS0001 X15 Performance Engine offers a 5% fuel efficiency advantage over the Cummins X15 in highway applications. However, the Cummins network provides broader service coverage. BMS0001 is priced 10% lower, making it attractive for cost-sensitive fleets.',
        tags: ['market-analysis', 'engine', 'competitor']
    },
    {
        id: 'DOC-002',
        title: 'Tire Durability Report: BMS0005',
        content: 'Field tests show BMS0005 Heavy Duty Tires last 15% longer than Michelin X Line on rough terrain, but have slightly higher rolling resistance on smooth pavement.',
        tags: ['technical', 'tires', 'performance']
    }
];

// Helper functions to simulate DB queries
export const getInventory = (itemId: string) => INVENTORY.filter(i => i.itemId === itemId);
export const getItem = (itemId: string) => ITEMS.find(i => i.id === itemId);
export const getOrders = (customerId?: string) => customerId ? ORDERS.filter(o => o.customerId === customerId) : ORDERS;
export const getForecast = (itemId: string) => SALES_FORECAST.filter(s => s.itemId === itemId);
