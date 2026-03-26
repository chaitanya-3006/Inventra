# Stock Reservation System — Inventra

## Quick Start

1. Clone the repo
2. Run: `docker-compose up --build`
3. Open: http://localhost:3000
4. Login with: username=`admin` password=`admin123`

## Architecture

```
Frontend (Next.js 14)  →  NestJS API Gateway  →  Go Reservation Service
                                    ↓                       ↓
                               PostgreSQL 15           PostgreSQL 15
                             (reads: inventory)   (writes: all stock ops)
```

- **Frontend**: http://localhost:3000
- **NestJS API**: http://localhost:3001
- **Go Service**: http://localhost:8081
- **PostgreSQL**: localhost:5432

## Services

| Service | Port | Responsibility |
|---------|------|---------------|
| Next.js Frontend | 3000 | UI — no business logic |
| NestJS Backend | 3001 | Auth, routing, inventory reads |
| Go Reservation Service | 8081 | All stock mutations (concurrency-safe) |
| PostgreSQL 15 | 5432 | Data store |

## API Endpoints (NestJS)

```
POST   /auth/login
GET    /inventory
POST   /inventory        (admin)
PUT    /inventory/:id    (admin)
DELETE /inventory/:id    (admin)
POST   /reservation
POST   /reservation/confirm
POST   /reservation/cancel
GET    /reservation/user
```

## Internal Go Service Endpoints

```
POST /reserve
POST /confirm
POST /cancel
GET  /reservations/user/:userID
GET  /health
```

## Key Design Decisions

- **SELECT FOR UPDATE**: All stock mutations in Go use row-level locking to prevent overselling under concurrent load.
- **Generated column**: `available_quantity` is a PostgreSQL generated column — never manually updated.
- **Expiry worker**: A cron job runs every 60 seconds to expire stale PENDING reservations and release their stock.
- **JWT**: 24-hour token expiry. Seeded admin password is bcrypt-hashed.
- **No stock logic in NestJS**: NestJS only proxies reservation calls to the Go service.

## Development

```bash
# Backend only
cd backend && npm install && npm run start:dev

# Go service only
cd reservation-service && go run .

# Frontend only
cd frontend && npm install && npm run dev
```
