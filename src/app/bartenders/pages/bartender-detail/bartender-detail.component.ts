import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';
import { BartenderService, Bartender } from '../../services/bartender.service';
import { EventService, Event as ReservationEvent } from '../../../reservations/services/event.service';

@Component({
  selector: 'app-bartender-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './bartender-detail.component.html',
  styleUrl: './bartender-detail.component.scss'
})
export class BartenderDetailComponent implements OnInit {
  private route            = inject(ActivatedRoute);
  private router           = inject(Router);
  private bartenderService = inject(BartenderService);
  private eventService     = inject(EventService);

  bartender: Bartender | null = null;
  assignedEvents: ReservationEvent[] = [];
  loadingEvents = true;

  today = new Date();
  today00 = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate());

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.bartenderService.getBartenderById(id).subscribe({
      next: (data) => { this.bartender = data; },
      error: (err)  => console.error('Error cargando bartender:', err),
    });

    // Load all events and filter those where this bartender is assigned
    this.eventService.getEvents().subscribe({
      next: (events) => {
        this.assignedEvents = events.filter(e =>
          (e.assignedBartenders || []).some((b: any) => {
            const bid = typeof b === 'object' ? b._id : b;
            return bid === id;
          })
        ).sort((a, b) => {
          const da = new Date(this.eventDate(a)).getTime();
          const db = new Date(this.eventDate(b)).getTime();
          return db - da; // Most recent first
        });
        this.loadingEvents = false;
      },
      error: () => { this.loadingEvents = false; },
    });
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  getFullName(): string {
    return `${this.bartender?.name ?? ''} ${this.bartender?.lastName ?? ''}`.trim();
  }

  initials(): string {
    const n = this.bartender?.name?.[0] ?? '';
    const l = this.bartender?.lastName?.[0] ?? '';
    return (n + l).toUpperCase();
  }

  /** Resolve event date from flat or nested structure */
  eventDate(e: ReservationEvent): string {
    return e.eventDate || (e as any).eventInfo?.date || '';
  }

  eventTitle(e: ReservationEvent): string {
    return e.title || (e as any).eventInfo?.title || 'Sin título';
  }

  eventLocation(e: ReservationEvent): string {
    return e.location || (e as any).eventInfo?.location || '—';
  }

  isUpcoming(e: ReservationEvent): boolean {
    const d = this.eventDate(e);
    if (!d) return false;
    return new Date(d) >= this.today00;
  }

  get upcomingCount(): number {
    return this.assignedEvents.filter(e => this.isUpcoming(e)).length;
  }

  get totalCount(): number {
    return this.assignedEvents.length;
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
    if (s === 'FINALIZADO'|| s === 'completed') return 'completed';
    return 'pending';
  }

  bartenderStatusClass(): string {
    switch (this.bartender?.status) {
      case 'AVAILABLE':   return 'available';
      case 'BUSY':        return 'busy';
      case 'UNAVAILABLE': return 'unavailable';
      default:            return '';
    }
  }

  // ── Navigation ────────────────────────────────────────────────────────────

  editBartender(): void {
    this.router.navigate(['/bartenders', this.bartender?._id, 'edit']);
  }

  goBack(): void {
    this.router.navigate(['/bartenders']);
  }

  goToEvent(id: string | undefined): void {
    if (id) this.router.navigate(['/reservations', id]);
  }
}
