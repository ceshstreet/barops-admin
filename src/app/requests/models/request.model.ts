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
  status: 'NEW' | 'REVIEWED' | 'CLIENT_CREATED';
  isRead: boolean;
  rawDescription: string;
  createdAt: string | null;



}