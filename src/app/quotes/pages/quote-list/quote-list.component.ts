import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { QuotesService, QuotesListResponse } from '../../services/quotes.service';
import { Quote, QUOTE_STATUSES } from '../../models/quote.model';

type SortField = 'eventName' | 'fullName' | 'eventDate' | 'status' | 'createdAt' | 'total';

@Component({
  selector: 'app-quote-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './quote-list.component.html',
  styleUrl: './quote-list.component.scss',
})
export class QuoteListComponent implements OnInit {
  private quotesService = inject(QuotesService);
  private router = inject(Router);

  quotes: Quote[] = [];
  loading = false;
  error = '';
  searchTerm = '';
  activeStatus = 'ALL';
  deleteId: string | null = null;
  deleting = false;

  sortField: SortField = 'createdAt';
  sortDirection: 'asc' | 'desc' = 'desc';

  statuses = QUOTE_STATUSES;

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.error = '';
    this.quotesService.getQuotes().subscribe({
      next: (res: QuotesListResponse) => {
        this.quotes = res.data || [];
        this.loading = false;
      },
      error: () => {
        this.error = 'Could not load quotes.';
        this.loading = false;
      },
    });
  }

  get filtered(): Quote[] {
    let list = this.quotes;
    if (this.activeStatus !== 'ALL') {
      list = list.filter(q => q.status === this.activeStatus);
    }
    if (this.searchTerm.trim()) {
      const s = this.searchTerm.toLowerCase();
      list = list.filter(q =>
        (q.fullName || '').toLowerCase().includes(s) ||
        (q.eventName || '').toLowerCase().includes(s) ||
        (q.location || '').toLowerCase().includes(s)
      );
    }
    return [...list].sort((a, b) => {
      const va = (a[this.sortField] ?? '').toString().toLowerCase();
      const vb = (b[this.sortField] ?? '').toString().toLowerCase();
      if (va < vb) return this.sortDirection === 'asc' ? -1 : 1;
      if (va > vb) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  countByStatus(status: string): number {
    return this.quotes.filter(q => q.status === status).length;
  }

  sort(field: SortField): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
  }

  getSortIcon(field: SortField): string {
    if (this.sortField !== field) return 'unfold_more';
    return this.sortDirection === 'asc' ? 'north' : 'south';
  }

  getStatusColor(status: string): string {
    return this.statuses.find(s => s.value === status)?.color ?? '#94a3b8';
  }

  viewQuote(id?: string): void { if (id) this.router.navigate(['/quotes', id]); }
  editQuote(id?: string): void { if (id) this.router.navigate(['/quotes', id, 'edit']); }
  trackByQuote(_: number, q: Quote): string { return q._id ?? ''; }

  confirmDelete(id: string): void { this.deleteId = id; }
  cancelDelete(): void { this.deleteId = null; }

  doDelete(): void {
    if (!this.deleteId) return;
    this.deleting = true;
    this.quotesService.deleteQuote(this.deleteId).subscribe({
      next: () => {
        this.quotes = this.quotes.filter(q => q._id !== this.deleteId);
        this.deleteId = null;
        this.deleting = false;
      },
      error: () => { this.deleting = false; },
    });
  }
}
