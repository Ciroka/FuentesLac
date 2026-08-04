# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

StockAI is a stock/production management system with a NestJS backend and an Angular frontend, backed by PostgreSQL. Domains covered: products, supplies, suppliers, categories, batches, production (+ production-detail + supplies-xproduction-detail), sales (+ sales-detail), orders (+ orders-detail), adjustments, clients, users/auth, audit-log, and a dashboard that aggregates KPIs and suggested actions. User-facing strings (error messages, UI) are in Spanish; the frontend runs under the `es-AR` locale.

## Commands

Run from the repo root (orchestrates both apps):
- `npm run start` — runs frontend and backend concurrently; the `preback` hook brings up the Postgres container first.
- `npm run stop` — stops the docker-compose Postgres container.
- `npm run back` / `npm run front` — run only one side.

Backend (`cd backend`):
- `npm run start:dev` — Nest in watch mode (http://localhost:3000).
- `npm run build` — `nest build`.
- `npm run lint` — ESLint with `--fix` over `src`, `apps`, `libs`, `test`.
- `npm run test` — Jest unit tests (config lives inside `backend/package.json`, rootDir `src`, pattern `*.spec.ts`).
- Single test: `npx jest src/products/service/products.service.spec.ts` or `npm test -- -t "<test name>"`.
- `npm run test:e2e` (config `test/jest-e2e.json`), `npm run test:cov`.

Frontend (`cd frontend`):
- `npm start` / `ng serve` — dev server at http://localhost:4200.
- `npm run build` — **development** build. The production build (what CI runs) is `npm run build -- --configuration production`; only that configuration swaps `environments/environment.ts` for `environment.prod.ts` via `fileReplacements`, so a plain `npm run build` keeps pointing at `http://localhost:3000`.
- `npm run test` / `ng test` — unit tests via the `@angular/build:unit-test` builder (Vitest + jsdom). Single file: `ng test -- src/app/services/auth.service.spec.ts`.
- `npm run lint` / `ng lint` — ESLint over `src/**/*.ts` and `src/**/*.html`.
- `ng generate component pages/name` — scaffolds a standalone component consistent with existing structure.

CI (`.github/workflows/ci.yml`) runs per app on push/PR to `main` and `develop`: `npm ci`, `npm run lint`, `npm run test`, then build. Husky hooks: `pre-commit` lints **both** apps; `commit-msg` runs commitlint (`@commitlint/config-conventional`), so commit subjects must follow Conventional Commits.

## Environment and database

`backend/.env` is required (see `backend/.env.example`): Postgres connection, `BCRYPT_COST`, JWT/refresh-token settings, SMTP (password recovery), and `R2_*` (Cloudflare R2 object storage). `docker-compose.yml` in `backend/` provisions Postgres on host port **5434** → container 5432, reading credentials from the same `.env`.

Two things to keep in mind about schema management:
- There are **no TypeORM migrations**. `synchronize` is enabled only when `NODE_ENV=development`, so entity changes propagate automatically in dev and must be applied by hand elsewhere.
- `ConfigModule`'s Joi schema only *requires* `NODE_ENV`, but `app.module.ts` and `StorageService` use `getOrThrow` for `POSTGRES_*` and `R2_*` — a missing one fails at boot, not at validation.
- When `POSTGRES_SSL=true`, TypeORM reads the pinned CA from `backend/certs/supabase-ca.crt` (relative to `process.cwd()`), which is how the Supabase-hosted database connects.

## Backend architecture (`backend/src`)

NestJS + TypeORM (Postgres). Each domain is a self-contained module folder (e.g. `products/`, `sales/`, `production/`) following the same internal layering:

- `entities/` — TypeORM entity.
- `dto/request/`, `dto/response/` — class-validator DTOs; `dto/index.ts` re-exports them; module `index.ts` re-exports the module, entity, and public types for cross-module imports (e.g. `import { ProductsModule, Product } from './products'`).
- `repository/*.interface.ts` — defines a `Repository` interface plus a string injection token (e.g. `PRODUCTS_REPOSITORY`); `repository/*.repository.ts` — TypeORM implementation.
- `service/` — injects the repository via the interface token (`@Inject(PRODUCTS_REPOSITORY)` with `import type` for the interface), holds business rules (not-found handling, cross-module calls like `ProductsService` calling `BatchService`).
- `controller/` — HTTP layer, thin, delegates to the service.
- `*.module.ts` — wires `TypeOrmModule.forFeature([Entity])`, binds the repository token to its implementation, declares controller/providers, and exports what other modules need.

When adding a new domain feature, mirror this exact layout (interface-first repository, DTO split by request/response, barrel `index.ts`) rather than inventing a new structure.

`app.module.ts` is the single place where all feature modules and the TypeORM entity list are registered — new domains must be added in both spots. It also registers `ScheduleModule.forRoot()` for cron jobs (e.g. `AuthService.purgeExpiredRefreshTokens` runs `@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)`) and the global `ThrottlerModule` (100 req/min). `main.ts` applies a global `ValidationPipe` (whitelist + forbid unknown props + transform), `helmet()`, `cookieParser()`, and CORS restricted to `CORS_ORIGIN` (defaults to the Angular dev server) with `credentials: true`.

### Globally registered cross-cutting providers

Four providers apply to every route without per-controller wiring — check these before adding a decorator or assuming a request is unhandled:
- `JwtAuthGuard` + `RolesGuard` + `ThrottlerGuard` (`APP_GUARD` in `app.module.ts`) — every route is authenticated and role-checked by default. `@Public()` (`shared/decorators/public.decorator.ts`) opts out of JWT auth; `@Roles(...)` (`shared/decorators/roles.decorator.ts`) restricts to specific `UserRole`s — both read via `Reflector.getAllAndOverride`.
- `QueryFailedFilter` (`APP_FILTER`, `shared/filters/query-failed.filter.ts`) — converts Postgres foreign-key violations (`23503`) into a 409 instead of a generic 500. It extends `BaseExceptionFilter` and delegates to `super.catch()` rather than re-throwing; a `throw` inside a Nest exception filter hangs the request (see the comment in the file before changing it).
- `AuditLogInterceptor` (`APP_INTERCEPTOR`, registered inside `AuditLogModule`) — records every successful `POST`/`PATCH`/`DELETE`, plus login/logout, via `AuditLogService`. It is global, so new write endpoints are audited automatically; `/auth/refresh` is explicitly skipped.

Other shared pieces live in `shared/`: `pagination/` (the `PaginatedResult<T>` shape and query-params DTO used by list endpoints) and `enums/` (cross-domain enums — `order.enum.ts`, `orderStatus.enum.ts`, `userRole.enum.ts`, `adjustmentType.enum.ts`, `auditAction.enum.ts`).

### Auth

Auth uses httpOnly cookies, **not** a bearer header: `JwtStrategy` (`auth/strategies/jwt.strategy.ts`) reads the JWT from `req.cookies.access_token`; refresh tokens are persisted in `auth/entities/refresh-token.entity.ts` and rotated via `POST /auth/refresh`. Sensitive endpoints (`login`, `forgot-password`, `reset-password`, `me/password`) carry an explicit `@Throttle({ default: { limit: 5, ttl: 60000 } })` tighter than the global default.

### Stock mutation and transactions

Stock-mutating writes (`supplies`, `batch` repositories) use a guarded conditional SQL `UPDATE ... WHERE id = :id AND current_stock >= :amount`, not a read-modify-write — the repository returns `null` when the `WHERE` clause matches zero rows (insufficient stock), and the corresponding service (`SuppliesService`/`BatchService`) turns that into a `BadRequestException`. This makes the check atomic under concurrent writes; don't reintroduce a `findOne` guard before the update.

Services that touch multiple stock rows in one business operation (`production`, `sales`, `orders`, `adjustments`) wrap the whole `create`/`delete` in `this.dataSource.transaction(async (manager) => { ... })` and thread that `manager` through every downstream repository/service call so a partial failure rolls back everything. Every atomic repository method therefore takes an optional `manager?: EntityManager` and does `manager ? manager.getRepository(X) : this.xRepository` — preserve that parameter when adding new stock operations.

### Other modules

- `dashboard/` aggregates data from other services rather than owning an entity; it uses a strategy pattern (`strategies/action-generator.interface.ts`, `produce-action.generator.ts`, `purchase-action.generator.ts`, `composite-action.generator.ts`) to build the suggested-actions list. Add new suggestion types as a new `ActionGenerator` rather than branching inside the composite.
- `storage/` wraps Cloudflare R2 through the AWS S3 SDK (`S3Client` with `region: 'auto'` and `R2_ENDPOINT`). It stores only the object **key** on the entity and resolves it to a URL at read time — a public URL when `R2_PUBLIC_URL` is set, otherwise a 1-hour presigned URL. Currently consumed by `SalesService` for receipt photos, uploaded via `FileInterceptor` with a size limit in `sales.controller.ts`.
- `email-sender/` wraps nodemailer (SMTP env vars) for password-recovery mail.

## Frontend architecture (`frontend/src/app`)

Angular 21, standalone components (no NgModules), lazy-loaded routes (`app.routes.ts`, every page via `loadComponent`). Angular Material + ng2-charts/chart.js for dashboard visualizations, ngx-sonner for toasts.

- `pages/<feature>/` — one folder per routed page (`.ts`/`.html`/`.scss`/`.spec.ts`). Multi-step create flows live in their own routes/pages (`sale-form`, `order-form`, `production-form`) rather than as dialogs inside the list page.
- `dashboard/` — the home dashboard page plus its `components/` (kpi-card, action-list, weekly-chart, product-stock-bars, top-selling-list), each consuming data shaped by `models/dashboard.model.ts`.
- `services/` — one Angular service per backend domain, injected with `inject(HttpClient)`, built off `environment.apiUrl`. Some compose multiple backend calls client-side (e.g. `ProductsService.findAllWithStock` fans out per-product `stock-status` requests via `forkJoin` and swallows individual failures with `catchError`).
- `models/` — TypeScript interfaces mirroring backend response DTOs.
- `guards/` — `auth.guard.ts` (require session), `guest.guard.ts` (require *no* session, used on `login`/`forgot-password`/`reset-password`), `role.guard.ts(role)` (require a specific `UserRole`, used on the admin route) — composed in `app.routes.ts` via `canActivate`/`canActivateChild`.
- `shared/navbar/` — shared layout component used across authenticated pages.

`app.config.ts` holds the app-wide wiring worth knowing about:
- `authInterceptor` (`interceptors/auth.interceptor.ts`) — auth is cookie-based, so every request is cloned with `withCredentials: true` to carry the httpOnly `access_token`. On a `401` it calls `AuthService.refreshToken()` (deduped across concurrent requests via a shared `Observable`) and retries once; if refresh fails it clears the session and redirects to `/login`. `/auth/refresh`, `/auth/login` and `/auth/logout` skip the retry path.
- `provideAppInitializer(() => firstValueFrom(inject(AuthService).restoreSession()))` — the session is restored from the cookie **before** the app bootstraps, which is what lets `authGuard`/`guestGuard` read `currentUser()` synchronously.
- `provideServiceWorker('ngsw-worker.js', { enabled: !isDevMode() })` — the app is a PWA (`ngsw-config.json`); the service worker is inactive in dev, so caching issues only appear in production builds.
- `LOCALE_ID: 'es-AR'` with `registerLocaleData(localeEsAr)` — date/number pipes format Argentine-style.

`ThemeService` (`services/theme.service.ts`) keeps light/dark in a signal, persists it to `localStorage`, and applies it as a `data-theme` attribute on `<html>` — component styles should hook into that attribute rather than `prefers-color-scheme` directly (the media query is only the initial fallback).

When adding a new backend domain that needs a UI, follow the existing pattern: a model in `models/`, a service in `services/` hitting `${environment.apiUrl}/<resource>`, and a page in `pages/<resource>/` registered as a lazy route in `app.routes.ts`.
