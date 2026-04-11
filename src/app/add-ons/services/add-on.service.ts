import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AddOn, AddOnListResponse } from '../models/add-on.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AddOnService {
  private url = `${environment.apiUrl}/add-ons`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<AddOnListResponse> {
    return this.http.get<AddOnListResponse>(this.url);
  }

  getById(id: string): Observable<AddOn> {
    return this.http.get<AddOn>(`${this.url}/${id}`);
  }

  create(addOn: Partial<AddOn>): Observable<{ message: string; addOn: AddOn }> {
    return this.http.post<{ message: string; addOn: AddOn }>(this.url, addOn);
  }

  update(id: string, addOn: Partial<AddOn>): Observable<{ message: string; addOn: AddOn }> {
    return this.http.put<{ message: string; addOn: AddOn }>(`${this.url}/${id}`, addOn);
  }

  delete(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.url}/${id}`);
  }
}
