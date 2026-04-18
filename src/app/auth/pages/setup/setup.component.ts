import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-setup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './setup.component.html',
  styleUrl: './setup.component.scss',
})
export class SetupComponent {
  private http   = inject(HttpClient);
  private router = inject(Router);

  name     = '';
  lastName = '';
  email    = '';
  password = '';
  showPass = false;
  loading  = false;
  errorMsg = '';
  success  = false;

  submit(): void {
    if (!this.name || !this.lastName || !this.email || !this.password || this.loading) return;
    this.loading  = true;
    this.errorMsg = '';

    this.http.post(`${environment.apiUrl}/auth/setup`, {
      name:     this.name.trim(),
      lastName: this.lastName.trim(),
      email:    this.email.trim(),
      password: this.password,
    }).subscribe({
      next: () => {
        this.loading = false;
        this.success = true;
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err: any) => {
        this.loading  = false;
        this.errorMsg = err?.error?.message || 'Error al crear el administrador.';
      },
    });
  }
}
