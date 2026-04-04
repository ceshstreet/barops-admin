import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { DrinkTheme, getPopulatedDrinks } from '../../models/drink-theme.model';
import { DrinkThemeService } from '../../services/drink-theme.service';
import { Drink } from '../../../drinks/models/drink.model';

@Component({
  selector: 'app-drink-theme-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './drink-theme-list.component.html',
  styleUrl: './drink-theme-list.component.scss',
})
export class DrinkThemeListComponent implements OnInit {
  themes: DrinkTheme[] = [];
  totalDrinks = 0;
  loading = true;

  constructor(private router: Router, private themeService: DrinkThemeService) {}

  ngOnInit(): void {
    this.themeService.getAll().subscribe({
      next: (themes) => {
        this.themes = themes;
        // Count unique drinks across all themes
        const allIds = new Set<string>();
        themes.forEach(t => this.getDrinksForTheme(t).forEach(d => allIds.add(d._id)));
        this.totalDrinks = allIds.size;
        this.loading = false;
      },
      error: (err) => { console.error('Error loading themes:', err); this.loading = false; },
    });
  }

  getDrinksForTheme(theme: DrinkTheme): Drink[] {
    return getPopulatedDrinks(theme);
  }

  viewTheme(id: string): void {
    this.router.navigate(['/drink-themes', id]);
  }

  createTheme(): void {
    this.router.navigate(['/drink-themes/new']);
  }
}