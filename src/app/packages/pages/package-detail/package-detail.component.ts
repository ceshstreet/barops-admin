import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Package, PackageService as PkgSvc } from '../../models/package.model';
import { PackageService } from '../../services/package.service';
import { DrinkTheme, getPopulatedDrinks } from '../../../drink-themes/models/drink-theme.model';
import { DrinkThemeService } from '../../../drink-themes/services/drink-theme.service';
import { DrinkService } from '../../../drinks/services/drink.service';
import { BarType, BarTypeService } from '../../../bar-types/services/bar-type.service';

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
  includedServices: PkgSvc[] = [];
  optionalServices: PkgSvc[] = [];
  barType: BarType | null = null;

  calcGuests = 50;
  selectedAddOns: PkgSvc[] = [];

  showDeleteModal = false;
  deleting = false;
  toast: { message: string; type: 'success' | 'error' } | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private packageService: PackageService,
    private themeService: DrinkThemeService,
    private drinkService: DrinkService,
    private barTypeService: BarTypeService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.packageService.getById(id).subscribe({
        next: (pkg) => {
          this.pkg = pkg;
          this.calcGuests = pkg.minGuests || 50;
          this.includedServices = (pkg.services || []).filter(s => s.included);
          this.optionalServices = (pkg.services || []).filter(s => !s.included);
          this.loadThemesAndDrinks();
          if (pkg.barTypeId) {
            this.barTypeService.getBarTypeById(pkg.barTypeId).subscribe({
              next: (bt) => this.barType = bt,
              error: () => this.barType = null,
            });
          }
        },
        error: (err) => console.error('Error loading package:', err),
      });
    }
  }

  loadThemesAndDrinks(): void {
    if (!this.pkg) return;

    // Load themes
    if (this.pkg.themeIds?.length > 0) {
      this.themeService.getAll().subscribe({
        next: (allThemes) => {
          this.themes = (this.pkg!.themeIds || [])
            .map(id => allThemes.find(t => t._id === id))
            .filter((t): t is DrinkTheme => !!t);

          // Get cocktail names from populated themes
          const fromThemes = this.themes.flatMap(t => {
            const drinks = getPopulatedDrinks(t);
            return drinks.map(d => d.name);
          });

          // Get extra cocktail names
          if (this.pkg!.extraCocktailIds?.length > 0) {
            this.drinkService.getAll().subscribe({
              next: (allDrinks) => {
                const fromExtras = (this.pkg!.extraCocktailIds || [])
                  .map(id => allDrinks.find(d => d._id === id)?.name)
                  .filter(Boolean) as string[];
                this.allCocktailNames = [...new Set([...fromThemes, ...fromExtras])];
              },
            });
          } else {
            this.allCocktailNames = [...new Set(fromThemes)];
          }
        },
      });
    }
  }

  // Calculator
  get calcTotal(): number {
    if (!this.pkg) return 0;
    const base = this.pkg.basePrice + (this.calcGuests * this.pkg.pricePerGuest);
    const addOns = this.selectedAddOns.reduce((s, a) => s + (a.addOnPrice || 0), 0);
    return base + addOns;
  }

  get calcPerGuest(): string {
    if (this.calcGuests === 0) return '0';
    return (this.calcTotal / this.calcGuests).toFixed(2);
  }

  isAddOnSelected(svc: PkgSvc): boolean { return this.selectedAddOns.some(a => a.name === svc.name); }

  toggleAddOn(svc: PkgSvc): void {
    this.selectedAddOns = this.isAddOnSelected(svc)
      ? this.selectedAddOns.filter(a => a.name !== svc.name)
      : [...this.selectedAddOns, svc];
  }

  isExtraCocktail(name: string): boolean {
    return false; // Will be implemented when extras are connected
  }

  // Nav
  editPackage(): void { if (this.pkg) this.router.navigate(['/packages', this.pkg._id, 'edit']); }
  goBack(): void { this.router.navigate(['/packages']); }

  // Delete
  openDeleteModal(): void { this.showDeleteModal = true; }
  closeDeleteModal(): void { this.showDeleteModal = false; }

  confirmDelete(): void {
    if (!this.pkg) return;
    this.deleting = true;
    this.packageService.delete(this.pkg._id).subscribe({
      next: () => {
        this.showDeleteModal = false;
        this.showToast('Package eliminado exitosamente', 'success');
        setTimeout(() => this.router.navigate(['/packages']), 1200);
      },
      error: (err) => {
        this.showDeleteModal = false;
        this.deleting = false;
        this.showToast('Error al eliminar', 'error');
      },
    });
  }

  showToast(message: string, type: 'success' | 'error'): void {
    this.toast = { message, type };
    setTimeout(() => this.toast = null, 3500);
  }
}