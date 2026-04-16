// ─── Section types ─────────────────────────────────────────────────────────────

export type QuoteSectionType =
  | 'hero'        // Cover: event name, date, client, per-person pill
  | 'experience'  // Package summary + description
  | 'included'    // What's included checklist (from package services)
  | 'drinks'      // Full drink menu grid
  | 'bar_setup'   // Bar type + drink theme duo cards
  | 'pricing'     // Services table + totals
  | 'upsells'     // Optional add-ons
  | 'notes'       // Terms, notes, legal
  | 'timeline'    // What happens next (3-step process)
  | 'custom';     // Free-form section

export interface QuoteSection {
  type:               QuoteSectionType;
  visibleInPdf:       boolean;
  order:              number;
  customTitle?:       string;   // overrides the default section heading in PDF
  customDescription?: string;   // additional note shown in PDF under the section
}

export function defaultSections(): QuoteSection[] {
  return [
    { type: 'hero',       visibleInPdf: true,  order: 0 },
    { type: 'experience', visibleInPdf: true,  order: 1 },
    { type: 'included',   visibleInPdf: true,  order: 2 },
    { type: 'drinks',     visibleInPdf: true,  order: 3 },
    { type: 'bar_setup',  visibleInPdf: true,  order: 4 },
    { type: 'pricing',    visibleInPdf: true,  order: 5 },
    { type: 'upsells',    visibleInPdf: false, order: 6 },
    { type: 'notes',      visibleInPdf: true,  order: 7 },
    { type: 'timeline',   visibleInPdf: false, order: 8 },
  ];
}

export const SECTION_LABELS: Record<QuoteSectionType, string> = {
  hero:       'Cover & Event Details',
  experience: 'The Experience',
  included:   "What's Included",
  drinks:     'Drink Menu',
  bar_setup:  'Bar & Theme Setup',
  pricing:    'Investment Summary',
  upsells:    'Optional Upgrades',
  notes:      'Terms & Notes',
  timeline:   'What Happens Next',
  custom:     'Custom Section',
};

export const SECTION_ICONS: Record<QuoteSectionType, string> = {
  hero:       'auto_awesome',
  experience: 'workspace_premium',
  included:   'checklist',
  drinks:     'local_bar',
  bar_setup:  'storefront',
  pricing:    'attach_money',
  upsells:    'add_shopping_cart',
  notes:      'description',
  timeline:   'timeline',
  custom:     'edit_note',
};

// ─── Drink lines ───────────────────────────────────────────────────────────────

export type DrinkCategory = 'beer' | 'spirit' | 'wine' | 'mixer' | 'cocktail' | 'other';

export interface QuoteDrinkLine {
  drinkId?:  string;       // reference to Drink._id (optional, for catalog-sourced items)
  category:  DrinkCategory;
  name:      string;
  detail?:   string;
  quantity:  number;       // number of units / bottles
  price:     number;       // price per unit (editable, contributes to subtotal)
}

export const DRINK_CATEGORY_LABELS: Record<DrinkCategory, string> = {
  beer:     'Beers',
  spirit:   'Spirits & Liquors',
  wine:     'Wines',
  mixer:    'Mixers & Non-Alcoholic',
  cocktail: 'Signature Cocktails',
  other:    'Other Drinks',
};

export const DRINK_CATEGORY_ICONS: Record<DrinkCategory, string> = {
  beer:     'sports_bar',
  spirit:   'wine_bar',
  wine:     'local_bar',
  mixer:    'emoji_food_beverage',
  cocktail: 'cocktail',
  other:    'local_drink',
};

export const DRINK_CATEGORIES: DrinkCategory[] = ['beer', 'spirit', 'wine', 'mixer', 'cocktail', 'other'];

// ─── Add-on line ───────────────────────────────────────────────────────────────

export interface QuoteAddOnLine {
  addOnId?: string;
  name: string;
  detail?: string;
  price: number;
}

// ─── Quote ─────────────────────────────────────────────────────────────────────

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

  // ── Drink menu (custom per-quote drink list) ────────────────────────────────
  drinkLines?:         QuoteDrinkLine[];  // if set, overrides catalog drinks in PDF

  // ── Builder fields ──────────────────────────────────────────────────────────
  sections?:           QuoteSection[];
  proposalIntro?:      string;   // opening paragraph shown in the hero section
  proposalSignature?:  string;   // closing line shown in PDF footer
  language?:           'en' | 'es';

  status: 'DRAFT' | 'SENT' | 'APPROVED' | 'REJECTED' | 'EXPIRED';

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
