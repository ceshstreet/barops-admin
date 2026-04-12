import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  RequestsService,
  InboxDetailResponse,
  ConvertClientResponse
} from '../../services/request.service';
import { QuoteRequest } from '../../models/request.model';
import { ClientService, Client } from '../../../clients/services/client.service';

@Component({
  selector: 'app-request-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './request-detail.component.html',
  styleUrl: './request-detail.component.scss',
})
export class RequestDetailComponent implements OnInit {
  private route          = inject(ActivatedRoute);
  private router         = inject(Router);
  private requestsService = inject(RequestsService);
  private clientService  = inject(ClientService);

  request: QuoteRequest | null = null;
  matchedClient: Client | null = null;
  loading = false;
  error = '';

  readonly STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
    NEW:            { label: 'New',          color: '#f59e0b', bg: 'rgba(245,158,11,0.12)'  },
    REVIEWED:       { label: 'Reviewed',     color: '#60a5fa', bg: 'rgba(96,165,250,0.12)'  },
    CLIENT_CREATED: { label: 'Client Added', color: '#34d399', bg: 'rgba(52,211,153,0.12)'  },
  };

  statusInfo(status: string) {
    return this.STATUS_MAP[status] ?? this.STATUS_MAP['NEW'];
  }

  actionMessage = '';
  actionMessageType: 'success' | 'error' | '' = '';
  processingClient = false;

  ngOnInit(): void {
    this.loadRequest();
  }

  loadRequest(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id) {
      this.error = 'Invalid request id.';
      return;
    }

    this.loading = true;
    this.error = '';

    this.requestsService.getInboxById(id).subscribe({
      next: (response: InboxDetailResponse) => {
        this.request = response.data;
        this.loading = false;
        if (!this.request.convertedToClient) {
          this.clientService.getClients().subscribe({
            next: (clients) => {
              this.matchedClient = clients.find(c =>
                (this.request!.email && c.email?.toLowerCase() === this.request!.email.toLowerCase()) ||
                (this.request!.phone && c.phone?.replace(/\D/g, '') === this.request!.phone?.replace(/\D/g, ''))
              ) ?? null;
            },
            error: () => {}
          });
        }
      },
      error: (err: any) => {
        console.error('Error loading request detail:', err);
        this.error = 'Could not load request detail.';
        this.loading = false;
      }
    });
  }

  goBack(): void { this.router.navigate(['/requests']); }

  goToClient(): void {
    if (!this.matchedClient?._id) return;
    this.router.navigate(['/clients', this.matchedClient._id]);
  }

  get matchedBy(): string {
    if (!this.matchedClient || !this.request) return '';
    const byEmail = this.request.email &&
      this.matchedClient.email?.toLowerCase() === this.request.email.toLowerCase();
    const byPhone = this.request.phone &&
      (this.matchedClient.phone ?? '').replace(/\D/g, '') === this.request.phone.replace(/\D/g, '');
    if (byEmail && byPhone) return 'email and phone';
    if (byEmail) return 'email';
    if (byPhone) return 'phone';
    return '';
  }

  showMessage(message: string, type: 'success' | 'error'): void {
    this.actionMessage = message;
    this.actionMessageType = type;

    setTimeout(() => {
      this.actionMessage = '';
      this.actionMessageType = '';
    }, 2600);
  }

  addClientDirect(): void {
    if (!this.request || this.request.convertedToClient || this.processingClient) return;

    this.processingClient = true;

    this.requestsService.convertToClient(this.request.odooId).subscribe({
      next: (response: ConvertClientResponse) => {
        this.request = response.request;
        this.processingClient = false;

        if (response.alreadyExists) {
          this.showMessage('Client already existed. Request updated.', 'success');
        } else {
          this.showMessage('Client created successfully.', 'success');
        }
      },
      error: (err: any) => {
        console.error('Error converting to client:', err);
        this.processingClient = false;
        this.showMessage(
          err?.error?.message || 'Could not create client.',
          'error'
        );
      }
    });
  }

  get hasQuote(): boolean { return !!this.request?.quoteId; }

  createQuote(): void {
    if (!this.request) return;

    // Already has a quote → go edit it
    if (this.request.quoteId) {
      this.router.navigate(['/quotes', this.request.quoteId, 'edit']);
      return;
    }

    const clientId =
      typeof this.request.clientId === 'string'
        ? this.request.clientId
        : this.request.clientId?._id;

    this.router.navigate(['/quotes/new'], {
      queryParams: {
        requestId: this.request._id || '',
        odooId: this.request.odooId,
        clientId: clientId || '',
        fullName: this.request.fullName || '',
        email: this.request.email || '',
        phone: this.request.phone || '',
        eventName: this.request.eventName || '',
        eventType: this.request.eventType || '',
        eventDate: this.request.eventDate || '',
        location: this.request.location || '',
        guests: this.request.guests || '',
        budgetRange: this.request.budgetRange || ''
      }
    });
  }
  getInitials(name: string): string {
    if (!name) return 'NA';

    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

    return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
  }
}