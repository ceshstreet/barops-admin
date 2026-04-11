import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Event {
  _id?: string;
  eventCode?: string;
  status?: string;
  title: string;
  clientId?: string;
  clientName?: string;
  email?: string;
  phone?: string;
  eventType?: string;
  eventDate: string;
  location: string;
  guests?: string;
  notes?: string;
  bartenderId?: string;
  quoteId?: string;
  quotedTotal?: number;
  packageName?: string;
}

@Injectable({ providedIn: 'root' })
export class EventService {
  private apiUrl = 'http://localhost:4000/api/events';

  constructor(private http: HttpClient) {}

  getEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(this.apiUrl);
  }

  getEventById(id: string): Observable<Event> {
    return this.http.get<Event>(`${this.apiUrl}/${id}`);
  }

  insertEvent(event: Event): Observable<any> {
    return this.http.post(this.apiUrl, event);
  }

  updateEvent(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deleteEvent(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}