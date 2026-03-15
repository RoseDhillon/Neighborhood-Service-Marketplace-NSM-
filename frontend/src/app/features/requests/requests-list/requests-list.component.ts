import { Component, OnInit, inject } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ReactiveFormsModule, FormBuilder } from "@angular/forms"
import { RouterLink } from "@angular/router"
import { debounceTime, distinctUntilChanged } from "rxjs"
import { RequestService } from "../../../core/services/request.service"
import { CategoryService } from "../../../core/services/category.service"
import { AuthService } from "../../../core/services/auth.service"
import { ServiceRequestDto, CategoryDto } from "../../../shared/models/models"

@Component({
  selector: "app-requests-list",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="page-header">
      <h2>Service Requests</h2>
      <a *ngIf="auth.isResident" routerLink="/requests/new" class="btn-primary"
        >+ New Request</a
      >
    </div>

    <div class="filters" [formGroup]="filterForm">
      <input
        formControlName="q"
        type="text"
        placeholder="Search by keyword..."
        class="filter-input"
      />
      <select formControlName="status" class="filter-select">
        <option value="">All Statuses</option>
        <option value="open">Open</option>
        <option value="quoted">Quoted</option>
        <option value="assigned">Assigned</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
      </select>
      <select formControlName="categoryId" class="filter-select">
        <option value="">All Categories</option>
        <option *ngFor="let c of categories" [value]="c._id">
          {{ c.name }}
        </option>
      </select>
      <button (click)="resetFilters()" class="btn-secondary">Reset</button>
    </div>

    <div *ngIf="loading" class="loading">Loading requests...</div>
    <div *ngIf="error" class="error-msg">{{ error }}</div>
    <div *ngIf="!loading && requests.length === 0" class="empty">
      No requests found.
    </div>

    <div class="request-grid" *ngIf="!loading && requests.length > 0">
      <a
        *ngFor="let r of requests"
        [routerLink]="['/requests', r._id]"
        class="request-card"
      >
        <div class="card-header">
          <span class="title">{{ r.title }}</span>
          <span class="badge badge-{{ r.status }}">{{ r.status }}</span>
        </div>
        <p class="desc">
          {{ r.description | slice: 0 : 100
          }}{{ r.description.length > 100 ? "..." : "" }}
        </p>
        <div class="card-meta">
          <span>📂 {{ r.category?.name }}</span>
          <span>📍 {{ r.location }}</span>
          <span>👤 {{ r.resident?.name }}</span>
        </div>
      </a>
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
      .filters {
        display: flex;
        gap: 0.75rem;
        margin-bottom: 1.5rem;
        flex-wrap: wrap;
      }
      .filter-input {
        flex: 1;
        min-width: 200px;
        padding: 0.5rem;
        border: 1px solid #ccc;
        border-radius: 4px;
      }
      .filter-select {
        padding: 0.5rem;
        border: 1px solid #ccc;
        border-radius: 4px;
      }
      .btn-primary {
        background: #1a1a2e;
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        text-decoration: none;
        border: none;
        cursor: pointer;
      }
      .btn-secondary {
        background: #eee;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        border: none;
        cursor: pointer;
      }
      .request-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 1rem;
      }
      .request-card {
        display: block;
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 1rem;
        text-decoration: none;
        color: inherit;
        transition: box-shadow 0.2s;
      }
      .request-card:hover {
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
      }
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
      }
      .title {
        font-weight: 600;
      }
      .desc {
        color: #666;
        font-size: 0.9rem;
        margin-bottom: 0.5rem;
      }
      .card-meta {
        display: flex;
        gap: 1rem;
        font-size: 0.8rem;
        color: #888;
        flex-wrap: wrap;
      }
      .badge {
        padding: 0.2rem 0.6rem;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
      }
      .badge-open {
        background: #d4edda;
        color: #155724;
      }
      .badge-quoted {
        background: #fff3cd;
        color: #856404;
      }
      .badge-assigned {
        background: #cce5ff;
        color: #004085;
      }
      .badge-completed {
        background: #d1ecf1;
        color: #0c5460;
      }
      .badge-cancelled {
        background: #f8d7da;
        color: #721c24;
      }
      .loading,
      .empty {
        text-align: center;
        padding: 2rem;
        color: #888;
      }
      .error-msg {
        color: #e94560;
        margin-bottom: 1rem;
      }
    `,
  ],
})
export class RequestsListComponent implements OnInit {
  private fb = inject(FormBuilder)
  private requestService = inject(RequestService)
  private categoryService = inject(CategoryService)
  auth = inject(AuthService)

  filterForm = this.fb.group({ q: [""], status: [""], categoryId: [""] })

  requests: ServiceRequestDto[] = []
  categories: CategoryDto[] = []
  loading = false
  error = ""

  ngOnInit(): void {
    this.loadCategories()
    this.loadRequests()
    this.filterForm.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe(() => this.loadRequests())
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (res) => (this.categories = res.categories),
    })
  }

  loadRequests(): void {
    this.loading = true
    this.error = ""
    const { q, status, categoryId } = this.filterForm.value
    this.requestService
      .getRequests({
        q: q || "",
        status: status || "",
        categoryId: categoryId || "",
      })
      .subscribe({
        next: (res) => {
          this.requests = res.requests
          this.loading = false
        },
        error: (err) => {
          this.error = err.error?.message || "Failed to load requests"
          this.loading = false
        },
      })
  }

  resetFilters(): void {
    this.filterForm.reset({ q: "", status: "", categoryId: "" })
  }
}
