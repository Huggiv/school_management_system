# Docker Compose Deployment Runbook

## Purpose

Deploy and operate the School Management Portal stack using Docker Compose.

## Prerequisites

- Docker Engine 24+
- Docker Compose v2
- Open ports: `5173`, `8000`, `5432`

## Required Environment Variables

Use root `.env` (copy from `.env.example`) and set:

- `APP_ENV`
- `LOG_LEVEL`
- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `JWT_SECRET_KEY`
- `JWT_ALGORITHM`
- `JWT_ACCESS_TOKEN_EXPIRE_MINUTES`
- `JWT_REFRESH_TOKEN_EXPIRE_MINUTES`
- `STORAGE_MAX_UPLOAD_MB`
- `VITE_API_BASE_URL`

## Deployment Steps

1. Build and start services:

```bash
docker compose up --build -d
```

1. Check service status:

```bash
docker compose ps
```

1. Verify health endpoints:

```bash
curl -f http://localhost:8000/health
curl -f http://localhost:5173/health
```

1. Check backend migration execution:

```bash
docker compose logs backend | grep -i alembic
```

## Access URLs

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`
- OpenAPI docs: `http://localhost:8000/docs`

## Backup and Restore

### Backup PostgreSQL

```bash
docker compose exec db pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" > backup.sql
```

### Restore PostgreSQL

```bash
cat backup.sql | docker compose exec -T db psql -U "$POSTGRES_USER" "$POSTGRES_DB"
```

## Restart and Rollback

### Restart all services

```bash
docker compose restart
```

### Rollback to previous images

1. Revert repository to previous stable commit/tag.
2. Rebuild and restart:

```bash
docker compose up --build -d
```

## Troubleshooting Matrix

| Symptom | Probable Cause | Resolution |
| --- | --- | --- |
| `backend` keeps restarting | DB not healthy or migration failed | Check `docker compose logs db backend`; verify DB credentials and run `docker compose exec backend alembic -c alembic.ini upgrade head`. |
| Frontend shows API errors | Invalid `VITE_API_BASE_URL` | Set `VITE_API_BASE_URL` to reachable backend URL and rebuild frontend service. |
| DB connection refused | Port conflict on `5432` | Stop local PostgreSQL or remap compose port. |
| Upload failures (`413`) | File exceeds max upload size | Increase `STORAGE_MAX_UPLOAD_MB` and restart backend. |
| `frontend` unhealthy | Nginx not serving `/health` | Verify `frontend/nginx.conf` and rebuild frontend image. |
