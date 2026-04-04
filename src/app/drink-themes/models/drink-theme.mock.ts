import { DrinkTheme } from './drink-theme.model';

// Temporary mock data until drink-themes backend is created.
export const MOCK_THEMES: DrinkTheme[] = [
  {
    _id: 'th001',
    name: 'Caribbean Vibes',
    description: 'Tropical cocktails that transport your guests to the beach.',
    style: 'Tropical',
    targetEvent: 'Beach / Outdoor Events',
    color: '#f59e0b',
    drinkIds: [],
    status: true,
  },
  {
    _id: 'th002',
    name: 'Classic Elegance',
    description: 'Timeless cocktails for sophisticated gatherings.',
    style: 'Classic Cocktails',
    targetEvent: 'Weddings / Corporate',
    color: '#a78bfa',
    drinkIds: [],
    status: true,
  },
  {
    _id: 'th003',
    name: 'Holiday Cheer',
    description: 'Festive drinks for seasonal celebrations.',
    style: 'Holiday',
    targetEvent: 'Holiday Events',
    color: '#ef4444',
    drinkIds: [],
    status: true,
  },
  {
    _id: 'th004',
    name: 'Zero Proof',
    description: 'Premium non-alcoholic options for inclusive events.',
    style: 'Mocktail',
    targetEvent: 'Corporate / Family',
    color: '#34d399',
    drinkIds: [],
    status: true,
  },
];