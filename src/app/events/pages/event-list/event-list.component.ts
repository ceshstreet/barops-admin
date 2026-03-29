import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface EventItem {
  id: string;
  eventName: string;
  client: string;
  date: string;
  bartender: string;
  barType: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
}

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './event-list.component.html',
  styleUrl: './event-list.component.scss'
})
export class EventListComponent {
  constructor(private router: Router) {}

  events: EventItem[] = [
    {
      id: 'EVT-1021',
      eventName: 'Wedding - Hacienda Los Pinos',
      client: 'Ana M.',
      date: '2026-02-07',
      bartender: 'Maria P.',
      barType: 'Ultimate Bar',
      status: 'scheduled'
    },
    {
      id: 'EVT-1022',
      eventName: 'Corporate Event - Rooftop Centro',
      client: 'Inversiones XYZ',
      date: '2026-02-08',
      bartender: 'Pending assignment',
      barType: 'Ultimate Bar',
      status: 'scheduled'
    },
    {
      id: 'EVT-1023',
      eventName: 'Private Party - Santa Tecla',
      client: 'Carlos R.',
      date: '2026-02-10',
      bartender: 'Sofia G.',
      barType: 'Travel Bar',
      status: 'scheduled'
    }
  ];

  openEvent(event: EventItem) {
    this.router.navigate(['/events', event.id]);
  }

  getStatusClass(status: string): string {
    if (status === 'scheduled') return 'scheduled';
    if (status === 'in-progress') return 'in-progress';
    if (status === 'completed') return 'completed';
    return 'cancelled';
  }
}