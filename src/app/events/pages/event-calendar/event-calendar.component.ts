import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

@Component({
  selector: 'app-event-calendar',
  standalone: true,
  imports: [CommonModule, FullCalendarModule],
  templateUrl: './event-calendar.component.html',
  styleUrl: './event-calendar.component.scss'
})
export class EventCalendarComponent {
  constructor(private router: Router) {}

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
    eventClick: (info: any) => {
      const eventId = info.event.id;
      this.router.navigate(['/events', eventId]);
    },
    dateClick: (info: any) => {
      console.log('Clicked date:', info.dateStr);
      this.router.navigate(['/reservations/new']);
    },
    events: [
      {
        id: 'EVT-1021',
        title: 'Wedding - Hacienda Los Pinos',
        start: '2026-02-07T18:00:00'
      },
      {
        id: 'EVT-1022',
        title: 'Corporate Event - Rooftop Centro',
        start: '2026-02-08T19:00:00'
      },
      {
        id: 'EVT-1023',
        title: 'Private Party - Santa Tecla',
        start: '2026-02-10T16:00:00'
      }
    ]
  };
}