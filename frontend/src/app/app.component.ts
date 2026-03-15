import { Component } from "@angular/core"
import { Router, RouterOutlet, RouterLink } from "@angular/router"
import { CommonModule } from "@angular/common"
import { AuthService } from "./core/services/auth.service"

@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule],
  template: `
    <nav class="navbar">
      <a routerLink="/requests" class="brand">NSM</a>
      <div class="nav-links">
        <ng-container *ngIf="auth.isLoggedIn; else guestLinks">
          <a routerLink="/requests">Requests</a>
          <a *ngIf="auth.isResident" routerLink="/requests/new">New Request</a>
          <a *ngIf="auth.isProvider" routerLink="/my-quotes">My Quotes</a>
          <span class="user-info"
            >{{ auth.currentUser?.name }} ({{ auth.currentUser?.role }})</span
          >
          <button (click)="logout()" class="btn-logout">Logout</button>
        </ng-container>
        <ng-template #guestLinks>
          <a routerLink="/login">Login</a>
          <a routerLink="/register">Register</a>
        </ng-template>
      </div>
    </nav>
    <main class="container">
      <router-outlet />
    </main>
  `,
  styles: [
    `
      .navbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem 2rem;
        background: #1a1a2e;
        color: white;
      }
      .brand {
        color: #e94560;
        font-weight: 700;
        font-size: 1.25rem;
        text-decoration: none;
      }
      .nav-links {
        display: flex;
        gap: 1rem;
        align-items: center;
      }
      .nav-links a {
        color: white;
        text-decoration: none;
      }
      .nav-links a:hover {
        color: #e94560;
      }
      .user-info {
        color: #aaa;
        font-size: 0.85rem;
      }
      .btn-logout {
        background: #e94560;
        color: white;
        border: none;
        padding: 0.4rem 0.9rem;
        border-radius: 4px;
        cursor: pointer;
      }
      .container {
        max-width: 1100px;
        margin: 2rem auto;
        padding: 0 1rem;
      }
    `,
  ],
})
export class AppComponent {
  constructor(
    public auth: AuthService,
    private router: Router,
  ) {}

  logout(): void {
    this.auth.logout().subscribe(() => this.router.navigate(["/login"]))
  }
}
