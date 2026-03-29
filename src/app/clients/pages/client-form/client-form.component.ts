import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ClientService } from '../../services/client.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './client-form.component.html',
  styleUrl: './client-form.component.scss'
})
export class ClientFormComponent implements OnInit {
  isEditMode = false;
  clientId: string | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private clientService: ClientService,
    private toastService: ToastService
  ) {}

  client = {
    name: '',
    lastName: '',
    phone: '',
    email: '',
    clientData: {
      preferredContact: '',
      notes: ''
    }
  };

  preferredContacts = ['WHATSAPP', 'EMAIL', 'PHONE'];

  ngOnInit() {
    this.clientId = this.route.snapshot.paramMap.get('id');
    if (this.clientId) {
      this.isEditMode = true;
      this.clientService.getClients().subscribe({
        next: (clients) => {
          const found = clients.find(c => c._id === this.clientId);
          if (found) {
            this.client = {
              name: found.name,
              lastName: found.lastName,
              phone: found.phone,
              email: found.email,
              clientData: {
                preferredContact: found.clientData?.preferredContact || '',
                notes: found.clientData?.notes || ''
              }
            };
          }
        }
      });
    }
  }

  saveClient() {
    if (this.isEditMode && this.clientId) {
      this.clientService.updateClient(this.clientId, this.client as any).subscribe({
        next: () => {
          this.toastService.show('Client updated successfully.', 'success');
          setTimeout(() => this.router.navigate(['/clients']), 1500);
        },
        error: (err) => {
          this.toastService.show('Error updating client.', 'error');
          console.error(err);
        }
      });
    } else {
      this.clientService.insertClient(this.client as any).subscribe({
        next: () => {
          this.toastService.show('Client created successfully.', 'success');
          setTimeout(() => this.router.navigate(['/clients']), 1500);
        },
        error: (err) => {
          this.toastService.show('Error creating client.', 'error');
          console.error(err);
        }
      });
    }
  }

  cancel() {
    this.router.navigate(['/clients']);
  }
}