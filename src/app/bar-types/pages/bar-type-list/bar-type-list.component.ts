import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface BarType {
  id: string;
  name: string;
  category: string;
  lighting: string;
  capacity: string;
  status: 'active' | 'inactive';
}

@Component({
  selector: 'app-bar-type-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bar-type-list.component.html',
  styleUrl: './bar-type-list.component.scss'
})
export class BarTypeListComponent {
  constructor(private router: Router) {}

  barTypes: BarType[] = [
    {
      id: 'BAR-001',
      name: 'Travel Bar',
      category: 'Portable',
      lighting: 'No',
      capacity: 'Small to medium events',
      status: 'active'
    },
    {
      id: 'BAR-002',
      name: 'Ultimate Bar',
      category: 'Premium Lighted',
      lighting: 'Yes',
      capacity: 'Medium to large events',
      status: 'active'
    },
    {
      id: 'BAR-003',
      name: 'Stadium Bar',
      category: 'Large Lighted',
      lighting: 'Yes',
      capacity: 'Large events',
      status: 'active'
    }
  ];

  createBarType() {
    this.router.navigate(['/bar-types/new']);
  }

  openBarType(barType: BarType) {
    this.router.navigate(['/bar-types', barType.id]);
  }

  getStatusClass(status: string): string {
    if (status === 'active') return 'active';
    return 'inactive';
  }
}