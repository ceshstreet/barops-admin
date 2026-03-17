import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface DrinkTheme {
  id: string;
  name: string;
  category: string;
  cocktailsIncluded: string;
  targetEventType: string;
  status: 'active' | 'inactive';
}

@Component({
  selector: 'app-drink-theme-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './drink-theme-list.component.html',
  styleUrl: './drink-theme-list.component.scss'
})
export class DrinkThemeListComponent {
  constructor(private router: Router) {}

  drinkThemes: DrinkTheme[] = [
    {
      id: 'THM-001',
      name: 'Caribbean',
      category: 'Tropical',
      cocktailsIncluded: 'Passion Fruit Mojito, Piña Colada, Painkiller, Cuba Libre',
      targetEventType: 'Beach / Outdoor Events',
      status: 'active'
    },
    {
      id: 'THM-002',
      name: 'Beach / Pool Party',
      category: 'Seasonal / Party',
      cocktailsIncluded: 'Mai Tai, Blue Hawaii, Rum Punch, Blueberry Mojito',
      targetEventType: 'Pool Parties',
      status: 'active'
    },
    {
      id: 'THM-003',
      name: 'Tequila',
      category: 'Spirit-Based',
      cocktailsIncluded: 'Paloma, Tequila Sunrise, Margarita, El Diablo',
      targetEventType: 'Private / Social Events',
      status: 'active'
    },
    {
      id: 'THM-004',
      name: 'Classic',
      category: 'Classic Cocktails',
      cocktailsIncluded: 'Old Fashioned, Martini, Cosmopolitan, Mojito',
      targetEventType: 'Weddings / Corporate',
      status: 'active'
    },
    {
      id: 'THM-005',
      name: 'Christmas',
      category: 'Holiday',
      cocktailsIncluded: 'White Christmas Margarita, Grinch Punch, Christmas Punch',
      targetEventType: 'Holiday Events',
      status: 'active'
    }
  ];

  createDrinkTheme() {
    this.router.navigate(['/drink-themes/new']);
  }

  openDrinkTheme(theme: DrinkTheme) {
    this.router.navigate(['/drink-themes', theme.id]);
  }

  getStatusClass(status: string): string {
    if (status === 'active') return 'active';
    return 'inactive';
  }
}