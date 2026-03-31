import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService, Event } from '../../../reservations/services/event.service';
import { BartenderService, Bartender } from '../../../bartenders/services/bartender.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-reservation-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reservation-detail.component.html',
  styleUrl: './reservation-detail.component.scss'
})
export class ReservationDetailComponent implements OnInit {
  reservation: Event | null = null;
  bartenders: Bartender[] = [];
  selectedBartenderId = '';
  showApproveModal = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService,
    private bartenderService: BartenderService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.eventService.getEvents().subscribe({
        next: (data) => {
          this.reservation = data.find(e => e._id === id) || null;
        },
        error: (err) => console.error(err)
      });
    }

    this.bartenderService.getBartenders().subscribe({
      next: (data) => this.bartenders = data.filter(b => b.status === 'AVAILABLE'),
      error: (err) => console.error(err)
    });
  }

  getClientName(): string {
    const client = this.reservation?.clientId as any;
    if (client && client.name) return `${client.name} ${client.lastName}`;
    return '—';
  }


  getClientInitials(): string {
    const client = this.reservation?.clientId as any;
    if (client && client.name) {
      return `${client.name[0]}${client.lastName[0]}`.toUpperCase();
    }
    return '?';
  }

  getClientEmail(): string {
    const client = this.reservation?.clientId as any;
    return client?.email || '—';
  }

  getClientPhone(): string {
    const client = this.reservation?.clientId as any;
    return client?.phone || '—';
  }


  approveReservation() {
    if (!this.selectedBartenderId) {
      this.toastService.show('Please select a bartender.', 'warning');
      return;
    }
    this.eventService.updateEvent(this.reservation!._id!, {
      status: 'APROBADO',
      bartenderId: this.selectedBartenderId
    }).subscribe({
      next: () => {
        this.toastService.show('Reservation approved successfully.', 'success');
        setTimeout(() => this.router.navigate(['/reservations']), 1500);
      },
      error: (err) => {
        this.toastService.show('Error approving reservation.', 'error');
        console.error(err);
      }
    });
  }

  rejectReservation() {
    this.eventService.updateEvent(this.reservation!._id!, {
      status: 'RECHAZADO'
    }).subscribe({
      next: () => {
        this.toastService.show('Reservation rejected.', 'warning');
        setTimeout(() => this.router.navigate(['/reservations']), 1500);
      },
      error: (err) => {
        this.toastService.show('Error rejecting reservation.', 'error');
        console.error(err);
      }
    });
  }

  goBack() {
    this.router.navigate(['/reservations']);
  }
}