/**
 * QuoteBuilderComponent
 *
 * Internal tool for designing the PDF proposal.
 * Two-panel layout: section controls (left) + live PDF preview (right).
 *
 * Features:
 *  - Drag-to-reorder sections via Angular CDK
 *  - Toggle section PDF visibility (eye icon)
 *  - Edit custom title + description per section
 *  - Proposal settings: intro paragraph, footer signature
 *  - Save (patches quote with updated sections)
 *  - Download PDF via window.print() on the /pdf-preview route
 */

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

import {
  CdkDragDrop, moveItemInArray,
  CdkDropList, CdkDrag, CdkDragHandle,
} from '@angular/cdk/drag-drop';

import {
  Quote, QuoteSection, QuoteSectionType,
  SECTION_LABELS, SECTION_ICONS, defaultSections,
} from '../../models/quote.model';
import { QuotesService } from '../../services/quotes.service';
import { PackageService } from '../../../packages/services/package.service';
import { BarTypeService, BarType } from '../../../bar-types/services/bar-type.service';
import { DrinkThemeService } from '../../../drink-themes/services/drink-theme.service';
import { AddOnService } from '../../../add-ons/services/add-on.service';
import { Package } from '../../../packages/models/package.model';
import { DrinkTheme } from '../../../drink-themes/models/drink-theme.model';
import { AddOn } from '../../../add-ons/models/add-on.model';

import { QuotePdfTemplateComponent } from '../../components/quote-pdf-template/quote-pdf-template.component';

@Component({
  selector: 'app-quote-builder',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    CdkDropList,
    CdkDrag,
    CdkDragHandle,
    QuotePdfTemplateComponent,
  ],
  templateUrl: './quote-builder.component.html',
  styleUrl: './quote-builder.component.scss',
})
export class QuoteBuilderComponent implements OnInit {
  private route         = inject(ActivatedRoute);
  private router        = inject(Router);
  private quotesService = inject(QuotesService);
  private pkgService    = inject(PackageService);
  private barTypeService = inject(BarTypeService);
  private themeService  = inject(DrinkThemeService);
  private addOnService  = inject(AddOnService);

  // ── Quote state ────────────────────────────────────────────────────────────
  quote:    Quote | null  = null;
  loading   = true;
  saving    = false;
  dirty     = false;
  errorMsg  = '';
  toast: { message: string; type: 'success' | 'error' } | null = null;

  // ── Sections (working copy, mutable) ──────────────────────────────────────
  sections: QuoteSection[] = [];

  // ── Selected section for editing ──────────────────────────────────────────
  selectedSection: QuoteSection | null = null;

  // ── Proposal-level settings ────────────────────────────────────────────────
  proposalIntro     = '';
  proposalSignature = '';

  // ── Enriched catalog data (passed to PDF template) ─────────────────────────
  pkgData:         Package | null    = null;
  barTypeData:     BarType | null    = null;
  drinkThemeData:  DrinkTheme | null = null;
  suggestedAddOns: AddOn[]           = [];

  // ── UI labels ──────────────────────────────────────────────────────────────
  readonly sectionLabels = SECTION_LABELS;
  readonly sectionIcons  = SECTION_ICONS;

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.errorMsg = 'No quote ID'; this.loading = false; return; }

    this.quotesService.getQuoteById(id).subscribe({
      next: (res) => {
        this.quote = res.data;
        this.loading = false;
        this.initSections();
        this.proposalIntro     = this.quote?.proposalIntro     || '';
        this.proposalSignature = this.quote?.proposalSignature || '';
        this.loadEnrichedData();
      },
      error: () => {
        this.errorMsg = 'Could not load quote.';
        this.loading = false;
      },
    });
  }

  // ── Section initialisation ─────────────────────────────────────────────────
  private initSections(): void {
    const saved = this.quote?.sections;
    if (saved && saved.length > 0) {
      // Use saved sections, sorted by order
      this.sections = [...saved].sort((a, b) => a.order - b.order);
    } else {
      this.sections = defaultSections();
    }
  }

  // ── Enriched catalog data ──────────────────────────────────────────────────
  private loadEnrichedData(): void {
    if (!this.quote) return;

    if (this.quote.packageId) {
      this.pkgService.getById(this.quote.packageId)
        .pipe(catchError(() => of(null)))
        .subscribe(p => this.pkgData = p);
    }

    if (this.quote.barTypeId) {
      this.barTypeService.getBarTypeById(this.quote.barTypeId)
        .pipe(catchError(() => of(null)))
        .subscribe(bt => this.barTypeData = bt);
    }

    if (this.quote.drinkThemeId) {
      this.themeService.getById(this.quote.drinkThemeId)
        .pipe(catchError(() => of(null)))
        .subscribe(t => this.drinkThemeData = t);
    }

    this.addOnService.getAll()
      .pipe(catchError(() => of({ data: [], total: 0 })))
      .subscribe(res => {
        const usedIds = new Set(
          (this.quote?.addOnLines || []).map(l => l.addOnId).filter(Boolean)
        );
        this.suggestedAddOns = (res.data || [])
          .filter(a => a.active && !usedIds.has(a._id))
          .slice(0, 4);
      });
  }

  // ── CDK Drag-drop ──────────────────────────────────────────────────────────
  onDrop(event: CdkDragDrop<QuoteSection[]>): void {
    moveItemInArray(this.sections, event.previousIndex, event.currentIndex);
    this.sections.forEach((s, i) => s.order = i);
    this.dirty = true;
  }

  // ── Section visibility toggle ─────────────────────────────────────────────
  toggleVisibility(section: QuoteSection, event: MouseEvent): void {
    event.stopPropagation();
    section.visibleInPdf = !section.visibleInPdf;
    this.dirty = true;
  }

  // ── Section selection ─────────────────────────────────────────────────────
  selectSection(section: QuoteSection): void {
    this.selectedSection = this.selectedSection === section ? null : section;
  }

  onSectionFieldChange(): void {
    this.dirty = true;
  }

  // ── Save ──────────────────────────────────────────────────────────────────
  save(): void {
    if (!this.quote?._id || this.saving) return;
    this.saving = true;

    // Sync proposal-level fields into the quote object for the template
    if (this.quote) {
      this.quote.proposalIntro     = this.proposalIntro;
      this.quote.proposalSignature = this.proposalSignature;
    }

    this.quotesService.updateQuote(this.quote._id, {
      sections:          this.sections,
      proposalIntro:     this.proposalIntro,
      proposalSignature: this.proposalSignature,
    } as Partial<Quote>).subscribe({
      next: (res) => {
        this.saving = false;
        this.dirty  = false;
        this.quote  = res.data;
        this.showToast('Saved successfully', 'success');
      },
      error: () => {
        this.saving = false;
        this.showToast('Could not save. Please try again.', 'error');
      },
    });
  }

  // ── Print / PDF download ───────────────────────────────────────────────────
  openPrintPreview(): void {
    if (!this.quote?._id) return;
    const url = this.router.createUrlTree(['/quotes', this.quote._id, 'pdf-preview']).toString();
    window.open(url, '_blank');
  }

  // ── Navigation ────────────────────────────────────────────────────────────
  goBack(): void {
    if (this.quote?._id) {
      this.router.navigate(['/quotes', this.quote._id]);
    } else {
      this.router.navigate(['/quotes']);
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  sectionLabel(type: QuoteSectionType): string {
    return SECTION_LABELS[type];
  }

  sectionIcon(type: QuoteSectionType): string {
    return SECTION_ICONS[type];
  }

  get visibleCount(): number {
    return this.sections.filter(s => s.visibleInPdf).length;
  }

  // ── Live sync to quote object for preview ─────────────────────────────────
  get liveQuote(): Quote | null {
    if (!this.quote) return null;
    return {
      ...this.quote,
      proposalIntro:     this.proposalIntro,
      proposalSignature: this.proposalSignature,
    };
  }

  showToast(message: string, type: 'success' | 'error'): void {
    this.toast = { message, type };
    setTimeout(() => this.toast = null, 3000);
  }
}
