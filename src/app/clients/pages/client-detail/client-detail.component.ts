import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ClientService, Client } from '../../services/client.service';
import { EventService, Event as ReservationEvent } from '../../../reservations/services/event.service';
import { QuotesService } from '../../../quotes/services/quotes.service';
import { Quote } from '../../../quotes/models/quote.model';

@Component({
  selector: 'app-client-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './client-detail.component.html',
  styleUrl: './client-detail.component.scss',
})
export class ClientDetailComponent implements OnInit {
  private route          = inject(ActivatedRoute);
  private router         = inject(Router);
  private clientService  = inject(ClientService);
  private eventService   = inject(EventService);
  private quotesService  = inject(QuotesService);

  client: Client | null = null;
  clientEvents: ReservationEvent[] = [];
  clientQuotes: Quote[]             = [];
  loading       = true;
  loadingRelated = true;

  today00 = (() => {
    const d = new Date(); d.setHours(0,0,0,0); return d;
  })();

  activeTab: 'events' | 'quotes' = 'events';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.clientService.getClientById(id).subscribe({
      next: (data) => {
        this.client  = data;
        this.loading = false;
        this.loadRelatedData(id, data);
      },
      error: () => { this.loading = false; },
    });
  }

  private loadRelatedData(clientId: string, client: Client): void {
    forkJoin({
      events: this.eventService.getEvents(),
      quotes: this.quotesService.getQuotes(),
    }).subscribe({
      next: ({ events, quotes }) => {
        // Match events by clientId (object or string) OR by email
        this.clientEvents = events
          .filter(e => {
            const cid = typeof e.clientId === 'object'
              ? (e.clientId as any)?._id
              : e.clientId;
            if (cid && cid === clientId) return true;
            // fallback: match by email
            const evEmail = (e as any).email || (e.clientId as any)?.email;
            return evEmail && evEmail === client.email;
          })
          .sort((a, b) =>
            new Date(this.resolveDate(b) || 0).getTime() -
            new Date(this.resolveDate(a) || 0).getTime()
          );

        // Match quotes by clientId OR email
        this.clientQuotes = (quotes.data || [])
          .filter(q => {
            if (q.clientId && q.clientId === clientId) return true;
            return q.email && q.email === client.email;
          })
          .sort((a, b) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
          );

        this.loadingRelated = false;
      },
      error: () => { this.loadingRelated = false; },
    });
  }

  // ── Computed stats ────────────────────────────────────────────────────────

  get upcomingEventsCount(): number {
    return this.clientEvents.filter(e => {
      const d = this.resolveDate(e);
      return d && new Date(d) >= this.today00 &&
        (e.status === 'APROBADO' || e.status === 'confirmed');
    }).length;
  }

  get totalSpend(): number {
    return this.clientEvents
      .filter(e => e.status === 'APROBADO' || e.status === 'confirmed' || e.status === 'FINALIZADO')
      .reduce((s, e) => s + (e.quotedTotal || 0), 0);
  }

  get latestQuoteTotal(): number {
    return this.clientQuotes[0]?.total || 0;
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  getFullName(): string {
    return `${this.client?.name ?? ''} ${this.client?.lastName ?? ''}`.trim();
  }

  initials(): string {
    return ((this.client?.name?.[0] ?? '') + (this.client?.lastName?.[0] ?? '')).toUpperCase();
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

  isUpcoming(e: ReservationEvent): boolean {
    const d = this.resolveDate(e);
    return !!d && new Date(d) >= this.today00;
  }

  eventStatusLabel(status: string | undefined): string {
    const map: Record<string, string> = {
      APROBADO: 'Confirmed', confirmed: 'Confirmed',
      PENDIENTE: 'Pending',  pending:   'Pending',
      RECHAZADO: 'Cancelled',cancelled: 'Cancelled',
      FINALIZADO: 'Completed',completed: 'Completed',
    };
    return map[status ?? ''] ?? (status ?? '—');
  }

  eventStatusClass(status: string | undefined): string {
    const s = status ?? '';
    if (s === 'APROBADO' || s === 'confirmed')  return 'confirmed';
    if (s === 'PENDIENTE' || s === 'pending')   return 'pending';
    if (s === 'RECHAZADO' || s === 'cancelled') return 'cancelled';
    return 'completed';
  }

  quoteStatusClass(status: string | undefined): string {
    const s = status ?? '';
    if (s === 'approved')  return 'confirmed';
    if (s === 'draft')     return 'pending';
    if (s === 'rejected')  return 'cancelled';
    if (s === 'sent')      return 'sent';
    return 'pending';
  }

  quoteStatusLabel(status: string | undefined): string {
    const map: Record<string, string> = {
      draft: 'Draft', sent: 'Sent', approved: 'Approved', rejected: 'Rejected',
    };
    return map[status ?? ''] ?? (status ?? '—');
  }

  // ── Navigation ────────────────────────────────────────────────────────────

  editClient(): void   { this.router.navigate(['/clients', this.client?._id, 'edit']); }
  goBack(): void       { this.router.navigate(['/clients']); }
  goToEvent(id?: string): void  { if (id) this.router.navigate(['/reservations', id]); }
  goToQuote(id?: string): void  { if (id) this.router.navigate(['/quotes', id]); }
  newQuote(): void     { this.router.navigate(['/quotes/new'], { queryParams: { clientId: this.client?._id } }); }
  newReservation(): void {
    this.router.navigate(['/reservations/new'], { queryParams: { clientId: this.client?._id } });
  }
}
