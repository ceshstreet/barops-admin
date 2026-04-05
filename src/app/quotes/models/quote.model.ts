export interface Quote {
  _id?: string;

  requestId?: string;
  odooId?: number;
  clientId?: string;

  fullName: string;
  email: string;
  phone: string;

  eventName: string;
  eventType: string;
  eventDate: string;
  location: string;
  guests: string;
  budgetRange: string;

  barTypeId?: string;
  packageId?: string;
  drinkThemeId?: string;

  selectedDrinks?: string[];

  notes?: string;
  internalNotes?: string;

  subtotal?: number;
  discount?: number;
  tax?: number;
  total?: number;

  status: 'DRAFT' | 'SENT' | 'APPROVED' | 'REJECTED' | 'EXPIRED';

  createdAt?: string;
  updatedAt?: string;
}