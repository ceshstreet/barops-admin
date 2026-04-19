import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ClientService } from '../../services/client.service';
import { ToastService } from '../../../shared/services/toast.service';
import intlTelInput from 'intl-tel-input';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './client-form.component.html',
  styleUrl: './client-form.component.scss'
})
export class ClientFormComponent implements OnInit, AfterViewInit {
  @ViewChild('phoneInput') phoneInput!: ElementRef<HTMLInputElement>;
  isEditMode = false;
  clientId: string | null = null;
  iti: any;

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

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private clientService: ClientService,
    private toastService: ToastService
  ) {}


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

            // Setear el teléfono en intl-tel-input después de cargar
            setTimeout(() => {
              const phoneEl = document.querySelector('.iti input[type="tel"]') as HTMLInputElement;
              if (phoneEl && found.phone) {
                // Quitar el código de país (cualquier cosa que empiece con +)
                const cleaned = found.phone.replace(/^\+\d{1,4}/, '').trim();
                phoneEl.value = cleaned;
              }
            }, 200);
          }
        }
      });
    }
  }



  ngAfterViewInit() {
    this.iti = intlTelInput(this.phoneInput.nativeElement, {
      initialCountry: 'sv',
      separateDialCode: true
    });
  }


  formError = '';

  private validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }

  saveClient() {
    this.formError = '';

    if (!this.client.name.trim() || !this.client.lastName.trim()) {
      this.formError = 'Name and last name are required.'; return;
    }
    if (!this.client.email.trim() || !this.validateEmail(this.client.email)) {
      this.formError = 'Please enter a valid email address.'; return;
    }

    const phoneEl    = document.querySelector('.iti input[type="tel"]') as HTMLInputElement;
    const dialCodeEl = document.querySelector('.iti__selected-dial-code') as HTMLElement;
    const dialCode   = dialCodeEl?.innerText?.trim() || '+503';
    const number     = phoneEl?.value?.trim() || '';
    if (!number) { this.formError = 'Phone number is required.'; return; }

    const fullPhone  = `${dialCode}${number}`.replace(/\s/g, '');
    const clientData = { ...this.client, phone: fullPhone };

    if (this.isEditMode && this.clientId) {
      this.clientService.updateClient(this.clientId, clientData as any).subscribe({
        next: () => {
          this.toastService.show('Client updated successfully.', 'success');
          setTimeout(() => this.router.navigate(['/clients']), 1500);
        },
        error: (err) => {
          this.formError = err?.error?.message || 'Error updating client.';
        }
      });
    } else {
      this.clientService.insertClient(clientData as any).subscribe({
        next: () => {
          this.toastService.show('Client created successfully.', 'success');
          setTimeout(() => this.router.navigate(['/clients']), 1500);
        },
        error: (err) => {
          this.formError = err?.error?.message || 'Error creating client.';
        }
      });
    }
  }
  ///
  cancel() {
    this.router.navigate(['/clients']);
  }
}