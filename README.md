# Neighborhood Service Marketplace (NSM)

A full-stack web application built with Node.js, Express, MongoDB, and Angular that enables residents to post service requests and providers to submit competitive quotes.

---

## Group Members

| Name                   | Role                                    |
| ---------------------- | --------------------------------------- |
| Rosenoor Singh Dhillon | Backend – Auth & Models                 |
| Thi Tieu Man Tran      | Backend – Requests & Categories         |
| Kim Joson              | Backend – Quotes & Lifecycle Logic      |
| Adit Rakeshkumar Rana  | Angular Frontend – Auth, Requests       |
| Gurleen Kaur           | Angular Frontend – Quotes, Guards, Docs |
| Li Zixin               | Overall Testing and help with the code  |

---

## Project Overview

NSM is a two-role marketplace: **Residents** submit service requests describing work they need done, and **Providers** respond with price quotes. Residents then accept the best quote, which automatically assigns the provider and rejects all competing bids. The system enforces strict lifecycle transitions and ownership rules at every API endpoint.

---

## System Architecture

```
nsm/
├── backend/                  # Node.js + Express + Mongoose API
│   ├── config/
│   │   └── db.js             # MongoDB connection
│   ├── controllers/          # Request handling logic
│   │   ├── authController.js
│   │   ├── categoryController.js
│   │   ├── requestController.js
│   │   └── quoteController.js
│   ├── middleware/
│   │   ├── auth.js           # Session authentication + role guards
│   │   └── errorHandler.js   # Centralised error handling
│   ├── models/               # Mongoose schemas with indexes
│   │   ├── User.js
│   │   ├── Category.js
│   │   ├── ServiceRequest.js
│   │   └── Quote.js
│   ├── routes/               # Express routers
│   │   ├── authRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── requestRoutes.js
│   │   └── quoteRoutes.js
│   ├── server.js             # Entry point
│   └── .env.example
│
└── frontend/                 # Angular 17 standalone application
    └── src/app/
        ├── core/
        │   ├── guards/       # authGuard, residentGuard, providerGuard
        │   ├── interceptors/ # credentialsInterceptor (withCredentials)
        │   └── services/     # AuthService, CategoryService, RequestService, QuoteService
        ├── features/
        │   ├── auth/         # LoginComponent, RegisterComponent
        │   ├── requests/     # RequestsListComponent, CreateRequestComponent, RequestDetailsComponent
        │   └── quotes/       # MyQuotesComponent
        └── shared/
            └── models/       # TypeScript interfaces (UserDto, CategoryDto, etc.)
```

---

## Setup Instructions

### Prerequisites

- Node.js 18+
- MongoDB running locally on port 27017 (or a MongoDB Atlas connection string)
- Angular CLI: `npm install -g @angular/cli`

### Backend

```bash
cd backend
npm install

# Copy and configure environment
cp .env.example .env
# Edit .env with your MongoDB URI and session secret

npm start
# Server runs on http://localhost:3000
```

**.env values:**

```
PORT=3000
MONGO_URI=mongodb://localhost:27017/nsm
SESSION_SECRET=replace_with_strong_random_string
CLIENT_ORIGIN=http://localhost:4200
```

### Frontend

```bash
cd frontend
npm install

# Verify src/environments/environment.ts has the correct API URL:
# apiUrl: 'http://localhost:3000/api'

ng serve
# App runs on http://localhost:4200
```

---

## Database Schema

### users

Stores both residents and providers in a single collection using a `role` discriminator field. This is preferred over separate collections because authentication logic is shared and queries rarely need to distinguish roles at the collection level.

| Field    | Type   | Notes                             |
| -------- | ------ | --------------------------------- |
| name     | String | Required, min 2 chars             |
| email    | String | Required, unique, lowercase       |
| password | String | Bcrypt-hashed, never stored plain |
| role     | String | Enum: `resident`, `provider`      |

### categories

Simple lookup collection for service types. Kept separate from requests to allow centralised management and future expansion without modifying request documents.

| Field       | Type   | Notes            |
| ----------- | ------ | ---------------- |
| name        | String | Required, unique |
| description | String | Optional         |

### serviceRequests

Core entity of the marketplace. References `users` (resident) and `categories` by ObjectId. Embedding category data was considered but rejected — a reference is correct here because categories change independently and are shared across many requests; embedding would require updating all request documents if a category name changed.

| Field            | Type                | Notes                                              |
| ---------------- | ------------------- | -------------------------------------------------- |
| title            | String              | Required, min 3 chars                              |
| description      | String              | Required, min 10 chars                             |
| category         | ObjectId → Category | Required                                           |
| location         | String              | Required                                           |
| resident         | ObjectId → User     | Set from session on creation                       |
| status           | String              | Enum: open, quoted, assigned, completed, cancelled |
| assignedProvider | ObjectId → User     | Null until quote accepted                          |

### quotes

Each quote belongs to a request and a provider. References are used instead of embedding quotes inside the request document because: (1) quotes are frequently queried independently (My Quotes page), (2) a request could receive many quotes over time, and (3) the accept operation must atomically update all sibling quotes, which is cleaner with a separate collection.

| Field          | Type                      | Notes                             |
| -------------- | ------------------------- | --------------------------------- |
| request        | ObjectId → ServiceRequest | Required, indexed                 |
| provider       | ObjectId → User           | Required, indexed                 |
| price          | Number                    | Required, min 0                   |
| daysToComplete | Number                    | Required, 1–365                   |
| message        | String                    | Optional                          |
| status         | String                    | Enum: pending, accepted, rejected |

---

## Index Justification

### Mandatory Indexes

**`users.email` (unique)**
Every login requires a lookup by email. Without this index, MongoDB would perform a full collection scan on every authentication attempt. The unique constraint also prevents duplicate registrations at the database level as a second line of defence after application-layer validation.

**`serviceRequests.title + description` (text index)**
The requests list supports keyword search, which maps directly to MongoDB's `$text` operator. Text indexes pre-process string fields into searchable tokens and support relevance scoring. A regex approach would require a full collection scan on every search — unacceptable at scale.

**`quotes.request` (single field)**
The most frequent quote access pattern is "get all quotes for a request" (used on the request details page and in the accept workflow). Without this index, every quote fetch would scan the entire quotes collection.

### Recommended Indexes

**`serviceRequests (status, category)` (compound)**
The primary filter combination on the requests list is status + category. A compound index on `(status, category)` satisfies both single-field filters and the combined query with a single index scan, following MongoDB's ESR (Equality-Sort-Range) guideline.

**`quotes.provider` (single field)**
The My Quotes page queries `{ provider: currentUserId }`. With potentially thousands of quotes, a dedicated provider index prevents a full collection scan for each provider session.

**`quotes (request, provider)` (unique compound)**
Prevents a provider from submitting a duplicate quote on the same request. The unique constraint handles this at the database layer even if application logic is bypassed.

### Scalability Considerations

As the platform grows, the text index on `serviceRequests` will benefit from MongoDB Atlas Search for more sophisticated relevance ranking. The compound index on `(status, category)` should be extended to include `createdAt` as the dataset grows to support efficient paginated queries. The session store is backed by MongoDB via `connect-mongo`, which scales naturally with the existing infrastructure without requiring a separate Redis instance for moderate traffic levels. For high-traffic deployments, sharding `serviceRequests` on `status` would distribute the most-queried collection across nodes.

---

## API Endpoint Reference

### Auth — `/api/auth`

| Method | Path      | Auth   | Description            |
| ------ | --------- | ------ | ---------------------- |
| POST   | /register | Public | Register new user      |
| POST   | /login    | Public | Login, creates session |
| POST   | /logout   | Any    | Destroy session        |
| GET    | /me       | Any    | Get current user       |

### Categories — `/api/categories`

| Method | Path | Auth          | Description         |
| ------ | ---- | ------------- | ------------------- |
| GET    | /    | Any           | List all categories |
| POST   | /    | Any logged-in | Create category     |

### Service Requests — `/api/requests`

| Method | Path        | Auth             | Description                                   |
| ------ | ----------- | ---------------- | --------------------------------------------- |
| GET    | /           | Any              | List requests (filter: status, categoryId, q) |
| POST   | /           | Resident         | Create new request                            |
| GET    | /:id        | Any              | Get request by ID                             |
| PATCH  | /:id/status | Resident (owner) | Update status                                 |

### Quotes — `/api/quotes`

| Method | Path        | Auth             | Description                                 |
| ------ | ----------- | ---------------- | ------------------------------------------- |
| GET    | /           | Any              | Get quotes for a request (?requestId=)      |
| POST   | /           | Provider         | Submit a quote                              |
| GET    | /my         | Provider         | Get own quotes                              |
| POST   | /:id/accept | Resident (owner) | Accept quote, reject others, assign request |

---

## Quote Lifecycle

```
Request Created → status: open
Provider submits quote → status: open → quoted
Resident accepts a quote:
  - Accepted quote: pending → accepted
  - All other quotes: pending → rejected
  - Request: quoted → assigned
Resident may also cancel:
  - open/quoted → cancelled
  - assigned → cancelled (if needed)
  - assigned → completed
```

---

## Testing Instructions

### Postman

1. Import `NSM_Postman_Collection.json` into Postman
2. Ensure "Cookie Jar" is enabled in Postman settings (required for session cookies)
3. Run requests **in order** — each request saves IDs to collection variables
4. Follow login/logout steps between resident and provider flows as labelled

### Manual UI Checklist

- [ ] Register as resident, login, see requests list
- [ ] Create a new request (resident only; button hidden for providers)
- [ ] Filter requests by status, category, and keyword
- [ ] Register as provider, login
- [ ] View request details, submit a quote
- [ ] Login as resident, view quotes on the request, accept one
- [ ] Confirm request card shows "assigned", other quotes show "rejected"
- [ ] Provider's My Quotes page shows "accepted" quote
- [ ] Logout; verify protected routes redirect to login
- [ ] Try accessing /requests/new as provider; confirm redirect

---

## HTTP Status Codes Used

| Code | Meaning                                                     |
| ---- | ----------------------------------------------------------- |
| 200  | OK – successful GET/PATCH/POST                              |
| 201  | Created – new resource                                      |
| 400  | Bad Request – validation failure or invalid transition      |
| 401  | Unauthorized – no active session                            |
| 403  | Forbidden – wrong role or not owner                         |
| 404  | Not Found – resource does not exist                         |
| 409  | Conflict – duplicate email, category name, or repeat accept |
