# School Management System

Monorepo scaffold for a school management portal with FastAPI backend,
React + Vite frontend, PostgreSQL, and Docker Compose deployment.

## Prerequisites

- Python 3.12+
- Node.js 22+
- Docker and Docker Compose v2

## Repository Layout

- `backend/` FastAPI service and database migrations
- `frontend/` React application
- `infra/` infrastructure helpers and deployment artifacts
- `scripts/` local automation scripts
- `tests/` cross-cutting or integration test helpers
- `docs/` architecture and runbooks
- `plan/` implementation plans

## Quick Start (Local)

1. Copy environment template:
   - `cp .env.example .env`
2. Backend setup:
   - `cd backend && python -m venv .venv && source .venv/bin/activate`
   - `pip install -e .[dev]`
3. Frontend setup:
   - `cd frontend && npm install`

## Quick Start (Docker)

- `docker compose up --build -d`

### Docker Recovery (Credential or Migration Mismatch)

If backend logs show PostgreSQL authentication errors or duplicate migration
objects after changing `.env`, reset the persisted DB volume and redeploy:

1. `docker compose down -v`
2. `docker compose up --build -d`
3. `docker compose ps`
4. `curl -f http://localhost:8000/health`

## Validation Commands

- Backend lint: `cd backend && ruff check .`
- Backend typecheck: `cd backend && mypy app`
- Frontend lint: `cd frontend && npm run lint`
- Frontend typecheck: `cd frontend && npm run typecheck`
