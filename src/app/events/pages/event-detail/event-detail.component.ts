import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { EventsService } from '../../services/events.service';
import { BaropsEvent, EVENT_STATUS, PAY_STATUS } from '../../models/event.model';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './event-detail.component.html',
  styleUrl: './event-detail.component.scss',
})
export class EventDetailComponent implements OnInit {
  private route         = inject(ActivatedRoute);
  private router        = inject(Router);
  private eventsService = inject(EventsService);

  event: BaropsEvent | null = null;
  loading    = true;
  error      = '';
  completing = false;

  actionMessage     = '';
  actionMessageType: 'success' | 'error' = 'success';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.eventsService.getById(id).subscribe({
        next: (data) => { this.event = data; this.loading = false; },
        error: () => { this.error = 'Could not load event.'; this.loading = false; },
      });
    }
  }

  statusInfo(s: string | undefined) { return EVENT_STATUS[s ?? 'APROBADO'] ?? EVENT_STATUS['APROBADO']; }
  payInfo(p: string | undefined)    { return PAY_STATUS[p  ?? 'UNPAID']    ?? PAY_STATUS['UNPAID'];      }

  // ── Getters ──
  getTitle():     string { return this.event?.eventInfo?.title    || (this.event as any)?.title     || '—'; }
  getDate():      string { return this.event?.eventInfo?.date     || (this.event as any)?.eventDate || '';  }
  getLocation():  string { return this.event?.eventInfo?.location || (this.event as any)?.location  || '—'; }
  getEventType(): string { return this.event?.eventInfo?.type     || (this.event as any)?.eventType || '';  }
  getStartTime(): string { return this.event?.eventInfo?.startTime || ''; }
  getEndTime():   string { return this.event?.eventInfo?.endTime   || ''; }

  getClientName(): string {
    const c = this.event?.clientId as any;
    if (c?.name) return `${c.name} ${c.lastName ?? ''}`.trim();
    return this.event?.clientName || '—';
  }

  getClientInitials(): string {
    const n = this.getClientName();
    if (!n || n === '—') return '?';
    const p = n.split(' ').filter(Boolean);
    return p.length >= 2 ? (p[0][0] + p[1][0]).toUpperCase() : n.slice(0, 2).toUpperCase();
  }

  getClientEmail(): string { const c = this.event?.clientId as any; return c?.email || this.event?.email || ''; }
  getClientPhone(): string { const c = this.event?.clientId as any; return c?.phone || this.event?.phone || ''; }

  getBartenders(): any[] { return (this.event?.assignedBartenders as any[]) || []; }

  getBartenderInitials(b: any): string {
    return `${b.name?.[0] ?? ''}${b.lastName?.[0] ?? ''}`.toUpperCase() || '?';
  }

  isConfirmed(): boolean { const s = this.event?.status ?? ''; return s === 'APROBADO'   || s === 'confirmed'; }
  isCompleted(): boolean { const s = this.event?.status ?? ''; return s === 'FINALIZADO' || s === 'completed'; }

  isToday(): boolean {
    const d = this.getDate(); if (!d) return false;
    return d.slice(0, 10) === new Date().toISOString().slice(0, 10);
  }

  markAsCompleted(): void {
    if (!this.event?._id || this.completing) return;
    this.completing = true;
    this.eventsService.markAsCompleted(this.event._id).subscribe({
      next:  (updated) => { this.event = updated; this.completing = false; this.showMessage('Event marked as completed!', 'success'); },
      error: ()        => { this.completing = false; this.showMessage('Error updating event.', 'error'); },
    });
  }

  showMessage(msg: string, type: 'success' | 'error'): void {
    this.actionMessage = msg; this.actionMessageType = type;
    setTimeout(() => this.actionMessage = '', 3200);
  }

  goBack():          void { this.router.navigate(['/events']); }
  goToQuote():       void { if (this.event?.quoteId) this.router.navigate(['/quotes', this.event.quoteId]); }
  goToReservation(): void { if (this.event?._id)    this.router.navigate(['/reservations', this.event._id]); }
}
