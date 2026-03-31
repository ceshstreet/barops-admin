import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface DrinkTheme {
  id: string;
  name: string;
  category: string;
  drinks: string[];
  targetEventType: string;
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
      drinks: ['Cuban Mojito', 'Piña Colada', 'Mai Tai'],
      targetEventType: 'Beach / Outdoor Events'
    },
    {
      id: 'THM-002',
      name: 'Classic',
      category: 'Classic Cocktails',
      drinks: ['Margarita', 'Old Fashioned', 'Cuban Mojito'],
      targetEventType: 'Weddings / Corporate'
    },
    {
      id: 'THM-003',
      name: 'Christmas',
      category: 'Holiday',
      drinks: ['Grinch Punch', 'Piña Colada'],
      targetEventType: 'Holiday Events'
    }
  ];

  createDrinkTheme() {
    this.router.navigate(['/drink-themes/new']);
  }

  openDrinkTheme(theme: DrinkTheme) {
    this.router.navigate(['/drink-themes', theme.id]);
  }

  getDrinkCount(theme: DrinkTheme): number {
    return theme.drinks.length;
  }
}