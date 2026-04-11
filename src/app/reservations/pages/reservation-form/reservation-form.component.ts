import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { ClientService, Client } from '../../../clients/services/client.service';
import { EventService } from '../../services/event.service';
import { ToastService } from '../../../shared/services/toast.service';

const EVENT_TYPES = [
  'Wedding', 'Corporate Event', 'Birthday', 'Anniversary',
  'Graduation', 'Quinceañera', 'Social Gathering', 'Other',
];

const GUEST_OPTIONS = ['Up to 25', '26 - 50', '51 - 75', '76 - 100', '100+'];

const STATUS_OPTIONS = [
  { value: 'pending',    label: 'Pending',    color: '#f59e0b' },
  { value: 'confirmed',  label: 'Confirmed',  color: '#34d399' },
  { value: 'cancelled',  label: 'Cancelled',  color: '#ef4444' },
  { value: 'completed',  label: 'Completed',  color: '#60a5fa' },
];

@Component({
  selector: 'app-reservation-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './reservation-form.component.html',
  styleUrl: './reservation-form.component.scss',
})
export class ReservationFormComponent implements OnInit {
  private router        = inject(Router);
  private route         = inject(ActivatedRoute);
  private clientService = inject(ClientService);
  private eventService  = inject(EventService);
  private toastService  = inject(ToastService);

  clients: Client[] = [];
  isEditMode    = false;
  reservationId: string | null = null;
  saving        = false;

  // Options
  eventTypes   = EVENT_TYPES;
  guestOptions = GUEST_OPTIONS;
  statusOptions = STATUS_OPTIONS;

  // ── From Quote ──
  fromQuoteId      = '';
  fromQuoteTotal   = 0;
  fromQuotePackage = '';

  // ── Form fields ──
  // Client
  clientName  = '';
  email       = '';
  phone       = '';
  clientId    = '';         // optional link to existing client

  // Event
  title      = '';
  eventType  = '';
  eventDate  = '';
  location   = '';
  guests     = '';
  status     = 'pending';
  notes      = '';

  // Service info (from quote)
  packageName  = '';
  quotedTotal  = 0;
  barTypeName  = '';
  themeName    = '';

  ngOnInit(): void {
    this.clientService.getClients().subscribe({
      next: (data) => {
        this.clients = data;
        // Try to auto-match client by email after clients load
        if (this.email && !this.clientId) {
          const match = data.find((c: Client) =>
            c.email?.toLowerCase() === this.email.toLowerCase()
          );
          if (match) this.clientId = match._id ?? '';
        }
      },
      error: (err) => console.error('Error loading clients:', err),
    });

    // ── Pre-fill from approved quote ──
    const p = this.route.snapshot.queryParams;
    if (p['quoteId']) {
      this.fromQuoteId      = p['quoteId'];
      this.fromQuoteTotal   = Number(p['total']) || 0;
      this.fromQuotePackage = p['packageName'] || '';

      this.clientName   = p['clientName']  || '';
      this.email        = p['email']       || '';
      this.phone        = p['phone']       || '';
      this.title        = p['title']       || '';
      this.eventDate    = p['eventDate']   || '';
      this.location     = p['location']    || '';
      this.notes        = p['notes']       || '';
      this.packageName  = p['packageName'] || '';
      this.quotedTotal  = Number(p['total']) || 0;

      const gc = Number(p['guests']) || 0;
      if      (gc <= 25)  this.guests = 'Up to 25';
      else if (gc <= 50)  this.guests = '26 - 50';
      else if (gc <= 75)  this.guests = '51 - 75';
      else if (gc <= 100) this.guests = '76 - 100';
      else                this.guests = '100+';
    }

    // ── Edit mode ──
    this.reservationId = this.route.snapshot.paramMap.get('id');
    if (this.reservationId) {
      this.isEditMode = true;
      this.eventService.getEventById(this.reservationId).subscribe({
        next: (ev: any) => {
          this.clientId    = typeof ev.clientId === 'object' ? ev.clientId?._id : ev.clientId ?? '';
          this.clientName  = ev.clientName  || '';
          this.email       = ev.email       || '';
          this.phone       = ev.phone       || '';
          this.title       = ev.title       || '';
          this.eventType   = ev.eventType   || '';
          this.eventDate   = ev.eventDate   || '';
          this.location    = ev.location    || '';
          this.guests      = ev.guests      || '';
          this.status      = ev.status      || 'pending';
          this.notes       = ev.notes       || '';
          this.packageName = ev.packageName || '';
          this.quotedTotal = ev.quotedTotal || 0;
          this.fromQuoteId = ev.quoteId     || '';
        },
        error: (err) => console.error(err),
      });
    }
  }

  get clientLabel(): string {
    if (this.clientId) {
      const c = this.clients.find(x => x._id === this.clientId);
      return c ? `${c.name} ${c.lastName}` : '';
    }
    return '';
  }

  getStatusColor(value: string): string {
    return STATUS_OPTIONS.find(s => s.value === value)?.color ?? '#94a3b8';
  }

  save(): void {
    this.saving = true;
    const payload: any = {
      client:      this.clientId   || undefined,
      clientName:  this.clientName,
      email:       this.email,
      phone:       this.phone,
      title:       this.title,
      eventType:   this.eventType,
      eventDate:   this.eventDate,
      location:    this.location,
      guests:      this.guests,
      status:      this.status,
      notes:       this.notes,
      packageName: this.packageName  || undefined,
      quotedTotal: this.quotedTotal  || undefined,
      quoteId:     this.fromQuoteId  || undefined,
    };

    const req$ = this.isEditMode && this.reservationId
      ? this.eventService.updateEvent(this.reservationId, payload)
      : this.eventService.insertEvent(payload);

    req$.subscribe({
      next: () => {
        this.toastService.show(
          this.isEditMode ? 'Reservation updated.' : 'Reservation created!',
          'success'
        );
        setTimeout(() => this.router.navigate(['/reservations']), 1200);
      },
      error: (err: any) => {
        this.toastService.show('Error saving reservation.', 'error');
        console.error(err);
        this.saving = false;
      },
    });
  }

  cancel(): void { this.router.navigate(['/reservations']); }
}
