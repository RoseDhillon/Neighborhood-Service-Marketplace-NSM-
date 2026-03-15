import { Routes } from "@angular/router"
import {
  authGuard,
  residentGuard,
  providerGuard,
} from "./core/guards/auth.guard"

export const routes: Routes = [
  { path: "", redirectTo: "requests", pathMatch: "full" },
  {
    path: "register",
    loadComponent: () =>
      import("./features/auth/register/register.component").then(
        (m) => m.RegisterComponent,
      ),
  },
  {
    path: "login",
    loadComponent: () =>
      import("./features/auth/login/login.component").then(
        (m) => m.LoginComponent,
      ),
  },
  {
    path: "requests",
    canActivate: [authGuard],
    loadComponent: () =>
      import("./features/requests/requests-list/requests-list.component").then(
        (m) => m.RequestsListComponent,
      ),
  },
  {
    path: "requests/new",
    canActivate: [authGuard, residentGuard],
    loadComponent: () =>
      import("./features/requests/create-request/create-request.component").then(
        (m) => m.CreateRequestComponent,
      ),
  },
  {
    path: "requests/:id",
    canActivate: [authGuard],
    loadComponent: () =>
      import("./features/requests/request-details/request-details.component").then(
        (m) => m.RequestDetailsComponent,
      ),
  },
  {
    path: "my-quotes",
    canActivate: [authGuard, providerGuard],
    loadComponent: () =>
      import("./features/quotes/my-quotes/my-quotes.component").then(
        (m) => m.MyQuotesComponent,
      ),
  },
  { path: "**", redirectTo: "requests" },
]
