import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  eventType: string;
  lastEventDate: string;
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
      firstName: 'Ana',
      lastName: 'Martinez',
      phone: '+503 7000-1001',
      email: 'ana@email.com',
      eventType: 'Wedding',
      lastEventDate: '2026-02-07'
    },
    {
      id: 'CL-002',
      firstName: 'Carlos',
      lastName: 'Ruiz',
      phone: '+503 7111-2233',
      email: 'carlos@email.com',
      eventType: 'Private Party',
      lastEventDate: '2026-02-10'
    },
    {
      id: 'CL-003',
      firstName: 'Lucia',
      lastName: 'Vasquez',
      phone: '+503 7444-8899',
      email: 'lucia@email.com',
      eventType: 'Birthday',
      lastEventDate: '2026-02-14'
    },
    {
      id: 'CL-004',
      firstName: 'David',
      lastName: 'Hernandez',
      phone: '+503 7555-9900',
      email: 'david@email.com',
      eventType: 'Corporate Event',
      lastEventDate: '2026-02-18'
    }
  ];

  createClient() {
    this.router.navigate(['/clients/new']);
  }

  openClient(client: Client) {
    this.router.navigate(['/clients', client.id]);
  }

  getFullName(client: Client): string {
    return `${client.firstName} ${client.lastName}`;
  }
}