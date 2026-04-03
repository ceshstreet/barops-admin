// drinks/pages/drink-detail/drink-detail.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Drink } from '../../models/drink.model';
import { MOCK_DRINKS } from '../../models/drink.mock';

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

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    // TODO: Replace with service call → this.drinkService.getById(id)
    this.drink = MOCK_DRINKS.find(d => d._id === id) || null;

    if (this.drink) {
      this.calculateIngredients();
    }
  }

  calculateIngredients(): void {
    if (!this.drink) return;

    this.calculatedIngredients = (this.drink.ingredients || []).map(ing => {
      const total = ing.quantity * this.calcQty;
      return {
        name: ing.name,
        quantity: ing.quantity,
        unit: ing.unit,
        total,
        displayTotal: this.formatTotal(total, ing.unit),
      };
    });
  }

  formatTotal(value: number, unit: string): string {
    if (unit === 'ml' && value >= 1000) {
      return `${(value / 1000).toFixed(2)} L`;
    }
    return `${value} ${unit}`;
  }

  onQtyChange(): void {
    if (this.calcQty < 1) this.calcQty = 1;
    this.calculateIngredients();
  }

  increaseQty(): void {
    this.calcQty += 10;
    this.calculateIngredients();
  }

  decreaseQty(): void {
    if (this.calcQty > 10) {
      this.calcQty -= 10;
    } else {
      this.calcQty = 1;
    }
    this.calculateIngredients();
  }

  editDrink(): void {
    if (this.drink) {
      this.router.navigate(['/drinks', this.drink._id, 'edit']);
    }
  }

  goBack(): void {
    this.router.navigate(['/drinks']);
  }
}
