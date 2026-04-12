import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventService, Event as ReservationEvent } from '../../services/event.service';
import { ToastService } from '../../../shared/services/toast.service';

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: 'Pending',   color: '#f59e0b', bg: 'rgba(245,158,11,0.12)'  },
  confirmed: { label: 'Confirmed', color: '#34d399', bg: 'rgba(52,211,153,0.12)'  },
  cancelled: { label: 'Cancelled', color: '#ef4444', bg: 'rgba(239,68,68,0.12)'   },
  completed: { label: 'Completed', color: '#60a5fa', bg: 'rgba(96,165,250,0.12)'  },
  PENDIENTE: { label: 'Pending',   color: '#f59e0b', bg: 'rgba(245,158,11,0.12)'  },
};

@Component({
  selector: 'app-reservation-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, FullCalendarModule],
  templateUrl: './reservation-list.component.html',
  styleUrl: './reservation-list.component.scss',
})
export class ReservationListComponent implements OnInit {
  private router       = inject(Router);
  private eventService = inject(EventService);
  private toastService = inject(ToastService);

  reservations: ReservationEvent[] = [];
  loading = true;
  currentView: 'list' | 'calendar' = 'list';
  searchTerm = '';
  filterStatus = 'ALL';
  deleteTarget: ReservationEvent | null = null;
  deleting = false;

  readonly statusOptions = [
    { value: 'ALL',       label: 'All'       },
    { value: 'pending',   label: 'Pending'   },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  calendarOptions: any = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek',
    },
    height: 'auto',
    editable: false,
    selectable: true,
    events: [],
    eventClick: (info: any) => this.router.navigate(['/reservations', info.event.id]),
    eventDidMount: (info: any) => {
      info.el.style.borderRadius = '6px';
      info.el.style.border = 'none';
      info.el.style.padding = '2px 6px';
    },
  };

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.eventService.getEvents().subscribe({
      next: (data) => {
        this.reservations = data;
        this.loading = false;
        this.calendarOptions = {
          ...this.calendarOptions,
          events: data.map(r => ({
            id: r._id,
            title: r.title,
            start: r.eventDate,
            backgroundColor: STATUS_MAP[r.status ?? 'pending']?.color ?? '#7c5cff',
            borderColor: 'transparent',
          })),
        };
      },
      error: () => { this.loading = false; },
    });
  }

  get filtered(): ReservationEvent[] {
    let list = this.reservations;
    if (this.filterStatus !== 'ALL') list = list.filter(r => r.status === this.filterStatus);
    if (this.searchTerm.trim()) {
      const s = this.searchTerm.toLowerCase();
      list = list.filter(r =>
        (r.title || '').toLowerCase().includes(s) ||
        (r.location || '').toLowerCase().includes(s) ||
        (this.clientName(r)).toLowerCase().includes(s)
      );
    }
    return list;
  }

  count(status: string): number {
    if (status === 'ALL') return this.reservations.length;
    return this.reservations.filter(r => r.status === status).length;
  }

  thisMonth(): number {
    const m = new Date().getMonth(); const y = new Date().getFullYear();
    return this.reservations.filter(r => {
      if (!r.eventDate) return false; const d = new Date(r.eventDate); return d.getMonth() === m && d.getFullYear() === y;
    }).length;
  }

  statusInfo(status: string | undefined) {
    return STATUS_MAP[status ?? 'pending'] ?? STATUS_MAP['pending'];
  }

  clientName(r: ReservationEvent): string {
    const c = r.clientId as any;
    if (c?.name) return `${c.name} ${c.lastName ?? ''}`.trim();
    return (r as any).clientName || '—';
  }

  open(r: ReservationEvent): void { this.router.navigate(['/reservations', r._id]); }
  edit(e: Event, r: ReservationEvent): void { e.stopPropagation(); this.router.navigate(['/reservations', r._id, 'edit']); }
  askDelete(e: Event, r: ReservationEvent): void { e.stopPropagation(); this.deleteTarget = r; }
  cancelDelete(): void { this.deleteTarget = null; }

  doDelete(): void {
    if (!this.deleteTarget) return;
    this.deleting = true;
    this.eventService.deleteEvent(this.deleteTarget._id!).subscribe({
      next: () => {
        this.reservations = this.reservations.filter(r => r._id !== this.deleteTarget!._id);
        this.toastService.show('Reservation deleted.', 'success');
        this.deleteTarget = null;
        this.deleting = false;
      },
      error: () => { this.toastService.show('Error deleting.', 'error'); this.deleting = false; },
    });
  }
}
