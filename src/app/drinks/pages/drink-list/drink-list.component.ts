import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Drink, DRINK_TYPES } from '../../models/drink.model';
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
  allDrinks: Drink[] = [];
  drinkTypes = DRINK_TYPES;

  // Main tabs
  activeTab: 'drinks' | 'calculator' = 'drinks';

  // Type filter within drinks tab
  activeType: string = 'cocktail';

  // Search
  searchTerm = '';
  filterStatus = '';

  // Event Calculator
  eventSelections: { [drinkId: string]: number } = {};
  calculatedTotals: IngredientTotal[] = [];
  totalDrinksCount = 0;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.allDrinks = MOCK_DRINKS;
  }

  // ── TYPE COUNTS ──
  getTypeCount(type: string): number {
    return this.allDrinks.filter(d => d.type === type).length;
  }

  getActiveTypeCount(type: string): number {
    return this.allDrinks.filter(d => d.type === type && d.status).length;
  }

  // ── FILTERED BY TYPE + SEARCH ──
  get filteredDrinks(): Drink[] {
    return this.allDrinks.filter(d => {
      const matchType = d.type === this.activeType;
      const matchSearch = d.name.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchStatus =
        !this.filterStatus ||
        (this.filterStatus === 'active' && d.status) ||
        (this.filterStatus === 'inactive' && !d.status);
      return matchType && matchSearch && matchStatus;
    });
  }

  // ── STATS for current type ──
  get totalForType(): number {
    return this.allDrinks.filter(d => d.type === this.activeType).length;
  }

  get activeForType(): number {
    return this.allDrinks.filter(d => d.type === this.activeType && d.status).length;
  }

  get inactiveForType(): number {
    return this.allDrinks.filter(d => d.type === this.activeType && !d.status).length;
  }

  // ── NAV ──
  viewDrink(id: string): void {
    this.router.navigate(['/drinks', id]);
  }

  editDrink(id: string): void {
    this.router.navigate(['/drinks', id, 'edit']);
  }

  switchType(type: string): void {
    this.activeType = type;
    this.searchTerm = '';
    this.filterStatus = '';
  }

  // ── CALCULATOR ──
  get activeCocktails(): Drink[] {
    return this.allDrinks.filter(d => d.type === 'cocktail' && d.status);
  }

  isCalcSelected(drinkId: string): boolean {
    return (this.eventSelections[drinkId] || 0) > 0;
  }

  get hasSelections(): boolean {
    return Object.values(this.eventSelections).some(v => v > 0);
  }

  onSelectionChange(): void {
    const map: { [key: string]: IngredientTotal } = {};
    this.totalDrinksCount = 0;

    this.activeCocktails.forEach(drink => {
      const qty = this.eventSelections[drink._id] || 0;
      if (qty > 0) {
        this.totalDrinksCount += qty;
        (drink.ingredients || []).forEach(ing => {
          const key = `${ing.name}__${ing.unit}`;
          if (!map[key]) {
            map[key] = { name: ing.name, unit: ing.unit, total: 0, displayTotal: '', sources: [] };
          }
          map[key].total += ing.quantity * qty;
          map[key].sources.push({ drink: drink.name, qty });
        });
      }
    });

    this.calculatedTotals = Object.values(map)
      .map(t => ({ ...t, displayTotal: this.formatTotal(t.total, t.unit) }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  formatTotal(value: number, unit: string): string {
    if (unit === 'ml' && value >= 1000) return `${(value / 1000).toFixed(2)} L`;
    return `${value} ${unit}`;
  }
}