export type UserRole = 'admin' | 'sales' | 'customer';

export interface Item {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  description?: string;
  competitorRef?: {
    name: string;
    price: number;
    url?: string;
    lastUpdated?: string;
  };
}

export interface InventoryItem {
  itemId: string;
  location: string;
  quantity: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

// Re-export InventoryItem as Inventory for compatibility if needed, 
// though mockDb seems to import 'Inventory' which might be a typo for 'INVENTORY' data or 'InventoryItem' type.
// The error said "Module ... has no exported member 'Inventory'".
export type Inventory = InventoryItem;

export interface Order {
  orderId: string;
  customerId: string;
  customerName?: string; // Made optional as it's missing in some mock data
  itemId: string;
  quantity: number;
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Backordered' | 'Cancelled' | 'Pending';
  date: string;
  value: number;
}

export interface SalesForecast {
  itemId: string;
  month: string;
  forecastQty: number;
  actualQty: number;
  accuracy: number;
  trend: 'Up' | 'Down';
  region?: string; // Added optional region
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
