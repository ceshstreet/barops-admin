import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { DrinkTheme } from '../../models/drink-theme.model';
import { MOCK_THEMES } from '../../models/drink-theme.mock';
import { Drink } from '../../../drinks/models/drink.model';
import { DrinkService } from '../../../drinks/services/drink.service';

@Component({
  selector: 'app-drink-theme-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './drink-theme-list.component.html',
  styleUrl: './drink-theme-list.component.scss',
})
export class DrinkThemeListComponent implements OnInit {
  themes: DrinkTheme[] = [];
  allDrinks: Drink[] = [];

  constructor(private router: Router, private drinkService: DrinkService) {}

  ngOnInit(): void {
    // TODO: Replace with theme service when backend is ready
    this.themes = MOCK_THEMES;

    // Load drinks from API
    this.drinkService.getAll().subscribe({
      next: (drinks) => this.allDrinks = drinks,
      error: (err) => console.error('Error loading drinks:', err),
    });
  }

  getDrinksForTheme(theme: DrinkTheme): Drink[] {
    return theme.drinkIds
      .map(id => this.allDrinks.find(d => d._id === id))
      .filter((d): d is Drink => !!d);
  }

  viewTheme(id: string): void {
    this.router.navigate(['/drink-themes', id]);
  }

  editTheme(id: string): void {
    this.router.navigate(['/drink-themes', id, 'edit']);
  }

  createTheme(): void {
    this.router.navigate(['/drink-themes/new']);
  }
}