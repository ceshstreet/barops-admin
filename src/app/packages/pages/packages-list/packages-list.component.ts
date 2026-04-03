import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Package } from '../../models/package.model';
import { MOCK_PACKAGES } from '../../models/package.mock';
import { DrinkTheme } from '../../../drink-themes/models/drink-theme.model';
import { MOCK_THEMES } from '../../../drink-themes/models/drink-theme.mock';
import { Drink } from '../../../drinks/models/drink.model';
import { MOCK_DRINKS } from '../../../drinks/models/drink.mock';

@Component({
  selector: 'app-package-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './packages-list.component.html',
  styleUrl: './packages-list.component.scss',
})
export class PackageListComponent implements OnInit {
  packages: Package[] = [];
  allThemes: DrinkTheme[] = [];
  allDrinks: Drink[] = [];
  searchTerm = '';

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.packages = MOCK_PACKAGES;
    this.allThemes = MOCK_THEMES;
    this.allDrinks = MOCK_DRINKS;
  }

  get filtered(): Package[] {
    return this.packages.filter(p =>
      p.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  get activeCount(): number {
    return this.packages.filter(p => p.status).length;
  }

  get minPrice(): number {
    return Math.min(...this.packages.map(p => p.basePrice));
  }

  get pricePerGuestRange(): string {
    const min = Math.min(...this.packages.map(p => p.pricePerGuest));
    const max = Math.max(...this.packages.map(p => p.pricePerGuest));
    return `$${min}–$${max}`;
  }

  getThemesForPackage(pkg: Package): DrinkTheme[] {
    return pkg.themeIds
      .map(id => this.allThemes.find(t => t._id === id))
      .filter((t): t is DrinkTheme => !!t);
  }

  getCocktailCount(pkg: Package): number {
    const themes = this.getThemesForPackage(pkg);
    const fromThemes = themes.flatMap(t => t.drinkIds);
    const all = new Set([...fromThemes, ...pkg.extraCocktailIds]);
    return all.size;
  }

  calcMinPrice(pkg: Package): number {
    return pkg.basePrice + (pkg.minGuests * pkg.pricePerGuest);
  }

  viewPackage(id: string): void {
    this.router.navigate(['/packages', id]);
  }

  createPackage(): void {
    this.router.navigate(['/packages/new']);
  }
}