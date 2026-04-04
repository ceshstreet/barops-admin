import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Drink } from '../../models/drink.model';
import { DrinkService } from '../../services/drink.service';

interface CalculatedIngredient {
  name: string;
  quantity: number;
  unit: string;
  total: number;
  displayTotal: string;
}

@Component({
  selector: 'app-drink-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './drink-detail.component.html',
  styleUrl: './drink-detail.component.scss',
})
export class DrinkDetailComponent implements OnInit {
  drink: Drink | null = null;
  calcQty = 50;
  calculatedIngredients: CalculatedIngredient[] = [];

  // Modal & Toast
  showDeleteModal = false;
  deleting = false;
  toast: { message: string; type: 'success' | 'error' } | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private drinkService: DrinkService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.drinkService.getById(id).subscribe({
        next: (drink) => {
          this.drink = drink;
          if (drink.type === 'cocktail') {
            this.calculateIngredients();
          }
        },
        error: (err) => console.error('Error loading drink:', err),
      });
    }
  }

  // ── Helpers for template ──
  get category(): string { return this.drink?.cocktailDetails?.category || ''; }
  get spirit(): string { return this.drink?.cocktailDetails?.baseSpirit || ''; }
  get glassware(): string { return this.drink?.cocktailDetails?.glassware || ''; }
  get garnish(): string { return this.drink?.cocktailDetails?.garnish || ''; }
  get servingSize(): number { return this.drink?.cocktailDetails?.servingSize || 0; }
  get preparation(): string { return this.drink?.cocktailDetails?.preparation || ''; }
  get ingredients() { return this.drink?.cocktailDetails?.ingredients || []; }

  // ── Calculator ──
  calculateIngredients(): void {
    if (!this.drink?.cocktailDetails?.ingredients) return;
    this.calculatedIngredients = this.drink.cocktailDetails.ingredients.map(ing => {
      const total = ing.quantity * this.calcQty;
      return {
        name: ing.name, quantity: ing.quantity, unit: ing.unit, total,
        displayTotal: this.formatTotal(total, ing.unit),
      };
    });
  }

  formatTotal(value: number, unit: string): string {
    if (unit === 'ml' && value >= 1000) return `${(value / 1000).toFixed(2)} L`;
    return `${value} ${unit}`;
  }

  onQtyChange(): void { if (this.calcQty < 1) this.calcQty = 1; this.calculateIngredients(); }
  increaseQty(): void { this.calcQty += 10; this.calculateIngredients(); }
  decreaseQty(): void { this.calcQty = this.calcQty > 10 ? this.calcQty - 10 : 1; this.calculateIngredients(); }

  // ── Navigation ──
  editDrink(): void { if (this.drink) this.router.navigate(['/drinks', this.drink._id, 'edit']); }
  goBack(): void { this.router.navigate(['/drinks']); }

  // ── Delete ──
  openDeleteModal(): void { this.showDeleteModal = true; }
  closeDeleteModal(): void { this.showDeleteModal = false; }

  confirmDelete(): void {
    if (!this.drink) return;
    this.deleting = true;

    this.drinkService.delete(this.drink._id).subscribe({
      next: () => {
        this.showDeleteModal = false;
        this.showToast('Item eliminado exitosamente', 'success');
        setTimeout(() => this.router.navigate(['/drinks']), 1200);
      },
      error: (err) => {
        console.error('Error deleting:', err);
        this.showDeleteModal = false;
        this.deleting = false;
        this.showToast('Error al eliminar el item', 'error');
      },
    });
  }

  // ── Toast ──
  showToast(message: string, type: 'success' | 'error'): void {
    this.toast = { message, type };
    setTimeout(() => this.toast = null, 3500);
  }
}