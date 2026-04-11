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
  private route           = inject(ActivatedRoute);
  private router          = inject(Router);
  private eventService    = inject(EventService);
  private bartenderService = inject(BartenderService);
  private toastService    = inject(ToastService);

  reservation: ReservationEvent | null = null;
  bartenders: Bartender[] = [];
  selectedBartenderId = '';
  loading = true;
  saving  = false;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.eventService.getEventById(id).subscribe({
        next: (data) => { this.reservation = data; this.loading = false; },
        error: () => { this.loading = false; },
      });
    }
    this.bartenderService.getBartenders().subscribe({
      next: (data) => this.bartenders = data.filter((b: Bartender) => b.status === 'AVAILABLE'),
      error: (err) => console.error(err),
    });
  }

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

  confirm(): void {
    if (!this.selectedBartenderId) {
      this.toastService.show('Please select a bartender first.', 'warning');
      return;
    }
    this.saving = true;
    this.eventService.updateEvent(this.reservation!._id!, {
      status: 'APROBADO',
      assignedBartenders: [this.selectedBartenderId],
    }).subscribe({
      next: () => {
        this.toastService.show('Reservation confirmed!', 'success');
        this.reservation = { ...this.reservation!, status: 'APROBADO' };
        this.saving = false;
      },
      error: () => { this.toastService.show('Error confirming reservation.', 'error'); this.saving = false; },
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

  goBack(): void { this.router.navigate(['/reservations']); }
}
