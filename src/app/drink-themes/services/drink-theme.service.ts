import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DrinkTheme } from '../models/drink-theme.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DrinkThemeService {
  private url = `${environment.apiUrl}/drinkThemes`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<DrinkTheme[]> {
    return this.http.get<DrinkTheme[]>(this.url);
  }

  getById(id: string): Observable<DrinkTheme> {
    return this.http.get<DrinkTheme>(`${this.url}/${id}`);
  }

  create(theme: any): Observable<{ message: string; theme: DrinkTheme }> {
    return this.http.post<{ message: string; theme: DrinkTheme }>(this.url, theme);
  }

  update(id: string, theme: any): Observable<{ message: string; theme: DrinkTheme }> {
    return this.http.put<{ message: string; theme: DrinkTheme }>(`${this.url}/${id}`, theme);
  }

  delete(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.url}/${id}`);
  }
}