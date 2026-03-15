import { Injectable } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { Observable } from "rxjs"
import { environment } from "../../../environments/environment"
import { QuoteDto } from "../../shared/models/models"

@Injectable({ providedIn: "root" })
export class QuoteService {
  private readonly baseUrl = `${environment.apiUrl}/quotes`

  constructor(private http: HttpClient) {}

  getQuotesByRequest(requestId: string): Observable<{ quotes: QuoteDto[] }> {
    return this.http.get<{ quotes: QuoteDto[] }>(this.baseUrl, {
      params: { requestId },
    })
  }

  submitQuote(data: {
    requestId: string
    price: number
    daysToComplete: number
    message?: string
  }): Observable<any> {
    return this.http.post(this.baseUrl, data)
  }

  getMyQuotes(): Observable<{ quotes: QuoteDto[] }> {
    return this.http.get<{ quotes: QuoteDto[] }>(`${this.baseUrl}/my`)
  }

  acceptQuote(quoteId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/${quoteId}/accept`, {})
  }
}
