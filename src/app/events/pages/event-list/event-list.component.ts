import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

interface EventItem {
  id: string;
  eventName: string;
  client: string;
  date: string;
  start: string;
  bartender: string;
  barType: string;
  location: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
}

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [CommonModule, FullCalendarModule],
  templateUrl: './event-list.component.html',
  styleUrl: './event-list.component.scss'
})
export class EventListComponent {
  constructor(private router: Router) {}

  currentView: 'list' | 'calendar' = 'list';

  events: EventItem[] = [
    {
      id: 'EVT-1021',
      eventName: 'Wedding - Hacienda Los Pinos',
      client: 'Ana M.',
      date: '2026-02-07',
      start: '2026-02-07T18:00:00',
      bartender: 'Maria P.',
      barType: 'Ultimate Bar',
      location: 'Hacienda Los Pinos',
      status: 'scheduled'
    },
    {
      id: 'EVT-1022',
      eventName: 'Corporate Event - Rooftop Centro',
      client: 'Inversiones XYZ',
      date: '2026-02-08',
      start: '2026-02-08T19:00:00',
      bartender: 'Pending assignment',
      barType: 'Ultimate Bar',
      location: 'Rooftop Centro',
      status: 'scheduled'
    },
    {
      id: 'EVT-1023',
      eventName: 'Private Party - Santa Tecla',
      client: 'Carlos R.',
      date: '2026-02-10',
      start: '2026-02-10T16:00:00',
      bartender: 'Sofia G.',
      barType: 'Travel Bar',
      location: 'Santa Tecla',
      status: 'scheduled'
    },
    {
      id: 'EVT-1024',
      eventName: 'Birthday - San Benito',
      client: 'Lucia V.',
      date: '2026-02-14',
      start: '2026-02-14T17:30:00',
      bartender: 'Jorge L.',
      barType: 'Ultimate Bar',
      location: 'San Benito',
      status: 'in-progress'
    }
  ];

  calendarOptions: any = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    height: 'auto',
    editable: false,
    selectable: true,
    events: this.events.map((event) => ({
      id: event.id,
      title: event.eventName,
      start: event.start
    })),
    eventClick: (info: any) => {
      this.router.navigate(['/events', info.event.id]);
    }
  };

  setView(view: 'list' | 'calendar') {
    this.currentView = view;
  }

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