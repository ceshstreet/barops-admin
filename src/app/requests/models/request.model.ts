export interface QuoteRequest {
  odooId: number;
  eventName: string;
  email: string;
  phone: string;
  eventType: string;
  eventDate: string;
  location: string;
  guests: string;
  budgetRange: string;
  rawDescription: string;
  createdAt: string | null;
}