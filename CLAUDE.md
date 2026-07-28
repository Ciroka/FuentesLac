# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

StockAI is a stock/production management system with a NestJS backend and an Angular frontend, backed by PostgreSQL. Domains covered: products, supplies, suppliers, categories, batches, production (+ production-detail), sales (+ sales-detail), orders (+ orders-detail), adjustments, clients, users/auth, and a dashboard that aggregates KPIs and suggested actions.

## Commands

Run from the repo root (orchestrates both apps):
- `npm run start` — starts Postgres via docker-compose, then runs backend (`start:dev`) and frontend (`ng serve`) concurrently.
- `npm run stop` — stops the docker-compose Postgres container.
- `npm run back` / `npm run front` — run only one side.

Backend (`cd backend`):
- `npm run start:dev` — Nest in watch mode (http://localhost:3000).
- `npm run build` — `nest build`.
- `npm run lint` — ESLint with `--fix` over `src`, `apps`, `libs`, `test`.
- `npm run test` — Jest unit tests (config lives inside `backend/package.json`, rootDir `src`, pattern `*.spec.ts`).
- `npm test -- <path or -t pattern>` — run a single spec file or test by name, e.g. `npx jest src/products/service/products.service.spec.ts`.
- `npm run test:e2e` — e2e tests via `test/jest-e2e.json`.
- `npm run test:cov` — coverage.
- Requires `backend/.env` (see `backend/.env.example`) with Postgres, JWT, bcrypt cost, and SMTP settings. `docker-compose.yml` in `backend/` provisions the Postgres container (port 5434 host → 5432 container).

Frontend (`cd frontend`):
- `npm start` / `ng serve` — dev server at http://localhost:4200.
- `npm run build` / `ng build --configuration production` — production build (matches CI).
- `npm run test` / `ng test` — Vitest-based unit tests.
- `npm run lint` / `ng lint` — ESLint (angular-eslint).
- `ng generate component path/name` — scaffold a new standalone component consistent with existing structure.

CI (`.github/workflows/ci.yml`) runs, per app: `npm ci`, `npm run lint`, then build (`npm run build` for backend, `npm run build -- --configuration production` for frontend). Commits are linted via commitlint (`@commitlint/config-conventional`) through a Husky pre-commit hook that lints both apps.

## Backend architecture (`backend/src`)

NestJS + TypeORM (Postgres). Each domain is a self-contained module folder (e.g. `products/`, `sales/`, `production/`) following the same internal layering:

- `entities/` — TypeORM entity.
- `dto/request/`, `dto/response/` — class-validator DTOs; `dto/index.ts` re-exports them; module `index.ts` re-exports the module, entity, and public types for cross-module imports (e.g. `import { ProductsModule, Product } from './products'`).
- `repository/*.interface.ts` — defines a `Repository` interface plus a string injection token (e.g. `PRODUCTS_REPOSITORY`); `repository/*.repository.ts` — TypeORM implementation.
- `service/` — injects the repository via the interface token (`@Inject(PRODUCTS_REPOSITORY)` with `import type` for the interface), holds business rules (e.g. not-found handling, cross-module calls like `ProductsService` calling `BatchService`).
- `controller/` — HTTP layer, thin, delegates to the service.
- `*.module.ts` — wires `TypeOrmModule.forFeature([Entity])`, binds the repository token to its implementation, declares controller/providers, and exports what other modules need.

When adding a new domain feature, mirror this exact layout (interface-first repository, DTO split by request/response, barrel `index.ts`) rather than inventing a new structure.

Cross-cutting pieces live in `shared/`:
- `guards/jwt-auth.guard.ts` and `roles.guard.ts` are registered globally in `app.module.ts` via `APP_GUARD` (plus `ThrottlerGuard`), so every route is authenticated and role-checked by default.
- `decorators/public.decorator.ts` (`@Public()`) opts a route out of JWT auth; `decorators/roles.decorator.ts` (`@Roles(...)`) restricts a route to specific `UserRole`s — both read via `Reflector.getAllAndOverride` in the guards.
- `pagination/` defines the shared `PaginatedResult<T>` shape and query-params DTO used by list endpoints across modules.
- `enums/` holds cross-domain enums (`order.enum.ts`, `userRole.enum.ts`, `adjustmentType.enum.ts`).

The `dashboard` module aggregates data from other services rather than owning its own entity; it uses a strategy pattern (`strategies/action-generator.interface.ts`, `produce-action.generator.ts`, `purchase-action.generator.ts`, `composite-action.generator.ts`) to build the list of suggested actions shown on the frontend home dashboard — add new suggestion types as a new `ActionGenerator` rather than branching inside the composite.

`app.module.ts` is the single place where all feature modules and the TypeORM entity list are registered — new domains must be added there. `main.ts` applies global `ValidationPipe` (whitelist + forbid unknown props + transform), `helmet()`, and CORS restricted to `CORS_ORIGIN` (defaults to the Angular dev server).

## Frontend architecture (`frontend/src/app`)

Angular 21, standalone components (no NgModules), lazy-loaded routes (`app.routes.ts`, all pages loaded via `loadComponent`). Angular Material + ng2-charts/chart.js for the dashboard visualizations.

- `pages/<feature>/` — one folder per routed page (`.ts`/`.html`/`.scss`/`.spec.ts`), e.g. `products`, `sales`, `supplies`, `clients`, `production`, `login`.
- `dashboard/` — the home dashboard page plus its `components/` (kpi-card, action-list, weekly-chart, product-stock-bars, top-selling-list) — each a small standalone component consuming data shaped by `models/dashboard.model.ts`.
- `services/` — one Angular service per backend domain (e.g. `products.service.ts`, `sales.service.ts`, `clients.service.ts`), injected with `inject(HttpClient)`, built off `environment.apiUrl` (`environments/environment.ts`). Some services compose multiple backend calls client-side (e.g. `ProductsService.findAllWithStock` fans out per-product `stock-status` requests via `forkJoin` and swallows individual failures with `catchError`).
- `models/` — TypeScript interfaces mirroring backend response DTOs.
- `interceptors/auth.interceptor.ts` — attaches the JWT bearer token to every request and forces logout on `401`; registered in `app.config.ts` via `provideHttpClient(withInterceptors([authInterceptor]))`.
- `shared/navbar/` — shared layout component used across authenticated pages.

When adding a new backend domain that needs a UI, follow the existing pattern: a model in `models/`, a service in `services/` hitting `${environment.apiUrl}/<resource>`, and a page in `pages/<resource>/` registered as a lazy route in `app.routes.ts`.
