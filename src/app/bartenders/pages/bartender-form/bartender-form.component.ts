import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-bartender-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bartender-form.component.html',
  styleUrl: './bartender-form.component.scss'
})
export class BartenderFormComponent {
  constructor(private router: Router) {}

  bartender = {
    fullName: '',
    phone: '',
    email: '',
    specialty: '',
    availability: '',
    experienceLevel: '',
    notes: '',
    status: 'available'
  };

  specialties = [
    'Classic Cocktails',
    'Tropical Drinks',
    'Mocktails',
    'Premium Service',
    'Bar Setup & Support',
    'Signature Cocktails'
  ];

  availabilities = [
    'Weekdays',
    'Weekends',
    'Weekdays / Nights',
    'Weekends / Nights',
    'On Request'
  ];

  experienceLevels = [
    'Junior',
    'Intermediate',
    'Senior',
    'Lead Bartender'
  ];

  statuses = [
    'available',
    'busy',
    'inactive'
  ];

  saveBartender() {
    console.log('Bartender data:', this.bartender);
    alert('Mock save: bartender created successfully.');
    this.router.navigate(['/bartenders']);
  }

  cancel() {
    this.router.navigate(['/bartenders']);
  }
}