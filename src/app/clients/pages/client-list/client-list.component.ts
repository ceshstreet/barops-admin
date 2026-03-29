import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ClientService, Client } from '../../services/client.service';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './client-list.component.html',
  styleUrl: './client-list.component.scss'
})
export class ClientListComponent implements OnInit {
  clients: Client[] = [];

  constructor(private router: Router, private clientService: ClientService) {}

  ngOnInit() {
    this.clientService.getClients().subscribe({
      next: (data) => this.clients = data,
      error: (err) => console.error('Error cargando clientes:', err)
    });
  }

  createClient() {
    this.router.navigate(['/clients/new']);
  }

  openClient(client: Client) {
    this.router.navigate(['/clients', client._id]);
  }

  getFullName(client: Client): string {
    return `${client.name} ${client.lastName}`;
  }
}