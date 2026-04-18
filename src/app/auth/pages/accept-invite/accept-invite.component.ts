import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

type Step = 'form' | 'success';

@Component({
  selector: 'app-accept-invite',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './accept-invite.component.html',
  styleUrl: './accept-invite.component.scss',
})
export class AcceptInviteComponent {
  private router = inject(Router);
  private http   = inject(HttpClient);

  email    = '';
  code     = '';
  password = '';
  confirm  = '';

  loading  = false;
  step: Step = 'form';
  errorMsg = '';

  showPass    = false;
  showConfirm = false;

  get passwordsMatch(): boolean { return this.password === this.confirm; }
  get passwordValid(): boolean  { return this.password.length >= 12; }
  get codeValid(): boolean      { return /^\d{6}$/.test(this.code.trim()); }

  get canSubmit(): boolean {
    return !!this.email && this.codeValid && this.passwordValid && this.passwordsMatch && !this.loading;
  }

  submit(): void {
    if (!this.canSubmit) return;
    this.loading  = true;
    this.errorMsg = '';

    this.http.post<{ message: string }>(
      `${environment.apiUrl}/auth/accept-invite`,
      { email: this.email.trim(), code: this.code.trim(), password: this.password }
    ).subscribe({
      next: () => {
        this.loading = false;
        this.step    = 'success';
      },
      error: (err) => {
        this.loading  = false;
        this.errorMsg = err?.error?.message || 'Error al activar la cuenta. Inténtalo de nuevo.';
      },
    });
  }

  goToLogin(): void { this.router.navigate(['/']); }
}
