import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
    private clientService: ClientService,
    private eventService: EventService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.clientService.getClients().subscribe({
      next: (data) => this.clients = data,
      error: (err) => console.error('Error cargando clientes:', err)
    });
  }

  getFullName(client: Client): string {
    return `${client.name} ${client.lastName}`;
  }

  saveReservation() {
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

  cancel() {
    this.router.navigate(['/reservations']);
  }
}