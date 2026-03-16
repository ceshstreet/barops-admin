import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface Reservation {
  id: string;
  title: string;
  client: string;
  date: string;
  time: string;
  location: string;
  bartender: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

@Component({
  selector: 'app-reservation-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reservation-calendar.component.html',
  styleUrl: './reservation-calendar.component.scss'
})
export class ReservationCalendarComponent {
  constructor(private router: Router){}

  currentView: 'month' | 'week' | 'list' = 'month';

  currentMonth = 'February 2026';


  //crear reservación
  createReservation(){
    this.router.navigate(['/reservations/new']);
  }

  //abrir reservación



  reservations: Reservation[] = [
    {
      id: 'EVT-1021',
      title: 'Wedding - Hacienda Los Pinos',
      client: 'Ana M.',
      date: '2026-02-07',
      time: '6:00 PM - 11:00 PM',
      location: 'Hacienda Los Pinos',
      bartender: 'Maria P.',
      status: 'confirmed'
    },
    {
      id: 'EVT-1022',
      title: 'Corporate Event - Rooftop Centro',
      client: 'Inversiones XYZ',
      date: '2026-02-08',
      time: '7:00 PM - 10:00 PM',
      location: 'Rooftop Centro',
      bartender: 'Pending assignment',
      status: 'pending'
    },
    {
      id: 'EVT-1023',
      title: 'Private Party - Santa Tecla',
      client: 'Carlos R.',
      date: '2026-02-10',
      time: '4:00 PM - 8:00 PM',
      location: 'Santa Tecla',
      bartender: 'Sofia G.',
      status: 'confirmed'
    },
    {
      id: 'EVT-1024',
      title: 'Birthday Event - San Benito',
      client: 'Lucia V.',
      date: '2026-02-14',
      time: '5:30 PM - 10:30 PM',
      location: 'San Benito',
      bartender: 'Jorge L.',
      status: 'confirmed'
    },
    {
      id: 'EVT-1025',
      title: 'Brunch Event',
      client: 'Corporate Group',
      date: '2026-02-20',
      time: '11:00 AM - 2:00 PM',
      location: 'Hotel Terrace',
      bartender: 'Cancelled',
      status: 'cancelled'
    }
  ];

  calendarDays = [
    { day: 26, muted: true, reservations: [] },
    { day: 27, muted: true, reservations: [] },
    { day: 28, muted: true, reservations: [] },
    { day: 29, muted: true, reservations: [] },
    { day: 30, muted: true, reservations: [] },
    { day: 31, muted: true, reservations: [] },
    { day: 1, muted: false, reservations: [] },

    { day: 2, muted: false, reservations: [] },
    { day: 3, muted: false, reservations: [] },
    { day: 4, muted: false, reservations: [] },
    { day: 5, muted: false, reservations: [] },
    { day: 6, muted: false, reservations: [] },
    { day: 7, muted: false, reservations: [this.reservations[0]] },
    { day: 8, muted: false, reservations: [this.reservations[1]] },

    { day: 9, muted: false, reservations: [] },
    { day: 10, muted: false, reservations: [this.reservations[2]] },
    { day: 11, muted: false, reservations: [] },
    { day: 12, muted: false, reservations: [] },
    { day: 13, muted: false, reservations: [] },
    { day: 14, muted: false, reservations: [this.reservations[3]] },
    { day: 15, muted: false, reservations: [] },

    { day: 16, muted: false, reservations: [] },
    { day: 17, muted: false, reservations: [] },
    { day: 18, muted: false, reservations: [] },
    { day: 19, muted: false, reservations: [] },
    { day: 20, muted: false, reservations: [this.reservations[4]] },
    { day: 21, muted: false, reservations: [] },
    { day: 22, muted: false, reservations: [] },

    { day: 23, muted: false, reservations: [] },
    { day: 24, muted: false, reservations: [] },
    { day: 25, muted: false, reservations: [] },
    { day: 26, muted: false, reservations: [] },
    { day: 27, muted: false, reservations: [] },
    { day: 28, muted: false, reservations: [] },
    { day: 1, muted: true, reservations: [] }
  ];

  setView(view: 'month' | 'week' | 'list') {
    this.currentView = view;
  }

  getStatusClass(status: string): string {
    if (status === 'confirmed') return 'confirmed';
    if (status === 'pending') return 'pending';
    return 'cancelled';
  }
  openReservation(reservation: any){
    this.router.navigate(['/reservations', reservation.id]);
    }
}