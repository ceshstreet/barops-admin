/**
 * QuotePdfTemplateComponent
 *
 * Pure presentational component. Receives all data as @Input() props.
 * Used in two places:
 *   1. QuoteBuilderComponent — live preview inside the builder
 *   2. /quotes/:id/pdf-preview route — standalone for window.print()
 *
 * Contains NO services, NO HTTP calls. Builder feeds the data down.
 */

import { Component, Input, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  Quote, QuoteSection, QuoteSectionType,
  SECTION_LABELS, DRINK_CATEGORY_LABELS, DRINK_CATEGORY_ICONS,
  DRINK_CATEGORIES, DrinkCategory, QuoteDrinkLine, defaultSections,
} from '../../models/quote.model';
import { Package } from '../../../packages/models/package.model';
import { BarType } from '../../../bar-types/services/bar-type.service';
import { DrinkTheme, getPopulatedDrinks } from '../../../drink-themes/models/drink-theme.model';
import { AddOn } from '../../../add-ons/models/add-on.model';
import { Drink } from '../../../drinks/models/drink.model';

@Component({
  selector: 'app-quote-pdf-template',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quote-pdf-template.component.html',
  styleUrl: './quote-pdf-template.component.scss',
  providers: [DatePipe],
})
export class QuotePdfTemplateComponent implements OnInit {
  @Input() quote!: Quote;
  @Input() sections: QuoteSection[] = [];
  @Input() pkgData:        Package | null    = null;
  @Input() barTypeData:    BarType | null    = null;
  @Input() drinkThemeData: DrinkTheme | null = null;
  @Input() suggestedAddOns: AddOn[]          = [];

  today = new Date();

  ngOnInit(): void {
    // If builder didn't provide sections, fall back to defaults
    if (!this.sections || this.sections.length === 0) {
      this.sections = defaultSections();
    }
  }

  // ── Section visibility & helpers ──────────────────────────────────────────

  get visibleSections(): QuoteSection[] {
    return [...this.sections]
      .filter(s => s.visibleInPdf)
      .sort((a, b) => a.order - b.order);
  }

  isVisible(type: QuoteSectionType): boolean {
    return this.visibleSections.some(s => s.type === type);
  }

  sectionTitle(type: QuoteSectionType): string {
    const s = this.sections.find(sec => sec.type === type);
    return s?.customTitle?.trim() || SECTION_LABELS[type];
  }

  sectionDesc(type: QuoteSectionType): string {
    return this.sections.find(s => s.type === type)?.customDescription?.trim() || '';
  }

  // ── Pricing helpers ────────────────────────────────────────────────────────

  get guestCount(): number {
    return this.quote?.guestCount || Number(this.quote?.guests) || 0;
  }

  get packageGuestTotal(): number {
    return this.guestCount * (this.quote?.pricePerGuest || 0);
  }

  get pricePerPerson(): number {
    if (!this.guestCount || !this.quote?.total) return 0;
    return Math.round(this.quote.total / this.guestCount);
  }

  // ── Enriched data helpers ─────────────────────────────────────────────────

  get experienceHeadline(): string {
    const pkg   = this.pkgData?.name   || this.quote?.packageName;
    const theme = this.drinkThemeData?.name || this.quote?.drinkThemeName;
    if (pkg && theme) return `${pkg} · ${theme} Experience`;
    if (pkg)          return pkg;
    if (theme)        return `${theme} Experience`;
    return 'Professional Bar Service';
  }

  get includedServices(): { name: string; detail: string }[] {
    return (this.pkgData?.services || []).filter(s => s.included);
  }

  get packageUpsells(): { name: string; detail: string; price: number }[] {
    return (this.pkgData?.services || [])
      .filter(s => !s.included && !!s.addOnPrice)
      .map(s => ({ name: s.name, detail: s.detail, price: s.addOnPrice! }));
  }

  get hasUpsells(): boolean {
    return this.packageUpsells.length > 0 || this.suggestedAddOns.length > 0;
  }

  get populatedDrinks(): Drink[] {
    if (!this.drinkThemeData) return [];
    return getPopulatedDrinks(this.drinkThemeData);
  }

  // ── Drink source: prefer quote.drinkLines, fall back to pkgData ──────────

  /** True when the quote has a custom drink list saved directly on it. */
  get hasCustomDrinkLines(): boolean {
    return (this.quote?.drinkLines || []).length > 0;
  }

  drinkLinesByCategory(cat: DrinkCategory): QuoteDrinkLine[] {
    return (this.quote?.drinkLines || []).filter(d => d.category === cat);
  }

  readonly drinkCategories     = DRINK_CATEGORIES;
  readonly drinkCategoryLabels = DRINK_CATEGORY_LABELS;
  readonly drinkCategoryIcons  = DRINK_CATEGORY_ICONS;

  // Legacy pkgData fallbacks (used when no custom drinkLines exist)
  get hasBeers():     boolean { return (this.pkgData?.beers     || []).length > 0; }
  get hasBeverages(): boolean { return (this.pkgData?.beverages || []).length > 0; }
  get hasWines():     boolean { return (this.pkgData?.wines     || []).length > 0; }
  get hasMixers():    boolean { return (this.pkgData?.mixers    || []).length > 0; }

  get hasDrinkContent(): boolean {
    if (this.hasCustomDrinkLines) return true;
    return this.hasBeers || this.hasBeverages || this.hasWines ||
           this.hasMixers || this.populatedDrinks.length > 0;
  }

  get drinksTotal(): number {
    return (this.quote?.drinkLines || []).reduce((s, d) => s + (d.price || 0) * (d.quantity || 1), 0);
  }

  // ── Countdown ─────────────────────────────────────────────────────────────

  get eventCountdown(): string {
    if (!this.quote?.eventDate) return '';
    const d = Math.ceil(
      (new Date(this.quote.eventDate).getTime() - Date.now()) / 86_400_000
    );
    if (d <= 0)  return '';
    if (d === 1) return 'Tomorrow';
    if (d <= 7)  return `${d} days away`;
    return `${Math.round(d / 7)} weeks away`;
  }

  get quoteRef(): string {
    return (this.quote?._id || '').slice(-6).toUpperCase() || '------';
  }
}
