import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BartenderService } from '../../services/bartender.service';
import { ToastService } from '../../../shared/services/toast.service';
import intlTelInput from 'intl-tel-input';

@Component({
  selector: 'app-bartender-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bartender-form.component.html',
  styleUrl: './bartender-form.component.scss'
})
export class BartenderFormComponent implements OnInit, AfterViewInit {
  @ViewChild('phoneInput') phoneInput!: ElementRef;
  isEditMode = false;
  bartenderId: string | null = null;
  iti: any;

  bartender: any = {
    name: '',
    lastName: '',
    email: '',
    phone: '',
    status: 'AVAILABLE',
    bartenderData: {
      specialty: '',
      availabilitySchedule: '',
      experienceLevel: '',
      notes: ''
    }
  };

  specialties = ['Classic Cocktails', 'Tropical Drinks', 'Mixology', 'Wine & Beer'];
  experienceLevels = ['Junior', 'Semi-Senior', 'Senior', 'Master'];
  statuses = ['AVAILABLE', 'BUSY', 'UNAVAILABLE'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bartenderService: BartenderService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.bartenderId = this.route.snapshot.paramMap.get('id');
    if (this.bartenderId) {
      this.isEditMode = true;
      this.bartenderService.getBartenderById(this.bartenderId).subscribe({
        next: (data) => {
          this.bartender = data;
          if (!this.bartender.bartenderData) {
            this.bartender.bartenderData = { specialty: '', availabilitySchedule: '', experienceLevel: '', notes: '' };
          }
          this.bartender.password = '';

          // Cargar teléfono en intl-tel-input
          setTimeout(() => {
            const phoneEl = document.querySelector('.iti input[type="tel"]') as HTMLInputElement;
            if (phoneEl && data.phone) {
              // Usar iti para setear el número correctamente
              if (this.iti) {
                this.iti.setNumber(data.phone);
              } else {
                const cleaned = data.phone.replace(/^\+\d{1,4}/, '').trim();
                phoneEl.value = cleaned;
              }
            }
          }, 300);
        },
        error: () => this.toastService.show('Error al cargar datos del bartender', 'error')
      });
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      const phoneEl = document.querySelector('input[type="tel"]') as HTMLInputElement;
      if (phoneEl) {
        this.iti = intlTelInput(phoneEl, {
          initialCountry: 'sv',
          separateDialCode: true
        });
      }
    }, 100);
  }


  //
  saveBartender() {
    const phoneEl = document.querySelector('.iti input[type="tel"]') as HTMLInputElement;
    const dialCodeEl = document.querySelector('.iti__selected-dial-code') as HTMLElement;

    const dialCode = dialCodeEl?.innerText?.trim() || '+503';
    const number = phoneEl?.value?.trim() || '';
    const fullPhone = `${dialCode}${number}`.replace(/\s/g, '');

    const bartenderData = { ...this.bartender, phone: fullPhone };

    if (this.isEditMode && this.bartenderId) {
      this.bartenderService.updateBartender(this.bartenderId, bartenderData).subscribe({
        next: () => {
          this.toastService.show('Bartender actualizado con éxito', 'success');
          setTimeout(() => this.router.navigate(['/bartenders']), 1500);
        },
        error: (err) => {
          this.toastService.show(err.error?.message || 'Error al actualizar', 'error');
          console.error(err);
        }
      });
    } else {
      this.bartenderService.insertBartender(bartenderData).subscribe({
        next: (res: any) => {
          const msg = res?.emailSent === false
            ? 'Bartender creado. Email no enviado — revisa la configuración SMTP.'
            : 'Bartender creado. Email de invitación enviado.';
          this.toastService.show(msg, res?.emailSent === false ? 'error' : 'success');
          setTimeout(() => this.router.navigate(['/bartenders']), 2000);
        },
        error: (err) => {
          this.toastService.show(err.error?.message || 'Error al crear', 'error');
          console.error(err);
        }
      });
    }
  }

  ///
  cancel() {
    this.router.navigate(['/bartenders']);
  }
}