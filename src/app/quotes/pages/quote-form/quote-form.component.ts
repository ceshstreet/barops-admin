import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  Quote, QuoteAddOnLine, QuoteDrinkLine, DrinkCategory,
  DRINK_CATEGORY_LABELS, DRINK_CATEGORY_ICONS, DRINK_CATEGORIES,
} from '../../models/quote.model';
import { QuotesService } from '../../services/quotes.service';
import { Package } from '../../../packages/models/package.model';
import { PackageService } from '../../../packages/services/package.service';
import { BarType, BarTypeService } from '../../../bar-types/services/bar-type.service';
import { DrinkTheme } from '../../../drink-themes/models/drink-theme.model';
import { DrinkThemeService } from '../../../drink-themes/services/drink-theme.service';
import { AddOn, ADDON_CATEGORY_LABELS } from '../../../add-ons/models/add-on.model';
import { AddOnService } from '../../../add-ons/services/add-on.service';
import { Client, ClientService } from '../../../clients/services/client.service';
import { Drink } from '../../../drinks/models/drink.model';
import { DrinkService } from '../../../drinks/services/drink.service';

@Component({
  selector: 'app-quote-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './quote-form.component.html',
  styleUrl: './quote-form.component.scss',
})
export class QuoteFormComponent implements OnInit, OnDestroy {
  private route          = inject(ActivatedRoute);
  private router         = inject(Router);
  private quotesService  = inject(QuotesService);
  private packageService = inject(PackageService);
  private barTypeService = inject(BarTypeService);
  private themeService   = inject(DrinkThemeService);
  private addOnService   = inject(AddOnService);
  private clientService  = inject(ClientService);
  private drinkService   = inject(DrinkService);

  isEdit  = false;
  quoteId: string | null = null;
  saving  = false;

  // ── Active step (for left nav highlight) ──────────────────────────────────
  activeStep = 1;

  // ── Form fields ───────────────────────────────────────────────────────────
  fullName     = '';
  email        = '';
  phone        = '';
  eventName    = '';
  eventType    = '';
  eventDate    = '';
  today        = new Date().toISOString().split('T')[0];
  location     = '';
  guestCount   = 50;
  budgetRange  = '';
  notes        = '';
  internalNotes = '';
  status: Quote['status'] = 'DRAFT';
  discount = 0;
  tax      = 0;

  // ── Catalog selections ────────────────────────────────────────────────────
  selectedPackageId  = '';
  selectedBarTypeId  = '';
  selectedThemeId    = '';
  selectedAddOnLines: QuoteAddOnLine[] = [];

  // ── Stored fallback (edit mode) ───────────────────────────────────────────
  storedPackageName      = '';

  // ── Editable price fields (override catalog prices per-quote) ─────────────
  customBasePrice      = 0;
  customPricePerGuest  = 0;

  // ── Catalogs ──────────────────────────────────────────────────────────────
  allPackages: Package[]    = [];
  packagesLoading = true;
  packagesError   = '';
  allBarTypes: BarType[]    = [];
  allThemes: DrinkTheme[]   = [];
  allAddOns: AddOn[]        = [];
  allClients: Client[]      = [];
  allDrinks: Drink[]        = [];

  // ── Client search ─────────────────────────────────────────────────────────
  clientSearch         = '';
  showClientDropdown   = false;
  selectedClientId     = '';

  // ── Custom price lines ────────────────────────────────────────────────────
  customLines: { name: string; price: number }[] = [];

  // ── Drink lines ───────────────────────────────────────────────────────────
  drinkLines: QuoteDrinkLine[] = [];

  readonly drinkCategories    = DRINK_CATEGORIES;
  readonly drinkCategoryLabels = DRINK_CATEGORY_LABELS;
  readonly drinkCategoryIcons  = DRINK_CATEGORY_ICONS;

  // ── Drink catalog modal ───────────────────────────────────────────────────
  showDrinkModal    = false;
  drinkSearch       = '';
  drinkTypeFilter   = '';   // '' | 'cocktail' | 'beer' | 'beverage' | 'wine' | 'mixer'

  // ── UI state ──────────────────────────────────────────────────────────────
  showAddonModal = false;
  addonSearch    = '';
  totalFlash     = false;
  private _flashTimer: any;

  // ── Source IDs ────────────────────────────────────────────────────────────
  requestId = '';
  odooId?: number;
  clientId  = '';

  // ── Event type icon cards ─────────────────────────────────────────────────
  readonly EVENT_TYPE_CARDS = [
    { value: 'Wedding',          icon: 'favorite',        label: 'Wedding'      },
    { value: 'Corporate Event',  icon: 'business_center', label: 'Corporate'    },
    { value: 'Birthday',         icon: 'cake',            label: 'Birthday'     },
    { value: 'Anniversary',      icon: 'celebration',     label: 'Anniversary'  },
    { value: 'Graduation',       icon: 'school',          label: 'Graduation'   },
    { value: 'Quinceañera',      icon: 'local_florist',   label: 'Quinceañera'  },
    { value: 'Social Gathering', icon: 'groups',          label: 'Social'       },
    { value: 'Other',            icon: 'more_horiz',      label: 'Other'        },
  ];

  readonly statusOptions: Quote['status'][] = ['DRAFT', 'SENT', 'APPROVED', 'REJECTED', 'EXPIRED'];

  readonly addonCategoryLabels = ADDON_CATEGORY_LABELS;

  // ── Steps ─────────────────────────────────────────────────────────────────
  readonly STEPS = [
    { id: 1, label: 'Client & Event',   icon: 'person'       },
    { id: 2, label: 'Package',          icon: 'inventory'    },
    { id: 3, label: 'Bar & Experience', icon: 'local_bar'    },
    { id: 4, label: 'Drink Menu',       icon: 'sports_bar'   },
    { id: 5, label: 'Add-ons',          icon: 'add_circle'   },
    { id: 6, label: 'Notes',            icon: 'notes'        },
  ];

  // ── Step completion ───────────────────────────────────────────────────────
  get step1Complete(): boolean { return !!(this.fullName && this.eventName); }
  get step2Complete(): boolean { return !!this.selectedPackageId; }
  get step3Complete(): boolean { return !!(this.selectedBarTypeId || this.selectedThemeId); }
  get step4Complete(): boolean { return this.drinkLines.length > 0; }
  get step5Complete(): boolean { return this.selectedAddOnLines.length > 0; }
  get step6Complete(): boolean { return !!(this.notes || this.internalNotes); }

  get stepsCompleted(): number {
    return [this.step1Complete, this.step2Complete, this.step3Complete,
            this.step4Complete, this.step5Complete, this.step6Complete].filter(v => v).length;
  }

  get stepsProgress(): number { return (this.stepsCompleted / 6) * 100; }

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.packageService.getAll().subscribe({
      next: (p) => {
        this.allPackages    = Array.isArray(p) ? p : (p as any).data || [];
        this.packagesLoading = false;
      },
      error: (err) => {
        this.packagesError   = 'Could not load packages.';
        this.packagesLoading = false;
        console.error('Packages error:', err);
      },
    });
    this.barTypeService.getBarTypes().subscribe({
      next: (b) => this.allBarTypes = b.filter(x => x.status),
      error: (err) => console.error('Error loading bar types:', err),
    });
    this.themeService.getAll().subscribe({
      next: (t) => this.allThemes = t,
      error: (err) => console.error('Error loading themes:', err),
    });
    this.addOnService.getAll().subscribe({
      next: (r) => this.allAddOns = (r.data || []).filter((a: any) => a.active),
      error: (err) => console.error('Error loading add-ons:', err),
    });
    this.clientService.getClients().subscribe({
      next: (c) => this.allClients = c,
      error: (err) => console.error('Error loading clients:', err),
    });
    this.drinkService.getAll().subscribe({
      next: (d) => this.allDrinks = (d as any[]).filter((x: any) => x.status === 'active' || x.status === 'Active'),
      error: (err) => console.error('Error loading drinks:', err),
    });

    this.route.queryParams.subscribe(params => {
      this.requestId   = params['requestId']   || '';
      this.odooId      = params['odooId'] ? Number(params['odooId']) : undefined;
      this.clientId    = params['clientId']    || '';
      this.fullName    = params['fullName']    || '';
      this.email       = params['email']       || '';
      this.phone       = params['phone']       || '';
      this.eventName   = params['eventName']   || '';
      this.eventType   = params['eventType']   || '';
      this.eventDate   = params['eventDate']   || '';
      this.location    = params['location']    || '';
      this.guestCount  = Number(params['guests']) || 50;
      this.budgetRange = params['budgetRange'] || '';
    });

    this.quoteId = this.route.snapshot.paramMap.get('id');
    if (this.quoteId) {
      this.isEdit = true;
      this.quotesService.getQuoteById(this.quoteId).subscribe({
        next: (res) => {
          const q = res.data;
          this.fullName        = q.fullName;
          this.email           = q.email;
          this.phone           = q.phone;
          this.eventName       = q.eventName;
          this.eventType       = q.eventType;
          this.eventDate       = q.eventDate;
          this.location        = q.location;
          this.guestCount      = q.guestCount || Number(q.guests) || 50;
          this.budgetRange     = q.budgetRange;
          this.selectedPackageId = q.packageId  || '';
          this.selectedBarTypeId = q.barTypeId  || '';
          this.selectedThemeId   = q.drinkThemeId || '';
          this.selectedAddOnLines = q.addOnLines || [];
          this.storedPackageName   = q.packageName      || '';
          this.customBasePrice     = q.packageBasePrice || 0;
          this.customPricePerGuest = q.pricePerGuest    || 0;
          this.discount      = q.discount || 0;
          this.tax           = q.tax      || 0;
          this.notes         = q.notes         || '';
          this.internalNotes = q.internalNotes || '';
          this.status        = q.status;
          this.requestId     = q.requestId || '';
          this.clientId      = q.clientId  || '';
          // Ensure saved lines always have quantity + price (backwards compat)
          this.drinkLines = (q.drinkLines || []).map((d: any) => ({
            ...d,
            quantity: d.quantity ?? 1,
            price:    d.price    ?? 0,
          }));
        },
      });
    }
  }

  ngOnDestroy(): void { clearTimeout(this._flashTimer); }

  // ── Client search ─────────────────────────────────────────────────────────
  get filteredClients(): Client[] {
    const s = this.clientSearch.trim().toLowerCase();
    const list = s
      ? this.allClients.filter(c =>
          `${c.name} ${c.lastName}`.toLowerCase().includes(s) ||
          (c.email  || '').toLowerCase().includes(s) ||
          (c.phone  || '').includes(s)
        )
      : this.allClients;
    return list.slice(0, 8);
  }

  selectClient(c: Client): void {
    this.fullName        = `${c.name} ${c.lastName}`.trim();
    this.email           = c.email  || '';
    this.phone           = c.phone  || '';
    this.clientId        = c._id    || '';
    this.selectedClientId = c._id   || '';
    this.clientSearch    = `${c.name} ${c.lastName}`.trim();
    this.showClientDropdown = false;
  }

  clearClient(): void {
    this.selectedClientId = '';
    this.clientSearch     = '';
    this.clientId         = '';
  }

  // ── Custom price lines ────────────────────────────────────────────────────
  addCustomLine(): void {
    this.customLines.push({ name: '', price: 0 });
  }

  removeCustomLine(i: number): void {
    this.customLines.splice(i, 1);
    this.triggerFlash();
  }

  // ── Step navigation ───────────────────────────────────────────────────────
  scrollTo(step: number): void {
    this.activeStep = step;
    const el = document.getElementById(`step-${step}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ── Package ───────────────────────────────────────────────────────────────
  get selectedPackage(): Package | undefined {
    return this.allPackages.find(p => p._id === this.selectedPackageId);
  }

  selectPackage(pkg: Package): void {
    this.selectedPackageId   = pkg._id;
    this.customBasePrice     = pkg.basePrice     || 0;
    this.customPricePerGuest = pkg.pricePerGuest || 0;
    if (pkg.barTypeId) this.selectedBarTypeId = pkg.barTypeId;
    this.populateDrinksFromPackage(pkg);
    this.triggerFlash();
  }

  // ── Drink management ──────────────────────────────────────────────────────

  /** Map Drink.type → DrinkCategory */
  private drinkTypeToCategory(type: string): DrinkCategory {
    const map: Record<string, DrinkCategory> = {
      beer:      'beer',
      beverage:  'spirit',
      wine:      'wine',
      mixer:     'mixer',
      cocktail:  'cocktail',
    };
    return map[type] || 'other';
  }

  /** Build drinkLines from the selected package's beverage arrays. */
  private populateDrinksFromPackage(pkg: Package): void {
    const lines: QuoteDrinkLine[] = [];
    (pkg.beers     || []).forEach(b => lines.push({ category: 'beer',   name: b.name, quantity: 1, price: 0 }));
    (pkg.beverages || []).forEach(b => lines.push({ category: 'spirit', name: b.name, quantity: 1, price: 0 }));
    (pkg.wines     || []).forEach(w => lines.push({ category: 'wine',   name: w.name, detail: w.detail, quantity: 1, price: 0 }));
    (pkg.mixers    || []).forEach(m => lines.push({ category: 'mixer',  name: m.name, quantity: 1, price: 0 }));
    this.drinkLines = lines;
  }

  drinksByCategory(cat: DrinkCategory): QuoteDrinkLine[] {
    return this.drinkLines.filter(d => d.category === cat);
  }

  removeDrinkLine(index: number): void {
    this.drinkLines.splice(index, 1);
    this.triggerFlash();
  }

  removeDrinkLineByRef(line: QuoteDrinkLine): void {
    const i = this.drinkLines.indexOf(line);
    if (i >= 0) this.drinkLines.splice(i, 1);
    this.triggerFlash();
  }

  // ── Drink catalog modal ───────────────────────────────────────────────────

  openDrinkModal(): void {
    this.showDrinkModal  = true;
    this.drinkSearch     = '';
    this.drinkTypeFilter = '';
  }

  closeDrinkModal(): void {
    this.showDrinkModal = false;
  }

  get filteredCatalogDrinks(): Drink[] {
    let list = this.allDrinks;
    if (this.drinkTypeFilter) {
      list = list.filter(d => d.type === this.drinkTypeFilter);
    }
    const s = this.drinkSearch.trim().toLowerCase();
    if (s) {
      list = list.filter(d =>
        d.name.toLowerCase().includes(s) ||
        (d.brand  || '').toLowerCase().includes(s) ||
        (d.drinkType || '').toLowerCase().includes(s)
      );
    }
    return list;
  }

  isDrinkSelected(drink: Drink): boolean {
    return this.drinkLines.some(d => d.drinkId === drink._id);
  }

  toggleCatalogDrink(drink: Drink): void {
    if (this.isDrinkSelected(drink)) {
      this.drinkLines = this.drinkLines.filter(d => d.drinkId !== drink._id);
    } else {
      this.drinkLines.push({
        drinkId:  drink._id,
        category: this.drinkTypeToCategory(drink.type),
        name:     drink.name,
        detail:   drink.brand ? `${drink.brand}${drink.size ? ' · ' + drink.size : ''}` : drink.drinkType,
        quantity: 1,
        price:    0,
      });
    }
    this.triggerFlash();
  }

  updateDrinkQty(line: QuoteDrinkLine, value: number): void {
    line.quantity = Math.max(1, value || 1);
    this.triggerFlash();
  }

  updateDrinkPrice(line: QuoteDrinkLine, value: number): void {
    line.price = Math.max(0, value || 0);
    this.triggerFlash();
  }

  drinkTypeLabel(type: string): string {
    const map: Record<string, string> = {
      cocktail:  'Cocktail',
      beer:      'Beer',
      beverage:  'Beverage',
      wine:      'Wine',
      mixer:     'Mixer',
    };
    return map[type] || type;
  }

  packageIncludedServices(pkg: Package): string[] {
    return (pkg.services || [])
      .filter(s => s.included)
      .slice(0, 4)
      .map(s => s.name);
  }

  // ── Pricing — always use editable custom fields ───────────────────────────
  get packageBasePrice(): number  { return this.customBasePrice; }
  get packageGuestPrice(): number { return this.customPricePerGuest * this.guestCount; }
  get effectivePricePerGuest(): number { return this.customPricePerGuest; }

  get effectivePackageName(): string {
    return this.selectedPackage?.name || this.storedPackageName;
  }

  get selectedBarTypeName(): string {
    return this.allBarTypes.find(b => b._id === this.selectedBarTypeId)?.name || '';
  }

  get selectedThemeName(): string {
    return this.allThemes.find(t => t._id === this.selectedThemeId)?.name || '';
  }

  get addOnsTotal(): number {
    const addonSum = this.selectedAddOnLines.reduce((s, a) => s + (a.price || 0), 0);
    const customSum = this.customLines.reduce((s, l) => s + (l.price || 0), 0);
    return addonSum + customSum;
  }

  get drinksTotal(): number {
    return this.drinkLines.reduce((s, d) => s + (d.price || 0) * (d.quantity || 1), 0);
  }

  get subtotal(): number {
    return this.packageBasePrice + this.packageGuestPrice + this.addOnsTotal + this.drinksTotal;
  }

  get total(): number {
    return Math.max(0, this.subtotal - this.discount + this.tax);
  }

  // ── Animate total on change ───────────────────────────────────────────────
  triggerFlash(): void {
    this.totalFlash = false;
    clearTimeout(this._flashTimer);
    setTimeout(() => {
      this.totalFlash = true;
      this._flashTimer = setTimeout(() => { this.totalFlash = false; }, 550);
    }, 16);
  }

  // ── Guest stepper ─────────────────────────────────────────────────────────
  stepGuest(delta: number): void {
    this.guestCount = Math.max(1, this.guestCount + delta);
    this.triggerFlash();
  }

  // ── Bar type icon ─────────────────────────────────────────────────────────
  barTypeIcon(bt: BarType): string {
    const c = (bt.category || '').toLowerCase();
    if (c.includes('mobile'))                  return 'directions_car';
    if (c.includes('beer') || c.includes('wine')) return 'wine_bar';
    if (c.includes('full') || c.includes('open')) return 'local_bar';
    if (c.includes('premium') || c.includes('vip')) return 'diamond';
    return 'sports_bar';
  }

  // ── Drink theme icon ──────────────────────────────────────────────────────
  themeIcon(theme: DrinkTheme): string {
    const s = (theme.style || '').toLowerCase();
    if (s.includes('tropical'))  return 'beach_access';
    if (s.includes('classic'))   return 'wine_bar';
    if (s.includes('holiday'))   return 'celebration';
    if (s.includes('mocktail'))  return 'emoji_food_beverage';
    if (s.includes('premium'))   return 'diamond';
    if (s.includes('spirit'))    return 'liquor';
    return 'local_bar';
  }

  // ── Add-ons ───────────────────────────────────────────────────────────────
  get filteredAddOns(): AddOn[] {
    if (!this.addonSearch.trim()) return this.allAddOns;
    const s = this.addonSearch.toLowerCase();
    return this.allAddOns.filter(a =>
      a.name.toLowerCase().includes(s) ||
      (a.defaultDetail || '').toLowerCase().includes(s)
    );
  }

  isAddOnSelected(addOn: AddOn): boolean {
    return this.selectedAddOnLines.some(a => a.addOnId === addOn._id);
  }

  toggleAddOn(addOn: AddOn): void {
    if (this.isAddOnSelected(addOn)) {
      this.selectedAddOnLines = this.selectedAddOnLines.filter(a => a.addOnId !== addOn._id);
    } else {
      this.selectedAddOnLines.push({
        addOnId: addOn._id,
        name: addOn.name,
        detail: addOn.defaultDetail,
        price: addOn.defaultPrice || 0,
      });
    }
    this.triggerFlash();
  }

  removeAddOnLine(index: number): void {
    this.selectedAddOnLines.splice(index, 1);
    this.triggerFlash();
  }

  addonCategoryIcon(category: string): string {
    const map: Record<string, string> = {
      bartending: 'sports_bar',
      bar:        'storefront',
      cocktail:   'local_bar',
      equipment:  'handyman',
      other:      'add_circle_outline',
    };
    return map[category] || 'add_circle_outline';
  }

  // ── Save ──────────────────────────────────────────────────────────────────
  save(asDraft = false): void {
    this.saving = true;

    const pkg     = this.selectedPackage;
    const barType = this.allBarTypes.find(b => b._id === this.selectedBarTypeId);
    const theme   = this.allThemes.find(t => t._id === this.selectedThemeId);

    const payload: Partial<Quote> = {
      requestId:     this.requestId  || undefined,
      odooId:        this.odooId,
      clientId:      this.clientId   || undefined,
      fullName:      this.fullName,
      email:         this.email,
      phone:         this.phone,
      eventName:     this.eventName,
      eventType:     this.eventType,
      eventDate:     this.eventDate,
      location:      this.location,
      guests:        String(this.guestCount),
      guestCount:    this.guestCount,
      budgetRange:   this.budgetRange,
      packageId:     this.selectedPackageId  || undefined,
      packageName:   pkg?.name,
      barTypeId:     this.selectedBarTypeId  || undefined,
      barTypeName:   barType?.name,
      drinkThemeId:  this.selectedThemeId    || undefined,
      drinkThemeName: theme?.name,
      drinkLines: this.drinkLines.length > 0 ? this.drinkLines : undefined,
      addOnLines: [
        ...this.selectedAddOnLines,
        ...this.customLines
          .filter(l => l.name.trim())
          .map(l => ({ name: l.name, price: l.price, detail: 'Custom line' })),
      ],
      packageBasePrice: this.customBasePrice,
      pricePerGuest:    this.customPricePerGuest,
      subtotal:      this.subtotal,
      discount:      this.discount,
      tax:           this.tax,
      total:         this.total,
      notes:         this.notes,
      internalNotes: this.internalNotes,
      status:        asDraft ? 'DRAFT' : this.status,
    };

    const req$ = this.isEdit && this.quoteId
      ? this.quotesService.updateQuote(this.quoteId, payload as Quote)
      : this.quotesService.createQuote(payload);

    req$.subscribe({
      next: (res) => this.router.navigate(['/quotes', res.data._id]),
      error: (err) => {
        console.error(err);
        alert(err.error?.message || 'Error saving quote');
        this.saving = false;
      },
    });
  }

  cancel(): void { this.router.navigate(['/quotes']); }
}
