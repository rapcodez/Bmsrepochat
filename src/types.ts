export type UserRole = 'admin' | 'sales' | 'customer';

export interface Item {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  description: string;
  competitorRef?: {
    name: string;
    price: number;
    url: string;
  };
}

export interface InventoryItem {
  itemId: string;
  location: string;
  quantity: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

export interface Order {
  orderId: string;
  customerName: string;
  itemId: string;
  quantity: number;
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Backordered' | 'Cancelled';
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
