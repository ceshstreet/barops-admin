import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { EventService, Event as ReservationEvent } from '../../services/event.service';
import { BartenderService, Bartender } from '../../../bartenders/services/bartender.service';
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
  private toastService     = inject(ToastService);

  reservation: ReservationEvent | null = null;
  allBartenders: Bartender[] = [];

  // Multi-select state
  selectedBartenderIds: string[] = [];
  showBartenderPicker  = false;
  editingBartenders    = false;   // edit mode for confirmed reservations

  // Availability by date (IDs of bartenders free on event date)
  availableOnDateIds: Set<string> = new Set();
  dateAvailabilityLoaded = false;

  loading = true;
  saving  = false;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    // Load all bartenders (we show status indicators ourselves)
    this.bartenderService.getBartenders().subscribe({
      next: (data) => { this.allBartenders = data; },
      error: (err)  => console.error(err),
    });

    if (id) {
      this.eventService.getEventById(id).subscribe({
        next: (data) => {
          this.reservation = data;
          this.loading = false;

          // Extract IDs from populated assignedBartenders array
          const assigned = (data.assignedBartenders || []) as any[];
          this.selectedBartenderIds = assigned
            .map(b => (typeof b === 'object' ? b._id : b))
            .filter(Boolean);

          // Fetch which bartenders are free on this event's date
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
        },
        error: () => { this.loading = false; },
      });
    }
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

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

  // ── Bartender multi-select ────────────────────────────────────────────────

  get selectedBartenders(): Bartender[] {
    return this.allBartenders.filter(b => this.selectedBartenderIds.includes(b._id!));
  }

  get pickerBartenders(): Bartender[] {
    // Show unselected first, then selected — all visible
    const unselected = this.allBartenders.filter(b => !this.isBartenderSelected(b._id!));
    const selected   = this.allBartenders.filter(b =>  this.isBartenderSelected(b._id!));
    return [...unselected, ...selected];
  }

  isBartenderSelected(id: string): boolean {
    return this.selectedBartenderIds.includes(id);
  }

  isAvailableOnDate(bartenderId: string): boolean {
    if (!this.dateAvailabilityLoaded) return true; // optimistic before load
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

  // ── Actions ───────────────────────────────────────────────────────────────

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
      error: () => { this.toastService.show('Error cancelling reservation.', 'error'); this.saving = false; },
    });
  }

  /** Update bartenders on an already-confirmed reservation */
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
    // Restore from reservation data
    const assigned = (this.reservation?.assignedBartenders || []) as any[];
    this.selectedBartenderIds = assigned
      .map(b => (typeof b === 'object' ? b._id : b))
      .filter(Boolean);
    this.editingBartenders = false;
    this.showBartenderPicker = false;
  }

  goBack(): void { this.router.navigate(['/reservations']); }
}
