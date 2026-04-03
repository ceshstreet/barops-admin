import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DrinkTheme } from '../../models/drink-theme.model';
import { MOCK_THEMES } from '../../models/drink-theme.mock';
import { Drink } from '../../../drinks/models/drink.model';
import { MOCK_DRINKS } from '../../../drinks/models/drink.mock';

@Component({
  selector: 'app-drink-theme-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './drink-theme-detail.component.html',
  styleUrl: './drink-theme-detail.component.scss',
})
export class DrinkThemeDetailComponent implements OnInit {
  theme: DrinkTheme | null = null;
  themeDrinks: Drink[] = [];
  totalIngredients = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    // TODO: Replace with service call
    this.theme = MOCK_THEMES.find(t => t._id === id) || null;

    if (this.theme) {
      this.themeDrinks = this.theme.drinkIds
        .map(did => MOCK_DRINKS.find(d => d._id === did))
        .filter((d): d is Drink => !!d);

        this.totalIngredients = this.themeDrinks.reduce(
          (sum, d) => sum + (d.ingredients?.length || 0), 0
        );
    }
  }

  editTheme(): void {
    if (this.theme) {
      this.router.navigate(['/drink-themes', this.theme._id, 'edit']);
    }
  }

  viewDrink(drinkId: string): void {
    this.router.navigate(['/drinks', drinkId]);
  }

  goBack(): void {
    this.router.navigate(['/drink-themes']);
  }
}