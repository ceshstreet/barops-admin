import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientService, Client } from '../../services/client.service';

@Component({
  selector: 'app-client-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './client-detail.component.html',
  styleUrl: './client-detail.component.scss'
})
export class ClientDetailComponent implements OnInit {
  client: Client | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clientService: ClientService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.clientService.getClientById(id).subscribe({
        next: (data) => this.client = data,
        error: (err) => console.error('Error cargando cliente:', err)
      });
    }
  }

  editClient() {
    this.router.navigate(['/clients', this.client?._id, 'edit']);
  }

  goBack() {
    this.router.navigate(['/clients']);
  }

  getFullName(): string {
    return `${this.client?.name} ${this.client?.lastName}`;
  }
}