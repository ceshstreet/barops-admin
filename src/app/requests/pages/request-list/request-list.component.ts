import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RequestsService, InboxResponse } from '../../services/request.service';
import { QuoteRequest } from '../../models/request.model';

@Component({
  selector: 'app-request-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './request-list.component.html',
  styleUrl: './request-list.component.scss',
})
export class RequestListComponent implements OnInit {
  private requestsService = inject(RequestsService);
  private router = inject(Router);

  requests: QuoteRequest[] = [];
  filteredRequests: QuoteRequest[] = [];

  loading = false;
  error = '';

  searchTerm = '';
  filterEventType = '';

  eventTypeOptions: string[] = [];

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.loading = true;
    this.error = '';

    this.requestsService.getInbox().subscribe({
      next: (response: InboxResponse) => {
        this.requests = response.data || [];
        this.eventTypeOptions = [...new Set(this.requests.map(r => r.eventType).filter(Boolean))].sort();
        this.applyFilters();
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading requests:', err);
        this.error = 'Could not load requests from Odoo.';
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.filteredRequests = this.requests.filter(request => {
      const text = this.searchTerm.toLowerCase();

      const matchSearch =
        request.eventName.toLowerCase().includes(text) ||
        request.email.toLowerCase().includes(text) ||
        request.phone.toLowerCase().includes(text) ||
        request.location.toLowerCase().includes(text);

      const matchEventType =
        !this.filterEventType || request.eventType === this.filterEventType;

      return matchSearch && matchEventType;
    });
  }

  viewRequest(id: number): void {
    this.router.navigate(['/requests', id]);
  }

  convertToClient(request: QuoteRequest, event?: MouseEvent): void {
    event?.stopPropagation();

    this.router.navigate(['/clients/new'], {
      queryParams: {
        fullName: request.eventName,
        email: request.email,
        phone: request.phone,
        notes: `Imported from request #${request.odooId}`
      }
    });
  }

  convertToEvent(request: QuoteRequest, event?: MouseEvent): void {
    event?.stopPropagation();

    this.router.navigate(['/events/new'], {
      queryParams: {
        name: request.eventName,
        clientEmail: request.email,
        clientPhone: request.phone,
        eventType: request.eventType,
        eventDate: request.eventDate,
        location: request.location,
        guests: request.guests,
        budgetRange: request.budgetRange
      }
    });
  }

  trackByOdooId(index: number, item: QuoteRequest): number {
    return item.odooId;
  }
}