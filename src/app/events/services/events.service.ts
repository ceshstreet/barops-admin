import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaropsEvent } from '../models/event.model';

@Injectable({ providedIn: 'root' })
export class EventsService {
  private apiUrl = 'http://localhost:4000/api/events';

  constructor(private http: HttpClient) {}

  // GET /api/events → returns plain array
  getAll(): Observable<BaropsEvent[]> {
    return this.http.get<BaropsEvent[]>(this.apiUrl);
  }

  // GET /api/events/:id → returns plain object
  getById(id: string): Observable<BaropsEvent> {
    return this.http.get<BaropsEvent>(`${this.apiUrl}/${id}`);
  }

  // PUT /api/events/:id → returns { message, event: {...} }
  update(id: string, data: any): Observable<BaropsEvent> {
    return this.http
      .put<{ message: string; event: BaropsEvent }>(`${this.apiUrl}/${id}`, data)
      .pipe(map(r => r.event || (r as any)));
  }

  markAsCompleted(id: string): Observable<BaropsEvent> {
    return this.update(id, { status: 'FINALIZADO' });
  }
}
