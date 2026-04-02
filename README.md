# Real-Time Incident Management Panel

A centralized incident management dashboard for monitoring and managing service incidents across Payment API, Auth Service, and Notification Worker. Features real-time updates via WebSocket, async event processing with BullMQ, and an animated React dashboard.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | NestJS 11, TypeORM 0.3, PostgreSQL 16, BullMQ, Socket.IO |
| Frontend | React 19, Vite 6, TypeScript 5, TanStack Query v5, Zustand 5, shadcn/ui, Tailwind CSS 4, Framer Motion |
| Infrastructure | Docker, nginx, Redis 7 |

## System Architecture

```
┌─────────────┐     REST API      ┌──────────────────────┐
│   Frontend   │◄────────────────►│     NestJS Backend    │
│  (React 19)  │                  │                       │
│              │   Socket.IO      │  Controller → Service │
│              │◄─────────────────│       ↓               │
└─────────────┘                   │  Repository (TypeORM) │
                                  │       ↓               │
                                  │  BullMQ Producer      │
                                  └───────┬───────────────┘
                                          │
                                          ▼
                                  ┌───────────────┐
                                  │     Redis      │
                                  │                │
                                  │ • BullMQ Queue │
                                  │ • Socket.IO    │
                                  │   Adapter      │
                                  └───────┬───────┘
                                          │
                                          ▼
                                  ┌───────────────────────┐
                                  │  Event Consumer        │
                                  │  (BullMQ Worker)       │
                                  │                        │
                                  │  • Create timeline     │
                                  │  • Socket.IO broadcast │
                                  └────────────────────────┘
                                          │
                                          ▼
                                  ┌───────────────┐
                                  │  PostgreSQL 16 │
                                  │                │
                                  │ • incidents    │
                                  │ • timelines    │
                                  └───────────────┘
```

## Prerequisites

- Node.js 22+
- pnpm
- Docker + Docker Compose

## Quick Start with Docker

```bash
# Start all services
docker compose up

# Load seed data (in a separate terminal)
docker compose --profile seed up seed

# Open the dashboard
open http://localhost
```

## Development Setup

```bash
# Start database and cache
docker compose up postgres redis

# Backend (in a new terminal)
cd backend
pnpm install
pnpm dev

# Frontend (in a new terminal)
cd frontend
pnpm install
pnpm dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Swagger Docs: http://localhost:3000/api/docs

## API Documentation

Interactive API documentation is available via Swagger at:

```
http://localhost:3000/api/docs
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://incident:incident123@localhost:5432/incident_db` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `PORT` | Backend server port | `3000` |
| `NODE_ENV` | Environment mode | `development` |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:5173` |

## Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| **BullMQ over Kafka** | Lightweight infrastructure. Redis is already required for Socket.IO adapter. Kafka is justified at 10K+ events/day with multi-consumer needs. |
| **Socket.IO with Redis Adapter** | Bidirectional communication, built-in reconnect/fallback, room-based event routing, multi-instance support via Redis adapter. |
| **Optimistic locking (@VersionColumn)** | Lock-free throughput, DB-level atomicity, no deadlock risk. Conflicts are rare and handled with 409 + refetch. |
| **Graceful degradation** | CRUD always works even if Redis is down. Socket falls back to single-instance mode. Availability over consistency. |
| **Free status transitions** | No strict state machine. Enum validation is sufficient for case study scope. |
| **Full object payload over WebSocket** | Zero-latency cache updates on the client. Avoids N refetch requests. Payload size (~1-5KB) is negligible. |

## Assumptions

- No authentication/authorization (case study scope, not in requirements)
- Free status transitions between any states (no strict state machine)
- Single Redis instance (no sentinel/cluster)

## Future Improvements

- Kafka for high-volume event streaming with consumer groups
- Authentication and RBAC (JWT + Guards)
- Notification system (email, Slack, PagerDuty webhooks)
- Monitoring and metrics (Prometheus + Grafana)
- Rate limiting and throttling
- Strict incident status state machine
- Monorepo with Turborepo for shared types
