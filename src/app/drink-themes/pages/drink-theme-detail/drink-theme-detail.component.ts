import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DrinkTheme, getPopulatedDrinks } from '../../models/drink-theme.model';
import { DrinkThemeService } from '../../services/drink-theme.service';
import { Drink } from '../../../drinks/models/drink.model';

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
    private router: Router,
    private themeService: DrinkThemeService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.themeService.getById(id).subscribe({
        next: (theme) => {
          this.theme = theme;
          this.themeDrinks = getPopulatedDrinks(theme);
          this.totalIngredients = this.themeDrinks.reduce(
            (sum, d) => sum + (d.cocktailDetails?.ingredients?.length || 0), 0
          );
        },
        error: (err) => console.error('Error loading theme:', err),
      });
    }
  }

  editTheme(): void {
    if (this.theme) this.router.navigate(['/drink-themes', this.theme._id, 'edit']);
  }

  viewDrink(drinkId: string): void {
    this.router.navigate(['/drinks', drinkId]);
  }

  goBack(): void {
    this.router.navigate(['/drink-themes']);
  }
}