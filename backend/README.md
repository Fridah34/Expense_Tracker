# 💰 Expense Tracker API

A secure, production-ready RESTful API for personal finance management. Track income and expenses, organize transactions into categories, and get financial summaries — all behind JWT authentication with full data isolation per user.

Built with **Node.js**, **Express**, and **PostgreSQL**.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Migrations](#database-migrations)
- [API Reference](#api-reference)
- [Error Handling](#error-handling)
- [Security](#security)
- [Rate Limiting](#rate-limiting)
- [Database Schema](#database-schema)
- [Project Structure](#project-structure)

---

## Overview

Most people have no clear picture of where their money goes. This API is the backend engine for an expense tracking application — handling all data storage, authentication, and business logic so any frontend (web or mobile) can be built on top of it.

Every user gets a completely isolated environment — you can never access, modify, or delete another user's data. All financial records are private, validated, and protected.

---

## Features

- **Authentication** — JWT-based register and login
- **Expense & Income Tracking** — record transactions with title, amount, date, type, and notes
- **Categories** — organize transactions with custom color-coded categories
- **Financial Summary** — income vs expense totals and balance for any date range
- **Filtering & Search** — filter by type, category, date range, or keyword
- **Pagination** — all list endpoints paginated, never unbounded responses
- **Full Validation** — every request validated before touching the database
- **Layered Rate Limiting** — global, auth, and write-specific limits
- **Graceful Shutdown** — in-flight requests complete before the server stops
- **Database Migrations** — versioned, reproducible schema changes

---

## Tech Stack

| Technology | Role |
|---|---|
| Node.js | Runtime |
| Express.js | Web framework |
| PostgreSQL 16 | Database |
| node-pg-migrate | Database migrations |
| jsonwebtoken | JWT authentication |
| bcryptjs | Password hashing |
| express-validator | Request validation |
| helmet | Security HTTP headers |
| morgan | HTTP request logging |
| express-rate-limit | Rate limiting |
| dotenv | Environment config |
| nodemon | Dev auto-reload |

---

## Architecture

The project follows the **MVC pattern** adapted for a REST API:

```
Request
  → Rate Limiter       blocks abusive traffic
  → Morgan             logs every HTTP request
  → Helmet + CORS      sets security headers
  → Router             matches URL to handler
  → authenticate       verifies JWT token
  → Validator          checks request data shape
  → Controller         business logic
  → Model              executes database query
  → Response

errorMiddleware        catches anything that goes wrong
```

**Separation of concerns:**

```
routes/       → define URLs and chain middleware
middleware/   → auth, validation, rate limiting, errors
controllers/  → business logic, builds responses
models/       → all SQL queries, one file per resource
config/       → database connection, migrations
validators/   → validation rule definitions
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- PostgreSQL 16
- npm

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd expense-tracker
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Fill in your values — see [Environment Variables](#environment-variables) below.

### 4. Create the database

```bash
psql -U postgres -c "CREATE DATABASE expense_tracker;"
```

### 5. Run migrations

```bash
npm run migrate
```

### 6. Start the server

```bash
# Development (auto-reload)
npm run dev

# Production
npm start
```

The API runs at `http://localhost:3000`

Health check: `http://localhost:3000/health`

---

## Environment Variables

Create a `.env` file at the project root. See `.env.example` for the template.

| Variable | Description | Example |
|---|---|---|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `development` |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | `yourpassword` |
| `DB_NAME` | Database name | `expense_tracker` |
| `JWT_SECRET` | JWT signing secret (min 32 chars) | `supersecretkey...` |
| `JWT_EXPIRES_IN` | Token expiry | `7d` |

> ⚠️ Never commit your `.env` file. It is listed in `.gitignore`.

---

## Database Migrations

This project uses `node-pg-migrate` for versioned database schema management.

```bash
# Apply all pending migrations
npm run migrate

# Undo the last migration
npm run migrate:down

# Create a new migration file
npm run migrate:create -- --name your-migration-name
```

Migration files live in the `migrations/` folder and are timestamped — they always run in the correct order and are never re-applied.

---

## API Reference

### Base URL

```
http://localhost:3000/api
```

### Authentication

Protected routes require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

---

### Auth

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Create a new account | No |
| POST | `/auth/login` | Login and receive token | No |
| GET | `/auth/profile` | Get profile via token | Yes |

**Register** `POST /api/auth/register`

```json
{
  "email": "john@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "password": "Password123"
}
```

Response `201`:

```json
{
  "status": "success",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
    "user": {
      "id": "a3f2c1d4-...",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "isActive": true
    }
  }
}
```

**Login** `POST /api/auth/login`

```json
{
  "email": "john@example.com",
  "password": "Password123"
}
```

---

### Users (Auth Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users/me` | Get full profile |
| PUT | `/users/me` | Update name |
| PUT | `/users/me/password` | Change password |
| DELETE | `/users/me` | Delete account |

**Update Profile** `PUT /api/users/me`

```json
{
  "firstName": "Jonathan",
  "lastName": "Doe"
}
```

**Change Password** `PUT /api/users/me/password`

```json
{
  "currentPassword": "Password123",
  "newPassword": "NewPassword456",
  "confirmPassword": "NewPassword456"
}
```

**Delete Account** `DELETE /api/users/me`

```json
{
  "password": "Password123"
}
```

> Deleting an account permanently removes all associated categories and expenses.

---

### Categories (Auth Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/categories` | Create category |
| GET | `/categories` | List all categories |
| GET | `/categories/:id` | Get one category |
| PUT | `/categories/:id` | Update category |
| DELETE | `/categories/:id` | Delete category |

**Create Category** `POST /api/categories`

```json
{
  "name": "Food",
  "color": "#f59e0b",
  "icon": "utensils"
}
```

Response `201`:

```json
{
  "status": "success",
  "data": {
    "category": {
      "id": "uuid",
      "name": "Food",
      "color": "#f59e0b",
      "icon": "utensils",
      "expense_count": "0",
      "total_spent": "0"
    }
  }
}
```

> `expense_count` and `total_spent` are returned on every category list — no extra request needed.

---

### Expenses (Auth Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/expenses` | Record a transaction |
| GET | `/expenses` | List with filters + pagination |
| GET | `/expenses/summary` | Income vs expense summary |
| GET | `/expenses/:id` | Get one transaction |
| PUT | `/expenses/:id` | Update transaction |
| DELETE | `/expenses/:id` | Delete transaction |

**Create Expense** `POST /api/expenses`

```json
{
  "title": "Lunch at KFC",
  "amount": 850.00,
  "type": "expense",
  "date": "2026-05-22",
  "categoryId": "category-uuid",
  "notes": "Team lunch"
}
```

> `type` must be `"expense"` or `"income"`. `categoryId` and `notes` are optional.

**List Expenses** `GET /api/expenses`

Supports query parameters:

| Parameter | Type | Description |
|-----------|------|-------------|
| `type` | string | `expense` or `income` |
| `categoryId` | uuid | Filter by category |
| `startDate` | date | From date `YYYY-MM-DD` |
| `endDate` | date | To date `YYYY-MM-DD` |
| `search` | string | Search in title |
| `page` | number | Page number (default: 1) |
| `limit` | number | Per page (default: 10, max: 100) |

Example:
```
GET /api/expenses?type=expense&startDate=2026-05-01&endDate=2026-05-31&page=1&limit=10
```

Response `200`:
```json
{
  "status": "success",
  "data": {
    "expenses": [...],
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

**Summary** `GET /api/expenses/summary`

Defaults to the current month if no dates provided.

```
GET /api/expenses/summary?startDate=2026-05-01&endDate=2026-05-31
```

Response `200`:
```json
{
  "status": "success",
  "data": {
    "summary": {
      "income": 50000.00,
      "expense": 12500.00,
      "balance": 37500.00,
      "count": 8
    },
    "period": {
      "startDate": "2026-05-01",
      "endDate": "2026-05-31"
    }
  }
}
```

---

## Error Handling

All errors return consistent JSON — no HTML, no stack traces in production.

**Standard error:**

```json
{
  "status": "error",
  "message": "Resource not found"
}
```

**Validation error:**

```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Please provide a valid email address" },
    { "field": "password", "message": "Password must be at least 8 characters" }
  ]
}
```

**HTTP Status Codes:**

| Code | Meaning |
|------|---------|
| `200` | Success |
| `201` | Resource created |
| `400` | Validation error or bad request |
| `401` | Missing or invalid token |
| `404` | Resource not found |
| `409` | Conflict — duplicate entry |
| `429` | Rate limit exceeded |
| `500` | Internal server error |

---

## Security

| Measure | Implementation |
|---|---|
| Password hashing | bcrypt with 12 salt rounds |
| Authentication | JWT — stateless, expires in 7 days |
| SQL injection prevention | Parameterized queries throughout |
| Security headers | Helmet.js — 14 headers automatically |
| Data isolation | Every query scoped to authenticated user |
| Rate limiting | Three-layer protection (see below) |
| Input sanitization | express-validator on every route |
| Sensitive config | Environment variables only, never hardcoded |

---

## Rate Limiting

| Scope | Limit | Window | Purpose |
|-------|-------|--------|---------|
| All `/api` routes | 60 requests | 10 minutes | General protection |
| `/api/auth` routes | 10 requests | 15 minutes | Prevent brute force |
| Expense/Category writes | 30 requests | 1 minute | Prevent spam inserts |

Clients receive `RateLimit-*` headers showing remaining requests and window reset time.

---

## Database Schema

```
users
├── id            UUID, Primary Key
├── email         VARCHAR(255), Unique, Not Null
├── first_name    VARCHAR(50), Not Null
├── last_name     VARCHAR(50), Not Null
├── password      VARCHAR(255), Not Null  [bcrypt hashed]
├── is_active     BOOLEAN, Default true
├── created_at    TIMESTAMP WITH TIME ZONE
└── updated_at    TIMESTAMP WITH TIME ZONE  [auto-updated via trigger]

categories
├── id            UUID, Primary Key
├── user_id       UUID, FK → users(id) ON DELETE CASCADE
├── name          VARCHAR(100), Not Null
├── color         VARCHAR(7)  [hex color e.g. #6366f1]
├── icon          VARCHAR(50)
├── created_at    TIMESTAMP WITH TIME ZONE
└── updated_at    TIMESTAMP WITH TIME ZONE  [auto-updated via trigger]
                  UNIQUE(user_id, name)

expenses
├── id            UUID, Primary Key
├── user_id       UUID, FK → users(id) ON DELETE CASCADE
├── category_id   UUID, FK → categories(id) ON DELETE SET NULL
├── title         VARCHAR(255), Not Null
├── amount        DECIMAL(12,2), CHECK > 0
├── type          VARCHAR(10), CHECK IN ('expense', 'income')
├── date          DATE, Not Null
├── notes         TEXT
├── created_at    TIMESTAMP WITH TIME ZONE
└── updated_at    TIMESTAMP WITH TIME ZONE  [auto-updated via trigger]
```

**Relationships:**
- A user owns many categories and expenses
- An expense optionally belongs to one category
- Deleting a user cascades — all their data is removed
- Deleting a category sets `category_id` to null on related expenses (history preserved)

---

## Project Structure

```
expense-tracker/
├── src/
│   ├── config/
│   │   └── db.js                    # PostgreSQL connection pool + query wrapper
│   ├── middleware/
│   │   ├── auth.middleware.js        # JWT verification, attaches user to request
│   │   ├── error.middleware.js       # Global error handler — clean JSON always
│   │   ├── rateLimiter.js            # Three-layer rate limiting
│   │   └── validate.js              # express-validator result checker
│   ├── models/
│   │   ├── user.model.js            # User queries
│   │   ├── category.model.js        # Category queries + expense aggregation
│   │   └── expense.model.js         # Expense queries + dynamic filtering
│   ├── controllers/
│   │   ├── auth.controller.js       # Register, login
│   │   ├── user.controller.js       # Profile, password, account deletion
│   │   ├── category.controller.js   # Category CRUD
│   │   └── expense.controller.js    # Expense CRUD + summary
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── category.routes.js
│   │   └── expense.routes.js
│   ├── validators/
│   │   ├── auth.validator.js
│   │   ├── user.validator.js
│   │   ├── category.validator.js
│   │   └── expense.validator.js
│   ├── app.js                       # Express setup — middleware, routes, error handler
│   └── server.js                    # Entry point — starts server, graceful shutdown
├── migrations/                      # Versioned SQL schema files
├── .env                             # Local secrets — never commit
├── .env.example                     # Safe template for onboarding
├── .gitignore
├── package.json
└── README.md
```

---

## Author

Built as a learning project covering real-world backend development patterns including REST API design, relational database modeling, JWT authentication, input validation, and production security practices.