import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { Quote, QUOTE_STATUSES } from '../../models/quote.model';
import { QuotesService } from '../../services/quotes.service';

@Component({
  selector: 'app-quote-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './quote-detail.component.html',
  styleUrl: './quote-detail.component.scss',
})
export class QuoteDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private quotesService = inject(QuotesService);

  quote: Quote | null = null;
  loading = true;
  error = '';
  updatingStatus = false;
  toast: { message: string; type: 'success' | 'error' } | null = null;

  statuses = QUOTE_STATUSES;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.quotesService.getQuoteById(id).subscribe({
        next: (res) => { this.quote = res.data; this.loading = false; },
        error: () => { this.error = 'Could not load quote.'; this.loading = false; },
      });
    }
  }

  getStatusColor(status: string): string {
    return this.statuses.find(s => s.value === status)?.color ?? '#94a3b8';
  }

  getStatusLabel(status: string): string {
    return this.statuses.find(s => s.value === status)?.label ?? status;
  }

  setStatus(status: Quote['status']): void {
    if (!this.quote?._id || this.quote.status === status) return;
    this.updatingStatus = true;
    this.quotesService.updateStatus(this.quote._id, status).subscribe({
      next: (res) => {
        this.quote = res.data;
        this.updatingStatus = false;
        this.showToast(`Status updated to ${status}`, 'success');
      },
      error: () => {
        this.updatingStatus = false;
        this.showToast('Error updating status', 'error');
      },
    });
  }

  edit(): void { if (this.quote?._id) this.router.navigate(['/quotes', this.quote._id, 'edit']); }
  goBack(): void { this.router.navigate(['/quotes']); }

  convertToReservation(): void {
    if (!this.quote) return;
    this.router.navigate(['/reservations/new'], {
      queryParams: {
        quoteId:     this.quote._id,
        title:       this.quote.eventName,
        eventDate:   this.quote.eventDate,
        location:    this.quote.location,
        guests:      this.quote.guestCount || this.quote.guests,
        packageName: this.quote.packageName || '',
        total:       this.quote.total || 0,
        clientName:  this.quote.fullName,
        email:       this.quote.email,
        phone:       this.quote.phone,
        notes:       `Quote approved. Package: ${this.quote.packageName || 'N/A'}. Total: $${this.quote.total || 0}.\n\n${this.quote.notes || ''}`.trim(),
      }
    });
  }

  printQuote(): void { window.print(); }

  copyShareLink(): void {
    if (this.quote?.shareToken) {
      this.doCopy(this.quote.shareToken);
    } else if (this.quote?._id) {
      // Generar token si la quote no tiene uno
      this.quotesService.generateShareLink(this.quote._id).subscribe({
        next: (res) => {
          this.quote = res.data;
          this.doCopy(res.data.shareToken ?? '');
        },
        error: () => this.showToast('Could not generate share link', 'error'),
      });
    }
  }

  private doCopy(token: string): void {
    const url = `${window.location.origin}/q/${token}`;
    navigator.clipboard.writeText(url).then(() => {
      this.showToast('Link copied to clipboard!', 'success');
    });
  }

  showToast(message: string, type: 'success' | 'error'): void {
    this.toast = { message, type };
    setTimeout(() => this.toast = null, 3000);
  }
}
