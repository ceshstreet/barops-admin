export interface PackageService {
  name: string;
  detail: string;
  included: boolean;
  addOnPrice?: number;
}

export interface PackageBevItem {
  name: string;
  availability: string; // 'included', 'unlimited', 'limited (50 units)', etc.
}

export interface PackageWineItem {
  name: string;
  detail: string; // '3 bottles', '2 bottles (toast)', etc.
}

export interface Package {
  _id: string;
  name: string;
  description: string;
  status: boolean;
  // Pricing
  basePrice: number;
  pricePerGuest: number;
  // Capacity
  minGuests: number;
  maxGuests: number;
  duration: string;
  barType: string;
  // Content
  themeIds: string[];
  extraCocktailIds: string[];
  beers: PackageBevItem[];
  beverages: PackageBevItem[];
  wines: PackageWineItem[];
  // Services
  services: PackageService[];
  // Meta
  createdAt?: string;
  updatedAt?: string;
}

export const AVAILABILITY_OPTIONS = [
  'included',
  'unlimited',
  'limited (50 units)',
  'limited (100 units)',
  'on request',
];

export const DURATION_OPTIONS = [
  '2 hours', '3 hours', '4 hours', '5 hours', '6 hours', '8 hours',
];

export const DEFAULT_SERVICES: PackageService[] = [
  { name: 'Professional Bartenders', detail: '1 bartender', included: true },
  { name: 'Glassware', detail: 'Standard set', included: true },
  { name: 'Ice & Garnishes', detail: 'Included', included: true },
  { name: 'Setup & Cleanup', detail: '30 min', included: true },
  { name: 'LED Bar Counter', detail: 'Premium', included: false, addOnPrice: 150 },
  { name: 'Cocktail Menu Signs', detail: 'Custom designed', included: false, addOnPrice: 75 },
  { name: 'Photo Booth Bar', detail: 'With props', included: false, addOnPrice: 200 },
];