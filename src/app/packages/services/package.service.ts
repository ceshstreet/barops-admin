import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Package } from '../models/package.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PackageService {
  private url = `${environment.apiUrl}/packages`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Package[]> {
    return this.http.get<Package[]>(this.url);
  }

  getById(id: string): Observable<Package> {
    return this.http.get<Package>(`${this.url}/${id}`);
  }

  create(pkg: any): Observable<{ message: string; package: Package }> {
    return this.http.post<{ message: string; package: Package }>(this.url, pkg);
  }

  update(id: string, pkg: any): Observable<{ message: string; package: Package }> {
    return this.http.put<{ message: string; package: Package }>(`${this.url}/${id}`, pkg);
  }

  delete(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.url}/${id}`);
  }
}