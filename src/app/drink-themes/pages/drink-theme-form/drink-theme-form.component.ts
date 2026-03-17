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
    cocktailsIncluded: '',
    targetEventType: '',
    description: '',
    status: 'active'
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

  statuses = [
    'active',
    'inactive'
  ];

  saveDrinkTheme() {
    console.log('Drink Theme data:', this.drinkTheme);
    alert('Mock save: drink theme created successfully.');
    this.router.navigate(['/drink-themes']);
  }

  cancel() {
    this.router.navigate(['/drink-themes']);
  }
}