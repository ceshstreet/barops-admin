import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Drink, DrinkIngredient, DRINK_TYPES,
  DRINK_CATEGORIES, BASE_SPIRITS, GLASSWARE_OPTIONS, INGREDIENT_UNITS,
  BEER_SUBTYPES, BEVERAGE_SUBTYPES, WINE_SUBTYPES,
} from '../../models/drink.model';
import { MOCK_DRINKS } from '../../models/drink.mock';

@Component({
  selector: 'app-drink-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './drink-form.component.html',
  styleUrl: './drink-form.component.scss',
})
export class DrinkFormComponent implements OnInit {
  isEdit = false;
  drinkId: string | null = null;

  // Type
  drinkTypes = DRINK_TYPES;
  selectedType: string = 'cocktail';

  // Common
  name = '';
  notes = '';
  status = 'active';

  // Cocktail
  category = '';
  baseSpirit = '';
  glassware = '';
  garnish = '';
  servingSize = 0;
  preparation = '';
  ingredients: DrinkIngredient[] = [{ name: '', quantity: 0, unit: 'ml' }];

  // Beer / Beverage / Wine
  subtype = '';
  brand = '';
  origin = '';
  size = '';

  // Options
  categories = DRINK_CATEGORIES;
  baseSpirits = BASE_SPIRITS;
  glasswareOptions = GLASSWARE_OPTIONS;
  units = INGREDIENT_UNITS;
  beerSubtypes = BEER_SUBTYPES;
  bevSubtypes = BEVERAGE_SUBTYPES;
  wineSubtypes = WINE_SUBTYPES;
  sizes = ['250ml', '300ml', '330ml', '350ml', '355ml', '473ml', '500ml', '750ml', '1L'];
  statuses = ['active', 'inactive'];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.drinkId = this.route.snapshot.paramMap.get('id');

    if (this.drinkId) {
      this.isEdit = true;
      const found = MOCK_DRINKS.find(d => d._id === this.drinkId);
      if (found) {
        this.selectedType = found.type;
        this.name = found.name;
        this.notes = found.notes;
        this.status = found.status ? 'active' : 'inactive';

        if (found.type === 'cocktail') {
          this.category = found.category || '';
          this.baseSpirit = found.baseSpirit || '';
          this.glassware = found.glassware || '';
          this.garnish = found.garnish || '';
          this.servingSize = found.servingSize || 0;
          this.preparation = found.preparation || '';
          this.ingredients = (found.ingredients || []).map(i => ({ ...i }));
          if (this.ingredients.length === 0) {
            this.ingredients = [{ name: '', quantity: 0, unit: 'ml' }];
          }
        } else {
          this.subtype = found.subtype || '';
          this.brand = found.brand || '';
          this.origin = found.origin || '';
          this.size = found.size || '';
        }
      }
    }
  }

  get activeType() {
    return this.drinkTypes.find(t => t.value === this.selectedType)!;
  }

  switchType(type: string): void {
    this.selectedType = type;
  }

  // ── Ingredients ──
  addIngredient(): void {
    this.ingredients.push({ name: '', quantity: 0, unit: 'ml' });
  }

  removeIngredient(index: number): void {
    if (this.ingredients.length > 1) {
      this.ingredients.splice(index, 1);
    }
  }

  // ── Save ──
  saveDrink(): void {
    const base: any = {
      type: this.selectedType,
      name: this.name,
      notes: this.notes,
      status: this.status === 'active',
    };

    if (this.selectedType === 'cocktail') {
      base.category = this.category;
      base.baseSpirit = this.baseSpirit;
      base.glassware = this.glassware;
      base.garnish = this.garnish;
      base.servingSize = this.servingSize;
      base.preparation = this.preparation;
      base.ingredients = this.ingredients.filter(i => i.name.trim() !== '');
    } else {
      base.subtype = this.subtype;
      base.brand = this.brand;
      base.size = this.size;
      if (this.selectedType === 'beer' || this.selectedType === 'wine') {
        base.origin = this.origin;
      }
    }

    console.log('💾 Drink payload:', base);
    alert(`Mock ${this.isEdit ? 'update' : 'create'}: ${base.name} (${base.type})`);
    this.router.navigate(['/drinks']);
  }

  cancel(): void {
    this.router.navigate(['/drinks']);
  }
}