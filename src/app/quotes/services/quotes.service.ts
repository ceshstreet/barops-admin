import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Quote } from '../models/quote.model';
import { environment } from '../../environments/environment';

export interface QuoteResponse {
  ok: boolean;
  message?: string;
  data: Quote;
}

export interface QuotesListResponse {
  ok: boolean;
  total: number;
  data: Quote[];
}

@Injectable({ providedIn: 'root' })
export class QuotesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/quotes`;

  getQuotes(): Observable<QuotesListResponse> {
    return this.http.get<QuotesListResponse>(this.apiUrl);
  }

  getQuoteById(id: string): Observable<QuoteResponse> {
    return this.http.get<QuoteResponse>(`${this.apiUrl}/${id}`);
  }

  createQuote(payload: Partial<Quote>): Observable<QuoteResponse> {
    return this.http.post<QuoteResponse>(this.apiUrl, payload);
  }

  updateQuote(id: string, payload: Partial<Quote>): Observable<QuoteResponse> {
    return this.http.put<QuoteResponse>(`${this.apiUrl}/${id}`, payload);
  }

  updateStatus(id: string, status: Quote['status']): Observable<QuoteResponse> {
    return this.http.patch<QuoteResponse>(`${this.apiUrl}/${id}/status`, { status });
  }

  sendQuote(id: string): Observable<{ ok: boolean; message: string; data: Quote }> {
    return this.http.post<{ ok: boolean; message: string; data: Quote }>(`${this.apiUrl}/${id}/send`, {});
  }

  deleteQuote(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}
