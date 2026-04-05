import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Quote } from '../../models/quote.model';

@Component({
  selector: 'app-quote-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './quote-form.component.html',
  styleUrl: './quote-form.component.scss',
})
export class QuoteFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  quote: Quote = {
    requestId: '',
    odooId: undefined,
    clientId: '',

    fullName: '',
    email: '',
    phone: '',

    eventName: '',
    eventType: '',
    eventDate: '',
    location: '',
    guests: '',
    budgetRange: '',

    barTypeId: '',
    packageId: '',
    drinkThemeId: '',

    selectedDrinks: [],

    notes: '',
    internalNotes: '',

    subtotal: 0,
    discount: 0,
    tax: 0,
    total: 0,

    status: 'DRAFT',
  };

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.quote = {
        ...this.quote,
        requestId: params['requestId'] || '',
        odooId: params['odooId'] ? Number(params['odooId']) : undefined,
        clientId: params['clientId'] || '',

        fullName: params['fullName'] || '',
        email: params['email'] || '',
        phone: params['phone'] || '',

        eventName: params['eventName'] || '',
        eventType: params['eventType'] || '',
        eventDate: params['eventDate'] || '',
        location: params['location'] || '',
        guests: params['guests'] || '',
        budgetRange: params['budgetRange'] || '',
      };
    });
  }

  calculateTotal(): void {
    const subtotal = Number(this.quote.subtotal || 0);
    const discount = Number(this.quote.discount || 0);
    const tax = Number(this.quote.tax || 0);

    this.quote.total = subtotal - discount + tax;
  }

  goBack(): void {
    this.router.navigate(['/quotes']);
  }

  saveDraft(): void {
    this.calculateTotal();
    console.log('Quote draft:', this.quote);
  }
}