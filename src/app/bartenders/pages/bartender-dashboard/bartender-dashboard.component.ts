import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { EventService, Event as ReservationEvent } from '../../../reservations/services/event.service';

@Component({
  selector: 'app-bartender-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './bartender-dashboard.component.html',
  styleUrl: './bartender-dashboard.component.scss',
})
export class BartenderDashboardComponent implements OnInit {
  private auth         = inject(AuthService);
  private eventService = inject(EventService);

  user    = this.auth.user();
  events: ReservationEvent[] = [];
  loading = true;

  today = (() => { const d = new Date(); d.setHours(0,0,0,0); return d; })();

  ngOnInit(): void {
    this.eventService.getEvents().subscribe({
      next: (all) => {
        const myId = this.user?.id ?? '';
        this.events = all
          .filter(e => {
            const assigned: any[] = (e as any).assignedBartenders || [];
            return assigned.some(b =>
              (typeof b === 'string' ? b : b?._id?.toString()) === myId
            );
          })
          .sort((a, b) =>
            new Date(this.resolveDate(b) || 0).getTime() -
            new Date(this.resolveDate(a) || 0).getTime()
          );
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  get upcoming(): ReservationEvent[] {
    return this.events.filter(e => {
      const d = this.resolveDate(e);
      return d && new Date(d) >= this.today;
    });
  }

  get past(): ReservationEvent[] {
    return this.events.filter(e => {
      const d = this.resolveDate(e);
      return !d || new Date(d) < this.today;
    });
  }

  get initials(): string {
    const u = this.user;
    return ((u?.name?.[0] ?? '') + (u?.lastName?.[0] ?? '')).toUpperCase();
  }

  resolveDate(e: ReservationEvent): string | undefined {
    return e.eventDate || (e as any).eventInfo?.date;
  }

  resolveTitle(e: ReservationEvent): string {
    return e.title || (e as any).eventInfo?.title || 'Sin título';
  }

  resolveLocation(e: ReservationEvent): string {
    return e.location || (e as any).eventInfo?.location || '—';
  }

  statusLabel(s?: string): string {
    const map: Record<string, string> = {
      APROBADO: 'Confirmed', confirmed: 'Confirmed',
      PENDIENTE: 'Pending',  pending: 'Pending',
      RECHAZADO: 'Cancelled', FINALIZADO: 'Completed',
    };
    return map[s ?? ''] ?? (s ?? '—');
  }

  statusClass(s?: string): string {
    if (s === 'APROBADO' || s === 'confirmed')  return 'confirmed';
    if (s === 'PENDIENTE' || s === 'pending')   return 'pending';
    if (s === 'RECHAZADO' || s === 'cancelled') return 'cancelled';
    return 'completed';
  }
}
