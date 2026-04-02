import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Drink } from '../../models/drink.model';
import { MOCK_DRINKS } from '../../models/drink.mock';

interface IngredientTotal {
  name: string;
  unit: string;
  total: number;
  displayTotal: string;
  sources: { drink: string; qty: number }[];
}

@Component({
  selector: 'app-drink-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './drink-list.component.html',
  styleUrl: './drink-list.component.scss',
})
export class DrinkListComponent implements OnInit {
  drinks: Drink[] = [];

  // Tab control
  activeTab: 'drinks' | 'calculator' = 'drinks';

  // Filters
  searchTerm = '';
  filterSpirit = '';
  filterCategory = '';
  filterStatus = '';

  // Event Calculator
  eventSelections: { [drinkId: string]: number } = {};
  calculatedTotals: IngredientTotal[] = [];
  totalDrinksCount = 0;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.drinks = MOCK_DRINKS;
  }

  // ── FILTRADO REACTIVO ──
  get filteredDrinks(): Drink[] {
    return this.drinks.filter(d => {
      const matchSearch = d.name.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchSpirit = !this.filterSpirit || d.baseSpirit === this.filterSpirit;
      const matchCategory = !this.filterCategory || d.category === this.filterCategory;
      const matchStatus =
        !this.filterStatus ||
        (this.filterStatus === 'active' && d.status) ||
        (this.filterStatus === 'inactive' && !d.status);
      return matchSearch && matchSpirit && matchCategory && matchStatus;
    });
  }

  // ── OPTIONS DINÁMICOS ──
  get spiritOptions(): string[] {
    return [...new Set(this.drinks.map(d => d.baseSpirit))].sort();
  }

  get categoryOptions(): string[] {
    return [...new Set(this.drinks.map(d => d.category))].sort();
  }

  // ── STATS ──
  get activeDrinks(): number {
    return this.drinks.filter(d => d.status).length;
  }

  get inactiveDrinks(): number {
    return this.drinks.filter(d => !d.status).length;
  }

  get uniqueSpirits(): number {
    return new Set(this.drinks.map(d => d.baseSpirit)).size;
  }

  get activeDrinksList(): Drink[] {
    return this.drinks.filter(d => d.status);
  }

  get hasSelections(): boolean {
    return Object.values(this.eventSelections).some(v => v > 0);
  }

  // ── NAV ──
  viewDrink(id: string): void {
    this.router.navigate(['/drinks', id]);
  }

  editDrink(id: string): void {
    this.router.navigate(['/drinks', id, 'edit']);
  }

  // ── EVENT CALCULATOR ──
  isSelected(drinkId: string): boolean {
    return (this.eventSelections[drinkId] || 0) > 0;
  }

  onSelectionChange(): void {
    const map: { [key: string]: IngredientTotal } = {};

    this.totalDrinksCount = 0;

    this.activeDrinksList.forEach(drink => {
      const qty = this.eventSelections[drink._id] || 0;
      if (qty > 0) {
        this.totalDrinksCount += qty;
        drink.ingredients.forEach(ing => {
          const key = `${ing.name}__${ing.unit}`;
          if (!map[key]) {
            map[key] = {
              name: ing.name,
              unit: ing.unit,
              total: 0,
              displayTotal: '',
              sources: [],
            };
          }
          map[key].total += ing.quantity * qty;
          map[key].sources.push({ drink: drink.name, qty });
        });
      }
    });

    this.calculatedTotals = Object.values(map)
      .map(t => ({
        ...t,
        displayTotal: this.formatTotal(t.total, t.unit),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  formatTotal(value: number, unit: string): string {
    if (unit === 'ml' && value >= 1000) {
      return `${(value / 1000).toFixed(2)} L`;
    }
    return `${value} ${unit}`;
  }
}
