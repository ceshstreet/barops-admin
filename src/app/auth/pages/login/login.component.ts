import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private auth   = inject(AuthService);
  private router = inject(Router);

  tab: 'admin' | 'bartender' = 'admin';

  email    = '';
  password = '';
  showPass = false;
  loading  = false;
  errorMsg = '';

  switchTab(t: 'admin' | 'bartender'): void {
    this.tab      = t;
    this.errorMsg = '';
  }

  submit(): void {
    if (!this.email || !this.password || this.loading) return;
    this.loading  = true;
    this.errorMsg = '';

    const login$ = this.tab === 'admin'
      ? this.auth.loginAdmin(this.email, this.password)
      : this.auth.loginBartender(this.email, this.password);

    login$.subscribe({
      next: () => {
        this.loading = false;
        const dest = this.tab === 'admin' ? '/dashboard' : '/bartender/dashboard';
        this.router.navigate([dest]);
      },
      error: (err: any) => {
        this.loading  = false;
        this.errorMsg = err?.error?.message || 'Credenciales incorrectas.';
      },
    });
  }
}
