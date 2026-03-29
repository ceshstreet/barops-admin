import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ClientService, Client } from '../../services/client.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './client-list.component.html',
  styleUrl: './client-list.component.scss'
})
export class ClientListComponent implements OnInit {
  clients: Client[] = [];
  sortAsc = true;
  showDeleteModal = false;
  clientToDelete: Client | null = null;

  constructor(
    private router: Router,
    private clientService: ClientService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.clientService.getClients().subscribe({
      next: (data) => this.clients = data,
      error: (err) => console.error('Error cargando clientes:', err)
    });
  }

  sortByName() {
    this.sortAsc = !this.sortAsc;
    this.clients.sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      return this.sortAsc ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    });
  }

  createClient() {
    this.router.navigate(['/clients/new']);
  }

  editClient(event: Event, client: Client) {
    event.stopPropagation();
    this.router.navigate(['/clients', client._id, 'edit']);
  }

  confirmDelete(event: Event, client: Client) {
    event.stopPropagation();
    this.clientToDelete = client;
    this.showDeleteModal = true;
  }

  cancelDelete() {
    this.clientToDelete = null;
    this.showDeleteModal = false;
  }

  confirmDeleteAction() {
    if (!this.clientToDelete) return;
    this.clientService.deleteClient(this.clientToDelete._id!).subscribe({
      next: () => {
        this.clients = this.clients.filter(c => c._id !== this.clientToDelete!._id);
        this.toastService.show('Client deleted successfully.', 'success');
        this.cancelDelete();
      },
      error: (err) => {
        this.toastService.show('Error deleting client.', 'error');
        console.error(err);
      }
    });
  }

  openClient(client: Client) {
    this.router.navigate(['/clients', client._id]);
  }

  getFullName(client: Client): string {
    return `${client.name} ${client.lastName}`;
  }
}