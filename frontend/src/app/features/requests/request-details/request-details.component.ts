import { Component, OnInit, inject } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms"
import { ActivatedRoute, RouterLink } from "@angular/router"
import { RequestService } from "../../../core/services/request.service"
import { QuoteService } from "../../../core/services/quote.service"
import { AuthService } from "../../../core/services/auth.service"
import {
  ServiceRequestDto,
  PopulatedQuoteDto,
} from "../../../shared/models/models"

@Component({
  selector: "app-request-details",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: "./request-details.component.html",
  styles: [
    `
      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 1.5rem;
      }
      .details-grid {
        display: grid;
        grid-template-columns: 1fr 1.5fr;
        gap: 1.5rem;
      }
      @media (max-width: 768px) {
        .details-grid {
          grid-template-columns: 1fr;
        }
      }
      .detail-card,
      .quotes-section {
        background: #f9f9f9;
        border-radius: 8px;
        padding: 1.5rem;
      }
      .detail-card p {
        margin-bottom: 0.5rem;
      }
      .quote-form {
        background: white;
        border: 1px solid #ddd;
        border-radius: 6px;
        padding: 1rem;
        margin-bottom: 1rem;
      }
      .quote-card {
        background: white;
        border: 1px solid #ddd;
        border-radius: 6px;
        padding: 1rem;
        margin-bottom: 0.75rem;
      }
      .quote-accepted {
        border-color: #28a745;
      }
      .quote-rejected {
        opacity: 0.6;
      }
      .quote-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
      }
      .provider-name {
        font-weight: 600;
      }
      .quote-details {
        display: flex;
        gap: 1rem;
        margin-bottom: 0.5rem;
        color: #555;
      }
      .quote-msg {
        color: #666;
        font-size: 0.9rem;
      }
      .field {
        margin-bottom: 0.8rem;
        display: flex;
        flex-direction: column;
        gap: 0.3rem;
      }
      label {
        font-weight: 600;
        font-size: 0.85rem;
      }
      input,
      textarea {
        padding: 0.4rem;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 0.95rem;
      }
      .error {
        color: #e94560;
        font-size: 0.78rem;
      }
      .server-error {
        color: #e94560;
        margin-bottom: 0.5rem;
      }
      .btn-primary {
        background: #1a1a2e;
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        border: none;
        cursor: pointer;
      }
      .btn-secondary {
        background: #eee;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        text-decoration: none;
        color: inherit;
      }
      .btn-danger {
        background: #e94560;
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        border: none;
        cursor: pointer;
        margin-top: 1rem;
      }
      .btn-accept {
        background: #28a745;
        color: white;
        padding: 0.4rem 0.9rem;
        border-radius: 4px;
        border: none;
        cursor: pointer;
        margin-top: 0.5rem;
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
        color: #888;
        padding: 1rem 0;
      }
      .error-msg {
        color: #e94560;
        margin-bottom: 1rem;
      }
      h3 {
        margin-bottom: 1rem;
      }
      h4 {
        margin-bottom: 0.75rem;
      }
    `,
  ],
})
export class RequestDetailsComponent implements OnInit {
  private fb = inject(FormBuilder)
  private route = inject(ActivatedRoute)
  private requestService = inject(RequestService)
  private quoteService = inject(QuoteService)
  auth = inject(AuthService)

  quoteForm = this.fb.group({
    price: [null as number | null, [Validators.required, Validators.min(0)]],
    daysToComplete: [
      null as number | null,
      [Validators.required, Validators.min(1), Validators.max(365)],
    ],
    message: [""],
  })

  request: ServiceRequestDto | null = null
  quotes: PopulatedQuoteDto[] = []
  loading = false
  quotesLoading = false
  actionLoading = false
  error = ""
  quoteError = ""

  get isOwnRequest(): boolean {
    return (
      (this.request?.resident as any)?._id === this.auth.currentUser?.id ||
      this.request?.resident?.id === this.auth.currentUser?.id
    )
  }

  getQuoteStatusBadge(status: string): string {
    if (status === "accepted") return "assigned"
    if (status === "rejected") return "cancelled"
    return "open"
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get("id")!
    this.loadRequest(id)
  }

  loadRequest(id: string): void {
    this.loading = true
    this.requestService.getRequestById(id).subscribe({
      next: (res) => {
        this.request = res.request
        this.loading = false
        this.loadQuotes(id)
      },
      error: (err) => {
        this.error = err.error?.message || "Failed to load request"
        this.loading = false
      },
    })
  }

  loadQuotes(requestId: string): void {
    this.quotesLoading = true
    this.quoteService.getQuotesByRequest(requestId).subscribe({
      next: (res) => {
        this.quotes = res.quotes as PopulatedQuoteDto[]
        this.quotesLoading = false
      },
      error: () => (this.quotesLoading = false),
    })
  }

  submitQuote(): void {
    if (this.quoteForm.invalid) {
      this.quoteForm.markAllAsTouched()
      return
    }
    this.actionLoading = true
    this.quoteError = ""
    const price = this.quoteForm.value.price!
    const daysToComplete = this.quoteForm.value.daysToComplete!
    const message = this.quoteForm.value.message || ""
    this.quoteService
      .submitQuote({
        requestId: this.request!._id,
        price,
        daysToComplete,
        message,
      })
      .subscribe({
        next: () => {
          this.quoteForm.reset()
          this.loadRequest(this.request!._id)
          this.actionLoading = false
        },
        error: (err) => {
          this.quoteError = err.error?.message || "Failed to submit quote"
          this.actionLoading = false
        },
      })
  }

  acceptQuote(quoteId: string): void {
    this.actionLoading = true
    this.quoteService.acceptQuote(quoteId).subscribe({
      next: () => this.loadRequest(this.request!._id),
      error: (err) => {
        alert(err.error?.message || "Failed to accept quote")
        this.actionLoading = false
      },
    })
  }

  cancelRequest(): void {
    if (!confirm("Are you sure you want to cancel this request?")) return
    this.actionLoading = true
    this.requestService.updateStatus(this.request!._id, "cancelled").subscribe({
      next: () => this.loadRequest(this.request!._id),
      error: (err) => {
        alert(err.error?.message || "Failed to cancel")
        this.actionLoading = false
      },
    })
  }
}
