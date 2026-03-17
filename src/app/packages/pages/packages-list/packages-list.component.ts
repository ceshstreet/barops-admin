import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface PackageItem {
  id: string;
  name: string;
  guests: string;
  cocktailsIncluded: string;
  barType: string;
  duration: string;
  status: 'active' | 'inactive';
}

@Component({
  selector: 'app-package-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './packages-list.component.html',
  styleUrl: './packages-list.component.scss'
})
export class PackageListComponent {
  constructor(private router: Router) {}

  packages: PackageItem[] = [
    {
      id: 'PKG-001',
      name: 'Basic',
      guests: 'Up to 50 guests',
      cocktailsIncluded: '3 cocktails',
      barType: 'Travel Bar',
      duration: '4 hours',
      status: 'active'
    },
    {
      id: 'PKG-002',
      name: 'Premium',
      guests: 'Up to 50 guests',
      cocktailsIncluded: '4 cocktails',
      barType: 'Ultimate Bar',
      duration: '4 hours',
      status: 'active'
    },
    {
      id: 'PKG-003',
      name: 'Ultimate',
      guests: 'Up to 50 guests',
      cocktailsIncluded: '5 cocktails + 1 signature cocktail',
      barType: 'Stadium Bar',
      duration: '4 hours',
      status: 'active'
    }
  ];

  createPackage() {
    this.router.navigate(['/packages/new']);
  }

  openPackage(packageItem: PackageItem) {
    this.router.navigate(['/packages', packageItem.id]);
  }

  getStatusClass(status: string): string {
    if (status === 'active') return 'active';
    return 'inactive';
  }
}