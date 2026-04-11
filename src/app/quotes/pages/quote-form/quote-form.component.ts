import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Quote, QuoteAddOnLine, EVENT_TYPES } from '../../models/quote.model';
import { QuotesService } from '../../services/quotes.service';
import { Package } from '../../../packages/models/package.model';
import { PackageService } from '../../../packages/services/package.service';
import { BarType, BarTypeService } from '../../../bar-types/services/bar-type.service';
import { DrinkTheme } from '../../../drink-themes/models/drink-theme.model';
import { DrinkThemeService } from '../../../drink-themes/services/drink-theme.service';
import { AddOn } from '../../../add-ons/models/add-on.model';
import { AddOnService } from '../../../add-ons/services/add-on.service';

@Component({
  selector: 'app-quote-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './quote-form.component.html',
  styleUrl: './quote-form.component.scss',
})
export class QuoteFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private quotesService = inject(QuotesService);
  private packageService = inject(PackageService);
  private barTypeService = inject(BarTypeService);
  private themeService = inject(DrinkThemeService);
  private addOnService = inject(AddOnService);

  isEdit = false;
  quoteId: string | null = null;
  saving = false;

  // Form fields
  fullName = '';
  email = '';
  phone = '';
  eventName = '';
  eventType = '';
  eventDate = '';
  location = '';
  guestCount = 50;
  budgetRange = '';
  notes = '';
  internalNotes = '';
  status: Quote['status'] = 'DRAFT';
  discount = 0;
  tax = 0;

  // Selections
  selectedPackageId = '';
  selectedBarTypeId = '';
  selectedThemeId = '';
  selectedAddOnLines: QuoteAddOnLine[] = [];

  // Stored values from saved quote (fallback when catalog hasn't loaded)
  storedPackageName = '';
  storedPackageBasePrice = 0;
  storedPricePerGuest = 0;

  // Catalogs
  allPackages: Package[] = [];
  allBarTypes: BarType[] = [];
  allThemes: DrinkTheme[] = [];
  allAddOns: AddOn[] = [];

  // Picker state
  showAddOnPicker = false;

  // Options
  eventTypes = EVENT_TYPES;
  statusOptions: Quote['status'][] = ['DRAFT', 'SENT', 'APPROVED', 'REJECTED', 'EXPIRED'];

  // IDs from source request
  requestId = '';
  odooId?: number;
  clientId = '';

  ngOnInit(): void {
    // Load catalogs
    this.packageService.getAll().subscribe({ next: (p) => this.allPackages = p.filter((x: Package) => x.status === 'active') });
    this.barTypeService.getBarTypes().subscribe({ next: (b) => this.allBarTypes = b.filter(x => x.status) });
    this.themeService.getAll().subscribe({ next: (t) => this.allThemes = t });
    this.addOnService.getAll().subscribe({ next: (r) => this.allAddOns = (r.data || []).filter(a => a.active) });

    // Pre-fill from request query params
    this.route.queryParams.subscribe(params => {
      this.requestId   = params['requestId'] || '';
      this.odooId      = params['odooId'] ? Number(params['odooId']) : undefined;
      this.clientId    = params['clientId'] || '';
      this.fullName    = params['fullName'] || '';
      this.email       = params['email'] || '';
      this.phone       = params['phone'] || '';
      this.eventName   = params['eventName'] || '';
      this.eventType   = params['eventType'] || '';
      this.eventDate   = params['eventDate'] || '';
      this.location    = params['location'] || '';
      this.guestCount  = Number(params['guests']) || 50;
      this.budgetRange = params['budgetRange'] || '';
    });

    // Edit mode
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
          this.selectedPackageId = q.packageId || '';
          this.selectedBarTypeId = q.barTypeId || '';
          this.selectedThemeId   = q.drinkThemeId || '';
          this.selectedAddOnLines = q.addOnLines || [];
          // Store saved values as fallback for when catalog hasn't loaded
          this.storedPackageName      = q.packageName || '';
          this.storedPackageBasePrice = q.packageBasePrice || 0;
          this.storedPricePerGuest    = q.pricePerGuest || 0;
          this.discount        = q.discount || 0;
          this.tax             = q.tax || 0;
          this.notes           = q.notes || '';
          this.internalNotes   = q.internalNotes || '';
          this.status          = q.status;
          this.requestId       = q.requestId || '';
          this.clientId        = q.clientId || '';
        },
      });
    }
  }

  // ── Package ──
  get selectedPackage(): Package | undefined {
    return this.allPackages.find(p => p._id === this.selectedPackageId);
  }

  selectPackage(pkg: Package): void {
    this.selectedPackageId = pkg._id;
    // Auto-fill bar type if package has one
    if (pkg.barTypeId) this.selectedBarTypeId = pkg.barTypeId;
  }

  // ── Pricing (usa valores guardados como fallback si el catálogo no cargó) ──
  get packageBasePrice(): number {
    return this.selectedPackage?.basePrice ?? this.storedPackageBasePrice;
  }

  get packageGuestPrice(): number {
    return (this.selectedPackage?.pricePerGuest ?? this.storedPricePerGuest) * this.guestCount;
  }

  get effectivePackageName(): string {
    return this.selectedPackage?.name || this.storedPackageName;
  }

  get effectivePricePerGuest(): number {
    return this.selectedPackage?.pricePerGuest ?? this.storedPricePerGuest;
  }

  get addOnsTotal(): number {
    return this.selectedAddOnLines.reduce((s, a) => s + (a.price || 0), 0);
  }

  get subtotal(): number {
    return this.packageBasePrice + this.packageGuestPrice + this.addOnsTotal;
  }

  get total(): number {
    return Math.max(0, this.subtotal - this.discount + this.tax);
  }

  // ── Add-ons picker ──
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
  }

  removeAddOnLine(index: number): void {
    this.selectedAddOnLines.splice(index, 1);
  }

  // ── Save ──
  save(asDraft = false): void {
    this.saving = true;

    const pkg = this.selectedPackage;
    const barType = this.allBarTypes.find(b => b._id === this.selectedBarTypeId);
    const theme = this.allThemes.find(t => t._id === this.selectedThemeId);

    const payload: Partial<Quote> = {
      requestId: this.requestId || undefined,
      odooId: this.odooId,
      clientId: this.clientId || undefined,
      fullName: this.fullName,
      email: this.email,
      phone: this.phone,
      eventName: this.eventName,
      eventType: this.eventType,
      eventDate: this.eventDate,
      location: this.location,
      guests: String(this.guestCount),
      guestCount: this.guestCount,
      budgetRange: this.budgetRange,
      packageId: this.selectedPackageId || undefined,
      packageName: pkg?.name,
      barTypeId: this.selectedBarTypeId || undefined,
      barTypeName: barType?.name,
      drinkThemeId: this.selectedThemeId || undefined,
      drinkThemeName: theme?.name,
      addOnLines: this.selectedAddOnLines,
      packageBasePrice: this.packageBasePrice,
      pricePerGuest: this.selectedPackage?.pricePerGuest,
      subtotal: this.subtotal,
      discount: this.discount,
      tax: this.tax,
      total: this.total,
      notes: this.notes,
      internalNotes: this.internalNotes,
      status: asDraft ? 'DRAFT' : this.status,
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
