import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface Client {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  eventType: string;
  lastEventDate: string;
  status: 'active' | 'prospect' | 'vip';
}

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './client-list.component.html',
  styleUrl: './client-list.component.scss'
})
export class ClientListComponent {
  constructor(private router: Router) {}

  clients: Client[] = [
    {
      id: 'CL-001',
      fullName: 'Ana M.',
      phone: '+503 7000-1001',
      email: 'ana@email.com',
      eventType: 'Wedding',
      lastEventDate: '2026-02-07',
      status: 'vip'
    },
    {
      id: 'CL-002',
      fullName: 'Inversiones XYZ',
      phone: '+503 2200-3300',
      email: 'contact@xyz.com',
      eventType: 'Corporate Event',
      lastEventDate: '2026-02-08',
      status: 'active'
    },
    {
      id: 'CL-003',
      fullName: 'Carlos R.',
      phone: '+503 7111-2233',
      email: 'carlos@email.com',
      eventType: 'Private Party',
      lastEventDate: '2026-02-10',
      status: 'active'
    },
    {
      id: 'CL-004',
      fullName: 'Lucia V.',
      phone: '+503 7444-8899',
      email: 'lucia@email.com',
      eventType: 'Birthday',
      lastEventDate: '2026-02-14',
      status: 'prospect'
    }
  ];

  createClient() {
    this.router.navigate(['/clients/new']);
  }

  openClient(client: Client) {
    this.router.navigate(['/clients', client.id]);
  }

  getStatusClass(status: string): string {
    if (status === 'vip') return 'vip';
    if (status === 'active') return 'active';
    return 'prospect';
  }
}