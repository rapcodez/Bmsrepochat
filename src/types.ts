export type UserRole = 'admin' | 'sales' | 'customer';

export interface CompetitorData {
  name: string;
  price: number;
  lastUpdated: string;
}

export interface Item {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  description?: string;
  cumminsPrice: number; // Benchmark
  competitors: CompetitorData[]; // 5 other competitors
}

export interface InventoryItem {
  itemId: string;
  location: string;
  type: 'DC' | 'RDC'; // Distinguish between Distribution Center and Regional DC
  quantity: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

// Re-export InventoryItem as Inventory for compatibility
export type Inventory = InventoryItem;

export interface Order {
  orderId: string;
  customerId: string;
  customerName?: string;
  itemId: string;
  quantity: number;
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Backordered' | 'Cancelled' | 'Pending';
  date: string;
  value: number;
}

export interface MarketTrend {
  itemId: string;
  month: string; // YYYY-MM
  bmsPrice: number;
  bmsSales: number;
  competitorPrices: Record<string, number>; // e.g., { "Cummins": 550, "Cat": 540 }
  competitorSales: Record<string, number>;
}

export interface SalesForecast {
  itemId: string;
  month: string;
  forecastQty: number;
  actualQty: number;
  accuracy: number;
  trend: 'Up' | 'Down';
  region?: string;
}

export interface KnowledgeBaseDoc {
  id: string;
  title: string;
  content: string;
  tags: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isOffline?: boolean;
  attachment?: {
    type: 'pdf';
    title: string;
  };
}
