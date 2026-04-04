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

export interface MarkAsReadResponse {
  ok: boolean;
  message: string;
  data: QuoteRequest;
}

export interface ConvertClientResponse {
  ok: boolean;
  message: string;
  alreadyExists: boolean;
  client: any;
  request: QuoteRequest;
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

  markAsRead(id: number): Observable<MarkAsReadResponse> {
    return this.http.patch<MarkAsReadResponse>(`${this.apiUrl}/${id}/read`, {});
  }

  convertToClient(id: number): Observable<ConvertClientResponse> {
    return this.http.post<ConvertClientResponse>(`${this.apiUrl}/${id}/convert-client`, {});
  }
}