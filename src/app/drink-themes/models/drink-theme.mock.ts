import { DrinkTheme } from './drink-theme.model';

export const MOCK_THEMES: DrinkTheme[] = [
  {
    _id: 'th001',
    name: 'Caribbean Vibes',
    description: 'Tropical cocktails that transport your guests to the beach. Perfect for outdoor summer events.',
    style: 'Tropical',
    targetEvent: 'Beach / Outdoor Events',
    color: '#f59e0b',
    drinkIds: [
      '6650a1b2c3d4e5f6a7b8c902', // Piña Colada
      '6650a1b2c3d4e5f6a7b8c901', // Cuban Mojito
      '6650a1b2c3d4e5f6a7b8c907', // Daiquiri
    ],
    status: true,
  },
  {
    _id: 'th002',
    name: 'Classic Elegance',
    description: 'Timeless cocktails for sophisticated gatherings. Refined and universally loved.',
    style: 'Classic Cocktails',
    targetEvent: 'Weddings / Corporate',
    color: '#a78bfa',
    drinkIds: [
      '6650a1b2c3d4e5f6a7b8c904', // Old Fashioned
      '6650a1b2c3d4e5f6a7b8c903', // Margarita
      '6650a1b2c3d4e5f6a7b8c909', // Daiquiri
      '6650a1b2c3d4e5f6a7b8c901', // Cuban Mojito
    ],
    status: true,
  },
  {
    _id: 'th003',
    name: 'Holiday Cheer',
    description: 'Festive drinks for seasonal celebrations. Colorful, fun, and crowd-pleasing.',
    style: 'Holiday',
    targetEvent: 'Holiday Events',
    color: '#ef4444',
    drinkIds: [
      '6650a1b2c3d4e5f6a7b8c905', // Grinch Punch
      '6650a1b2c3d4e5f6a7b8c902', // Piña Colada
    ],
    status: true,
  },
  {
    _id: 'th004',
    name: 'Zero Proof',
    description: 'Premium non-alcoholic options for inclusive events. Nobody feels left out.',
    style: 'Mocktail',
    targetEvent: 'Corporate / Family',
    color: '#34d399',
    drinkIds: [
      '6650a1b2c3d4e5f6a7b8c906', // Virgin Sunrise
    ],
    status: true,
  },
];