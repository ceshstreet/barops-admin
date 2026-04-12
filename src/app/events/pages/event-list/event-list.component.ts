import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventsService } from '../../services/events.service';
import { BaropsEvent, EVENT_STATUS, PAY_STATUS } from '../../models/event.model';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, FullCalendarModule],
  templateUrl: './event-list.component.html',
  styleUrl: './event-list.component.scss',
})
export class EventListComponent implements OnInit {
  private eventsService = inject(EventsService);
  private router        = inject(Router);

  allEvents: BaropsEvent[]      = [];
  filteredEvents: BaropsEvent[] = [];

  loading      = false;
  error        = '';
  searchTerm   = '';
  view: 'list' | 'calendar' = 'list';
  filterStatus = 'ALL';

  readonly filterOptions = [
    { value: 'ALL',        label: 'All Events' },
    { value: 'APROBADO',   label: 'Active'     },
    { value: 'FINALIZADO', label: 'Completed'  },
  ];

  // ── Stats ──
  get todayCount():     number { return this.allEvents.filter(e => this.isToday(e)).length;     }
  get weekCount():      number { return this.allEvents.filter(e => this.isThisWeek(e)).length;  }
  get activeCount():    number { return this.allEvents.filter(e => this.isActive(e)).length;    }
  get completedCount(): number { return this.allEvents.filter(e => this.isDone(e)).length;      }

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: { left: 'prev,next today', center: 'title', right: '' },
    events: [],
    eventClick: (info) => this.router.navigate(['/events', info.event.id]),
    height: 'auto',
  };

  ngOnInit(): void { this.loadEvents(); }

  loadEvents(): void {
    this.loading = true;
    this.eventsService.getAll().subscribe({
      next: (events) => {
        // Events page shows only confirmed/completed — pending ones stay in Reservations
        this.allEvents = events.filter(e => {
          const s = e.status ?? '';
          return s === 'APROBADO' || s === 'FINALIZADO' || s === 'confirmed' || s === 'completed';
        });
        this.applyFilters();
        this.buildCalendar();
        this.loading = false;
      },
      error: () => { this.error = 'Could not load events.'; this.loading = false; },
    });
  }

  applyFilters(): void {
    const text = this.searchTerm.toLowerCase().trim();
    this.filteredEvents = this.allEvents.filter(e => {
      const title  = this.getTitle(e).toLowerCase();
      const client = this.getClientName(e).toLowerCase();
      const code   = (e.eventCode || '').toLowerCase();
      const loc    = this.getLocation(e).toLowerCase();
      const matchSearch = !text ||
        title.includes(text) || client.includes(text) ||
        code.includes(text)  || loc.includes(text);

      const s = e.status ?? '';
      const matchStatus =
        this.filterStatus === 'ALL' ||
        s === this.filterStatus ||
        (this.filterStatus === 'APROBADO'   && s === 'confirmed') ||
        (this.filterStatus === 'FINALIZADO' && s === 'completed');

      return matchSearch && matchStatus;
    });

    // Active first, then by date ascending
    this.filteredEvents.sort((a, b) => {
      const aActive = this.isActive(a) ? 0 : 1;
      const bActive = this.isActive(b) ? 0 : 1;
      if (aActive !== bActive) return aActive - bActive;
      return (this.getDate(a) || '').localeCompare(this.getDate(b) || '');
    });
  }

  buildCalendar(): void {
    const calEvents = this.filteredEvents.map(e => ({
      id: e._id!,
      title: `${e.eventCode ? e.eventCode + ' · ' : ''}${this.getTitle(e)}`,
      date: this.getDate(e),
      backgroundColor: this.isActive(e) ? 'rgba(52,211,153,0.5)' : 'rgba(96,165,250,0.4)',
      borderColor:     this.isActive(e) ? '#34d399'              : '#60a5fa',
    }));
    this.calendarOptions = { ...this.calendarOptions, events: calEvents };
  }

  // ── Helpers ──
  isActive(e: BaropsEvent): boolean { const s = e.status ?? ''; return s === 'APROBADO'   || s === 'confirmed'; }
  isDone(e: BaropsEvent):   boolean { const s = e.status ?? ''; return s === 'FINALIZADO' || s === 'completed'; }

  isToday(e: BaropsEvent): boolean {
    const d = this.getDate(e); if (!d) return false;
    return d.slice(0, 10) === new Date().toISOString().slice(0, 10);
  }

  isThisWeek(e: BaropsEvent): boolean {
    const d = this.getDate(e); if (!d) return false;
    const now = new Date();
    const ed  = new Date(d);
    const sun = new Date(now); sun.setDate(now.getDate() - now.getDay());
    const sat = new Date(sun); sat.setDate(sun.getDate() + 6);
    return ed >= sun && ed <= sat;
  }

  getTitle(e: BaropsEvent):     string { return e.eventInfo?.title    || (e as any).title     || e.eventCode || '—'; }
  getDate(e: BaropsEvent):      string { return e.eventInfo?.date     || (e as any).eventDate || '';                  }
  getLocation(e: BaropsEvent):  string { return e.eventInfo?.location || (e as any).location  || '—';                 }
  getEventType(e: BaropsEvent): string { return e.eventInfo?.type     || (e as any).eventType || '';                  }

  getClientName(e: BaropsEvent): string {
    const c = e.clientId as any;
    if (c?.name) return `${c.name} ${c.lastName ?? ''}`.trim();
    return e.clientName || '—';
  }

  getClientInitials(e: BaropsEvent): string {
    const n = this.getClientName(e);
    if (!n || n === '—') return '?';
    const p = n.split(' ').filter(Boolean);
    return p.length >= 2 ? (p[0][0] + p[1][0]).toUpperCase() : n.slice(0, 2).toUpperCase();
  }

  getBartenders(e: BaropsEvent): any[] { return (e.assignedBartenders as any[]) || []; }

  getBartenderInitials(b: any): string {
    return `${b.name?.[0] ?? ''}${b.lastName?.[0] ?? ''}`.toUpperCase() || '?';
  }

  statusInfo(s: string | undefined) { return EVENT_STATUS[s ?? 'APROBADO'] ?? EVENT_STATUS['APROBADO']; }
  payInfo(p: string | undefined)    { return PAY_STATUS[p  ?? 'UNPAID']    ?? PAY_STATUS['UNPAID'];      }

  viewEvent(id: string): void { this.router.navigate(['/events', id]); }
  trackById(_i: number, e: BaropsEvent): string { return e._id!; }
}
