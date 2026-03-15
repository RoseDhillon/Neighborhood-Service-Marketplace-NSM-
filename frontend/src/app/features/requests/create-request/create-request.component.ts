import { Component, OnInit, inject } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms"
import { Router, RouterLink } from "@angular/router"
import { RequestService } from "../../../core/services/request.service"
import { CategoryService } from "../../../core/services/category.service"
import { CategoryDto } from "../../../shared/models/models"

@Component({
  selector: "app-create-request",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>New Service Request</h2>
        <a routerLink="/requests" class="btn-secondary">← Back</a>
      </div>
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form-card">
        <div class="field">
          <label>Title *</label>
          <input
            formControlName="title"
            type="text"
            placeholder="Brief title for the service"
          />
          <span
            class="error"
            *ngIf="
              form.get('title')?.touched &&
              form.get('title')?.errors?.['required']
            "
            >Title is required</span
          >
          <span
            class="error"
            *ngIf="
              form.get('title')?.touched &&
              form.get('title')?.errors?.['minlength']
            "
            >Min 3 characters</span
          >
        </div>
        <div class="field">
          <label>Description *</label>
          <textarea
            formControlName="description"
            rows="4"
            placeholder="Describe the service you need..."
          ></textarea>
          <span
            class="error"
            *ngIf="
              form.get('description')?.touched &&
              form.get('description')?.errors?.['required']
            "
            >Description is required</span
          >
          <span
            class="error"
            *ngIf="
              form.get('description')?.touched &&
              form.get('description')?.errors?.['minlength']
            "
            >Min 10 characters</span
          >
        </div>
        <div class="field">
          <label>Category *</label>
          <select formControlName="category">
            <option value="">Select a category</option>
            <option *ngFor="let c of categories" [value]="c._id">
              {{ c.name }}
            </option>
          </select>
          <span
            class="error"
            *ngIf="
              form.get('category')?.touched &&
              form.get('category')?.errors?.['required']
            "
            >Category is required</span
          >
        </div>
        <div class="field">
          <label>Location *</label>
          <input
            formControlName="location"
            type="text"
            placeholder="e.g. 123 Main St, Toronto"
          />
          <span
            class="error"
            *ngIf="
              form.get('location')?.touched &&
              form.get('location')?.errors?.['required']
            "
            >Location is required</span
          >
        </div>
        <div class="server-error" *ngIf="serverError">{{ serverError }}</div>
        <button type="submit" [disabled]="loading" class="btn-primary">
          {{ loading ? "Submitting..." : "Create Request" }}
        </button>
      </form>
    </div>
  `,
  styles: [
    `
      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
      }
      .form-card {
        max-width: 600px;
      }
      .field {
        margin-bottom: 1.2rem;
        display: flex;
        flex-direction: column;
        gap: 0.3rem;
      }
      label {
        font-weight: 600;
        font-size: 0.9rem;
      }
      input,
      select,
      textarea {
        padding: 0.5rem;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 1rem;
        font-family: inherit;
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
        background: #1a1a2e;
        color: white;
        padding: 0.7rem 1.5rem;
        border-radius: 4px;
        border: none;
        cursor: pointer;
        font-size: 1rem;
      }
      .btn-primary:disabled {
        opacity: 0.6;
      }
      .btn-secondary {
        background: #eee;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        text-decoration: none;
        color: inherit;
      }
    `,
  ],
})
export class CreateRequestComponent implements OnInit {
  private fb = inject(FormBuilder)
  private requestService = inject(RequestService)
  private categoryService = inject(CategoryService)
  private router = inject(Router)

  form = this.fb.group({
    title: ["", [Validators.required, Validators.minLength(3)]],
    description: ["", [Validators.required, Validators.minLength(10)]],
    category: ["", Validators.required],
    location: ["", Validators.required],
  })

  categories: CategoryDto[] = []
  loading = false
  serverError = ""

  ngOnInit(): void {
    this.categoryService.getCategories().subscribe({
      next: (res) => (this.categories = res.categories),
    })
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched()
      return
    }
    this.loading = true
    this.serverError = ""
    this.requestService.createRequest(this.form.value as any).subscribe({
      next: () => this.router.navigate(["/requests"]),
      error: (err) => {
        this.serverError = err.error?.message || "Failed to create request"
        this.loading = false
      },
    })
  }
}
