import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventService, Event as ReservationEvent } from '../../../reservations/services/event.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-reservation-list',
  standalone: true,
  imports: [CommonModule, FullCalendarModule],
  templateUrl: './reservation-list.component.html',
  styleUrl: './reservation-list.component.scss'
})
export class ReservationListComponent implements OnInit {
  reservations: ReservationEvent[] = [];
  currentView: 'list' | 'calendar' = 'list';
  showDeleteModal = false;
  reservationToDelete: ReservationEvent | null = null;

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
    events: [],
    eventClick: (info: any) => {
      this.router.navigate(['/reservations', info.event.id]);
    }
  };

  constructor(
    private router: Router,
    private eventService: EventService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.loadReservations();
  }

  loadReservations() {
    this.eventService.getEvents().subscribe({
      next: (data) => {
        this.reservations = data.filter(e => e.status === 'PENDIENTE');
        this.calendarOptions = {
          ...this.calendarOptions,
          events: this.reservations.map(r => ({
            id: r._id,
            title: r.title,
            start: r.eventDate,
            backgroundColor: '#7c5cff',
            borderColor: '#7c5cff'
          }))
        };
      },
      error: (err) => console.error('Error cargando reservaciones:', err)
    });
  }

  setView(view: 'list' | 'calendar') {
    this.currentView = view;
  }

  createReservation() {
    this.router.navigate(['/reservations/new']);
  }

  openReservation(reservation: ReservationEvent) {
    this.router.navigate(['/reservations', reservation._id]);
  }

  editReservation(event: MouseEvent, reservation: ReservationEvent) {
    event.stopPropagation();
    this.router.navigate(['/reservations', reservation._id, 'edit']);
  }

  confirmDelete(event: MouseEvent, reservation: ReservationEvent) {
    event.stopPropagation();
    this.reservationToDelete = reservation;
    this.showDeleteModal = true;
  }

  cancelDelete() {
    this.reservationToDelete = null;
    this.showDeleteModal = false;
  }

  confirmDeleteAction() {
    if (!this.reservationToDelete) return;
    this.eventService.deleteEvent(this.reservationToDelete._id!).subscribe({
      next: () => {
        this.reservations = this.reservations.filter(r => r._id !== this.reservationToDelete!._id);
        this.toastService.show('Reservation deleted successfully.', 'success');
        this.cancelDelete();
      },
      error: (err) => {
        this.toastService.show('Error deleting reservation.', 'error');
        console.error(err);
      }
    });
  }

  getClientName(reservation: ReservationEvent): string {
    const client = reservation.clientId as any;
    if (client && client.name) return `${client.name} ${client.lastName}`;
    return '—';
  }
}