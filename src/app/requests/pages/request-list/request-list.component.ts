import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RequestsService, InboxResponse } from '../../services/request.service';
import { QuoteRequest } from '../../models/request.model';

type SortField = 'eventName' | 'fullName' | 'phone' | 'eventDate' | 'createdAt';

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

  sortField: SortField = 'createdAt';
  sortDirection: 'asc' | 'desc' = 'desc';

  newCount = 0;

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.loading = true;
    this.error = '';

    this.requestsService.getInbox().subscribe({
      next: (response: InboxResponse) => {
        this.requests = response.data || [];
        this.updateCounters();
        this.applyFilters();
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading requests:', err);
        this.error = 'Could not load requests from database.';
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    const text = this.searchTerm.toLowerCase().trim();

    this.filteredRequests = this.requests.filter(request => {
      const matchSearch =
        request.eventName.toLowerCase().includes(text) ||
        request.fullName.toLowerCase().includes(text) ||
        request.phone.toLowerCase().includes(text);

      return matchSearch;
    });

    this.sortData();
  }

  sort(field: SortField): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }

    this.sortData();
  }

  sortData(): void {
    this.filteredRequests.sort((a, b) => {
      const valueA = (a[this.sortField] || '').toString().toLowerCase();
      const valueB = (b[this.sortField] || '').toString().toLowerCase();

      if (valueA < valueB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  getSortIcon(field: SortField): string {
    if (this.sortField !== field) return 'unfold_more';
    return this.sortDirection === 'asc' ? 'north' : 'south';
  }

  updateCounters(): void {
    this.newCount = this.requests.filter(r => r.status === 'NEW').length;
  }

  viewRequest(id: number): void {
    this.router.navigate(['/requests', id]);
  }

  convertToClient(request: QuoteRequest, event?: MouseEvent): void {
    event?.stopPropagation();

    this.router.navigate(['/clients/new'], {
      queryParams: {
        fullName: request.fullName,
        email: request.email,
        phone: request.phone,
        preferredContact: 'WhatsApp',
        notes: `Client created from inbox request #${request.odooId}`
      }
    });
  }

  convertToEvent(request: QuoteRequest, event?: MouseEvent): void {
    event?.stopPropagation();

    this.router.navigate(['/events/new'], {
      queryParams: {
        name: request.eventName,
        clientName: request.fullName,
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