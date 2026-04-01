import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ClientService, Client } from '../../../clients/services/client.service';
import { EventService } from '../../services/event.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-reservation-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reservation-form.component.html',
  styleUrl: './reservation-form.component.scss'
})
export class ReservationFormComponent implements OnInit {
  clients: Client[] = [];
  isEditMode = false;
  reservationId: string | null = null;

  reservation = {
    title: '',
    clientId: '',
    eventDate: '',
    location: '',
    guests: '',
    notes: ''
  };

  guestOptions = [
    'Up to 25',
    '26 - 50',
    '51 - 75',
    '76 - 100',
    '100+'
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private clientService: ClientService,
    private eventService: EventService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.clientService.getClients().subscribe({
      next: (data) => this.clients = data,
      error: (err) => console.error('Error cargando clientes:', err)
    });

    this.reservationId = this.route.snapshot.paramMap.get('id');
    if (this.reservationId) {
      this.isEditMode = true;
      this.eventService.getEvents().subscribe({
        next: (data) => {
          const found = data.find(e => e._id === this.reservationId);
          if (found) {
            const clientId = typeof found.clientId === 'object'
              ? (found.clientId as any)._id
              : found.clientId;
            this.reservation = {
              title: found.title,
              clientId: clientId,
              eventDate: found.eventDate,
              location: found.location,
              guests: found.guests || '',
              notes: found.notes || ''
            };
          }
        },
        error: (err) => console.error(err)
      });
    }
  }

  getFullName(client: Client): string {
    return `${client.name} ${client.lastName}`;
  }

  saveReservation() {
    if (this.isEditMode && this.reservationId) {
      this.eventService.updateEvent(this.reservationId, this.reservation).subscribe({
        next: () => {
          this.toastService.show('Reservation updated successfully.', 'success');
          setTimeout(() => this.router.navigate(['/reservations']), 1500);
        },
        error: (err) => {
          this.toastService.show('Error updating reservation.', 'error');
          console.error(err);
        }
      });
    } else {
      this.eventService.insertEvent(this.reservation).subscribe({
        next: () => {
          this.toastService.show('Reservation created successfully.', 'success');
          setTimeout(() => this.router.navigate(['/reservations']), 1500);
        },
        error: (err) => {
          this.toastService.show('Error creating reservation.', 'error');
          console.error(err);
        }
      });
    }
  }

  cancel() {
    this.router.navigate(['/reservations']);
  }
}