import { Injectable } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { Observable } from "rxjs"
import { environment } from "../../../environments/environment"
import { CategoryDto } from "../../shared/models/models"

@Injectable({ providedIn: "root" })
export class CategoryService {
  private readonly baseUrl = `${environment.apiUrl}/categories`

  constructor(private http: HttpClient) {}

  getCategories(): Observable<{ categories: CategoryDto[] }> {
    return this.http.get<{ categories: CategoryDto[] }>(this.baseUrl)
  }

  createCategory(data: {
    name: string
    description?: string
  }): Observable<any> {
    return this.http.post(this.baseUrl, data)
  }
}
