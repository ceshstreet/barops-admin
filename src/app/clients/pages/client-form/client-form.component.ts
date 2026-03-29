import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './client-form.component.html',
  styleUrl: './client-form.component.scss'
})
export class ClientFormComponent {
  constructor(private router: Router) {}

  client = {
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    eventType: '',
    preferredContact: '',
    budgetRange: '',
    notes: ''
  };

  eventTypes = [
    'Wedding',
    'Corporate Event',
    'Birthday',
    'Private Party',
    'Pool Party',
    'Holiday Event'
  ];

  preferredContacts = [
    'Phone',
    'Email',
    'WhatsApp'
  ];

  budgetRanges = [
    '$300 - $500',
    '$500 - $800',
    '$800 - $1,200',
    '$1,200+'
  ];

  saveClient() {
    console.log('Client data:', this.client);
    alert('Mock save: client created successfully.');
    this.router.navigate(['/clients']);
  }

  cancel() {
    this.router.navigate(['/clients']);
  }
}