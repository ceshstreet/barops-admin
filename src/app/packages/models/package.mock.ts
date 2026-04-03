import { Package } from './package.model';

export const MOCK_PACKAGES: Package[] = [
  {
    _id: 'pkg-001',
    name: 'Tropical Paradise',
    description: 'Complete tropical bar for outdoor events, pool parties, and beach celebrations.',
    status: true,
    basePrice: 450,
    pricePerGuest: 8,
    minGuests: 30,
    maxGuests: 150,
    duration: '4 hours',
    barType: 'Travel Bar',
    themeIds: ['th001'], // Caribbean Vibes
    extraCocktailIds: ['6650a1b2c3d4e5f6a7b8c908'], // Moscow Mule
    beers: [
      { name: 'Corona Extra', availability: 'included' },
      { name: 'Modelo Especial', availability: 'included' },
    ],
    beverages: [
      { name: 'Agua Pura', availability: 'unlimited' },
      { name: 'Coca-Cola', availability: 'unlimited' },
      { name: 'Sprite', availability: 'unlimited' },
    ],
    wines: [],
    services: [
      { name: 'Professional Bartenders', detail: '2 bartenders', included: true },
      { name: 'Glassware', detail: 'Full set', included: true },
      { name: 'Ice & Garnishes', detail: 'All included', included: true },
      { name: 'Setup & Cleanup', detail: '30 min before/after', included: true },
      { name: 'LED Bar Counter', detail: 'Premium', included: false, addOnPrice: 150 },
    ],
  },
  {
    _id: 'pkg-002',
    name: 'Corporate Premium',
    description: 'Elegant selection for corporate events, weddings, and galas. Full premium experience.',
    status: true,
    basePrice: 750,
    pricePerGuest: 12,
    minGuests: 50,
    maxGuests: 200,
    duration: '5 hours',
    barType: 'Ultimate Bar',
    themeIds: ['th002', 'th004'], // Classic Elegance + Zero Proof
    extraCocktailIds: [],
    beers: [
      { name: 'Heineken', availability: 'included' },
      { name: 'Stella Artois', availability: 'included' },
    ],
    beverages: [
      { name: 'Agua Mineral', availability: 'unlimited' },
      { name: 'Agua Pura', availability: 'unlimited' },
      { name: 'Red Bull', availability: 'limited (50 units)' },
      { name: 'Jugo de Naranja', availability: 'unlimited' },
    ],
    wines: [
      { name: 'Malbec Reserva', detail: '3 bottles' },
      { name: 'Sauvignon Blanc', detail: '3 bottles' },
      { name: 'Prosecco', detail: '2 bottles (toast)' },
    ],
    services: [
      { name: 'Professional Bartenders', detail: '3 bartenders', included: true },
      { name: 'Premium Glassware', detail: 'Crystal set', included: true },
      { name: 'Ice & Garnishes', detail: 'Premium selection', included: true },
      { name: 'Setup & Cleanup', detail: '1 hour before/after', included: true },
      { name: 'LED Bar Counter', detail: 'Included', included: true },
      { name: 'Cocktail Menu Signs', detail: 'Custom designed', included: true },
      { name: 'Photo Booth Bar', detail: 'With props', included: false, addOnPrice: 200 },
    ],
  },
  {
    _id: 'pkg-003',
    name: 'Basic Social',
    description: 'Essential bar service for small gatherings, birthdays, and casual parties.',
    status: true,
    basePrice: 250,
    pricePerGuest: 5,
    minGuests: 15,
    maxGuests: 60,
    duration: '3 hours',
    barType: 'Travel Bar',
    themeIds: ['th001'], // Caribbean Vibes
    extraCocktailIds: [],
    beers: [
      { name: 'Pilsener', availability: 'included' },
      { name: 'Corona Extra', availability: 'included' },
    ],
    beverages: [
      { name: 'Agua Pura', availability: 'unlimited' },
      { name: 'Coca-Cola', availability: 'unlimited' },
    ],
    wines: [],
    services: [
      { name: 'Bartender', detail: '1 bartender', included: true },
      { name: 'Basic Glassware', detail: 'Standard set', included: true },
      { name: 'Ice', detail: 'Included', included: true },
    ],
  },
  {
    _id: 'pkg-004',
    name: 'Holiday Special',
    description: 'Festive themed bar for end-of-year celebrations. Available November–January only.',
    status: false,
    basePrice: 400,
    pricePerGuest: 7,
    minGuests: 25,
    maxGuests: 100,
    duration: '4 hours',
    barType: 'Stadium Bar',
    themeIds: ['th003'], // Holiday Cheer
    extraCocktailIds: ['6650a1b2c3d4e5f6a7b8c906'], // Virgin Sunrise
    beers: [
      { name: 'Corona Extra', availability: 'included' },
    ],
    beverages: [
      { name: 'Agua Pura', availability: 'unlimited' },
      { name: 'Sprite', availability: 'unlimited' },
    ],
    wines: [],
    services: [
      { name: 'Bartenders', detail: '2 bartenders', included: true },
      { name: 'Holiday Decoration', detail: 'Themed setup', included: true },
      { name: 'Ice & Garnishes', detail: 'Included', included: true },
    ],
  },
];