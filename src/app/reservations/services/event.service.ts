import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Event {
  _id?: string;
  eventCode?: string;
  status?: string;
  title?: string;
  clientId?: any;
  clientName?: string;
  email?: string;
  phone?: string;
  eventType?: string;
  eventDate?: string;
  location?: string;
  guests?: string;
  notes?: string;
  assignedBartenders?: any[];
  quoteId?: string;
  quotedTotal?: number;
  packageName?: string;
  eventInfo?: {
    title?: string;
    type?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
    location?: string;
  };
  financials?: {
    budgetRange?: string;
    paidType?: string;
    paidStatus?: string;
  };
}

@Injectable({ providedIn: 'root' })
export class EventService {
  private apiUrl = 'http://localhost:4000/api/events';

  constructor(private http: HttpClient) {}

  // GET /api/events → returns plain array
  getEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(this.apiUrl);
  }

  // GET /api/events/:id → returns plain object
  getEventById(id: string): Observable<Event> {
    return this.http.get<Event>(`${this.apiUrl}/${id}`);
  }

  insertEvent(event: Event): Observable<any> {
    return this.http.post(this.apiUrl, event);
  }

  // PUT /api/events/:id → returns { message, event: {...} }
  updateEvent(id: string, data: any): Observable<Event> {
    return this.http
      .put<{ message: string; event: Event }>(`${this.apiUrl}/${id}`, data)
      .pipe(map(r => r.event || (r as any)));
  }

  deleteEvent(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
