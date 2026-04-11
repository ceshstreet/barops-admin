import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Quote, QUOTE_STATUSES } from '../../models/quote.model';
import { QuotesService } from '../../services/quotes.service';

@Component({
  selector: 'app-quote-public',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quote-public.component.html',
  styleUrl: './quote-public.component.scss',
})
export class QuotePublicComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private quotesService = inject(QuotesService);

  quote: Quote | null = null;
  loading = true;
  error = '';
  responding = false;
  responded = false;
  toast: { message: string; type: 'success' | 'error' } | null = null;

  statuses = QUOTE_STATUSES;

  ngOnInit(): void {
    const token = this.route.snapshot.paramMap.get('token');
    if (token) {
      this.quotesService.getPublicQuote(token).subscribe({
        next: (res) => { this.quote = res.data; this.loading = false; },
        error: () => { this.error = 'Quote not found or link has expired.'; this.loading = false; },
      });
    }
  }

  getStatusColor(status: string): string {
    return this.statuses.find(s => s.value === status)?.color ?? '#94a3b8';
  }

  getStatusLabel(status: string): string {
    return this.statuses.find(s => s.value === status)?.label ?? status;
  }

  respond(action: 'approve' | 'reject'): void {
    const token = this.route.snapshot.paramMap.get('token');
    if (!token || this.responding) return;
    this.responding = true;
    this.quotesService.respondToQuote(token, action).subscribe({
      next: (res) => {
        this.quote = res.data;
        this.responding = false;
        this.responded = true;
        this.showToast(
          action === 'approve' ? 'Quote approved! We\'ll be in touch shortly.' : 'Quote declined. Thank you for your response.',
          'success'
        );
      },
      error: () => {
        this.responding = false;
        this.showToast('Something went wrong. Please try again.', 'error');
      },
    });
  }

  showToast(message: string, type: 'success' | 'error'): void {
    this.toast = { message, type };
    setTimeout(() => this.toast = null, 4000);
  }

  get canRespond(): boolean {
    return !!this.quote && this.quote.status === 'SENT' && !this.responded;
  }
}
