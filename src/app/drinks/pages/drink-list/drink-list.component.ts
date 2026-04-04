import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Drink, DRINK_TYPES } from '../../models/drink.model';
import { DrinkService } from '../../services/drink.service';

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
  loading = true;

  activeTab: 'drinks' | 'calculator' = 'drinks';
  activeType: string = 'cocktail';
  searchTerm = '';
  filterStatus = '';

  eventSelections: { [drinkId: string]: number } = {};
  calculatedTotals: IngredientTotal[] = [];
  totalDrinksCount = 0;

  constructor(private router: Router, private drinkService: DrinkService) {}

  ngOnInit(): void {
    this.loadDrinks();
  }

  loadDrinks(): void {
    this.loading = true;
    this.drinkService.getAll().subscribe({
      next: (drinks) => { this.allDrinks = drinks; this.loading = false; },
      error: (err) => { console.error('Error loading drinks:', err); this.loading = false; },
    });
  }

  getTypeCount(type: string): number {
    return this.allDrinks.filter(d => d.type === type).length;
  }

  get filteredDrinks(): Drink[] {
    return this.allDrinks.filter(d => {
      const matchType = d.type === this.activeType;
      const matchSearch = d.name.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchStatus = !this.filterStatus ||
        (this.filterStatus === 'active' && d.status === 'active') ||
        (this.filterStatus === 'inactive' && d.status === 'inactive');
      return matchType && matchSearch && matchStatus;
    });
  }

  get totalForType(): number { return this.allDrinks.filter(d => d.type === this.activeType).length; }
  get activeForType(): number { return this.allDrinks.filter(d => d.type === this.activeType && d.status === 'active').length; }
  get inactiveForType(): number { return this.allDrinks.filter(d => d.type === this.activeType && d.status !== 'active').length; }

  viewDrink(id: string): void { this.router.navigate(['/drinks', id]); }
  editDrink(id: string): void { this.router.navigate(['/drinks', id, 'edit']); }
  switchType(type: string): void { this.activeType = type; this.searchTerm = ''; this.filterStatus = ''; }

  // Helper to get cocktail nested fields
  getCategory(d: Drink): string { return d.cocktailDetails?.category || ''; }
  getSpirit(d: Drink): string { return d.cocktailDetails?.baseSpirit || ''; }
  getGlassware(d: Drink): string { return d.cocktailDetails?.glassware || ''; }
  getIngCount(d: Drink): number { return d.cocktailDetails?.ingredients?.length || 0; }

  get activeCocktails(): Drink[] { return this.allDrinks.filter(d => d.type === 'cocktail' && d.status === 'active'); }
  isCalcSelected(drinkId: string): boolean { return (this.eventSelections[drinkId] || 0) > 0; }
  get hasSelections(): boolean { return Object.values(this.eventSelections).some(v => v > 0); }

  onSelectionChange(): void {
    const map: { [key: string]: IngredientTotal } = {};
    this.totalDrinksCount = 0;
    this.activeCocktails.forEach(drink => {
      const qty = this.eventSelections[drink._id] || 0;
      if (qty > 0) {
        this.totalDrinksCount += qty;
        (drink.cocktailDetails?.ingredients || []).forEach(ing => {
          const key = `${ing.name}__${ing.unit}`;
          if (!map[key]) map[key] = { name: ing.name, unit: ing.unit, total: 0, displayTotal: '', sources: [] };
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