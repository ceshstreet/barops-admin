import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Drink } from '../models/drink.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DrinkService {
  private url = `${environment.apiUrl}/drinks`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Drink[]> {
    return this.http.get<Drink[]>(this.url);
  }

  getById(id: string): Observable<Drink> {
    return this.http.get<Drink>(`${this.url}/${id}`);
  }

  create(drink: any): Observable<{ message: string; data: Drink }> {
    return this.http.post<{ message: string; data: Drink }>(this.url, drink);
  }

  update(id: string, drink: any): Observable<{ message: string; data: Drink }> {
    return this.http.put<{ message: string; data: Drink }>(`${this.url}/${id}`, drink);
  }

  delete(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.url}/${id}`);
  }
}