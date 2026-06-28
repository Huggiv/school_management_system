# Release Checklist

## Goal

Provide a deterministic pre-release and rollback checklist for safe deployment.

## Pre-Release Gates

1. Verify branch is up to date and CI is green.
1. Confirm tests pass locally:
   - `make backend-test`
   - `make frontend-test`
   - `make frontend-e2e`
1. Confirm lint/type checks pass:
   - `make backend-lint`
   - `make backend-typecheck`
   - `make frontend-lint`
   - `make frontend-typecheck`
1. Confirm migration state is valid:
   - `alembic -c backend/alembic.ini upgrade head`
   - `alembic -c backend/alembic.ini downgrade -1`
   - `alembic -c backend/alembic.ini upgrade head`

## Backup Gate

1. Create database backup before release:

```bash
docker compose exec db pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" > backup-pre-release.sql
```

1. Validate backup file exists and is non-empty.

## Smoke Tests After Deploy

1. `curl -f http://localhost:8000/health`
1. `curl -f http://localhost:8000/ready`
1. Open frontend home page and dashboard route.
1. Execute login flow and one create/read API flow (admission or assignment).

## Rollback Procedure

1. Revert to previous known-good tag/commit.
1. Redeploy containers:

```bash
docker compose up --build -d
```

1. Restore backup if schema/data incompatibility detected:

```bash
cat backup-pre-release.sql | docker compose exec -T db psql -U "$POSTGRES_USER" "$POSTGRES_DB"
```

## Release Sign-Off

1. Platform owner approves deployment evidence.
1. Engineering lead confirms rollback path tested.
1. Tag release and update changelog.
