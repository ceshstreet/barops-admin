import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  DrinkIngredient, DRINK_TYPES,
  DRINK_CATEGORIES, BASE_SPIRITS, GLASSWARE_OPTIONS, INGREDIENT_UNITS,
  BEER_SUBTYPES, BEVERAGE_SUBTYPES, WINE_SUBTYPES, MIXER_SUBTYPES, SIZE_OPTIONS,
} from '../../models/drink.model';
import { DrinkService } from '../../services/drink.service';

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
  saving = false;

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
  drinkType = '';  // maps to backend "drinkType"
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
  mixerSubtypes = MIXER_SUBTYPES;
  sizes = SIZE_OPTIONS;
  statuses = ['active', 'inactive'];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private drinkService: DrinkService,
  ) {}

  ngOnInit(): void {
    this.drinkId = this.route.snapshot.paramMap.get('id');

    if (this.drinkId) {
      this.isEdit = true;
      this.drinkService.getById(this.drinkId).subscribe({
        next: (drink) => {
          this.selectedType = drink.type;
          this.name = drink.name;
          this.notes = drink.notes || '';
          this.status = drink.status || 'active';

          if (drink.type === 'cocktail' && drink.cocktailDetails) {
            this.category = drink.cocktailDetails.category || '';
            this.baseSpirit = drink.cocktailDetails.baseSpirit || '';
            this.glassware = drink.cocktailDetails.glassware || '';
            this.garnish = drink.cocktailDetails.garnish || '';
            this.servingSize = drink.cocktailDetails.servingSize || 0;
            this.preparation = drink.cocktailDetails.preparation || '';
            this.ingredients = (drink.cocktailDetails.ingredients || []).map(i => ({ ...i }));
            if (this.ingredients.length === 0) {
              this.ingredients = [{ name: '', quantity: 0, unit: 'ml' }];
            }
          } else {
            this.drinkType = drink.drinkType || '';
            this.brand = drink.brand || '';
            this.origin = drink.origin || '';
            this.size = drink.size || '';
          }
        },
        error: (err) => console.error('Error loading drink:', err),
      });
    }
  }

  get activeType() {
    return this.drinkTypes.find(t => t.value === this.selectedType)!;
  }

  switchType(type: string): void {
    this.selectedType = type;
  }

  addIngredient(): void {
    this.ingredients.push({ name: '', quantity: 0, unit: 'ml' });
  }

  removeIngredient(index: number): void {
    if (this.ingredients.length > 1) this.ingredients.splice(index, 1);
  }

  saveDrink(): void {
    this.saving = true;

    const payload: any = {
      type: this.selectedType,
      name: this.name,
      notes: this.notes,
      status: this.status,
    };

    if (this.selectedType === 'cocktail') {
      payload.cocktailDetails = {
        category: this.category,
        baseSpirit: this.baseSpirit,
        glassware: this.glassware,
        garnish: this.garnish,
        servingSize: this.servingSize,
        preparation: this.preparation,
        ingredients: this.ingredients.filter(i => i.name.trim() !== ''),
      };
    } else {
      payload.drinkType = this.drinkType;
      payload.brand = this.brand;
      payload.size = this.size;
      if (this.selectedType === 'beer' || this.selectedType === 'wine') {
        payload.origin = this.origin;
      }
    }

    const request$ = this.isEdit && this.drinkId
      ? this.drinkService.update(this.drinkId, payload)
      : this.drinkService.create(payload);

    request$.subscribe({
      next: () => {
        this.router.navigate(['/drinks']);
      },
      error: (err) => {
        console.error('Error saving:', err);
        alert(err.error?.message || 'Error al guardar');
        this.saving = false;
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/drinks']);
  }
}