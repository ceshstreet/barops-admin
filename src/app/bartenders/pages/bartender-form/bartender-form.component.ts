import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BartenderService, Bartender } from '../../services/bartender.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-bartender-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bartender-form.component.html',
  styleUrl: './bartender-form.component.scss'
})
export class BartenderFormComponent implements OnInit {
  isEditMode = false;
  bartenderId: string | null = null;

  bartender: any = {
    name: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
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
          // Inicializamos los datos anidados por si vienen vacíos del back
          if (!this.bartender.bartenderData) {
            this.bartender.bartenderData = { specialty: '', availabilitySchedule: '', experienceLevel: '', notes: '' };
          }
          // Limpiamos password para que no de error de validación al editar
          this.bartender.password = '';
        },
        error: (err) => this.toastService.show('Error al cargar datos del bartender', 'error')
      });
    }
  }

  saveBartender() {
    if (this.isEditMode && this.bartenderId) {
      this.bartenderService.updateBartender(this.bartenderId, this.bartender).subscribe({
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
      this.bartenderService.insertBartender(this.bartender).subscribe({
        next: () => {
          this.toastService.show('Bartender creado con éxito', 'success');
          setTimeout(() => this.router.navigate(['/bartenders']), 1500);
        },
        error: (err) => {
          this.toastService.show(err.error?.message || 'Error al crear', 'error');
          console.error(err);
        }
      });
    }
  }

  cancel() {
    this.router.navigate(['/bartenders']);
  }
}