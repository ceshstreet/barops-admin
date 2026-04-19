import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BartenderService, Bartender } from '../../services/bartender.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-bartender-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bartender-list.component.html',
  styleUrl: './bartender-list.component.scss'
})
export class BartenderListComponent implements OnInit {
  bartenders: Bartender[] = [];
  showDeleteModal = false;
  bartenderToDelete: Bartender | null = null;

  // Reset password
  showResetModal    = false;
  bartenderToReset: Bartender | null = null;
  resetPassword     = '';
  resetConfirm      = '';
  showResetPass     = false;
  resetError        = '';
  resetSaving       = false;

  constructor(
    private router: Router,
    private bartenderService: BartenderService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.bartenderService.getBartenders().subscribe({
      next: (data) => this.bartenders = data,
      error: (err) => console.error('Error cargando bartenders:', err)
    });
  }

  createBartender() {
    this.router.navigate(['/bartenders/new']);
  }

  openBartender(bartender: Bartender) {
    this.router.navigate(['/bartenders', bartender._id]);
  }

  editBartender(event: Event, bartender: Bartender) {
    event.stopPropagation(); // Para que no se abra el Detail al mismo tiempo
    this.router.navigate(['/bartenders', bartender._id, 'edit']);
  }


  confirmDelete(event: Event, bartender: Bartender) {
    event.stopPropagation();
    this.bartenderToDelete = bartender;
    this.showDeleteModal = true;
  }

  cancelDelete() {
    this.bartenderToDelete = null;
    this.showDeleteModal = false;
  }

  confirmDeleteAction() {
    if (!this.bartenderToDelete) return;
    this.bartenderService.deleteBartender(this.bartenderToDelete._id!).subscribe({
      next: () => {
        this.bartenders = this.bartenders.filter(b => b._id !== this.bartenderToDelete!._id);
        this.toastService.show('Bartender deleted successfully.', 'success');
        this.cancelDelete();
      },
      error: (err) => {
        this.toastService.show('Error deleting bartender.', 'error');
        console.error(err);
      }
    });
  }

  getFullName(bartender: Bartender): string {
    return `${bartender.name} ${bartender.lastName}`;
  }

  getStatusClass(status: string): string {
    if (status === 'AVAILABLE') return 'available';
    if (status === 'BUSY') return 'busy';
    return 'inactive';
  }

  openReset(event: Event, bartender: Bartender): void {
    event.stopPropagation();
    this.bartenderToReset = bartender;
    this.resetPassword    = '';
    this.resetConfirm     = '';
    this.resetError       = '';
    this.showResetModal   = true;
  }

  cancelReset(): void {
    this.showResetModal   = false;
    this.bartenderToReset = null;
  }

  confirmReset(): void {
    if (!this.resetPassword) { this.resetError = 'Ingresa la nueva contraseña.'; return; }
    if (this.resetPassword.length < 8) { this.resetError = 'Mínimo 8 caracteres.'; return; }
    if (this.resetPassword !== this.resetConfirm) { this.resetError = 'Las contraseñas no coinciden.'; return; }

    this.resetSaving = true;
    this.bartenderService.resetPassword(this.bartenderToReset!._id!, this.resetPassword).subscribe({
      next: () => {
        this.resetSaving = false;
        this.cancelReset();
        this.toastService.show('Contraseña actualizada correctamente.', 'success');
      },
      error: (e: any) => {
        this.resetSaving = false;
        this.resetError = e?.error?.message || 'Error al actualizar la contraseña.';
      },
    });
  }
}