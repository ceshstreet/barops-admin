import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  RequestsService,
  InboxResponse,
  ConvertClientResponse,
  MarkAsReadResponse
} from '../../services/request.service';
import { QuoteRequest } from '../../models/request.model';

type SortField =
  | 'eventName'
  | 'fullName'
  | 'phone'
  | 'eventDate'
  | 'createdAtOdoo';

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

  sortField: SortField = 'createdAtOdoo';
  sortDirection: 'asc' | 'desc' = 'desc';

  newCount = 0;

  actionMessage = '';
  actionMessageType: 'success' | 'error' | '' = '';

  processingReadId: number | null = null;
  processingClientId: number | null = null;

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

  replaceRequest(updatedRequest: QuoteRequest): void {
    this.requests = this.requests.map(item =>
      item.odooId === updatedRequest.odooId ? updatedRequest : item
    );

    this.updateCounters();
    this.applyFilters();
  }

  showMessage(message: string, type: 'success' | 'error'): void {
    this.actionMessage = message;
    this.actionMessageType = type;

    setTimeout(() => {
      this.actionMessage = '';
      this.actionMessageType = '';
    }, 2600);
  }

  viewRequest(id: number): void {
    this.router.navigate(['/requests', id]);
  }

  markAsRead(request: QuoteRequest, event?: MouseEvent): void {
    event?.stopPropagation();

    if (request.isRead || this.processingReadId === request.odooId) return;

    this.processingReadId = request.odooId;

    this.requestsService.markAsRead(request.odooId).subscribe({
      next: (response: MarkAsReadResponse) => {
        this.replaceRequest(response.data);
        this.processingReadId = null;
        this.showMessage('Request marked as reviewed.', 'success');
      },
      error: (err: any) => {
        console.error('Error marking as read:', err);
        this.processingReadId = null;
        this.showMessage('Could not mark request as reviewed.', 'error');
      }
    });
  }

  addClient(request: QuoteRequest, event?: MouseEvent): void {
    event?.stopPropagation();

    if (request.convertedToClient || this.processingClientId === request.odooId) return;

    this.processingClientId = request.odooId;

    this.requestsService.convertToClient(request.odooId).subscribe({
      next: (response: ConvertClientResponse) => {
        this.replaceRequest(response.request);
        this.processingClientId = null;

        if (response.alreadyExists) {
          this.showMessage('Client already existed. Request updated.', 'success');
        } else {
          this.showMessage('Client created successfully.', 'success');
        }
      },
      error: (err: any) => {
        console.error('Error converting to client:', err);
        this.processingClientId = null;
        this.showMessage(
          err?.error?.message || 'Could not create client.',
          'error'
        );
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