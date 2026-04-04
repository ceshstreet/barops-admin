export interface QuoteRequest {
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

  // 🔥 IMPORTANTE (esto faltaba)
  createdAtOdoo: string;

  // 🔥 estados del sistema
  status: 'NEW' | 'REVIEWED' | 'CLIENT_CREATED';

  isRead: boolean;

  convertedToClient: boolean;
  convertedToEvent: boolean;

  // timestamps Mongo
  createdAt?: string;
  updatedAt?: string;
}