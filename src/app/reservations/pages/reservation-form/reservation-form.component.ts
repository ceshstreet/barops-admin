import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reservation-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reservation-form.component.html',
  styleUrl: './reservation-form.component.scss'
})
export class ReservationFormComponent {
  constructor(private router: Router) {}

  reservation = {
    client: '',
    eventName: '',
    eventType: '',
    eventDate: '',
    startTime: '',
    endTime: '',
    location: '',
    guests: '',
    budgetRange: '',
    notes: '',
    stage: 'pending'
  };

  clients = [
    'Ana Martinez',
    'Carlos Ruiz',
    'Lucia Vasquez',
    'David Hernandez'
  ];

  eventTypes = [
    'Wedding',
    'Corporate Event',
    'Birthday',
    'Private Party',
    'Pool Party',
    'Holiday Event'
  ];

  guestOptions = [
    'Up to 25',
    '26 - 50',
    '51 - 75',
    '76 - 100',
    '100+'
  ];

  budgetRanges = [
    '$300 - $500',
    '$500 - $800',
    '$800 - $1,200',
    '$1,200+'
  ];

  saveReservation() {
    console.log('Reservation created in early stage:', this.reservation);
    alert('Mock save: reservation created in pending stage.');
    this.router.navigate(['/reservations']);
  }

  cancel() {
    this.router.navigate(['/reservations']);
  }
}