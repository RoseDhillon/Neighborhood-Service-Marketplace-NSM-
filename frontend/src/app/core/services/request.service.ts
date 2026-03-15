import { Injectable } from "@angular/core"
import { HttpClient, HttpParams } from "@angular/common/http"
import { Observable } from "rxjs"
import { environment } from "../../../environments/environment"
import { ServiceRequestDto } from "../../shared/models/models"

@Injectable({ providedIn: "root" })
export class RequestService {
  private readonly baseUrl = `${environment.apiUrl}/requests`

  constructor(private http: HttpClient) {}

  getRequests(filters?: {
    status?: string
    categoryId?: string
    q?: string
  }): Observable<{ requests: ServiceRequestDto[] }> {
    let params = new HttpParams()
    if (filters?.status) params = params.set("status", filters.status)
    if (filters?.categoryId)
      params = params.set("categoryId", filters.categoryId)
    if (filters?.q) params = params.set("q", filters.q)
    return this.http.get<{ requests: ServiceRequestDto[] }>(this.baseUrl, {
      params,
    })
  }

  getRequestById(id: string): Observable<{ request: ServiceRequestDto }> {
    return this.http.get<{ request: ServiceRequestDto }>(
      `${this.baseUrl}/${id}`,
    )
  }

  createRequest(data: {
    title: string
    description: string
    category: string
    location: string
  }): Observable<any> {
    return this.http.post(this.baseUrl, data)
  }

  updateStatus(id: string, status: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${id}/status`, { status })
  }
}
