import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Admin {
  _id: string;
  name: string;
  lastName: string;
  email: string;
  isVerified: boolean;
  status: boolean;
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class AdminsService {
  private http = inject(HttpClient);
  private api  = `${environment.apiUrl}/admins`;

  getAll(): Observable<Admin[]> {
    return this.http.get<Admin[]>(this.api);
  }

  create(data: { name: string; lastName: string; email: string; password: string }): Observable<any> {
    return this.http.post(this.api, data);
  }

  update(id: string, data: { name: string; lastName: string; email: string }): Observable<any> {
    return this.http.put(`${this.api}/${id}`, data);
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.api}/${id}`);
  }

  resetPassword(id: string, password: string): Observable<any> {
    return this.http.post(`${this.api}/${id}/reset-password`, { password });
  }
}
