import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface BarType {
  _id?: string;
  name: string;
  category: string;
  lighting: boolean;
  capacity: number;
  setupType: string;
  status: boolean;
}

@Injectable({ providedIn: 'root' })
export class BarTypeService {
  private apiUrl = `${environment.apiUrl}/barTypes`;

  constructor(private http: HttpClient) {}

  getBarTypes(): Observable<BarType[]> {
    return this.http.get<BarType[]>(this.apiUrl);
  }

  getBarTypeById(id: string): Observable<BarType> {
    return this.http.get<BarType>(`${this.apiUrl}/${id}`);
  }

  insertBarType(barType: BarType): Observable<any> {
    return this.http.post(this.apiUrl, barType);
  }

  updateBarType(id: string, barType: BarType): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, barType);
  }

  deleteBarType(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}