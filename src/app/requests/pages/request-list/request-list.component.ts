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
import { ClientService, Client } from '../../../clients/services/client.service';

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
  private clientService   = inject(ClientService);
  private router          = inject(Router);

  requests: QuoteRequest[] = [];
  filteredRequests: QuoteRequest[] = [];
  clientMatchMap = new Map<number, Client>(); // odooId → matched client

  loading = false;
  error = '';
  searchTerm = '';

  sortField: SortField = 'createdAtOdoo';
  sortDirection: 'asc' | 'desc' = 'desc';

  newCount = 0;
  filterStatus = 'ALL';

  readonly STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
    NEW:            { label: 'New',          color: '#f59e0b', bg: 'rgba(245,158,11,0.12)'  },
    REVIEWED:       { label: 'Reviewed',     color: '#60a5fa', bg: 'rgba(96,165,250,0.12)'  },
    CLIENT_CREATED: { label: 'Client Added', color: '#34d399', bg: 'rgba(52,211,153,0.12)'  },
  };

  readonly statusOptions = [
    { value: 'ALL',            label: 'All'          },
    { value: 'NEW',            label: 'New'          },
    { value: 'REVIEWED',       label: 'Reviewed'     },
    { value: 'CLIENT_CREATED', label: 'Client Added' },
  ];

  actionMessage = '';
  actionMessageType: 'success' | 'error' | '' = '';

  processingReadId: number | null = null;
  processingClientId: number | null = null;

  ngOnInit(): void {
    this.loadRequests();
  }

  // ── Client cross-reference ──
  private buildClientMatchMap(clients: Client[]): void {
    this.clientMatchMap.clear();
    for (const req of this.requests) {
      if (req.convertedToClient) continue; // already linked — no need to flag
      const match = clients.find(c =>
        (req.email && c.email?.toLowerCase() === req.email.toLowerCase()) ||
        (req.phone && c.phone?.replace(/\D/g, '') === req.phone?.replace(/\D/g, ''))
      );
      if (match) this.clientMatchMap.set(req.odooId, match);
    }
  }

  matchedClient(req: QuoteRequest): Client | undefined {
    return this.clientMatchMap.get(req.odooId);
  }

  goToClient(clientId: string, event: MouseEvent): void {
    event.stopPropagation();
    this.router.navigate(['/clients', clientId]);
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
        // Cross-reference with clients after requests load
        this.clientService.getClients().subscribe({
          next: (clients) => this.buildClientMatchMap(clients),
          error: () => {} // non-critical — silently ignore
        });
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
      const matchSearch = !text ||
        request.eventName.toLowerCase().includes(text) ||
        request.fullName.toLowerCase().includes(text) ||
        request.phone.toLowerCase().includes(text);

      const matchStatus = this.filterStatus === 'ALL' || request.status === this.filterStatus;

      return matchSearch && matchStatus;
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
        // Remove from match map now that it's officially linked
        this.clientMatchMap.delete(request.odooId);

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

  viewClient(request: QuoteRequest, event?: MouseEvent): void {
    event?.stopPropagation();

    if (!request.clientId) return;

    const clientId =
      typeof request.clientId === 'string'
        ? request.clientId
        : request.clientId?._id;

    if (!clientId) return;

    this.router.navigate(['/clients', clientId]);
  }



  createQuote(request: QuoteRequest, event?: MouseEvent): void {
    event?.stopPropagation();

    // If a quote was already created from this request → edit it instead
    if (request.quoteId) {
      this.router.navigate(['/quotes', request.quoteId, 'edit']);
      return;
    }

    const clientId =
      typeof request.clientId === 'string'
        ? request.clientId
        : request.clientId?._id;

    this.router.navigate(['/quotes/new'], {
      queryParams: {
        requestId: request._id || '',
        odooId: request.odooId,
        clientId: clientId || '',
        fullName: request.fullName || '',
        email: request.email || '',
        phone: request.phone || '',
        eventName: request.eventName || '',
        eventType: request.eventType || '',
        eventDate: request.eventDate || '',
        location: request.location || '',
        guests: request.guests || '',
        budgetRange: request.budgetRange || ''
      }
    });
  }

  statusInfo(status: string) {
    return this.STATUS_MAP[status] ?? this.STATUS_MAP['NEW'];
  }

  count(status: string): number {
    if (status === 'ALL') return this.requests.length;
    return this.requests.filter(r => r.status === status).length;
  }

  getInitials(name: string): string {
    if (!name) return '?';
    const parts = name.trim().split(' ').filter(Boolean);
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase();
  }

  trackByOdooId(_index: number, item: QuoteRequest): number {
    return item.odooId;
  }
}