import { Component, OnInit, inject } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterLink } from "@angular/router"
import { QuoteService } from "../../../core/services/quote.service"
import { PopulatedQuoteDto } from "../../../shared/models/models"

@Component({
  selector: "app-my-quotes",
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: "./my-quotes.component.html",
  styles: [
    `
      h2 {
        margin-bottom: 1.5rem;
      }
      .quote-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      .quote-card {
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 1.25rem;
        background: white;
      }
      .quote-top {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 0.75rem;
      }
      .request-title {
        font-weight: 700;
        font-size: 1.05rem;
        text-decoration: none;
        color: #1a1a2e;
      }
      .request-title:hover {
        color: #e94560;
      }
      .request-meta {
        display: flex;
        gap: 0.75rem;
        margin-top: 0.3rem;
        font-size: 0.82rem;
        color: #888;
        align-items: center;
      }
      .quote-details {
        display: flex;
        gap: 1.5rem;
        color: #555;
        font-size: 0.9rem;
        margin-bottom: 0.5rem;
      }
      .quote-msg {
        color: #666;
        font-style: italic;
        font-size: 0.9rem;
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
      .badge-assigned {
        background: #cce5ff;
        color: #004085;
      }
      .badge-cancelled {
        background: #f8d7da;
        color: #721c24;
      }
      .badge-req-open {
        background: #d4edda;
        color: #155724;
      }
      .badge-req-quoted {
        background: #fff3cd;
        color: #856404;
      }
      .badge-req-assigned {
        background: #cce5ff;
        color: #004085;
      }
      .badge-req-completed {
        background: #d1ecf1;
        color: #0c5460;
      }
      .badge-req-cancelled {
        background: #f8d7da;
        color: #721c24;
      }
      .loading,
      .empty {
        color: #888;
        padding: 2rem;
        text-align: center;
      }
      .error-msg {
        color: #e94560;
      }
    `,
  ],
})
export class MyQuotesComponent implements OnInit {
  private quoteService = inject(QuoteService)

  quotes: PopulatedQuoteDto[] = []
  loading = false
  error = ""

  ngOnInit(): void {
    this.loading = true
    this.quoteService.getMyQuotes().subscribe({
      next: (res) => {
        this.quotes = res.quotes as PopulatedQuoteDto[]
        this.loading = false
      },
      error: (err) => {
        this.error = err.error?.message || "Failed to load quotes"
        this.loading = false
      },
    })
  }

  getStatusBadge(status: string): string {
    if (status === "accepted") return "assigned"
    if (status === "rejected") return "cancelled"
    return "open"
  }
}
