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

  lastSyncedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}