import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';

import { EventService, Event as ReservationEvent, ServiceConfig, ServiceAddOnLine } from '../../services/event.service';
import { BartenderService, Bartender } from '../../../bartenders/services/bartender.service';
import { PackageService } from '../../../packages/services/package.service';
import { Package } from '../../../packages/models/package.model';
import { BarTypeService, BarType } from '../../../bar-types/services/bar-type.service';
import { DrinkThemeService } from '../../../drink-themes/services/drink-theme.service';
import { DrinkTheme } from '../../../drink-themes/models/drink-theme.model';
import { AddOnService } from '../../../add-ons/services/add-on.service';
import { AddOn } from '../../../add-ons/models/add-on.model';
import { QuotesService } from '../../../quotes/services/quotes.service';
import { ToastService } from '../../../shared/services/toast.service';

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: 'Pending',   color: '#f59e0b', bg: 'rgba(245,158,11,0.12)'  },
  confirmed: { label: 'Confirmed', color: '#34d399', bg: 'rgba(52,211,153,0.12)'  },
  cancelled: { label: 'Cancelled', color: '#ef4444', bg: 'rgba(239,68,68,0.12)'   },
  completed: { label: 'Completed', color: '#60a5fa', bg: 'rgba(96,165,250,0.12)'  },
  PENDIENTE: { label: 'Pending',   color: '#f59e0b', bg: 'rgba(245,158,11,0.12)'  },
  APROBADO:  { label: 'Confirmed', color: '#34d399', bg: 'rgba(52,211,153,0.12)'  },
  RECHAZADO: { label: 'Cancelled', color: '#ef4444', bg: 'rgba(239,68,68,0.12)'   },
};

@Component({
  selector: 'app-reservation-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './reservation-detail.component.html',
  styleUrl: './reservation-detail.component.scss',
})
export class ReservationDetailComponent implements OnInit {
  private route            = inject(ActivatedRoute);
  private router           = inject(Router);
  private eventService     = inject(EventService);
  private bartenderService = inject(BartenderService);
  private packageService   = inject(PackageService);
  private barTypeService   = inject(BarTypeService);
  private drinkThemeService= inject(DrinkThemeService);
  private addOnService     = inject(AddOnService);
  private quotesService    = inject(QuotesService);
  private toastService     = inject(ToastService);

  reservation: ReservationEvent | null = null;
  allBartenders: Bartender[] = [];

  // ── Bartender multi-select ────────────────────────────────────────────────
  selectedBartenderIds: string[] = [];
  showBartenderPicker  = false;
  editingBartenders    = false;
  availableOnDateIds: Set<string> = new Set();
  dateAvailabilityLoaded = false;

  // ── Catalog data ──────────────────────────────────────────────────────────
  packages:    Package[]   = [];
  barTypes:    BarType[]   = [];
  drinkThemes: DrinkTheme[] = [];
  allAddOns:   AddOn[]    = [];

  // ── Service Sheet state ───────────────────────────────────────────────────
  editingServices   = false;
  savingServices    = false;

  // Form fields (mirrors ServiceConfig)
  sc_packageId:      string = '';
  sc_packageName:    string = '';
  sc_barTypeId:      string = '';
  sc_barTypeName:    string = '';
  sc_drinkThemeId:   string = '';
  sc_drinkThemeName: string = '';
  sc_addOnLines:     ServiceAddOnLine[] = [];
  sc_pricePerGuest:  number = 0;
  sc_packageBasePrice: number = 0;
  sc_subtotal:       number = 0;
  sc_discount:       number = 0;
  sc_total:          number = 0;
  sc_notes:          string = '';

  // Add-on picker
  showAddOnPicker = false;

  // Generate Quote
  generatingQuote = false;

  loading = true;
  saving  = false;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    // Load catalog + bartenders in parallel
    forkJoin({
      bartenders: this.bartenderService.getBartenders(),
      packages:   this.packageService.getAll(),
      barTypes:   this.barTypeService.getBarTypes(),
      themes:     this.drinkThemeService.getAll(),
      addOns:     this.addOnService.getAll(),
    }).subscribe({
      next: ({ bartenders, packages, barTypes, themes, addOns }) => {
        this.allBartenders = bartenders;
        this.packages      = packages;
        this.barTypes      = barTypes;
        this.drinkThemes   = themes;
        this.allAddOns     = addOns.data || [];
      },
      error: (err) => console.error('Error loading catalogs:', err),
    });

    if (id) {
      this.eventService.getEventById(id).subscribe({
        next: (data) => {
          this.reservation = data;
          this.loading = false;

          const assigned = (data.assignedBartenders || []) as any[];
          this.selectedBartenderIds = assigned
            .map(b => (typeof b === 'object' ? b._id : b))
            .filter(Boolean);

          // Load availability
          const dateStr = data.eventDate || (data as any).eventInfo?.date;
          if (dateStr) {
            this.bartenderService.getAvailableByDate(dateStr, data._id).subscribe({
              next: (avail) => {
                this.availableOnDateIds = new Set(avail.map(b => b._id!));
                this.dateAvailabilityLoaded = true;
              },
              error: () => { this.dateAvailabilityLoaded = true; },
            });
          }

          // Prime service sheet form from existing serviceConfig
          this.loadServiceSheetFromReservation(data);
        },
        error: () => { this.loading = false; },
      });
    }
  }

  // ── Service Sheet helpers ─────────────────────────────────────────────────

  private loadServiceSheetFromReservation(ev: ReservationEvent): void {
    const sc = ev.serviceConfig ?? {};
    this.sc_packageId       = sc.packageId       || '';
    this.sc_packageName     = sc.packageName     || ev.packageName || '';
    this.sc_barTypeId       = sc.barTypeId       || '';
    this.sc_barTypeName     = sc.barTypeName     || '';
    this.sc_drinkThemeId    = sc.drinkThemeId    || '';
    this.sc_drinkThemeName  = sc.drinkThemeName  || '';
    this.sc_addOnLines      = (sc.addOnLines     || []).map(a => ({ ...a }));
    this.sc_pricePerGuest   = sc.pricePerGuest   || 0;
    this.sc_packageBasePrice= sc.packageBasePrice|| 0;
    this.sc_subtotal        = sc.subtotal        || 0;
    this.sc_discount        = sc.discount        || 0;
    this.sc_total           = sc.total           || ev.quotedTotal || 0;
    this.sc_notes           = sc.notes           || ev.notes       || '';
  }

  get hasServiceConfig(): boolean {
    return !!(
      this.sc_packageId    ||
      this.sc_barTypeId    ||
      this.sc_drinkThemeId ||
      this.sc_addOnLines.length > 0 ||
      this.sc_total > 0
    );
  }

  onPackageChange(pkgId: string): void {
    this.sc_packageId = pkgId;
    const pkg = this.packages.find(p => p._id === pkgId);
    if (pkg) {
      this.sc_packageName     = pkg.name;
      this.sc_packageBasePrice= pkg.basePrice    || 0;
      this.sc_pricePerGuest   = pkg.pricePerGuest|| 0;
      this.recalcTotal();
    } else {
      this.sc_packageName = '';
    }
  }

  onBarTypeChange(btId: string): void {
    this.sc_barTypeId = btId;
    const bt = this.barTypes.find(b => b._id === btId);
    this.sc_barTypeName = bt?.name || '';
  }

  onDrinkThemeChange(dtId: string): void {
    this.sc_drinkThemeId = dtId;
    const dt = this.drinkThemes.find(d => d._id === dtId);
    this.sc_drinkThemeName = dt?.name || '';
  }

  isAddOnSelected(id: string): boolean {
    return this.sc_addOnLines.some(l => l.addOnId === id);
  }

  toggleAddOn(addOn: AddOn): void {
    if (this.isAddOnSelected(addOn._id)) {
      this.sc_addOnLines = this.sc_addOnLines.filter(l => l.addOnId !== addOn._id);
    } else {
      this.sc_addOnLines = [
        ...this.sc_addOnLines,
        { addOnId: addOn._id, name: addOn.name, detail: addOn.defaultDetail || '', price: addOn.defaultPrice || 0 },
      ];
    }
    this.recalcTotal();
  }

  removeAddOn(addOnId: string): void {
    this.sc_addOnLines = this.sc_addOnLines.filter(l => l.addOnId !== addOnId);
    this.recalcTotal();
  }

  recalcTotal(): void {
    const addOnTotal = this.sc_addOnLines.reduce((s, a) => s + (a.price || 0), 0);
    this.sc_subtotal = this.sc_packageBasePrice + addOnTotal;
    this.sc_total    = Math.max(0, this.sc_subtotal - (this.sc_discount || 0));
  }

  saveServiceConfig(): void {
    if (!this.reservation?._id) return;
    this.savingServices = true;

    const serviceConfig: ServiceConfig = {
      packageId:       this.sc_packageId      || undefined,
      packageName:     this.sc_packageName    || undefined,
      barTypeId:       this.sc_barTypeId      || undefined,
      barTypeName:     this.sc_barTypeName    || undefined,
      drinkThemeId:    this.sc_drinkThemeId   || undefined,
      drinkThemeName:  this.sc_drinkThemeName || undefined,
      addOnLines:      this.sc_addOnLines,
      pricePerGuest:   this.sc_pricePerGuest  || undefined,
      packageBasePrice:this.sc_packageBasePrice|| undefined,
      subtotal:        this.sc_subtotal       || undefined,
      discount:        this.sc_discount       || undefined,
      total:           this.sc_total          || undefined,
      notes:           this.sc_notes          || undefined,
    };

    this.eventService.updateEvent(this.reservation._id, {
      serviceConfig,
      quotedTotal: this.sc_total,
      packageName: this.sc_packageName || undefined,
      notes:       this.sc_notes       || undefined,
    } as any).subscribe({
      next: () => {
        this.toastService.show('Service details saved!', 'success');
        this.reservation = { ...this.reservation!, serviceConfig, quotedTotal: this.sc_total };
        this.savingServices = false;
        this.editingServices = false;
        this.showAddOnPicker = false;
      },
      error: (err) => {
        const msg = err?.error?.message || 'Error saving service details.';
        this.toastService.show(msg, 'error');
        this.savingServices = false;
      },
    });
  }

  cancelServiceEdit(): void {
    this.loadServiceSheetFromReservation(this.reservation!);
    this.editingServices  = false;
    this.showAddOnPicker  = false;
  }

  // ── Generate Quote ────────────────────────────────────────────────────────

  generateQuote(): void {
    if (!this.reservation?._id) return;
    this.generatingQuote = true;

    this.quotesService.fromEvent(this.reservation._id).subscribe({
      next: (res) => {
        this.generatingQuote = false;
        const msg = res.existing ? 'Navigating to existing quote…' : 'Quote created! Opening builder…';
        this.toastService.show(msg, 'success');
        // Update local quoteId
        this.reservation = { ...this.reservation!, quoteId: res.data._id };
        setTimeout(() => this.router.navigate(['/quotes', res.data._id, 'builder']), 800);
      },
      error: (err) => {
        this.generatingQuote = false;
        const msg = err?.error?.message || 'Error generating quote.';
        this.toastService.show(msg, 'error');
      },
    });
  }

  // ── Misc ─────────────────────────────────────────────────────────────────

  statusInfo(status: string | undefined) {
    return STATUS_MAP[status ?? 'pending'] ?? STATUS_MAP['pending'];
  }

  clientName(): string {
    const c = this.reservation?.clientId as any;
    if (c?.name) return `${c.name} ${c.lastName ?? ''}`.trim();
    return (this.reservation as any)?.clientName || '—';
  }

  clientInitials(): string {
    const name = this.clientName();
    if (name === '—') return '?';
    const parts = name.split(' ').filter(Boolean);
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase();
  }

  clientEmail(): string {
    const c = this.reservation?.clientId as any;
    return c?.email || (this.reservation as any)?.email || '—';
  }

  clientPhone(): string {
    const c = this.reservation?.clientId as any;
    return c?.phone || (this.reservation as any)?.phone || '—';
  }

  isPending(): boolean {
    const s = this.reservation?.status ?? '';
    return s === 'pending' || s === 'PENDIENTE';
  }

  isConfirmed(): boolean {
    const s = this.reservation?.status ?? '';
    return s === 'APROBADO' || s === 'confirmed';
  }

  goToEvent(): void {
    if (this.reservation?._id) this.router.navigate(['/events', this.reservation._id]);
  }

  // ── Bartender helpers ─────────────────────────────────────────────────────

  get selectedBartenders(): Bartender[] {
    return this.allBartenders.filter(b => this.selectedBartenderIds.includes(b._id!));
  }

  get pickerBartenders(): Bartender[] {
    const eligible   = this.allBartenders.filter(b =>
      this.isBartenderSelected(b._id!) || this.isAvailableOnDate(b._id!)
    );
    const unselected = eligible.filter(b => !this.isBartenderSelected(b._id!));
    const selected   = eligible.filter(b =>  this.isBartenderSelected(b._id!));
    return [...unselected, ...selected];
  }

  isBartenderSelected(id: string): boolean {
    return this.selectedBartenderIds.includes(id);
  }

  isAvailableOnDate(bartenderId: string): boolean {
    if (!this.dateAvailabilityLoaded) return true;
    return this.availableOnDateIds.has(bartenderId);
  }

  toggleBartender(id: string): void {
    if (this.isBartenderSelected(id)) {
      this.selectedBartenderIds = this.selectedBartenderIds.filter(x => x !== id);
    } else {
      this.selectedBartenderIds = [...this.selectedBartenderIds, id];
    }
  }

  removeBartender(id: string): void {
    this.selectedBartenderIds = this.selectedBartenderIds.filter(x => x !== id);
  }

  bartenderInitials(b: Bartender): string {
    return ((b.name?.[0] ?? '') + (b.lastName?.[0] ?? '')).toUpperCase();
  }

  // ── Bartender actions ─────────────────────────────────────────────────────

  confirm(): void {
    if (this.selectedBartenderIds.length === 0) {
      this.toastService.show('Assign at least one bartender before confirming.', 'warning');
      return;
    }
    this.saving = true;
    this.eventService.updateEvent(this.reservation!._id!, {
      status: 'APROBADO',
      assignedBartenders: this.selectedBartenderIds,
    }).subscribe({
      next: () => {
        this.toastService.show('Reservation confirmed!', 'success');
        this.reservation = { ...this.reservation!, status: 'APROBADO' };
        this.saving = false;
        this.showBartenderPicker = false;
      },
      error: (err) => {
        const msg = err?.error?.message || 'Error confirming reservation.';
        this.toastService.show(msg, 'error');
        this.saving = false;
      },
    });
  }

  cancel(): void {
    this.saving = true;
    this.eventService.updateEvent(this.reservation!._id!, { status: 'RECHAZADO' }).subscribe({
      next: () => {
        this.toastService.show('Reservation cancelled.', 'warning');
        this.reservation = { ...this.reservation!, status: 'RECHAZADO' };
        this.saving = false;
      },
      error: () => {
        this.toastService.show('Error cancelling reservation.', 'error');
        this.saving = false;
      },
    });
  }

  saveBartenders(): void {
    this.saving = true;
    this.eventService.updateEvent(this.reservation!._id!, {
      assignedBartenders: this.selectedBartenderIds,
    }).subscribe({
      next: () => {
        this.toastService.show('Bartenders updated!', 'success');
        this.saving = false;
        this.editingBartenders = false;
        this.showBartenderPicker = false;
      },
      error: (err) => {
        const msg = err?.error?.message || 'Error updating bartenders.';
        this.toastService.show(msg, 'error');
        this.saving = false;
      },
    });
  }

  cancelEditBartenders(): void {
    const assigned = (this.reservation?.assignedBartenders || []) as any[];
    this.selectedBartenderIds = assigned
      .map(b => (typeof b === 'object' ? b._id : b))
      .filter(Boolean);
    this.editingBartenders = false;
    this.showBartenderPicker = false;
  }

  goBack(): void { this.router.navigate(['/reservations']); }
}
