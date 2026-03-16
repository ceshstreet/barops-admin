import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface Bartender {
  id: string;
  fullName: string;
  phone: string;
  specialty: string;
  availability: string;
  status: 'available' | 'busy' | 'inactive';
}

@Component({
  selector: 'app-bartender-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bartender-list.component.html',
  styleUrl: './bartender-list.component.scss'
})
export class BartenderListComponent {
  constructor(private router: Router) {}

  bartenders: Bartender[] = [
    {
      id: 'BT-001',
      fullName: 'Maria P.',
      phone: '+503 7000-2001',
      specialty: 'Classic Cocktails',
      availability: 'Weekends / Nights',
      status: 'available'
    },
    {
      id: 'BT-002',
      fullName: 'Jorge L.',
      phone: '+503 7000-2002',
      specialty: 'Tropical Drinks',
      availability: 'Mon - Sat / Afternoons',
      status: 'busy'
    },
    {
      id: 'BT-003',
      fullName: 'Sofia G.',
      phone: '+503 7000-2003',
      specialty: 'Mocktails & Premium Service',
      availability: 'Weekends',
      status: 'available'
    },
    {
      id: 'BT-004',
      fullName: 'Carlos M.',
      phone: '+503 7000-2004',
      specialty: 'Bar Setup & Support',
      availability: 'On Request',
      status: 'inactive'
    }
  ];

  createBartender() {
    this.router.navigate(['/bartenders/new']);
  }

  openBartender(bartender: Bartender) {
    this.router.navigate(['/bartenders', bartender.id]);
  }

  getStatusClass(status: string): string {
    if (status === 'available') return 'available';
    if (status === 'busy') return 'busy';
    return 'inactive';
  }
}