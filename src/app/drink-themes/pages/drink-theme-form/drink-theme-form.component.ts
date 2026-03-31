import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-drink-theme-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './drink-theme-form.component.html',
  styleUrl: './drink-theme-form.component.scss'
})
export class DrinkThemeFormComponent {
  constructor(private router: Router) {}

  drinkTheme = {
    name: '',
    category: '',
    targetEventType: '',
    selectedDrinks: [] as string[],
    description: ''
  };

  categories = [
    'Tropical',
    'Seasonal / Party',
    'Spirit-Based',
    'Classic Cocktails',
    'Holiday',
    'Custom'
  ];

  targetEventTypes = [
    'Weddings',
    'Corporate Events',
    'Private Parties',
    'Pool Parties',
    'Holiday Events',
    'Outdoor Events',
    'Indoor Events'
  ];

  availableDrinks = [
    'Cuban Mojito',
    'Piña Colada',
    'Margarita',
    'Old Fashioned',
    'Paloma',
    'Tequila Sunrise',
    'Mai Tai',
    'Blue Hawaii',
    'Grinch Punch'
  ];

  toggleDrink(drink: string) {
    const exists = this.drinkTheme.selectedDrinks.includes(drink);

    if (exists) {
      this.drinkTheme.selectedDrinks = this.drinkTheme.selectedDrinks.filter(
        (item) => item !== drink
      );
    } else {
      this.drinkTheme.selectedDrinks = [...this.drinkTheme.selectedDrinks, drink];
    }
  }

  isSelected(drink: string): boolean {
    return this.drinkTheme.selectedDrinks.includes(drink);
  }

  saveDrinkTheme() {
    console.log('Drink Theme data:', this.drinkTheme);
    alert('Mock save: drink theme created successfully.');
    this.router.navigate(['/drink-themes']);
  }

  cancel() {
    this.router.navigate(['/drink-themes']);
  }
}