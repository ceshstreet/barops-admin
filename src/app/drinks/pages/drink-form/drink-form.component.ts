import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-drink-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './drink-form.component.html',
  styleUrl: './drink-form.component.scss'
})
export class DrinkFormComponent {
  constructor(private router: Router) {}

  drink = {
    name: '',
    category: '',
    baseSpirit: '',
    glassware: '',
    garnish: '',
    ingredients: '',
    preparation: '',
    notes: '',
    status: 'active'
  };

  categories = [
    'Classic Cocktail',
    'Tropical',
    'Spirit-Based',
    'Holiday',
    'Mocktail',
    'Custom'
  ];

  baseSpirits = [
    'White Rum',
    'Dark Rum',
    'Tequila',
    'Vodka',
    'Whiskey',
    'Gin',
    'Brandy',
    'None / Non-Alcoholic'
  ];

  glasswareOptions = [
    'Highball',
    'Rocks Glass',
    'Coupe',
    'Margarita Glass',
    'Hurricane Glass',
    'Punch Glass',
    'Wine Glass',
    'Martini Glass'
  ];

  statuses = [
    'active',
    'inactive'
  ];

  saveDrink() {
    console.log('Drink data:', this.drink);
    alert('Mock save: drink created successfully.');
    this.router.navigate(['/drinks']);
  }

  cancel() {
    this.router.navigate(['/drinks']);
  }
}