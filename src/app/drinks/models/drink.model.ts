// drinks/models/drink.model.ts

export interface DrinkIngredient {
  name: string;
  quantity: number;
  unit: string;
}

export interface Drink {
  _id: string;
  name: string;
  category: string;
  baseSpirit: string;
  glassware: string;
  garnish: string;
  servingSize: number;
  status: boolean;
  preparation: string;
  notes: string;
  ingredients: DrinkIngredient[];
  createdAt?: string;
  updatedAt?: string;
}

// Opciones para los selects del form
export const DRINK_CATEGORIES = [
  'Classic Cocktail', 'Tropical', 'Spirit-Based',
  'Holiday', 'Mocktail', 'Custom'
];

export const BASE_SPIRITS = [
  'White Rum', 'Dark Rum', 'Tequila', 'Vodka',
  'Whiskey', 'Gin', 'Brandy', 'None / Non-Alcoholic'
];

export const GLASSWARE_OPTIONS = [
  'Highball', 'Rocks Glass', 'Coupe', 'Margarita Glass',
  'Hurricane Glass', 'Punch Glass', 'Wine Glass', 'Martini Glass',
  'Collins Glass', 'Copper Mug'
];

export const INGREDIENT_UNITS = ['ml', 'oz', 'dash', 'splash', 'unit', 'leaves', 'slice', 'cdta'];
