/**
 * QuotePdfPreviewComponent
 *
 * Standalone full-page route: /quotes/:id/pdf-preview
 * Renders only the QuotePdfTemplateComponent — no admin nav, no sidebar.
 * Opened in a new tab from the builder. User presses Ctrl+P to print/save PDF.
 *
 * Auto-triggers window.print() after data loads so the browser print
 * dialog opens immediately when the tab opens.
 */

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

import { Quote } from '../../models/quote.model';
import { QuotesService } from '../../services/quotes.service';
import { PackageService } from '../../../packages/services/package.service';
import { BarTypeService, BarType } from '../../../bar-types/services/bar-type.service';
import { DrinkThemeService } from '../../../drink-themes/services/drink-theme.service';
import { AddOnService } from '../../../add-ons/services/add-on.service';
import { Package } from '../../../packages/models/package.model';
import { DrinkTheme } from '../../../drink-themes/models/drink-theme.model';
import { AddOn } from '../../../add-ons/models/add-on.model';
import { QuoteSection, defaultSections } from '../../models/quote.model';
import { QuotePdfTemplateComponent } from '../../components/quote-pdf-template/quote-pdf-template.component';

@Component({
  selector: 'app-quote-pdf-preview',
  standalone: true,
  imports: [CommonModule, QuotePdfTemplateComponent],
  template: `
    <div class="pdf-preview-loading" *ngIf="loading">
      <div class="pvl-spinner"></div>
      <span>Preparing PDF…</span>
    </div>

    <div class="pdf-preview-error" *ngIf="!loading && error">
      <p>{{ error }}</p>
    </div>

    <app-quote-pdf-template
      *ngIf="!loading && !error && quote"
      [quote]="quote!"
      [sections]="sections"
      [pkgData]="pkgData"
      [barTypeData]="barTypeData"
      [drinkThemeData]="drinkThemeData"
      [suggestedAddOns]="suggestedAddOns">
    </app-quote-pdf-template>
  `,
  styles: [`
    :host { display: block; background: white; }

    .pdf-preview-loading {
      height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 14px;
      color: #64748b;
      font-family: -apple-system, sans-serif;
      font-size: 15px;
    }

    .pvl-spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #e2e8f0;
      border-top-color: #7c5cff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }

    .pdf-preview-error {
      padding: 60px;
      text-align: center;
      color: #ef4444;
      font-family: -apple-system, sans-serif;
    }
  `],
})
export class QuotePdfPreviewComponent implements OnInit {
  private route         = inject(ActivatedRoute);
  private quotesService = inject(QuotesService);
  private pkgService    = inject(PackageService);
  private barTypeService = inject(BarTypeService);
  private themeService  = inject(DrinkThemeService);
  private addOnService  = inject(AddOnService);

  loading  = true;
  error    = '';
  quote:   Quote | null    = null;
  sections: QuoteSection[] = [];

  pkgData:         Package | null    = null;
  barTypeData:     BarType | null    = null;
  drinkThemeData:  DrinkTheme | null = null;
  suggestedAddOns: AddOn[]           = [];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.error = 'No quote ID.'; this.loading = false; return; }

    this.quotesService.getQuoteById(id).subscribe({
      next: (res) => {
        this.quote    = res.data;
        this.sections = (this.quote.sections?.length)
          ? [...this.quote.sections].sort((a, b) => a.order - b.order)
          : defaultSections();
        this.loading  = false;
        this.loadEnrichedData();
      },
      error: () => {
        this.error   = 'Could not load quote.';
        this.loading = false;
      },
    });
  }

  private loadEnrichedData(): void {
    if (!this.quote) return;

    const done = () => {
      // Auto-open print dialog once all data has loaded
      setTimeout(() => window.print(), 400);
    };

    let pending = 0;
    const tick = () => { if (--pending === 0) done(); };

    if (this.quote.packageId) {
      pending++;
      this.pkgService.getById(this.quote.packageId)
        .pipe(catchError(() => of(null)))
        .subscribe(p => { this.pkgData = p; tick(); });
    }

    if (this.quote.barTypeId) {
      pending++;
      this.barTypeService.getBarTypeById(this.quote.barTypeId)
        .pipe(catchError(() => of(null)))
        .subscribe(bt => { this.barTypeData = bt; tick(); });
    }

    if (this.quote.drinkThemeId) {
      pending++;
      this.themeService.getById(this.quote.drinkThemeId)
        .pipe(catchError(() => of(null)))
        .subscribe(t => { this.drinkThemeData = t; tick(); });
    }

    pending++;
    this.addOnService.getAll()
      .pipe(catchError(() => of({ data: [], total: 0 })))
      .subscribe(res => {
        const usedIds = new Set(
          (this.quote?.addOnLines || []).map(l => l.addOnId).filter(Boolean)
        );
        this.suggestedAddOns = (res.data || [])
          .filter((a: AddOn) => a.active && !usedIds.has(a._id))
          .slice(0, 4);
        tick();
      });

    if (pending === 0) done();
  }
}
