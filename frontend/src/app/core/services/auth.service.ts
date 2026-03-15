import { Injectable } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { BehaviorSubject, Observable, tap } from "rxjs"
import { environment } from "../../../environments/environment"
import { UserDto } from "../../shared/models/models"

@Injectable({ providedIn: "root" })
export class AuthService {
  private readonly baseUrl = `${environment.apiUrl}/auth`
  private currentUserSubject = new BehaviorSubject<UserDto | null>(
    this.loadUserFromStorage(),
  )

  currentUser$ = this.currentUserSubject.asObservable()

  constructor(private http: HttpClient) {}

  private loadUserFromStorage(): UserDto | null {
    try {
      const stored = localStorage.getItem("nsm_user")
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  }

  get currentUser(): UserDto | null {
    return this.currentUserSubject.value
  }

  get isLoggedIn(): boolean {
    return !!this.currentUserSubject.value
  }

  get isResident(): boolean {
    return this.currentUser?.role === "resident"
  }

  get isProvider(): boolean {
    return this.currentUser?.role === "provider"
  }

  register(data: {
    name: string
    email: string
    password: string
    role: string
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, data)
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http
      .post<{ user: UserDto }>(`${this.baseUrl}/login`, credentials)
      .pipe(
        tap((res) => {
          this.currentUserSubject.next(res.user)
          localStorage.setItem("nsm_user", JSON.stringify(res.user))
        }),
      )
  }

  logout(): Observable<any> {
    return this.http.post(`${this.baseUrl}/logout`, {}).pipe(
      tap(() => {
        this.currentUserSubject.next(null)
        localStorage.removeItem("nsm_user")
      }),
    )
  }

  me(): Observable<any> {
    return this.http.get<{ user: UserDto }>(`${this.baseUrl}/me`).pipe(
      tap((res) => {
        this.currentUserSubject.next(res.user)
        localStorage.setItem("nsm_user", JSON.stringify(res.user))
      }),
    )
  }
}
