export interface DrinkTheme {
  _id: string;
  name: string;
  description: string;
  style: string;
  targetEvent: string;
  color: string;
  drinkIds: string[];
  status: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const THEME_STYLES = [
  'Tropical',
  'Classic Cocktails',
  'Spirit-Based',
  'Holiday',
  'Mocktail',
  'Custom',
];

export const TARGET_EVENTS = [
  'Weddings / Corporate',
  'Beach / Outdoor Events',
  'Private Parties',
  'Pool Parties',
  'Holiday Events',
  'Corporate / Family',
  'Indoor Events',
];

export const THEME_COLORS = [
  { name: 'Gold', value: '#f59e0b' },
  { name: 'Purple', value: '#a78bfa' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Green', value: '#34d399' },
  { name: 'Blue', value: '#38bdf8' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Pink', value: '#f472b6' },
  { name: 'Teal', value: '#2dd4bf' },
];