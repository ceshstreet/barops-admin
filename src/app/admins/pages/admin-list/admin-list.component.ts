import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminsService, Admin } from '../../services/admins.service';

type Modal = 'create' | 'edit' | 'reset' | 'delete' | null;

@Component({
  selector: 'app-admin-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-list.component.html',
  styleUrl: './admin-list.component.scss',
})
export class AdminListComponent implements OnInit {
  private svc = inject(AdminsService);

  admins:  Admin[] = [];
  loading  = true;
  saving   = false;
  errorMsg = '';
  successMsg = '';

  modal: Modal = null;
  selected: Admin | null = null;

  // Formulario crear/editar
  form = { name: '', lastName: '', email: '', password: '', confirm: '' };
  showPass = false;

  // Formulario reset
  resetPass = '';
  resetConfirm = '';
  showResetPass = false;

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.svc.getAll().subscribe({
      next:  a  => { this.admins = a; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  openCreate(): void {
    this.form = { name: '', lastName: '', email: '', password: '', confirm: '' };
    this.errorMsg = '';
    this.modal = 'create';
  }

  openEdit(a: Admin): void {
    this.selected = a;
    this.form = { name: a.name, lastName: a.lastName, email: a.email, password: '', confirm: '' };
    this.errorMsg = '';
    this.modal = 'edit';
  }

  openReset(a: Admin): void {
    this.selected = a;
    this.resetPass = '';
    this.resetConfirm = '';
    this.errorMsg = '';
    this.modal = 'reset';
  }

  openDelete(a: Admin): void {
    this.selected = a;
    this.modal = 'delete';
  }

  close(): void { this.modal = null; this.errorMsg = ''; }

  submitCreate(): void {
    if (!this.form.name || !this.form.lastName || !this.form.email || !this.form.password) {
      this.errorMsg = 'Todos los campos son obligatorios.'; return;
    }
    if (this.form.password !== this.form.confirm) {
      this.errorMsg = 'Las contraseñas no coinciden.'; return;
    }
    if (this.form.password.length < 8) {
      this.errorMsg = 'Mínimo 8 caracteres.'; return;
    }
    this.saving = true; this.errorMsg = '';
    this.svc.create({ name: this.form.name, lastName: this.form.lastName, email: this.form.email, password: this.form.password }).subscribe({
      next: () => { this.saving = false; this.close(); this.load(); this.flash('Admin creado correctamente.'); },
      error: (e: any) => { this.saving = false; this.errorMsg = e?.error?.message || 'Error al crear.'; },
    });
  }

  submitEdit(): void {
    if (!this.form.name || !this.form.lastName || !this.form.email) {
      this.errorMsg = 'Nombre, apellido y correo son obligatorios.'; return;
    }
    this.saving = true; this.errorMsg = '';
    this.svc.update(this.selected!._id, { name: this.form.name, lastName: this.form.lastName, email: this.form.email }).subscribe({
      next: () => { this.saving = false; this.close(); this.load(); this.flash('Admin actualizado.'); },
      error: (e: any) => { this.saving = false; this.errorMsg = e?.error?.message || 'Error al actualizar.'; },
    });
  }

  submitReset(): void {
    if (!this.resetPass) { this.errorMsg = 'Ingresa la nueva contraseña.'; return; }
    if (this.resetPass !== this.resetConfirm) { this.errorMsg = 'Las contraseñas no coinciden.'; return; }
    if (this.resetPass.length < 8) { this.errorMsg = 'Mínimo 8 caracteres.'; return; }
    this.saving = true; this.errorMsg = '';
    this.svc.resetPassword(this.selected!._id, this.resetPass).subscribe({
      next: () => { this.saving = false; this.close(); this.flash('Contraseña actualizada.'); },
      error: (e: any) => { this.saving = false; this.errorMsg = e?.error?.message || 'Error al resetear.'; },
    });
  }

  confirmDelete(): void {
    this.saving = true;
    this.svc.delete(this.selected!._id).subscribe({
      next: () => { this.saving = false; this.close(); this.load(); this.flash('Admin eliminado.'); },
      error: () => { this.saving = false; this.close(); },
    });
  }

  private flash(msg: string): void {
    this.successMsg = msg;
    setTimeout(() => this.successMsg = '', 3500);
  }

  initials(a: Admin): string {
    return ((a.name?.[0] ?? '') + (a.lastName?.[0] ?? '')).toUpperCase();
  }
}
