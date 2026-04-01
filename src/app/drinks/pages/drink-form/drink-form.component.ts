import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface Ingredient {
  name: string;
  amount: number;
  unit: string;
}

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
    preparation: '',
    notes: '',
    status: 'active',
    servingSizeMl: 0
  };

  ingredients: Ingredient[] = [
    { name: '', amount: 0, unit: 'ml' }
  ];

  categories = [
    'Classic Cocktail', 'Tropical', 'Spirit-Based',
    'Holiday', 'Mocktail', 'Custom'
  ];

  baseSpirits = [
    'White Rum', 'Dark Rum', 'Tequila', 'Vodka',
    'Whiskey', 'Gin', 'Brandy', 'None / Non-Alcoholic'
  ];

  glasswareOptions = [
    'Highball', 'Rocks Glass', 'Coupe', 'Margarita Glass',
    'Hurricane Glass', 'Punch Glass', 'Wine Glass', 'Martini Glass'
  ];

  units = ['ml', 'oz', 'pizca', 'unidad', 'dash', 'cdta'];

  statuses = ['active', 'inactive'];

  addIngredient() {
    this.ingredients.push({ name: '', amount: 0, unit: 'ml' });
  }

  removeIngredient(index: number) {
    if (this.ingredients.length > 1) {
      this.ingredients.splice(index, 1);
    }
  }

  saveDrink() {
    const drinkData = { ...this.drink, ingredients: this.ingredients };
    console.log('Drink data:', drinkData);
    alert('Mock save: drink created successfully.');
    this.router.navigate(['/drinks']);
  }

  cancel() {
    this.router.navigate(['/drinks']);
  }
}