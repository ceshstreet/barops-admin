export interface DrinkIngredient {
  name: string;
  quantity: number;
  unit: string;
}

export interface Drink {
  _id: string;
  name: string;
  type: 'cocktail' | 'beer' | 'beverage' | 'wine';
  // Cocktail fields
  category?: string;
  baseSpirit?: string;
  glassware?: string;
  garnish?: string;
  servingSize?: number;
  preparation?: string;
  ingredients?: DrinkIngredient[];
  // Beer / Wine / Beverage fields
  subtype?: string;
  brand?: string;
  origin?: string;
  size?: string;
  // Common
  notes: string;
  status: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ── Type config for UI ──
export const DRINK_TYPES = [
  { value: 'cocktail', label: 'Cocktails', icon: '🍸', color: '#a78bfa' },
  { value: 'beer', label: 'Beers', icon: '🍺', color: '#f59e0b' },
  { value: 'beverage', label: 'Beverages', icon: '💧', color: '#38bdf8' },
  { value: 'wine', label: 'Wine', icon: '🍷', color: '#ef4444' },
] as const;

// ── Cocktail options ──
export const DRINK_CATEGORIES = [
  'Classic Cocktail', 'Tropical', 'Spirit-Based',
  'Holiday', 'Mocktail', 'Custom',
];

export const BASE_SPIRITS = [
  'White Rum', 'Dark Rum', 'Tequila', 'Vodka',
  'Whiskey', 'Gin', 'Brandy', 'None / Non-Alcoholic',
];

export const GLASSWARE_OPTIONS = [
  'Highball', 'Rocks Glass', 'Coupe', 'Margarita Glass',
  'Hurricane Glass', 'Punch Glass', 'Wine Glass', 'Martini Glass',
  'Collins Glass', 'Copper Mug',
];

export const INGREDIENT_UNITS = ['ml', 'oz', 'dash', 'splash', 'unit', 'leaves', 'slice', 'cdta'];

// ── Beer options ──
export const BEER_SUBTYPES = ['Lager', 'Pilsner', 'IPA', 'Stout', 'Ale', 'Wheat', 'Porter', 'Amber'];

// ── Beverage options ──
export const BEVERAGE_SUBTYPES = ['Water', 'Soft Drink', 'Juice', 'Energy', 'Tonic', 'Mixer'];

// ── Wine options ──
export const WINE_SUBTYPES = ['Red', 'White', 'Rosé', 'Sparkling', 'Dessert'];