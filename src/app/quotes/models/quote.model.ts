export interface QuoteAddOnLine {
  addOnId?: string;
  name: string;
  detail?: string;
  price: number;
}

export interface Quote {
  _id?: string;

  requestId?: string;
  odooId?: number;
  clientId?: string;

  // Client
  fullName: string;
  email: string;
  phone: string;

  // Event
  eventName: string;
  eventType: string;
  eventDate: string;
  location: string;
  guests: string;
  guestCount: number;
  budgetRange: string;

  // Package & catalog selections
  packageId?: string;
  packageName?: string;
  barTypeId?: string;
  barTypeName?: string;
  drinkThemeId?: string;
  drinkThemeName?: string;

  // Add-ons
  addOnLines?: QuoteAddOnLine[];

  // Pricing
  packageBasePrice?: number;
  pricePerGuest?: number;
  subtotal?: number;
  discount?: number;
  tax?: number;
  total?: number;

  // Notes
  notes?: string;
  internalNotes?: string;

  status: 'DRAFT' | 'SENT' | 'APPROVED' | 'REJECTED' | 'EXPIRED';

  shareToken?: string;

  createdAt?: string;
  updatedAt?: string;
}

export const QUOTE_STATUSES = [
  { value: 'DRAFT',    label: 'Draft',    color: '#94a3b8' },
  { value: 'SENT',     label: 'Sent',     color: '#60a5fa' },
  { value: 'APPROVED', label: 'Approved', color: '#34d399' },
  { value: 'REJECTED', label: 'Rejected', color: '#f87171' },
  { value: 'EXPIRED',  label: 'Expired',  color: '#f59e0b' },
] as const;

export const EVENT_TYPES = [
  'Wedding', 'Corporate Event', 'Birthday', 'Anniversary',
  'Graduation', 'Quinceañera', 'Social Gathering', 'Other',
];
