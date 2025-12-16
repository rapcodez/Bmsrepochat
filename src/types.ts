export type UserRole = 'Admin' | 'Sales' | 'Customer';

export interface Item {
  id: string;
  name: string;
  category: string;
  price: number;
  competitorRef: string;
}

export interface Inventory {
  itemId: string;
  location: string;
  quantity: number;
}

export interface Order {
  orderId: string;
  customerId: string;
  itemId: string;
  qty: number;
  status: 'Shipped' | 'Pending' | 'Backordered';
  value: number;
  date: string;
}

export interface SalesForecast {
  itemId: string;
  region: string;
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
