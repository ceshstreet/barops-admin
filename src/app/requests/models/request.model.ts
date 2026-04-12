export interface LinkedClient {
  _id: string;
  name: string;
  lastName: string;
  email: string;
  phone: string;
  status: boolean;
  clientData?: {
    preferredContact?: 'WHATSAPP' | 'EMAIL' | 'PHONE';
    notes?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface QuoteRequest {
  _id?: string;

  odooId: number;
  eventName: string;
  fullName: string;
  email: string;
  phone: string;

  eventType: string;
  eventDate: string;
  location: string;
  guests: string;
  budgetRange: string;

  rawDescription: string;
  createdAtOdoo: string;

  status: 'NEW' | 'REVIEWED' | 'CLIENT_CREATED';
  isRead: boolean;
  convertedToClient: boolean;
  convertedToEvent: boolean;

  clientId?: string | LinkedClient | null;
  quoteId?:  string | null;

  lastSyncedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}