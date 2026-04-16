import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { EventService, Event as ReservationEvent } from '../../../reservations/services/event.service';
import { BartenderService, Bartender } from '../../../bartenders/services/bartender.service';
import { ClientService } from '../../../clients/services/client.service';
import { PackageService } from '../../../packages/services/package.service';
import { DrinkService } from '../../../drinks/services/drink.service';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard-home.component.html',
  styleUrl: './dashboard-home.component.scss',
})
export class DashboardHomeComponent implements OnInit {
  private eventService     = inject(EventService);
  private bartenderService = inject(BartenderService);
  private clientService    = inject(ClientService);
  private packageService   = inject(PackageService);
  private drinkService     = inject(DrinkService);
  private router           = inject(Router);

  loading = true;

  // Raw data
  allEvents:     ReservationEvent[] = [];
  allBartenders: Bartender[]        = [];
  clientCount  = 0;
  packageCount = 0;
  drinkCount   = 0;

  today00 = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  })();

  ngOnInit(): void {
    forkJoin({
      events:     this.eventService.getEvents(),
      bartenders: this.bartenderService.getBartenders(),
      clients:    this.clientService.getClients(),
      packages:   this.packageService.getAll(),
      drinks:     this.drinkService.getAll(),
    }).subscribe({
      next: ({ events, bartenders, clients, packages, drinks }) => {
        this.allEvents     = events;
        this.allBartenders = bartenders;
        this.clientCount   = clients.length;
        this.packageCount  = packages.length;
        this.drinkCount    = drinks.length;
        this.loading       = false;
      },
      error: () => { this.loading = false; },
    });
  }

  // ── KPI Computed ─────────────────────────────────────────────────────────

  get totalReservations(): number { return this.allEvents.length; }

  get upcomingEvents(): ReservationEvent[] {
    return this.allEvents
      .filter(e => {
        const d = this.resolveDate(e);
        if (!d) return false;
        return new Date(d) >= this.today00 &&
          (e.status === 'APROBADO' || e.status === 'confirmed');
      })
      .sort((a, b) => new Date(this.resolveDate(a)!).getTime() - new Date(this.resolveDate(b)!).getTime())
      .slice(0, 8);
  }

  get pendingReservations(): number {
    return this.allEvents.filter(e =>
      e.status === 'PENDIENTE' || e.status === 'pending'
    ).length;
  }

  get availableBartenders(): number {
    return this.allBartenders.filter(b => b.status === 'AVAILABLE').length;
  }

  get busyBartenders(): number {
    return this.allBartenders.filter(b => b.status === 'BUSY').length;
  }

  // ── Alerts ───────────────────────────────────────────────────────────────

  get alerts(): { title: string; description: string; severity: 'warning' | 'danger' | 'info'; route?: string }[] {
    const list: { title: string; description: string; severity: 'warning' | 'danger' | 'info'; route?: string }[] = [];

    const noBartender = this.allEvents.filter(e =>
      (e.status === 'APROBADO' || e.status === 'confirmed') &&
      (!e.assignedBartenders || e.assignedBartenders.length === 0)
    );
    if (noBartender.length > 0) {
      list.push({
        title: `${noBartender.length} confirmed event${noBartender.length > 1 ? 's' : ''} without bartender`,
        description: 'Assign a bartender before the event date.',
        severity: 'danger',
        route: '/reservations',
      });
    }

    if (this.pendingReservations > 0) {
      list.push({
        title: `${this.pendingReservations} reservation${this.pendingReservations > 1 ? 's' : ''} pending review`,
        description: 'Review and confirm or reject these reservations.',
        severity: 'warning',
        route: '/reservations',
      });
    }

    if (this.availableBartenders === 0 && this.allBartenders.length > 0) {
      list.push({
        title: 'No bartenders available',
        description: 'All bartenders are either busy or unavailable.',
        severity: 'danger',
        route: '/bartenders',
      });
    }

    if (list.length === 0) {
      list.push({
        title: 'Everything looks good',
        description: 'No pending actions or alerts at this time.',
        severity: 'info',
      });
    }

    return list;
  }

  // ── Catalog summary ───────────────────────────────────────────────────────

  get catalogSummary() {
    return [
      { label: 'Packages',   value: this.packageCount,              route: '/packages',   icon: 'inventory_2' },
      { label: 'Drinks',     value: this.drinkCount,                route: '/drinks',     icon: 'local_bar'   },
      { label: 'Bartenders', value: this.allBartenders.length,      route: '/bartenders', icon: 'person'      },
      { label: 'Clients',    value: this.clientCount,               route: '/clients',    icon: 'group'       },
      { label: 'Confirmed',  value: this.upcomingEvents.length,     route: '/reservations', icon: 'event'    },
      { label: 'Pending',    value: this.pendingReservations,        route: '/reservations', icon: 'schedule' },
    ];
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  resolveDate(e: ReservationEvent): string | undefined {
    return e.eventDate || (e as any).eventInfo?.date;
  }

  resolveTitle(e: ReservationEvent): string {
    return e.title || (e as any).eventInfo?.title || 'Sin título';
  }

  resolveLocation(e: ReservationEvent): string {
    return e.location || (e as any).eventInfo?.location || '—';
  }

  clientName(e: ReservationEvent): string {
    const c = e.clientId as any;
    if (c?.name) return `${c.name} ${c.lastName ?? ''}`.trim();
    return (e as any).clientName || '—';
  }

  bartenderNames(e: ReservationEvent): string {
    const arr = e.assignedBartenders || [];
    if (arr.length === 0) return '—';
    return arr.map((b: any) =>
      typeof b === 'object' ? `${b.name} ${b.lastName ?? ''}`.trim() : b
    ).join(', ');
  }

  statusLabel(status: string | undefined): string {
    const map: Record<string, string> = {
      APROBADO: 'Confirmed', confirmed: 'Confirmed',
      PENDIENTE: 'Pending',  pending:   'Pending',
      RECHAZADO: 'Cancelled',cancelled: 'Cancelled',
      FINALIZADO: 'Completed',completed: 'Completed',
    };
    return map[status ?? ''] ?? (status ?? '—');
  }

  statusClass(status: string | undefined): string {
    const s = status ?? '';
    if (s === 'APROBADO' || s === 'confirmed')  return 'confirmed';
    if (s === 'PENDIENTE' || s === 'pending')   return 'pending';
    if (s === 'RECHAZADO' || s === 'cancelled') return 'cancelled';
    return 'completed';
  }

  bartenderStatusClass(b: Bartender): string {
    switch (b.status) {
      case 'AVAILABLE':   return 'available';
      case 'BUSY':        return 'busy';
      case 'UNAVAILABLE': return 'unavailable';
      default:            return '';
    }
  }

  initials(b: Bartender): string {
    return ((b.name?.[0] ?? '') + (b.lastName?.[0] ?? '')).toUpperCase();
  }

  navigateTo(route?: string): void {
    if (route) this.router.navigate([route]);
  }

  quickActions = [
    { label: 'New Reservation', description: 'Create a new event booking',  route: '/reservations/new', icon: 'add_circle' },
    { label: 'New Quote',       description: 'Build a pricing proposal',     route: '/quotes/new',       icon: 'receipt_long' },
    { label: 'New Client',      description: 'Add a new customer profile',   route: '/clients/new',      icon: 'person_add' },
    { label: 'New Drink',       description: 'Create a new drink recipe',    route: '/drinks/new',       icon: 'local_bar' },
  ];
}
