import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reservation-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reservation-form.component.html',
  styleUrl: './reservation-form.component.scss'
})
export class ReservationFormComponent {
  reservation = {
    client: '',
    eventName: '',
    eventType: '',
    eventDate: '',
    startTime: '',
    endTime: '',
    location: '',
    guests: '',
    package: '',
    drinkTheme: '',
    bartender: '',
    barType: '',
    budgetRange: '',
    notes: '',
    status: 'pending'
  };

  clients = [
    'Ana M.',
    'Inversiones XYZ',
    'Carlos R.',
    'Lucia V.'
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

  packages = [
    'Basic',
    'Premium',
    'Ultimate'
  ];

  drinkThemes = [
    'Classic',
    'Caribbean',
    'Beach / Pool Party',
    'Tequila',
    'BBQ',
    'Rum',
    'Halloween',
    'Christmas',
    'New Years'
  ];

  bartenders = [
    'Maria P.',
    'Jorge L.',
    'Sofia G.',
    'Pending assignment'
  ];

  barTypes = [
    'Travel Bar',
    'Ultimate Bar',
    'Stadium Bar'
  ];

  budgetRanges = [
    '$300 - $500',
    '$500 - $800',
    '$800 - $1,200',
    '$1,200+'
  ];

  statuses = [
    'pending',
    'confirmed',
    'cancelled'
  ];

  saveReservation() {
    console.log('Reservation data:', this.reservation);
    alert('Mock save: reservation captured successfully.');
  }
}