import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-bar-type-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bar-type-form.component.html',
  styleUrl: './bar-type-form.component.scss'
})
export class BarTypeFormComponent {
  constructor(private router: Router) {}

  barType = {
    name: '',
    category: '',
    lighting: '',
    capacity: '',
    setupType: '',
    notes: '',
    status: 'active'
  };

  categories = [
    'Portable',
    'Premium Lighted',
    'Large Lighted',
    'Custom'
  ];

  lightingOptions = [
    'Yes',
    'No'
  ];

  capacityOptions = [
    'Small events',
    'Small to medium events',
    'Medium events',
    'Medium to large events',
    'Large events'
  ];

  setupTypes = [
    'Indoor',
    'Outdoor',
    'Indoor / Outdoor'
  ];

  statuses = [
    'active',
    'inactive'
  ];

  saveBarType() {
    console.log('Bar Type data:', this.barType);
    alert('Mock save: bar type created successfully.');
    this.router.navigate(['/bar-types']);
  }

  cancel() {
    this.router.navigate(['/bar-types']);
  }
}