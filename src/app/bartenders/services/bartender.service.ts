import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Bartender {
  _id?: string;
  name: string;
  lastName: string;
  email: string;
  phone: string;
  password?: string;
  status?: string;
  bartenderData?: {
    specialty: string;
    availabilitySchedule: string;
    experienceLevel: string;
    notes: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class BartenderService {
  private apiUrl = 'http://localhost:4000/api/bartenders';

  constructor(private http: HttpClient) {}

  getBartenders(): Observable<Bartender[]> {
    return this.http.get<Bartender[]>(this.apiUrl);
  }

  getBartenderById(id: string): Observable<Bartender> {
    return this.http.get<Bartender>(`${this.apiUrl}/${id}`);
  }

  insertBartender(bartender: Bartender): Observable<Bartender> {
    return this.http.post<Bartender>(this.apiUrl, bartender);
  }

  updateBartender(id: string, bartender: Bartender): Observable<Bartender> {
    return this.http.put<Bartender>(`${this.apiUrl}/${id}`, bartender);
  }

  deleteBartender(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  /** Returns bartenders that are free on the given date (ISO string).
   *  excludeEventId: the current event being edited — excluded from conflict check. */
  getAvailableByDate(date: string, excludeEventId?: string): Observable<Bartender[]> {
    let params = `date=${encodeURIComponent(date)}`;
    if (excludeEventId) params += `&excludeEventId=${excludeEventId}`;
    return this.http.get<Bartender[]>(`${this.apiUrl}/available?${params}`);
  }
}