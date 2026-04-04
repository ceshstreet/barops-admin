import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { QuoteRequest } from '../models/request.model';

export interface InboxResponse {
  ok: boolean;
  total: number;
  data: QuoteRequest[];
}

export interface InboxDetailResponse {
  ok: boolean;
  data: QuoteRequest;
}

@Injectable({
  providedIn: 'root'
})
export class RequestsService {
  private http = inject(HttpClient);

    private apiUrl = 'http://localhost:4000/api/requests';

  getInbox(): Observable<InboxResponse> {
    return this.http.get<InboxResponse>(this.apiUrl);
  }

  getInboxById(id: number): Observable<InboxDetailResponse> {
    return this.http.get<InboxDetailResponse>(`${this.apiUrl}/${id}`);
  }
}