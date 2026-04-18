import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AuthUser {
  id: string;
  name: string;
  lastName: string;
  email: string;
  role: 'admin' | 'bartender';
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http   = inject(HttpClient);
  private router = inject(Router);

  private readonly api = `${environment.apiUrl}/auth`;

  // ── State ──────────────────────────────────────────────────────────────────
  private _user = signal<AuthUser | null>(null);

  readonly user      = this._user.asReadonly();
  readonly isAdmin   = computed(() => this._user()?.role === 'admin');
  readonly isBartender = computed(() => this._user()?.role === 'bartender');
  readonly isLoggedIn  = computed(() => !!this._user());

  // ── Actions ────────────────────────────────────────────────────────────────

  loginAdmin(email: string, password: string): Observable<any> {
    return this.http.post<{ user: AuthUser }>(`${this.api}/login-admin`, { email, password },
      { withCredentials: true }
    ).pipe(
      tap(res => this._user.set(res.user))
    );
  }

  loginBartender(email: string, password: string): Observable<any> {
    return this.http.post<{ user: AuthUser }>(`${this.api}/login-employee`, { email, password },
      { withCredentials: true }
    ).pipe(
      tap(res => this._user.set(res.user))
    );
  }

  logout(): void {
    const clear = () => { this._user.set(null); this.router.navigate(['/login']); };
    this.http.post(`${this.api}/logout`, {}, { withCredentials: true }).subscribe({
      next:  () => clear(),
      error: () => clear(),   // fuerza logout aunque el server falle
    });
  }

  /** Restaura sesión desde la cookie al recargar la página */
  restoreSession(): Observable<AuthUser | null> {
    return this.http.get<AuthUser>(`${this.api}/me`, { withCredentials: true }).pipe(
      tap(user => this._user.set(user)),
      catchError(() => {
        this._user.set(null);
        return of(null);
      })
    );
  }

  setUser(user: AuthUser): void {
    this._user.set(user);
  }
}
