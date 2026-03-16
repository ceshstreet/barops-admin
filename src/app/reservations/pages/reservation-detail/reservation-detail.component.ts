import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-reservation-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reservation-detail.component.html',
  styleUrl: './reservation-detail.component.scss'
})
export class ReservationDetailComponent {
  reservationId: string | null = null;

  reservation = {
    id: 'EVT-1021',
    client: 'Ana M.',
    eventName: 'Wedding - Hacienda Los Pinos',
    eventType: 'Wedding',
    eventDate: '2026-02-07',
    startTime: '6:00 PM',
    endTime: '11:00 PM',
    location: 'Hacienda Los Pinos',
    guests: '100+',
    package: 'Ultimate',
    drinkTheme: 'Classic',
    bartender: 'Maria P.',
    barType: 'Ultimate Bar',
    budgetRange: '$1,200+',
    status: 'confirmed',
    notes: 'Customer requested premium signature cocktails and full bar setup.'
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.reservationId = this.route.snapshot.paramMap.get('id');
  }

  goBack() {
    this.router.navigate(['/reservations/calendar']);
  }

  editReservation() {
    this.router.navigate(['/reservations/edit', this.reservationId]);
  }
}