import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { Quote, QUOTE_STATUSES } from '../../models/quote.model';
import { QuotesService } from '../../services/quotes.service';
import { Package } from '../../../packages/models/package.model';
import { PackageService } from '../../../packages/services/package.service';
import { BarType, BarTypeService } from '../../../bar-types/services/bar-type.service';
import { DrinkTheme, getPopulatedDrinks } from '../../../drink-themes/models/drink-theme.model';
import { DrinkThemeService } from '../../../drink-themes/services/drink-theme.service';
import { AddOn, ADDON_CATEGORY_LABELS } from '../../../add-ons/models/add-on.model';
import { AddOnService } from '../../../add-ons/services/add-on.service';
import { Drink } from '../../../drinks/models/drink.model';

@Component({
  selector: 'app-quote-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './quote-detail.component.html',
  styleUrl: './quote-detail.component.scss',
})
export class QuoteDetailComponent implements OnInit {
  private route          = inject(ActivatedRoute);
  private router         = inject(Router);
  private quotesService  = inject(QuotesService);
  private pkgService     = inject(PackageService);
  private barTypeService = inject(BarTypeService);
  private themeService   = inject(DrinkThemeService);
  private addOnService   = inject(AddOnService);

  quote: Quote | null = null;
  loading = true;
  error   = '';
  updatingStatus = false;
  sending = false;
  toast: { message: string; type: 'success' | 'error' } | null = null;

  // ── Enriched catalog data ──────────────────────────────────────────────────
  pkgData:        Package | null   = null;
  barTypeData:    BarType | null   = null;
  drinkThemeData: DrinkTheme | null = null;
  suggestedAddOns: AddOn[]         = [];

  readonly statuses = QUOTE_STATUSES;
  readonly addonCategoryLabels = ADDON_CATEGORY_LABELS;

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.quotesService.getQuoteById(id).subscribe({
        next: (res) => {
          this.quote   = res.data;
          this.loading = false;
          this.loadEnrichedData();
        },
        error: () => { this.error = 'Could not load quote.'; this.loading = false; },
      });
    }
  }

  private loadEnrichedData(): void {
    if (!this.quote) return;

    if (this.quote.packageId) {
      this.pkgService.getById(this.quote.packageId).pipe(catchError(() => of(null)))
        .subscribe(p => this.pkgData = p);
    }

    if (this.quote.barTypeId) {
      this.barTypeService.getBarTypeById(this.quote.barTypeId).pipe(catchError(() => of(null)))
        .subscribe(bt => this.barTypeData = bt);
    }

    if (this.quote.drinkThemeId) {
      this.themeService.getById(this.quote.drinkThemeId).pipe(catchError(() => of(null)))
        .subscribe(t => this.drinkThemeData = t);
    }

    this.addOnService.getAll().pipe(catchError(() => of({ data: [], total: 0 })))
      .subscribe(res => {
        const selectedIds = new Set(
          (this.quote?.addOnLines || []).map(l => l.addOnId).filter(Boolean)
        );
        this.suggestedAddOns = (res.data || [])
          .filter(a => a.active && !selectedIds.has(a._id))
          .slice(0, 4);
      });
  }

  // ── Getters ───────────────────────────────────────────────────────────────
  get guestCount(): number {
    return this.quote?.guestCount || Number(this.quote?.guests) || 0;
  }

  get experienceHeadline(): string {
    const pkg   = this.pkgData?.name || this.quote?.packageName;
    const theme = this.drinkThemeData?.name || this.quote?.drinkThemeName;
    if (pkg && theme) return `${pkg} · ${theme} Experience`;
    if (pkg)          return pkg;
    if (theme)        return `${theme} Experience`;
    return 'Bar Service Experience';
  }

  get includedServices(): { name: string; detail: string }[] {
    return (this.pkgData?.services || []).filter(s => s.included);
  }

  get packageUpsells(): { name: string; detail: string; price: number }[] {
    return (this.pkgData?.services || [])
      .filter(s => !s.included && !!s.addOnPrice)
      .map(s => ({ name: s.name, detail: s.detail, price: s.addOnPrice! }));
  }

  get populatedDrinks(): Drink[] {
    if (!this.drinkThemeData) return [];
    return getPopulatedDrinks(this.drinkThemeData);
  }

  get hasBeers(): boolean      { return (this.pkgData?.beers || []).length > 0; }
  get hasBeverages(): boolean  { return (this.pkgData?.beverages || []).length > 0; }
  get hasWines(): boolean      { return (this.pkgData?.wines || []).length > 0; }
  get hasMixers(): boolean     { return (this.pkgData?.mixers || []).length > 0; }

  get hasDrinkContent(): boolean {
    return this.hasBeers || this.hasBeverages || this.hasWines ||
           this.hasMixers || this.populatedDrinks.length > 0;
  }

  get packageGuestTotal(): number {
    return this.guestCount * (this.quote?.pricePerGuest || 0);
  }

  get addOnsTotal(): number {
    return (this.quote?.addOnLines || []).reduce((s, l) => s + (l.price || 0), 0);
  }

  get hasUpsells(): boolean {
    return this.packageUpsells.length > 0 || this.suggestedAddOns.length > 0;
  }

  // ── Conversion getters ────────────────────────────────────────────────────

  /** Calendar days until the event. -1 if no date set. */
  get daysUntilEvent(): number {
    if (!this.quote?.eventDate) return -1;
    const diff = new Date(this.quote.eventDate).getTime() - Date.now();
    return Math.ceil(diff / 86_400_000);
  }

  /** Total divided by guest count. 0 when guests unknown. */
  get pricePerPerson(): number {
    if (!this.guestCount || !this.quote?.total) return 0;
    return Math.round(this.quote.total / this.guestCount);
  }

  /** Quote is valid for 14 days from creation. Returns days remaining. */
  get daysUntilExpiry(): number {
    if (!this.quote?.createdAt) return -1;
    const expiry = new Date(this.quote.createdAt);
    expiry.setDate(expiry.getDate() + 14);
    return Math.ceil((expiry.getTime() - Date.now()) / 86_400_000);
  }

  get quoteExpiryDate(): Date | null {
    if (!this.quote?.createdAt) return null;
    const d = new Date(this.quote.createdAt);
    d.setDate(d.getDate() + 14);
    return d;
  }

  /** Quote expires within 3 days. */
  get isExpiringSoon(): boolean {
    return this.daysUntilExpiry > 0 && this.daysUntilExpiry <= 3;
  }

  /** Quote has expired. */
  get quoteExpired(): boolean {
    return this.daysUntilExpiry === 0;
  }

  /** First 2 suggested add-ons are marked "popular". */
  get popularUpsellIds(): Set<string> {
    return new Set(this.suggestedAddOns.slice(0, 2).map(a => a._id));
  }

  /** Event is coming up within 60 days → show urgency. */
  get showUrgency(): boolean {
    return this.daysUntilEvent > 0 && this.daysUntilEvent <= 60;
  }

  /** Human-readable days-to-event string. */
  get eventCountdownLabel(): string {
    const d = this.daysUntilEvent;
    if (d <= 0)  return '';
    if (d === 1) return 'Tomorrow';
    if (d <= 7)  return `${d} days away`;
    if (d <= 30) return `${d} days away`;
    const weeks = Math.round(d / 7);
    return `${weeks} week${weeks > 1 ? 's' : ''} away`;
  }

  // ── Icon helpers ──────────────────────────────────────────────────────────
  eventTypeIcon(type: string): string {
    const map: Record<string, string> = {
      'Wedding': 'favorite', 'Corporate Event': 'business_center',
      'Birthday': 'cake', 'Anniversary': 'celebration',
      'Graduation': 'school', 'Quinceañera': 'local_florist',
      'Social Gathering': 'groups', 'Other': 'more_horiz',
    };
    return map[type] || 'event';
  }

  barTypeIcon(): string {
    const c = (this.barTypeData?.category || '').toLowerCase();
    if (c.includes('mobile'))                      return 'directions_car';
    if (c.includes('beer') || c.includes('wine'))  return 'wine_bar';
    if (c.includes('full') || c.includes('open'))  return 'local_bar';
    if (c.includes('premium') || c.includes('vip')) return 'diamond';
    return 'sports_bar';
  }

  themeIcon(): string {
    const s = (this.drinkThemeData?.style || '').toLowerCase();
    if (s.includes('tropical'))  return 'beach_access';
    if (s.includes('classic'))   return 'wine_bar';
    if (s.includes('holiday'))   return 'celebration';
    if (s.includes('mocktail'))  return 'emoji_food_beverage';
    if (s.includes('premium'))   return 'diamond';
    return 'local_bar';
  }

  addonCategoryIcon(category: string): string {
    const map: Record<string, string> = {
      bartending: 'sports_bar', bar: 'storefront',
      cocktail: 'local_bar', equipment: 'handyman', other: 'add_circle_outline',
    };
    return map[category] || 'add_circle_outline';
  }

  // ── Status ────────────────────────────────────────────────────────────────
  getStatusColor(status: string): string {
    return this.statuses.find(s => s.value === status)?.color ?? '#94a3b8';
  }

  getStatusLabel(status: string): string {
    return this.statuses.find(s => s.value === status)?.label ?? status;
  }

  setStatus(status: Quote['status']): void {
    if (!this.quote?._id || this.quote.status === status) return;
    this.updatingStatus = true;
    this.quotesService.updateStatus(this.quote._id, status).subscribe({
      next: (res) => {
        this.quote = res.data;
        this.updatingStatus = false;
        this.showToast(`Status → ${status}`, 'success');
      },
      error: () => {
        this.updatingStatus = false;
        this.showToast('Error updating status', 'error');
      },
    });
  }

  // ── Navigation / Actions ──────────────────────────────────────────────────
  edit(): void        { if (this.quote?._id) this.router.navigate(['/quotes', this.quote._id, 'edit']); }
  goBack(): void      { this.router.navigate(['/quotes']); }
  openBuilder(): void { if (this.quote?._id) this.router.navigate(['/quotes', this.quote._id, 'build']); }

  sendToClient(): void {
    if (!this.quote?._id || this.sending) return;
    this.sending = true;
    this.quotesService.sendQuote(this.quote._id).subscribe({
      next: (res) => {
        this.quote   = res.data;
        this.sending = false;
        this.showToast('Quote sent to client successfully', 'success');
      },
      error: (err) => {
        this.sending = false;
        const msg = err?.error?.message || 'Error sending quote';
        this.showToast(msg, 'error');
      },
    });
  }

  convertToReservation(): void {
    if (!this.quote) return;
    this.router.navigate(['/reservations/new'], {
      queryParams: {
        quoteId: this.quote._id, title: this.quote.eventName,
        eventDate: this.quote.eventDate, location: this.quote.location,
        guests: this.quote.guestCount || this.quote.guests,
        packageName: this.quote.packageName || '',
        total: this.quote.total || 0,
        clientName: this.quote.fullName, email: this.quote.email, phone: this.quote.phone,
        notes: `Quote approved. Package: ${this.quote.packageName || 'N/A'}. Total: $${this.quote.total || 0}.\n\n${this.quote.notes || ''}`.trim(),
      }
    });
  }

  showToast(message: string, type: 'success' | 'error'): void {
    this.toast = { message, type };
    setTimeout(() => this.toast = null, 3000);
  }
}
