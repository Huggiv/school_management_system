.PHONY: backend-lint backend-typecheck backend-test-unit backend-test-integration backend-test frontend-lint frontend-typecheck frontend-test frontend-build frontend-e2e ci

backend-lint:
	cd backend && ruff check .

backend-typecheck:
	cd backend && mypy app

backend-test-unit:
	cd backend && pytest tests/unit -q

backend-test-integration:
	cd backend && pytest tests/integration -q

backend-test:
	cd backend && pytest tests -q

frontend-lint:
	cd frontend && npm run lint

frontend-typecheck:
	cd frontend && npm run typecheck

frontend-test:
	cd frontend && npm run test

frontend-build:
	cd frontend && npm run build

frontend-e2e:
	cd frontend && npm run e2e

ci: backend-lint backend-typecheck backend-test frontend-lint frontend-typecheck frontend-test frontend-build
