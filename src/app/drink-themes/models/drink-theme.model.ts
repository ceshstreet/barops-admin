import { Drink } from '../../drinks/models/drink.model';

export interface DrinkTheme {
  _id: string;
  name: string;
  description: string;
  style: string;
  targetEvent: string;
  color: string;
  drinksId: string[] | Drink[];
  notes?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export function getDrinkIds(theme: DrinkTheme): string[] {
  return (theme.drinksId || []).map((d: any) =>
    typeof d === 'string' ? d : d._id
  );
}

export function getPopulatedDrinks(theme: DrinkTheme): Drink[] {
  return (theme.drinksId || []).filter(
    (d: any) => typeof d !== 'string'
  ) as Drink[];
}

export const THEME_STYLES = [
  'Tropical', 'Classic Cocktails', 'Holiday', 'Mocktail',
  'Spirit-Based', 'Premium', 'Casual', 'Custom',
];

export const TARGET_EVENTS = [
  'Beach / Outdoor Events', 'Weddings / Corporate',
  'Holiday Events', 'Corporate / Family',
  'Birthday Parties', 'Social Gatherings', 'Any Event',
];

export const THEME_COLORS = [
  { name: 'Gold', value: '#f59e0b' },
  { name: 'Purple', value: '#a78bfa' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Green', value: '#34d399' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Lime', value: '#84cc16' },
];