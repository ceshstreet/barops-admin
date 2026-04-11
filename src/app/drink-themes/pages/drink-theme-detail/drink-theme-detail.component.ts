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

  showDeleteModal = false;
  deleting = false;
  toast: { message: string; type: 'success' | 'error' } | null = null;

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

  openDeleteModal(): void { this.showDeleteModal = true; }
  closeDeleteModal(): void { this.showDeleteModal = false; }

  confirmDelete(): void {
    if (!this.theme) return;
    this.deleting = true;
    this.themeService.delete(this.theme._id).subscribe({
      next: () => {
        this.showDeleteModal = false;
        this.showToast('Theme eliminado exitosamente', 'success');
        setTimeout(() => this.router.navigate(['/drink-themes']), 1200);
      },
      error: (err) => {
        console.error('Error deleting:', err);
        this.showDeleteModal = false;
        this.deleting = false;
        this.showToast('Error al eliminar el theme', 'error');
      },
    });
  }

  showToast(message: string, type: 'success' | 'error'): void {
    this.toast = { message, type };
    setTimeout(() => this.toast = null, 3500);
  }
}