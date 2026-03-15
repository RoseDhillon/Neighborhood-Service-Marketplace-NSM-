import { Component, inject } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms"
import { Router, RouterLink } from "@angular/router"
import { AuthService } from "../../../core/services/auth.service"

@Component({
  selector: "app-login",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-card">
      <h2>Sign In</h2>
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="field">
          <label>Email</label>
          <input
            formControlName="email"
            type="email"
            placeholder="you@example.com"
          />
          <span
            class="error"
            *ngIf="
              form.get('email')?.touched &&
              form.get('email')?.errors?.['required']
            "
            >Email is required</span
          >
          <span
            class="error"
            *ngIf="
              form.get('email')?.touched && form.get('email')?.errors?.['email']
            "
            >Enter a valid email</span
          >
        </div>
        <div class="field">
          <label>Password</label>
          <input
            formControlName="password"
            type="password"
            placeholder="Password"
          />
          <span
            class="error"
            *ngIf="
              form.get('password')?.touched &&
              form.get('password')?.errors?.['required']
            "
            >Password is required</span
          >
        </div>
        <div class="server-error" *ngIf="serverError">{{ serverError }}</div>
        <button type="submit" [disabled]="loading" class="btn-primary">
          {{ loading ? "Signing in..." : "Login" }}
        </button>
      </form>
      <p class="alt-link">No account? <a routerLink="/register">Register</a></p>
    </div>
  `,
  styles: [
    `
      .auth-card {
        max-width: 420px;
        margin: 3rem auto;
        padding: 2rem;
        border: 1px solid #ddd;
        border-radius: 8px;
      }
      h2 {
        margin-bottom: 1.5rem;
      }
      .field {
        margin-bottom: 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.3rem;
      }
      label {
        font-weight: 600;
        font-size: 0.9rem;
      }
      input {
        padding: 0.5rem;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 1rem;
      }
      .error {
        color: #e94560;
        font-size: 0.8rem;
      }
      .server-error {
        color: #e94560;
        margin-bottom: 1rem;
      }
      .btn-primary {
        width: 100%;
        padding: 0.7rem;
        background: #1a1a2e;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 1rem;
      }
      .btn-primary:disabled {
        opacity: 0.6;
      }
      .alt-link {
        margin-top: 1rem;
        text-align: center;
      }
    `,
  ],
})
export class LoginComponent {
  private fb = inject(FormBuilder)
  private auth = inject(AuthService)
  private router = inject(Router)

  form = this.fb.group({
    email: ["", [Validators.required, Validators.email]],
    password: ["", Validators.required],
  })

  loading = false
  serverError = ""

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched()
      return
    }
    this.loading = true
    this.serverError = ""
    this.auth.login(this.form.value as any).subscribe({
      next: () => this.router.navigate(["/requests"]),
      error: (err) => {
        this.serverError = err.error?.message || "Login failed"
        this.loading = false
      },
    })
  }
}
