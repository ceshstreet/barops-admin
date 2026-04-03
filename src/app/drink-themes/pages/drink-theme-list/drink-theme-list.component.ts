import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { DrinkTheme } from '../../models/drink-theme.model';
import { MOCK_THEMES } from '../../models/drink-theme.mock';
import { Drink } from '../../../drinks/models/drink.model';
import { MOCK_DRINKS } from '../../../drinks/models/drink.mock';

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

  constructor(private router: Router) {}

  ngOnInit(): void {
    // TODO: Replace with service calls
    this.themes = MOCK_THEMES;
    this.allDrinks = MOCK_DRINKS;
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