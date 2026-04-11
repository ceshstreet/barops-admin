import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  PackageService as PkgSvc, PackageBevItem, PackageWineItem,
  AVAILABILITY_OPTIONS, DURATION_OPTIONS, DEFAULT_SERVICES,
} from '../../models/package.model';
import { PackageService } from '../../services/package.service';
import { DrinkTheme } from '../../../drink-themes/models/drink-theme.model';
import { DrinkThemeService } from '../../../drink-themes/services/drink-theme.service';
import { Drink } from '../../../drinks/models/drink.model';
import { DrinkService } from '../../../drinks/services/drink.service';
import { AddOn, AddOnCategory, ADDON_CATEGORY_LABELS } from '../../../add-ons/models/add-on.model';
import { AddOnService } from '../../../add-ons/services/add-on.service';
import { BarType, BarTypeService } from '../../../bar-types/services/bar-type.service';

@Component({
  selector: 'app-package-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './package-form.component.html',
  styleUrl: './package-form.component.scss',
})
export class PackageFormComponent implements OnInit {
  isEdit = false;
  packageId: string | null = null;
  saving = false;

  // Basic info
  name = '';
  description = '';
  status = 'active';
  basePrice = 0;
  pricePerGuest = 0;
  minGuests = 15;
  maxGuests = 100;
  duration = '';
  barType = '';

  // Content
  selectedThemeIds: string[] = [];
  selectedExtraCocktailIds: string[] = [];
  beers: PackageBevItem[] = [];
  beverages: PackageBevItem[] = [];
  wines: PackageWineItem[] = [];
  mixers: PackageBevItem[] = [];
  services: PkgSvc[] = [];

  // Options
  availabilityOptions = AVAILABILITY_OPTIONS;
  durationOptions = DURATION_OPTIONS;
  barTypes = ['Travel Bar', 'Ultimate Bar', 'Stadium Bar'];

  // Catalog data
  allThemes: DrinkTheme[] = [];
  allDrinks: Drink[] = [];
  allAddOns: AddOn[] = [];
  allBarTypes: BarType[] = [];
  addOnCategories = Object.keys(ADDON_CATEGORY_LABELS) as AddOnCategory[];
  categoryLabels = ADDON_CATEGORY_LABELS;

  selectedBarTypeId = '';

  // Picker visibility
  showBeerPicker = false;
  showBeveragePicker = false;
  showWinePicker = false;
  showMixerPicker = false;
  showServicePicker = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private packageService: PackageService,
    private themeService: DrinkThemeService,
    private drinkService: DrinkService,
    private addOnService: AddOnService,
    private barTypeService: BarTypeService,
  ) {}

  ngOnInit(): void {
    this.themeService.getAll().subscribe({
      next: (themes) => this.allThemes = themes,
    });

    this.drinkService.getAll().subscribe({
      next: (drinks) => this.allDrinks = drinks.filter(d => d.status === 'active'),
    });

    this.addOnService.getAll().subscribe({
      next: (res) => this.allAddOns = (res.data || []).filter(a => a.active),
      error: () => this.allAddOns = [],
    });

    this.barTypeService.getBarTypes().subscribe({
      next: (types) => this.allBarTypes = types.filter(b => b.status),
      error: () => this.allBarTypes = [],
    });

    this.services = DEFAULT_SERVICES.map(s => ({ ...s }));

    this.packageId = this.route.snapshot.paramMap.get('id');
    if (this.packageId) {
      this.isEdit = true;
      this.packageService.getById(this.packageId).subscribe({
        next: (pkg) => {
          this.name = pkg.name;
          this.description = pkg.description || '';
          this.status = pkg.status || 'active';
          this.basePrice = pkg.basePrice || 0;
          this.pricePerGuest = pkg.pricePerGuest || 0;
          this.minGuests = pkg.minGuests || 15;
          this.maxGuests = pkg.maxGuests || 100;
          this.duration = pkg.duration || '';
          this.barType = pkg.barType || '';
          this.selectedBarTypeId = pkg.barTypeId || '';
          this.selectedThemeIds = pkg.themeIds || [];
          this.selectedExtraCocktailIds = pkg.extraCocktailIds || [];
          this.beers = (pkg.beers || []).map(b => ({ ...b }));
          this.beverages = (pkg.beverages || []).map(b => ({ ...b }));
          this.wines = (pkg.wines || []).map(w => ({ ...w }));
          this.mixers = (pkg.mixers || []).map(m => ({ ...m }));
          if (pkg.services?.length > 0) {
            this.services = pkg.services.map(s => ({ ...s }));
          }
        },
      });
    }
  }

  // ── Themes ──
  isThemeSelected(id: string): boolean { return this.selectedThemeIds.includes(id); }

  toggleTheme(id: string): void {
    this.selectedThemeIds = this.isThemeSelected(id)
      ? this.selectedThemeIds.filter(x => x !== id)
      : [...this.selectedThemeIds, id];
  }

  // ── Drink catalog helpers ──
  get catalogBeers(): Drink[] {
    return this.allDrinks.filter(d => d.type === 'beer');
  }

  get catalogBeverages(): Drink[] {
    return this.allDrinks.filter(d => d.type === 'beverage' && d.drinkType !== 'Mixer');
  }

  get catalogWines(): Drink[] {
    return this.allDrinks.filter(d => d.type === 'wine');
  }

  get catalogMixers(): Drink[] {
    return this.allDrinks.filter(d => d.type === 'mixer');
  }

  isDrinkAdded(list: PackageBevItem[] | PackageWineItem[], name: string): boolean {
    return list.some(item => item.name === name);
  }

  // ── Beers ──
  toggleBeerPicker(): void { this.showBeerPicker = !this.showBeerPicker; }
  closeBeerPicker(): void { this.showBeerPicker = false; }

  selectBeer(drink: Drink): void {
    if (this.isDrinkAdded(this.beers, drink.name)) return;
    this.beers.push({ name: drink.name, availability: 'included' });
    this.showBeerPicker = false;
  }

  addCustomBeer(): void {
    this.beers.push({ name: '', availability: 'included' });
    this.showBeerPicker = false;
  }

  removeBeer(i: number): void { this.beers.splice(i, 1); }

  // ── Beverages ──
  toggleBeveragePicker(): void { this.showBeveragePicker = !this.showBeveragePicker; }
  closeBeveragePicker(): void { this.showBeveragePicker = false; }

  selectBeverage(drink: Drink): void {
    if (this.isDrinkAdded(this.beverages, drink.name)) return;
    this.beverages.push({ name: drink.name, availability: 'unlimited' });
    this.showBeveragePicker = false;
  }

  addCustomBeverage(): void {
    this.beverages.push({ name: '', availability: 'unlimited' });
    this.showBeveragePicker = false;
  }

  removeBeverage(i: number): void { this.beverages.splice(i, 1); }

  // ── Wines ──
  toggleWinePicker(): void { this.showWinePicker = !this.showWinePicker; }
  closeWinePicker(): void { this.showWinePicker = false; }

  selectWine(drink: Drink): void {
    if (this.isDrinkAdded(this.wines, drink.name)) return;
    this.wines.push({ name: drink.name, detail: drink.drinkType || '' });
    this.showWinePicker = false;
  }

  addCustomWine(): void {
    this.wines.push({ name: '', detail: '' });
    this.showWinePicker = false;
  }

  removeWine(i: number): void { this.wines.splice(i, 1); }

  // ── Mixers ──
  toggleMixerPicker(): void { this.showMixerPicker = !this.showMixerPicker; }
  closeMixerPicker(): void { this.showMixerPicker = false; }

  selectMixer(drink: Drink): void {
    if (this.isDrinkAdded(this.mixers, drink.name)) return;
    this.mixers.push({ name: drink.name, availability: 'included' });
    this.showMixerPicker = false;
  }

  addCustomMixer(): void {
    this.mixers.push({ name: '', availability: 'included' });
    this.showMixerPicker = false;
  }

  removeMixer(i: number): void { this.mixers.splice(i, 1); }

  // ── Services ──
  toggleServicePicker(): void { this.showServicePicker = !this.showServicePicker; }
  closeServicePicker(): void { this.showServicePicker = false; }

  getAddOnsByCategory(category: AddOnCategory): AddOn[] {
    return this.allAddOns.filter(a => a.category === category);
  }

  isAddOnAlreadyAdded(addOn: AddOn): boolean {
    return this.services.some(s => s.name === addOn.name);
  }

  selectAddOn(addOn: AddOn): void {
    if (this.isAddOnAlreadyAdded(addOn)) return;
    this.services.push({
      name: addOn.name,
      detail: addOn.defaultDetail,
      included: addOn.defaultIncluded,
      addOnPrice: addOn.defaultPrice ?? 0,
    });
  }

  addCustomService(): void {
    this.services.push({ name: '', detail: '', included: true, addOnPrice: 0 });
    this.showServicePicker = false;
  }

  removeService(i: number): void { this.services.splice(i, 1); }

  // ── Calc preview ──
  get calcMinPrice(): number { return this.basePrice + (this.minGuests * this.pricePerGuest); }
  get calcMaxPrice(): number { return this.basePrice + (this.maxGuests * this.pricePerGuest); }

  // ── Save ──
  savePackage(): void {
    this.saving = true;

    const payload = {
      name: this.name,
      description: this.description,
      status: this.status,
      basePrice: this.basePrice,
      pricePerGuest: this.pricePerGuest,
      minGuests: this.minGuests,
      maxGuests: this.maxGuests,
      duration: this.duration,
      barType: this.allBarTypes.find(b => b._id === this.selectedBarTypeId)?.name || this.barType,
      barTypeId: this.selectedBarTypeId || undefined,
      themeIds: this.selectedThemeIds,
      extraCocktailIds: this.selectedExtraCocktailIds,
      beers: this.beers.filter(b => b.name.trim()),
      beverages: this.beverages.filter(b => b.name.trim()),
      wines: this.wines.filter(w => w.name.trim()),
      mixers: this.mixers.filter(m => m.name.trim()),
      services: this.services.filter(s => s.name.trim()),
    };

    const request$ = this.isEdit && this.packageId
      ? this.packageService.update(this.packageId, payload)
      : this.packageService.create(payload);

    request$.subscribe({
      next: () => this.router.navigate(['/packages']),
      error: (err) => {
        console.error('Error saving package:', err);
        alert(err.error?.message || 'Error al guardar');
        this.saving = false;
      },
    });
  }

  cancel(): void { this.router.navigate(['/packages']); }
}
