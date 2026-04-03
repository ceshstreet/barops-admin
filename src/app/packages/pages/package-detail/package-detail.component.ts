import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Package, PackageService } from '../../models/package.model';
import { MOCK_PACKAGES } from '../../models/package.mock';
import { DrinkTheme } from '../../../drink-themes/models/drink-theme.model';
import { MOCK_THEMES } from '../../../drink-themes/models/drink-theme.mock';
import { Drink } from '../../../drinks/models/drink.model';
import { MOCK_DRINKS } from '../../../drinks/models/drink.mock';

@Component({
  selector: 'app-package-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './package-detail.component.html',
  styleUrl: './package-detail.component.scss',
})
export class PackageDetailComponent implements OnInit {
  pkg: Package | null = null;
  themes: DrinkTheme[] = [];
  allCocktailNames: string[] = [];
  includedServices: PackageService[] = [];
  optionalServices: PackageService[] = [];

  // Calculator
  calcGuests = 50;
  selectedAddOns: PackageService[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.pkg = MOCK_PACKAGES.find(p => p._id === id) || null;

    if (this.pkg) {
      this.calcGuests = this.pkg.minGuests;

      this.themes = this.pkg.themeIds
        .map(tid => MOCK_THEMES.find(t => t._id === tid))
        .filter((t): t is DrinkTheme => !!t);

      // Get all cocktail names from themes + extras
      const fromThemes = this.themes.flatMap(t =>
        t.drinkIds.map(did => MOCK_DRINKS.find(d => d._id === did)?.name).filter(Boolean)
      ) as string[];
      const fromExtras = this.pkg.extraCocktailIds
        .map(did => MOCK_DRINKS.find(d => d._id === did)?.name)
        .filter(Boolean) as string[];
      this.allCocktailNames = [...new Set([...fromThemes, ...fromExtras])];

      this.includedServices = this.pkg.services.filter(s => s.included);
      this.optionalServices = this.pkg.services.filter(s => !s.included);
    }
  }

  // ── Calculator ──
  get calcTotal(): number {
    if (!this.pkg) return 0;
    const base = this.pkg.basePrice + (this.calcGuests * this.pkg.pricePerGuest);
    const addOns = this.selectedAddOns.reduce((s, a) => s + (a.addOnPrice || 0), 0);
    return base + addOns;
  }

  get calcPerGuest(): string {
    return (this.calcTotal / this.calcGuests).toFixed(2);
  }

  isAddOnSelected(svc: PackageService): boolean {
    return this.selectedAddOns.some(a => a.name === svc.name);
  }

  toggleAddOn(svc: PackageService): void {
    if (this.isAddOnSelected(svc)) {
      this.selectedAddOns = this.selectedAddOns.filter(a => a.name !== svc.name);
    } else {
      this.selectedAddOns = [...this.selectedAddOns, svc];
    }
  }

  isExtraCocktail(name: string): boolean {
    if (!this.pkg) return false;
    return this.pkg.extraCocktailIds.some(id => {
      const d = MOCK_DRINKS.find(dr => dr._id === id);
      return d?.name === name;
    });
  }

  // ── Nav ──
  editPackage(): void {
    if (this.pkg) this.router.navigate(['/packages', this.pkg._id, 'edit']);
  }

  goBack(): void {
    this.router.navigate(['/packages']);
  }
}