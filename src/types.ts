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
