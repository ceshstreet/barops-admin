import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RequestsService, InboxDetailResponse } from '../../services/request.service';
import { QuoteRequest } from '../../models/request.model';

@Component({
  selector: 'app-request-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './request-detail.component.html',
  styleUrl: './request-detail.component.scss',
})
export class RequestDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private requestsService = inject(RequestsService);

  request: QuoteRequest | null = null;
  loading = false;
  error = '';

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
      },
      error: (err: any) => {
        console.error('Error loading request detail:', err);
        this.error = 'Could not load request detail.';
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/requests']);
  }

  convertToClient(): void {
    if (!this.request) return;

    this.router.navigate(['/clients/new'], {
      queryParams: {
        fullName: this.request.fullName,
        email: this.request.email,
        phone: this.request.phone,
        preferredContact: 'WhatsApp',
        notes: `Client created from inbox request #${this.request.odooId}`
      }
    });
  }

  convertToEvent(): void {
    if (!this.request) return;

    this.router.navigate(['/events/new'], {
      queryParams: {
        name: this.request.eventName,
        clientName: this.request.fullName,
        clientEmail: this.request.email,
        clientPhone: this.request.phone,
        eventType: this.request.eventType,
        eventDate: this.request.eventDate,
        location: this.request.location,
        guests: this.request.guests,
        budgetRange: this.request.budgetRange
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