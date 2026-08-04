# Lotes con rendimiento, fixes mobile, Safari y validaciones — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a read-only "Lotes" page showing batch yield, fix the mobile layout of Insumos and the global page gutter, fix a login bug specific to Safari, fix a sale price validation bug, and add descriptive validation messages to forms that today only turn red with no explanation.

**Architecture:** Backend changes follow the existing `QueryParams`/`PaginatedResult<T>` pattern already used by `products`/`production` (interface-first repository, DTO split by request/response). Frontend changes follow the existing page/service/model layering (`pages/<feature>/`, one service per domain, lazy route). No new libraries.

**Tech Stack:** NestJS + TypeORM (backend), Angular 21 standalone components + Angular Material (frontend). No new dependencies.

## Global Constraints

- Backend: mirror the exact `QueryParams extends` + `PaginatedResult<T>` pattern already used by `products`/`production` — do not invent a new pagination shape.
- Frontend: mirror the exact page structure of `pages/production/` (signals for `page`/`total`, `findPage`/`findAll` split on the service) — do not invent a new list-page pattern.
- No new npm dependencies for any of this work.
- Spanish (Argentina, "vos") for all user-facing strings, consistent with the rest of the app.
- Every task that touches a `.ts`/`.html` file must pass `npm run lint` in its respective app (`backend`/`frontend`) before committing.

**Design decisions carried through every frontend task below** (informed by the `frontend-design`, `ui-ux-pro-max`, and `emil-design-eng` skills):
- Every `<mat-error aria-live="polite">` added in Tasks 10/11 gets `aria-live="polite"` explicitly. Verified directly against the installed `@angular/material@21.2.11` bundle (`node_modules/@angular/material/fesm2022/_form-field-chunk.mjs`): `MatError`'s host metadata only sets `class`/`id`, no `role="alert"` or `aria-live` — so without this, the message is visible but never announced to a screen reader (a real, checked gap, not an assumption).
- The expand/collapse animation reused in Tasks 6/7 (`max-height` transition, `0.3s ease`) is intentionally left byte-for-byte identical to the existing one in `production.scss`/`sales.scss`, even though a stricter read of animation best practice would prefer animating `transform`/`opacity` over `max-height` and `ease-out` over `ease` for an entering panel. Cohesion across the three tables (Producción, Ventas, and now Lotes/Insumos) outweighs a locally "more correct" animation that would make one table feel different from the other three. Not a checklist miss — a deliberate call.
- The yield/rendimiento percentage in Task 6 is shown as plain right-aligned numeric text (`—` when null), with no red/yellow/green threshold coloring. A performance-vs-target chart or gauge only makes sense with a defined target value, and no yield threshold (what counts as a "good" vs "bad" cheese yield) was specified — inventing one would be a fabricated business rule, not a design decision.

---

### Task 1: Backend — `SortByBatch` enum, `QueryParamsBatch` DTO, and paginated/filterable `BatchRepository.findAll`

**Files:**
- Create: `backend/src/batch/enums/sort-by.enum.ts`
- Create: `backend/src/batch/dto/request/params-batch.dto.ts`
- Modify: `backend/src/batch/dto/index.ts`
- Modify: `backend/src/batch/repository/batch.repository.interface.ts`
- Modify: `backend/src/batch/repository/batch.repository.ts`

**Interfaces:**
- Produces: `SortByBatch.YIELD = 'yield'`; `QueryParamsBatch extends QueryParams { productId?: number; sortBy?: SortByBatch }`; `IBatchRepository.findAll(page: number, limit: number, order: OrderEnum, sortBy?: SortByBatch, productId?: number): Promise<PaginatedResult<Batch>>` — Task 2 consumes this exact signature.

There is no existing convention in this codebase for unit-testing TypeORM query builders directly (zero `*.repository.spec.ts` files exist anywhere in `backend/src`, including for `products`/`production` which use the same query-builder pattern). This task is verified by a manual `curl` check instead of a new Jest file, matching that existing convention; the passthrough from service to repository is what gets a real unit test, in Task 2.

- [ ] **Step 1: Create the `SortByBatch` enum**

```typescript
// backend/src/batch/enums/sort-by.enum.ts
export enum SortByBatch {
  YIELD = 'yield',
}
```

- [ ] **Step 2: Create the `QueryParamsBatch` DTO**

```typescript
// backend/src/batch/dto/request/params-batch.dto.ts
import { IsEnum, IsInt, IsOptional, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

import { QueryParams } from '../../../shared/pagination/query-params.dto';
import { SortByBatch } from '../../enums/sort-by.enum';

export class QueryParamsBatch extends QueryParams {
  @IsOptional()
  @IsEnum(SortByBatch)
  sortBy?: SortByBatch;

  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  productId?: number;
}
```

- [ ] **Step 3: Export the new DTO from the module's barrel**

```typescript
// backend/src/batch/dto/index.ts
export * from './request/create-batch.dto';
export * from './request/update-batch.dto';
export * from './request/params-batch.dto';
export * from './response/batch-response.dto';
```

- [ ] **Step 4: Update the repository interface**

```typescript
// backend/src/batch/repository/batch.repository.interface.ts
import { EntityManager } from 'typeorm';
import { Batch } from '../entities/batch.entity';
import { PaginatedResult } from '../../shared/pagination/pagination.type';
import { OrderEnum } from '../../shared/enums/order.enum';
import { SortByBatch } from '../enums/sort-by.enum';

export const BATCH_REPOSITORY = 'BATCH_REPOSITORY';

export interface IBatchRepository {
  findAll(
    page: number,
    limit: number,
    order: OrderEnum,
    sortBy?: SortByBatch,
    productId?: number,
  ): Promise<PaginatedResult<Batch>>;
  findOneById(id: number, manager?: EntityManager): Promise<Batch | null>;
  create(input: Partial<Batch>, manager?: EntityManager): Promise<Batch>;
  update(batch: Partial<Batch>, manager?: EntityManager): Promise<Batch>;
  remove(batch: Batch): Promise<Batch>;
  decreaseStockAtomic(
    id: number,
    amount: number,
    manager?: EntityManager,
  ): Promise<Batch | null>;
  increaseStockAtomic(
    id: number,
    amount: number,
    manager?: EntityManager,
  ): Promise<Batch | null>;
  sumStockByProductId(productId: number): Promise<number>;
}
```

- [ ] **Step 5: Implement the paginated/filtered/sorted `findAll` in the repository**

Replace the existing `findAll(): Promise<Batch[]> { return this.batchRepository.find(); }` with:

```typescript
// backend/src/batch/repository/batch.repository.ts — add these imports at the top
import { PaginatedResult } from '../../shared/pagination/pagination.type';
import { OrderEnum } from '../../shared/enums/order.enum';
import { SortByBatch } from '../enums/sort-by.enum';
```

```typescript
// backend/src/batch/repository/batch.repository.ts — replace findAll
async findAll(
  page: number,
  limit: number,
  order: OrderEnum,
  sortBy?: SortByBatch,
  productId?: number,
): Promise<PaginatedResult<Batch>> {
  const query = this.batchRepository
    .createQueryBuilder('batch')
    .leftJoinAndSelect('batch.product', 'product');

  if (productId) {
    query.andWhere('batch.productId = :productId', { productId });
  }

  if (sortBy) {
    query.orderBy(`batch.${sortBy}`, order, 'NULLS LAST');
  }

  const offset = (page - 1) * limit;
  const [items, total] = await query
    .take(limit)
    .skip(offset)
    .getManyAndCount();

  return { items, total, page, limit };
}
```

`orderBy(sort, order, nulls)` is TypeORM's 3-argument overload (confirmed present in the installed `typeorm@1.1.0`'s `SelectQueryBuilder.d.ts`) — batches that haven't sold anything yet have `yield = null` and must sort to the end regardless of ASC/DESC, not to the top.

- [ ] **Step 6: Manual verification (no automated repository test — see rationale above)**

Run: `cd backend && npm run start:dev`, then in another terminal:

```bash
curl "http://localhost:3000/batch?page=1&limit=5&sortBy=yield&order=DESC" -H "Cookie: access_token=<a-valid-token-from-your-browser-session>"
```

Expected: JSON with `items` (each including a nested `product` object), `total`, `page`, `limit`. Batches with a non-null `yield` appear first in descending order; batches with `yield: null` appear after them, in any order. Repeat with `productId=<some-id>` and confirm every returned item has that `productId`.

- [ ] **Step 7: Commit**

```bash
git add backend/src/batch/enums/sort-by.enum.ts backend/src/batch/dto/request/params-batch.dto.ts backend/src/batch/dto/index.ts backend/src/batch/repository/batch.repository.interface.ts backend/src/batch/repository/batch.repository.ts
git commit -m "feat(batch): pagina, filtra por producto y ordena por rendimiento en el repositorio"
```

---

### Task 2: Backend — `BatchService.findAll` passthrough

**Files:**
- Modify: `backend/src/batch/service/batch.service.ts`
- Modify: `backend/src/batch/service/batch.service.spec.ts`

**Interfaces:**
- Consumes: `IBatchRepository.findAll(page, limit, order, sortBy?, productId?)` from Task 1.
- Produces: `BatchService.findAll(params: QueryParamsBatch): Promise<PaginatedResult<Batch>>` — Task 3's controller consumes this exact signature.

- [ ] **Step 1: Write the failing test**

Add to `backend/src/batch/service/batch.service.spec.ts`, inside the existing `describe('BatchService', ...)` block (after the `increaseStock` describe block), and add `findAll: jest.Mock` to the `batchRepository` object built in `beforeEach`:

```typescript
// batchRepository object in beforeEach — add this key alongside the existing two:
    batchRepository = {
      findAll: jest.fn(),
      decreaseStockAtomic: jest.fn(),
      increaseStockAtomic: jest.fn(),
    };
```

```typescript
  describe('findAll', () => {
    it('passes the destructured query params through to the repository', async () => {
      const paginated = { items: [], total: 0, page: 2, limit: 5 };
      batchRepository.findAll.mockResolvedValue(paginated);

      const result = await service.findAll({
        page: 2,
        limit: 5,
        order: OrderEnum.DESC,
        sortBy: SortByBatch.YIELD,
        productId: 7,
      } as QueryParamsBatch);

      expect(batchRepository.findAll).toHaveBeenCalledWith(
        2,
        5,
        OrderEnum.DESC,
        SortByBatch.YIELD,
        7,
      );
      expect(result).toBe(paginated);
    });
  });
```

Add the needed imports at the top of the spec file:

```typescript
import { OrderEnum } from 'src/shared/enums/order.enum';
import { SortByBatch } from '../enums/sort-by.enum';
import { QueryParamsBatch } from '../dto';
```

Update the `batchRepository` type annotation above `beforeEach` to include the new mock:

```typescript
  let batchRepository: {
    findAll: jest.Mock;
    decreaseStockAtomic: jest.Mock;
    increaseStockAtomic: jest.Mock;
  };
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && npx jest src/batch/service/batch.service.spec.ts -v`
Expected: FAIL — `service.findAll` does not exist yet (or does not accept this signature).

- [ ] **Step 3: Implement `findAll` in the service**

```typescript
// backend/src/batch/service/batch.service.ts — add these imports
import { PaginatedResult } from 'src/shared/pagination/pagination.type';
import { QueryParamsBatch } from '../dto';
```

```typescript
// backend/src/batch/service/batch.service.ts — add this method (e.g. right after the constructor)
async findAll(params: QueryParamsBatch): Promise<PaginatedResult<Batch>> {
  const { page, limit, order, sortBy, productId } = params;
  return this.batchRepository.findAll(page, limit, order, sortBy, productId);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd backend && npx jest src/batch/service/batch.service.spec.ts -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/src/batch/service/batch.service.ts backend/src/batch/service/batch.service.spec.ts
git commit -m "feat(batch): BatchService.findAll delega los params paginados al repositorio"
```

---

### Task 3: Backend — `BatchResponse.product` and paginated `GET /batch`

**Files:**
- Modify: `backend/src/batch/dto/response/batch-response.dto.ts`
- Modify: `backend/src/batch/controller/batch.controller.ts`
- Modify: `backend/src/batch/controller/batch.controller.spec.ts`

**Interfaces:**
- Consumes: `BatchService.findAll(params: QueryParamsBatch): Promise<PaginatedResult<Batch>>` from Task 2. `Batch.product?: Product` (already on the entity, populated by the join added in Task 1).
- Produces: `GET /batch` now returns `PaginatedResult<BatchResponse>` (was `BatchResponse[]`) — this is the shape Task 6's frontend `BatchService` consumes.

- [ ] **Step 1: Add `product` to `BatchResponse` and `toBatchResponse`**

```typescript
// backend/src/batch/dto/response/batch-response.dto.ts — full replacement
import { Batch } from '../../entities/batch.entity';

export interface BatchResponse {
  id: number;
  yield?: number;
  description?: string;
  currentStock: number;
  milkLitersUsed?: number;
  obtainedWeight?: number;
  clientBatchDate?: Date;
  clientBatchCode?: string;
  productId: number;
  product?: { id: number; name: string };
}

export function toBatchResponse(batch: Batch): BatchResponse {
  return {
    id: batch.id,
    yield: batch.yield,
    description: batch.description,
    currentStock: batch.currentStock,
    milkLitersUsed: batch.milkLitersUsed,
    obtainedWeight: batch.obtainedWeight,
    clientBatchDate: batch.clientBatchDate,
    clientBatchCode: batch.clientBatchDate
      ? formatClientBatchCode(batch.clientBatchDate)
      : undefined,
    productId: batch.productId,
    product: batch.product
      ? { id: batch.product.id, name: batch.product.name }
      : undefined,
  };
}

function formatClientBatchCode(date: Date): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}
```

- [ ] **Step 2: Write the failing controller test**

Add to `backend/src/batch/controller/batch.controller.spec.ts` (new imports plus a new `it` block):

```typescript
import { BatchController } from './batch.controller';
import { BatchService } from '../service/batch.service';
import { BATCH_REPOSITORY } from '../repository/batch.repository.interface';
import { SalesDetailService } from 'src/sales-detail/service/sales-detail.service';
import { OrderEnum } from 'src/shared/enums/order.enum';
import { QueryParamsBatch } from '../dto';
```

```typescript
  it('findAll maps repository items through toBatchResponse and keeps pagination fields', async () => {
    const batch = {
      id: 1,
      currentStock: 10,
      productId: 5,
      yield: 0.12,
      product: { id: 5, name: 'Queso cremoso' },
    };
    (batchRepository as { findAll: jest.Mock }).findAll = jest
      .fn()
      .mockResolvedValue({ items: [batch], total: 1, page: 1, limit: 10 });

    const params: QueryParamsBatch = { page: 1, limit: 10, order: OrderEnum.ASC };
    const result = await controller.findAll(params);

    expect(result).toEqual({
      items: [
        {
          id: 1,
          yield: 0.12,
          description: undefined,
          currentStock: 10,
          milkLitersUsed: undefined,
          obtainedWeight: undefined,
          clientBatchDate: undefined,
          clientBatchCode: undefined,
          productId: 5,
          product: { id: 5, name: 'Queso cremoso' },
        },
      ],
      total: 1,
      page: 1,
      limit: 10,
    });
  });
```

`batchRepository` in this file is currently declared inline as `{ provide: BATCH_REPOSITORY, useValue: {} }` inside the `providers` array with no named variable — change that line so the object is assigned to a `const batchRepository = {};` declared before `Test.createTestingModule(...)`, and reference `{ provide: BATCH_REPOSITORY, useValue: batchRepository }` in `providers`, so the test above can attach `findAll` to it.

- [ ] **Step 3: Run test to verify it fails**

Run: `cd backend && npx jest src/batch/controller/batch.controller.spec.ts -v`
Expected: FAIL — `controller.findAll` does not accept a `QueryParamsBatch` argument yet / returns the wrong shape.

- [ ] **Step 4: Update the controller**

```typescript
// backend/src/batch/controller/batch.controller.ts — full replacement
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { BatchService } from '../service/batch.service';
import {
  BatchResponse,
  CreateBatchDto,
  QueryParamsBatch,
  toBatchResponse,
} from '../dto';
import { PaginatedResult } from 'src/shared/pagination/pagination.type';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { UserRole } from 'src/shared/enums';
import { Batch } from '../entities/batch.entity';

@Controller('batch')
export class BatchController {
  constructor(private readonly batchService: BatchService) {}

  @Get()
  async findAll(
    @Query() params: QueryParamsBatch,
  ): Promise<PaginatedResult<BatchResponse>> {
    const result = await this.batchService.findAll(params);
    return { ...result, items: result.items.map(toBatchResponse) };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<BatchResponse> {
    const batch = await this.batchService.findOne(id);
    return toBatchResponse(batch);
  }

  @Roles(UserRole.ADMIN)
  @Post()
  async create(@Body() dto: CreateBatchDto): Promise<BatchResponse> {
    const input: Partial<Batch> = {
      ...dto,
      clientBatchDate: dto.clientBatchDate
        ? new Date(dto.clientBatchDate)
        : undefined,
    };
    const batch = await this.batchService.create(input);
    return toBatchResponse(batch);
  }

  @Roles(UserRole.ADMIN)
  @Post(':id/recalculate-yield')
  async recalculate(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<BatchResponse> {
    const batch = await this.batchService.recalculateYield(id);
    return toBatchResponse(batch);
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<BatchResponse> {
    const batch = await this.batchService.remove(id);
    return toBatchResponse(batch);
  }
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd backend && npx jest src/batch/controller/batch.controller.spec.ts -v`
Expected: PASS

- [ ] **Step 6: Run the full backend suite and lint**

Run: `cd backend && npm run lint && npm run test`
Expected: all pass (no errors; pre-existing warnings unrelated to this change are fine).

- [ ] **Step 7: Commit**

```bash
git add backend/src/batch/dto/response/batch-response.dto.ts backend/src/batch/controller/batch.controller.ts backend/src/batch/controller/batch.controller.spec.ts
git commit -m "feat(batch): GET /batch paginado devuelve product embebido"
```

---

### Task 4: Backend — accept the sale's default unit price without the user touching it

**Files:**
- Modify: `backend/src/sales-detail/dto/request/create-sales-detail.dto.ts`
- Create: `backend/src/sales-detail/dto/request/create-sales-detail.dto.spec.ts`

**Interfaces:**
- Produces: `CreateSalesDetailDto.unitPrice` now coerces incoming strings to numbers before validating — no other module depends on this type change (it's a leaf DTO field consumed only by `SalesService.create`, which already does `item.unitPrice ?? batch.product.salePrice`).

The bug lives entirely at the class-validator boundary (a string arrives, `@IsNumber()` rejects it before the DTO ever reaches `SalesService`), so this is tested directly at that boundary with `class-transformer`'s `plainToInstance` + `class-validator`'s `validate`, not through `SalesService` (which never sees an invalid value either way — Nest's `ValidationPipe` rejects the request before the service runs).

- [ ] **Step 1: Write the failing test**

```typescript
// backend/src/sales-detail/dto/request/create-sales-detail.dto.spec.ts (new file)
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateSalesDetailDto } from './create-sales-detail.dto';

describe('CreateSalesDetailDto', () => {
  it('accepts unitPrice sent as a numeric string, coercing it to a number', async () => {
    const dto = plainToInstance(CreateSalesDetailDto, {
      quantity: 2,
      batchId: 1,
      unitPrice: '150.50',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.unitPrice).toBe(150.5);
  });

  it('still rejects a negative unitPrice', async () => {
    const dto = plainToInstance(CreateSalesDetailDto, {
      quantity: 2,
      batchId: 1,
      unitPrice: '-10',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('unitPrice');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && npx jest src/sales-detail/dto/request/create-sales-detail.dto.spec.ts -v`
Expected: FAIL on the first test — `errors` is non-empty (`unitPrice` fails `@IsNumber()` because it's still a string `'150.50'`), and/or `dto.unitPrice` is still the string. The second test (negative price) passes already, since `@IsPositive()` already rejects it regardless of this fix.

- [ ] **Step 3: Add the fix**

```typescript
// backend/src/sales-detail/dto/request/create-sales-detail.dto.ts — full replacement
import { IsInt, IsNumber, IsOptional, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSalesDetailDto {
  @IsInt()
  @IsPositive()
  quantity!: number;

  @IsInt()
  @IsPositive()
  batchId!: number;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  weight?: number;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  @IsOptional()
  unitPrice?: number;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd backend && npx jest src/sales-detail/dto/request/create-sales-detail.dto.spec.ts -v`
Expected: PASS

- [ ] **Step 5: Run the full backend suite and lint**

Run: `cd backend && npm run lint && npm run test`
Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add backend/src/sales-detail/dto/request/create-sales-detail.dto.ts backend/src/sales-detail/dto/request/create-sales-detail.dto.spec.ts
git commit -m "fix(sales): acepta el precio unitario por defecto sin que el usuario lo toque

Product.salePrice es una columna decimal de TypeORM y llega como string
desde Postgres; @IsNumber() sin @Type(() => Number) la rechazaba con 400
a menos que el usuario editara el input (lo que fuerza la coercion a
number del lado del navegador)."
```

---

### Task 5: Frontend — `Batch` model and `BatchService.findPage`

**Files:**
- Modify: `frontend/src/app/models/batch.model.ts`
- Modify: `frontend/src/app/services/batch.service.ts`
- Create: `frontend/src/app/services/batch.service.spec.ts`

**Interfaces:**
- Produces: `Batch.product?: { id: number; name: string }`; `BatchService.findPage(page = 1, limit = 10, opts?: { productId?: number | null; sortBy?: 'yield'; order?: 'ASC' | 'DESC' }): Observable<PaginatedBatch>`; `PaginatedBatch { items: Batch[]; total: number; page: number; limit: number }` — Task 6's `Batches` component consumes these exact names.
- `BatchService.findAll(limit = 1000): Observable<Batch[]>` keeps its existing signature (still used by `sale-form.ts`, untouched).

- [ ] **Step 1: Add `product` to the `Batch` model**

```typescript
// frontend/src/app/models/batch.model.ts — full replacement
export interface Batch {
  id: number;
  yield?: number;
  description?: string;
  currentStock: number;
  milkLitersUsed?: number;
  obtainedWeight?: number;
  clientBatchDate?: string;
  clientBatchCode?: string;
  productId: number;
  product?: { id: number; name: string };
}
```

- [ ] **Step 2: Write the failing tests**

```typescript
// frontend/src/app/services/batch.service.spec.ts (new file)
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { BatchService } from './batch.service';
import { environment } from '../../environments/environment';

describe('BatchService', () => {
  let service: BatchService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(BatchService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('findAll unwraps the paginated items', () => {
    let result: unknown;
    service.findAll().subscribe(res => (result = res));

    httpMock
      .expectOne(`${environment.apiUrl}/batch?limit=1000`)
      .flush({ items: [{ id: 1, currentStock: 5, productId: 1 }], total: 1, page: 1, limit: 1000 });

    expect(result).toEqual([{ id: 1, currentStock: 5, productId: 1 }]);
  });

  it('findPage sends productId, sortBy and order as query params', () => {
    let result: unknown;
    service.findPage(2, 10, { productId: 3, sortBy: 'yield', order: 'DESC' }).subscribe(res => (result = res));

    const req = httpMock.expectOne(
      `${environment.apiUrl}/batch?page=2&limit=10&productId=3&sortBy=yield&order=DESC`
    );
    req.flush({ items: [], total: 0, page: 2, limit: 10 });

    expect(result).toEqual({ items: [], total: 0, page: 2, limit: 10 });
  });

  it('findPage omits productId/sortBy/order when not provided', () => {
    service.findPage().subscribe();

    httpMock
      .expectOne(`${environment.apiUrl}/batch?page=1&limit=10`)
      .flush({ items: [], total: 0, page: 1, limit: 10 });
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `cd frontend && ng test -- src/app/services/batch.service.spec.ts`
Expected: FAIL — `findPage` does not exist yet, and `findAll` still hits `/batch?limit=1000` but doesn't unwrap `.items` from a `PaginatedBatch` (or the request URL doesn't match if `findAll` isn't implemented against the same endpoint shape).

- [ ] **Step 4: Implement the service**

```typescript
// frontend/src/app/services/batch.service.ts — full replacement
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Batch } from '../models/batch.model';
import { environment } from '../../environments/environment';

export interface PaginatedBatch {
  items: Batch[];
  total: number;
  page: number;
  limit: number;
}

export interface BatchQueryOptions {
  productId?: number | null;
  sortBy?: 'yield';
  order?: 'ASC' | 'DESC';
}

@Injectable({
  providedIn: 'root'
})
export class BatchService {
  private api = `${environment.apiUrl}/batch`;
  private readonly http = inject(HttpClient);

  findAll(limit = 1000): Observable<Batch[]> {
    return this.http.get<PaginatedBatch>(`${this.api}?limit=${limit}`).pipe(
      map(res => res.items)
    );
  }

  findPage(page = 1, limit = 10, opts: BatchQueryOptions = {}): Observable<PaginatedBatch> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (opts.productId != null) params = params.set('productId', opts.productId);
    if (opts.sortBy) params = params.set('sortBy', opts.sortBy);
    if (opts.order) params = params.set('order', opts.order);

    return this.http.get<PaginatedBatch>(this.api, { params });
  }
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd frontend && ng test -- src/app/services/batch.service.spec.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add frontend/src/app/models/batch.model.ts frontend/src/app/services/batch.service.ts frontend/src/app/services/batch.service.spec.ts
git commit -m "feat(batch): BatchService.findPage con filtro por producto y orden por rendimiento"
```

---

### Task 6: Frontend — `/lotes` page, route, and navbar entry

**Files:**
- Create: `frontend/src/app/pages/batches/batches.ts`
- Create: `frontend/src/app/pages/batches/batches.html`
- Create: `frontend/src/app/pages/batches/batches.scss`
- Create: `frontend/src/app/pages/batches/batches.spec.ts`
- Modify: `frontend/src/app/app.routes.ts`
- Modify: `frontend/src/app/shared/navbar/navbar.html`

**Interfaces:**
- Consumes: `BatchService.findPage`/`findAll` and `PaginatedBatch` from Task 5; `ProductsService.findAll()` (existing, `frontend/src/app/services/products.service.ts`); `Batch`/`Product` models.

- [ ] **Step 1: Create the component class**

```typescript
// frontend/src/app/pages/batches/batches.ts
import { Component, OnInit, ChangeDetectorRef, inject, signal } from '@angular/core';
import { Navbar } from '../../shared/navbar/navbar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BatchService } from '../../services/batch.service';
import { ProductsService } from '../../services/products.service';
import { Batch } from '../../models/batch.model';
import { Product } from '../../models/product.model';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-batches',
  standalone: true,
  imports: [
    Navbar, CommonModule, FormsModule,
    MatTableModule, MatFormFieldModule, MatSelectModule, MatOptionModule,
    MatIconModule, MatButtonModule, MatTooltipModule,
  ],
  templateUrl: './batches.html',
  styleUrl: './batches.scss',
})
export class Batches implements OnInit {
  private batchService = inject(BatchService);
  private productsService = inject(ProductsService);
  private cdr = inject(ChangeDetectorRef);

  readonly limit = 10;

  lotes: Batch[] = [];
  products: Product[] = [];
  page = signal(1);
  total = signal(0);
  selectedProductId: number | null = null;
  sortOrder: 'ASC' | 'DESC' = 'DESC';

  private expandedIds = new Set<number>();

  displayedColumns = ['toggle', 'product', 'clientBatchCode', 'yield', 'currentStock'];

  ngOnInit(): void {
    this.productsService.findAll().subscribe(products => {
      this.products = products;
      this.cdr.detectChanges();
    });
    this.loadLotes();
  }

  loadLotes(): void {
    this.batchService
      .findPage(this.page(), this.limit, {
        productId: this.selectedProductId,
        sortBy: 'yield',
        order: this.sortOrder,
      })
      .subscribe({
        next: (res) => {
          this.lotes = res.items;
          this.total.set(res.total);
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error al traer lotes:', err)
      });
  }

  onFilterChange(): void {
    this.page.set(1);
    this.loadLotes();
  }

  toggleSortOrder(): void {
    this.sortOrder = this.sortOrder === 'DESC' ? 'ASC' : 'DESC';
    this.onFilterChange();
  }

  nextPage(): void {
    if (this.page() * this.limit >= this.total()) return;
    this.page.update(p => p + 1);
    this.loadLotes();
  }

  prevPage(): void {
    if (this.page() <= 1) return;
    this.page.update(p => p - 1);
    this.loadLotes();
  }

  toggleDetail(batch: Batch): void {
    if (this.expandedIds.has(batch.id)) {
      this.expandedIds.delete(batch.id);
    } else {
      this.expandedIds.add(batch.id);
    }
  }

  isExpanded(id: number): boolean {
    return this.expandedIds.has(id);
  }

  formatYield(batch: Batch): string {
    return batch.yield != null ? `${(batch.yield * 100).toFixed(1)}%` : '—';
  }
}
```

- [ ] **Step 2: Create the template**

```html
<!-- frontend/src/app/pages/batches/batches.html -->
<div><app-navbar></app-navbar></div>

<main class="contenido page-enter">

  <div class="view-header">
    <h2>Lotes</h2>
  </div>

  <div class="search-row">
    <mat-form-field appearance="outline" class="category-field">
      <mat-label>Producto</mat-label>
      <mat-select [(ngModel)]="selectedProductId" (ngModelChange)="onFilterChange()">
        <mat-option [value]="null">Todos los productos</mat-option>
        @for (p of products; track p.id) {
          <mat-option [value]="p.id">{{ p.name }}</mat-option>
        }
      </mat-select>
    </mat-form-field>

    <button mat-stroked-button type="button" (click)="toggleSortOrder()"
            [matTooltip]="sortOrder === 'DESC' ? 'Ordenar de menor a mayor' : 'Ordenar de mayor a menor'">
      <mat-icon>{{ sortOrder === 'DESC' ? 'arrow_downward' : 'arrow_upward' }}</mat-icon>
      Rendimiento
    </button>
  </div>

  @if (lotes.length === 0) {
    <div class="empty-state">
      <mat-icon>search_off</mat-icon>
      <div class="empty-state-title">Sin resultados</div>
      <div class="empty-state-sub">No hay lotes que coincidan con el producto seleccionado.</div>
    </div>
  } @else {
    <div class="mat-elevation-z2 table-container">
      <table mat-table [dataSource]="lotes" multiTemplateDataRows>
        <ng-container matColumnDef="toggle">
          <th mat-header-cell *matHeaderCellDef class="col-toggle"></th>
          <td mat-cell *matCellDef="let lote" class="col-toggle">
            <button mat-icon-button class="toggle-btn"
                    (click)="$event.stopPropagation(); toggleDetail(lote)"
                    [matTooltip]="isExpanded(lote.id) ? 'Colapsar' : 'Expandir'"
                    [attr.aria-label]="isExpanded(lote.id) ? 'Colapsar detalles' : 'Expandir detalles'">
              <mat-icon>{{ isExpanded(lote.id) ? 'expand_less' : 'expand_more' }}</mat-icon>
            </button>
          </td>
        </ng-container>

        <ng-container matColumnDef="product">
          <th mat-header-cell *matHeaderCellDef>Producto</th>
          <td mat-cell *matCellDef="let lote">{{ lote.product?.name ?? '—' }}</td>
        </ng-container>

        <ng-container matColumnDef="clientBatchCode">
          <th mat-header-cell *matHeaderCellDef>Lote</th>
          <td mat-cell *matCellDef="let lote">{{ lote.clientBatchCode ?? lote.id }}</td>
        </ng-container>

        <ng-container matColumnDef="yield">
          <th mat-header-cell *matHeaderCellDef class="num">Rendimiento</th>
          <td mat-cell *matCellDef="let lote" class="num">{{ formatYield(lote) }}</td>
        </ng-container>

        <ng-container matColumnDef="currentStock">
          <th mat-header-cell *matHeaderCellDef class="num">Stock actual</th>
          <td mat-cell *matCellDef="let lote" class="num">{{ lote.currentStock | number }}</td>
        </ng-container>

        <ng-container matColumnDef="expandedDetail">
          <td mat-cell *matCellDef="let lote" [attr.colspan]="displayedColumns.length" class="detail-cell">
            <div class="detail-panel" [class.detail-panel-open]="isExpanded(lote.id)">
              <table class="detail-table">
                <thead>
                  <tr>
                    <th>Litros de leche usados</th>
                    <th>Peso obtenido</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{{ lote.milkLitersUsed != null ? (lote.milkLitersUsed | number) + ' L' : '—' }}</td>
                    <td>{{ lote.obtainedWeight != null ? (lote.obtainedWeight | number) + ' kg' : '—' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"
            [class.expanded-row]="isExpanded(row.id)"
            (click)="toggleDetail(row)"></tr>
        <tr mat-row *matRowDef="let row; columns: ['expandedDetail']"
            class="detail-row"
            [class.detail-row-visible]="isExpanded(row.id)"></tr>
      </table>
    </div>

    <div class="list-pagination">
      <button mat-stroked-button (click)="prevPage()" [disabled]="page() <= 1">Anterior</button>
      <span class="list-page-label">Página {{ page() }}</span>
      <button mat-stroked-button (click)="nextPage()" [disabled]="page() * limit >= total()">Siguiente</button>
    </div>
  }

</main>
```

- [ ] **Step 3: Create the stylesheet**

This is the same `col-toggle`/`detail-row`/`detail-panel`/`detail-table`/`num` block already duplicated in `production.scss` and `sales.scss` in this codebase (component styles are view-encapsulated per component, so it can't be shared without a broader refactor that's out of scope here):

```scss
// frontend/src/app/pages/batches/batches.scss
.col-toggle {
  width: 48px;
  text-align: center;
  padding-right: 0 !important;
}

.table-container tbody tr:not(.detail-row) {
  cursor: pointer;
}

.expanded-row td {
  border-bottom-color: transparent !important;
}

.detail-row {
  min-height: 0 !important;
  height: 0 !important;
  padding: 0 !important;
  overflow: hidden;
}

.detail-row td.detail-cell {
  padding: 0 !important;
  border: none;
}

.detail-row-visible {
  height: auto !important;
  min-height: unset !important;
  padding: inherit;
}

.detail-row-visible td.detail-cell {
  padding: 12px 16px !important;
}

.detail-panel {
  background: var(--panel-2);
  border-radius: 8px;
  padding: 0 12px;
  overflow: hidden;
  transition: max-height 0.3s ease;
  max-height: 0;
}

.detail-panel-open {
  max-height: 600px;
  padding: 12px;
}

.detail-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12.5px;

  th {
    font-family: var(--sans);
    font-weight: 600;
    font-size: 10px;
    color: var(--ink-dim);
    text-transform: uppercase;
    letter-spacing: 0.6px;
    padding: 6px 8px;
    border-bottom: 1px solid var(--line);
    text-align: left;
  }

  td {
    padding: 8px;
    border-bottom: 1px solid var(--line);
    color: var(--ink);
    white-space: normal;
    overflow: visible;
  }

  tr:last-child td {
    border-bottom: none;
  }
}

.num {
  text-align: right;
}
```

- [ ] **Step 4: Create the spec**

```typescript
// frontend/src/app/pages/batches/batches.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { Batches } from './batches';

describe('Batches', () => {
  let component: Batches;
  let fixture: ComponentFixture<Batches>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Batches],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(Batches);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

- [ ] **Step 5: Register the route**

In `frontend/src/app/app.routes.ts`, add this entry to the authenticated `children` array, right after the `production/new` entry and before `sales`:

```typescript
      {
        path: 'batches',
        loadComponent: () => import('./pages/batches/batches').then((m) => m.Batches),
      },
```

- [ ] **Step 6: Add the navbar entry**

In `frontend/src/app/shared/navbar/navbar.html`, insert this `<li>` right after the "Producción" entry and before the "Ventas" entry:

```html
                <li routerLinkActive="active">
                    <a routerLink="/batches" (click)="closeMobileMenu()">
                        <mat-icon aria-hidden="true">science</mat-icon>
                        <span>Lotes</span>
                    </a>
                </li>
```

- [ ] **Step 7: Run the frontend test and lint**

Run: `cd frontend && ng test -- src/app/pages/batches/batches.spec.ts && npm run lint`
Expected: PASS, no lint errors.

- [ ] **Step 8: Manual verification**

Run: `npm run start` (from repo root), navigate to `http://localhost:4200/batches`. Confirm: the product filter populates, the sort button flips between "mayor a menor"/"menor a mayor" and reloads, expanding a row shows litros/peso, pagination buttons work, and a lote with no sales yet shows "—" instead of "0.0%".

- [ ] **Step 9: Commit**

```bash
git add frontend/src/app/pages/batches frontend/src/app/app.routes.ts frontend/src/app/shared/navbar/navbar.html
git commit -m "feat(batches): pagina /lotes con filtro por producto, orden por rendimiento y detalle expandible"
```

---

### Task 7: Frontend — Insumos table to the expandable-row pattern

**Files:**
- Modify: `frontend/src/app/pages/supplies/components/supplies-table/supplies-table.ts`
- Modify: `frontend/src/app/pages/supplies/components/supplies-table/supplies-table.html`
- Modify: `frontend/src/app/pages/supplies/components/supplies-table/supplies-table.scss`

**Interfaces:**
- No signature changes to `SuppliesTable` from the outside — `supplies.html` still binds `[supplies]="insumos()"` unchanged.

- [ ] **Step 1: Add expand state to the component**

```typescript
// frontend/src/app/pages/supplies/components/supplies-table/supplies-table.ts — full replacement
import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Supply } from '../../../../models/supply.model';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-supplies-table',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatIconModule, MatButtonModule, MatTooltipModule],
  templateUrl: './supplies-table.html',
  styleUrl: './supplies-table.scss',
})
export class SuppliesTable {
  supplies = input.required<Supply[]>();

  displayedColumns = ['toggle', 'name', 'currentStock'];

  private expandedIds = new Set<number>();

  toggleDetail(supply: Supply): void {
    if (this.expandedIds.has(supply.id)) {
      this.expandedIds.delete(supply.id);
    } else {
      this.expandedIds.add(supply.id);
    }
  }

  isExpanded(id: number): boolean {
    return this.expandedIds.has(id);
  }

  getStockPercent(insumo: Supply): number {
    return Math.min((insumo.currentStock / insumo.minStock) * 100, 100);
  }

  getEstado(insumo: Supply): { color: string; label: string; chipClass: string } {
    const ratio = insumo.currentStock / insumo.minStock;

    if (ratio < 1) {
      return { color: 'var(--color-danger)', label: 'CRÍTICO', chipClass: 'chip-danger' };
    } else if (ratio < 1.2) {
      return { color: 'var(--color-warning)', label: 'BAJO', chipClass: 'chip-warn' };
    } else {
      return { color: 'var(--color-success)', label: 'OK', chipClass: 'chip-ok' };
    }
  }
}
```

- [ ] **Step 2: Rewrite the template with the toggle/expand pattern**

```html
<!-- frontend/src/app/pages/supplies/components/supplies-table/supplies-table.html -->
<div class="mat-elevation-z2 table-container">
  <table mat-table [dataSource]="supplies()" multiTemplateDataRows>
    <ng-container matColumnDef="toggle">
      <th mat-header-cell *matHeaderCellDef class="col-toggle"></th>
      <td mat-cell *matCellDef="let row" class="col-toggle">
        <button mat-icon-button class="toggle-btn"
                (click)="$event.stopPropagation(); toggleDetail(row)"
                [matTooltip]="isExpanded(row.id) ? 'Colapsar' : 'Expandir'"
                [attr.aria-label]="isExpanded(row.id) ? 'Colapsar detalles' : 'Expandir detalles'">
          <mat-icon>{{ isExpanded(row.id) ? 'expand_less' : 'expand_more' }}</mat-icon>
        </button>
      </td>
    </ng-container>

    <ng-container matColumnDef="name">
      <th mat-header-cell *matHeaderCellDef>Insumo</th>
      <td mat-cell *matCellDef="let row">
        <strong>{{ row.name }}</strong>
        <span class="chip-status" [ngClass]="getEstado(row).chipClass">{{ getEstado(row).label }}</span>
      </td>
    </ng-container>

    <ng-container matColumnDef="currentStock">
      <th mat-header-cell *matHeaderCellDef class="num">Stock actual</th>
      <td mat-cell *matCellDef="let row" class="num">
        <div class="stock-cell">
          <div class="stockbar">
            <div class="stockbar-fill" [style.width.%]="getStockPercent(row)"
                 [style.background]="getEstado(row).color"></div>
          </div>
          <span class="stock-num">{{ row.currentStock | number }}</span>
        </div>
      </td>
    </ng-container>

    <ng-container matColumnDef="expandedDetail">
      <td mat-cell *matCellDef="let row" [attr.colspan]="displayedColumns.length" class="detail-cell">
        <div class="detail-panel" [class.detail-panel-open]="isExpanded(row.id)">
          <table class="detail-table">
            <thead>
              <tr>
                <th>Proveedor</th>
                <th class="num">Stock mínimo</th>
                <th class="num">Precio unit.</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{{ row.supplier?.name ?? '—' }}</td>
                <td class="num">{{ row.minStock | number }}</td>
                <td class="num">{{ row.costPrice | currency:'ARS':'symbol-narrow':'1.0-0' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </td>
    </ng-container>

    <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
    <tr mat-row *matRowDef="let row; columns: displayedColumns;"
        [class.expanded-row]="isExpanded(row.id)"
        (click)="toggleDetail(row)"></tr>
    <tr mat-row *matRowDef="let row; columns: ['expandedDetail']"
        class="detail-row"
        [class.detail-row-visible]="isExpanded(row.id)"></tr>
  </table>
</div>
```

- [ ] **Step 3: Append the expand-row CSS (existing stock/chip styles stay as-is)**

Add this block to the end of `frontend/src/app/pages/supplies/components/supplies-table/supplies-table.scss` (do not remove the existing `.stock-cell`/`.stockbar`/`.chip-*`/`.num`/`.status-col` rules already in that file):

```scss
.col-toggle {
  width: 48px;
  text-align: center;
  padding-right: 0 !important;
}

.table-container tbody tr:not(.detail-row) {
  cursor: pointer;
}

.expanded-row td {
  border-bottom-color: transparent !important;
}

.detail-row {
  min-height: 0 !important;
  height: 0 !important;
  padding: 0 !important;
  overflow: hidden;
}

.detail-row td.detail-cell {
  padding: 0 !important;
  border: none;
}

.detail-row-visible {
  height: auto !important;
  min-height: unset !important;
  padding: inherit;
}

.detail-row-visible td.detail-cell {
  padding: 12px 16px !important;
}

.detail-panel {
  background: var(--panel-2);
  border-radius: 8px;
  padding: 0 12px;
  overflow: hidden;
  transition: max-height 0.3s ease;
  max-height: 0;
}

.detail-panel-open {
  max-height: 600px;
  padding: 12px;
}

.detail-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12.5px;

  th {
    font-family: var(--sans);
    font-weight: 600;
    font-size: 10px;
    color: var(--ink-dim);
    text-transform: uppercase;
    letter-spacing: 0.6px;
    padding: 6px 8px;
    border-bottom: 1px solid var(--line);
    text-align: left;
  }

  td {
    padding: 8px;
    border-bottom: 1px solid var(--line);
    color: var(--ink);
    white-space: normal;
    overflow: visible;
  }

  tr:last-child td {
    border-bottom: none;
  }
}
```

- [ ] **Step 4: Run lint**

Run: `cd frontend && npm run lint`
Expected: no errors.

- [ ] **Step 5: Manual verification**

Run: `npm run start`, open `http://localhost:4200/supplies`, resize to 375px. Confirm the main row shows only nombre + chip de estado + stock, and tapping the row expands proveedor/stock mínimo/precio without any horizontal scroll.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/app/pages/supplies/components/supplies-table
git commit -m "fix(supplies): la tabla de insumos usa el mismo patron de fila expandible que Produccion/Ventas en mobile"
```

---

### Task 8: Frontend — global mobile gutter fix on `.contenido`

**Files:**
- Modify: `frontend/src/styles.scss`

**Interfaces:** none (pure CSS, no consumers to update).

- [ ] **Step 1: Fix the mobile override**

In `frontend/src/styles.scss`, inside the existing `@media (max-width: 768px)` block, change:

```scss
  .contenido {
    margin-left: 0 !important;
    margin-right: 0 !important;
    margin-top: 12px;
  }
```

to:

```scss
  .contenido {
    margin-left: 0 !important;
    margin-right: 0 !important;
    margin-top: 12px;
    padding-left: 16px;
    padding-right: 16px;
  }
```

- [ ] **Step 2: Manual verification**

Run: `npm run start`, resize the browser to 320px/375px, and visit `/supplies`, `/products`, `/production`, `/sales`, `/clients`, `/batches`. Confirm inputs, cards, and tables now have a visible 16px gutter from the screen edge on every one of them, instead of touching it.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/styles.scss
git commit -m "fix(mobile): agrega gutter de 16px a .contenido en mobile, compartido por las 11 paginas"
```

---

### Task 9: Deploy — same-origin proxy to fix the Safari login loop

**Files:**
- Create: `frontend/vercel.json`
- Modify: `frontend/src/environments/environment.prod.ts`

**Interfaces:** none (deploy/config only; `environment.apiUrl` is already consumed everywhere via the existing `environment` import, no call sites change).

- [ ] **Step 1: Add the Vercel rewrite**

```json
// frontend/vercel.json (new file)
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "https://fuentelac.onrender.com/:path*" }
  ]
}
```

- [ ] **Step 2: Point the production environment at the relative path**

```typescript
// frontend/src/environments/environment.prod.ts — full replacement
export const environment = {
  apiUrl: '/api'
};
```

`environment.ts` (the dev config, `apiUrl: 'http://localhost:3000'`) is unchanged — dev already has frontend and backend on `localhost` at different ports, which Safari treats as same-site (ports don't factor into `SameSite` cookie rules), so it never hit this bug locally.

- [ ] **Step 3: Verify the production build picks up the relative path**

Run: `cd frontend && npm run build -- --configuration production`
Expected: build succeeds; inspect `dist/frontend/browser/main-*.js` (or run `grep -r "fuentelac.onrender.com" dist/frontend/browser/*.js`) and confirm the string `/api` appears where the old absolute Render URL used to, i.e. the `fileReplacements` swap took effect.

- [ ] **Step 4: Commit**

```bash
git add frontend/vercel.json frontend/src/environments/environment.prod.ts
git commit -m "fix(auth): proxea /api a traves del dominio de Vercel para que la cookie de sesion sea de primera parte

Frontend (vercel.app) y backend (onrender.com) eran dominios distintos,
por lo que la cookie de sesion era cross-site. Safari con Intelligent
Tracking Prevention la bloquea incluso con SameSite=None; Secure, lo
que se traducia en un logout inmediato despues de loguearse. El
rewrite hace que el navegador le pegue al propio origen de Vercel, que
reenvia server-side a Render, asi que la cookie llega como de primera
parte."
```

- [ ] **Step 5: Post-deploy checklist (manual, cannot be verified in this local environment)**

After merging and Vercel redeploys:
1. Confirm the `CORS_ORIGIN` environment variable on Render still matches the live Vercel URL (unchanged requirement, the proxy doesn't remove the need for it on the direct Render calls, e.g. anything hitting Render outside the rewrite).
2. In Safari (macOS or iOS), log in on the deployed Vercel URL and confirm the session persists (no immediate redirect back to `/login`).
3. In DevTools → Application → Cookies (or Safari's equivalent), confirm `access_token`/`refresh_token` are listed under the Vercel domain, not the Render domain.

---

### Task 10: Frontend — descriptive validation messages on the auth forms

**Files:**
- Modify: `frontend/src/app/pages/login/login.html`
- Modify: `frontend/src/app/pages/forgot-password/forgot-password.html`
- Modify: `frontend/src/app/pages/reset-password/reset-password.html`
- Modify: `frontend/src/app/pages/profile/profile.html`

**Interfaces:** none — template-only changes, no component class changes.

Angular's built-in `required`/`email`/`minlength` validators already populate `NgModel.errors` (`{ required: true }`, `{ email: true }`, `{ minlength: {...} }`) whenever `FormsModule` is imported, which it already is in every one of these components — no new imports or component logic needed, only a template reference variable per input plus a conditional `<mat-error aria-live="polite">`.

Copy follows the "vos" tone already used elsewhere in the app (e.g. `sale-form.ts`'s `errorMessage` strings): state what's wrong, no "por favor", no generic "campo obligatorio".

- [ ] **Step 1: `login.html`**

Replace the email field:

```html
          <mat-form-field appearance="outline" class="full-width stagger-1">
            <mat-label>Email</mat-label>
            <input id="email" matInput type="email" [(ngModel)]="email" name="email" required email
                   placeholder="ejemplo@correo.com" #emailModel="ngModel" />
            <mat-icon matPrefix>email</mat-icon>
            @if (emailModel.hasError('required')) {
              <mat-error aria-live="polite">Ingresá tu email</mat-error>
            } @else if (emailModel.hasError('email')) {
              <mat-error aria-live="polite">Ese email no es válido</mat-error>
            }
          </mat-form-field>
```

Replace the password field:

```html
          <mat-form-field appearance="outline" class="full-width stagger-2">
            <mat-label>Contraseña</mat-label>
            <input id="password" matInput
                   [type]="showPassword() ? 'text' : 'password'"
                   [(ngModel)]="password" name="password" required
                   placeholder="••••••••" #passwordModel="ngModel" />
            <mat-icon matPrefix>lock</mat-icon>
            <button mat-icon-button matSuffix type="button" class="password-toggle" (click)="togglePassword()"
                    [attr.aria-label]="showPassword() ? 'Ocultar contraseña' : 'Mostrar contraseña'">
              <mat-icon>{{ showPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
            @if (passwordModel.hasError('required')) {
              <mat-error aria-live="polite">Ingresá tu contraseña</mat-error>
            }
          </mat-form-field>
```

- [ ] **Step 2: `forgot-password.html`**

Replace the email field the same way as login's:

```html
          <mat-form-field appearance="outline" class="full-width stagger-1">
            <mat-label>Email</mat-label>
            <input id="email" matInput type="email" [(ngModel)]="email" name="email" required email
                   placeholder="ejemplo@correo.com" #emailModel="ngModel" />
            <mat-icon matPrefix>email</mat-icon>
            @if (emailModel.hasError('required')) {
              <mat-error aria-live="polite">Ingresá tu email</mat-error>
            } @else if (emailModel.hasError('email')) {
              <mat-error aria-live="polite">Ese email no es válido</mat-error>
            }
          </mat-form-field>
```

- [ ] **Step 3: `reset-password.html`**

Replace the código field:

```html
          <mat-form-field appearance="outline" class="full-width stagger-1">
            <mat-label>Código</mat-label>
            <input id="code" matInput type="text" inputmode="numeric" maxlength="6"
                   [(ngModel)]="code" name="code" required placeholder="123456" #codeModel="ngModel" />
            <mat-icon matPrefix>pin</mat-icon>
            @if (codeModel.hasError('required')) {
              <mat-error aria-live="polite">Ingresá el código de 6 dígitos</mat-error>
            }
          </mat-form-field>
```

Replace the nueva contraseña field:

```html
          <mat-form-field appearance="outline" class="full-width stagger-2">
            <mat-label>Nueva contraseña</mat-label>
            <input id="newPassword" matInput
                   [type]="showPassword() ? 'text' : 'password'"
                   [(ngModel)]="newPassword" name="newPassword" required minlength="8"
                   placeholder="••••••••" #newPasswordModel="ngModel" />
            <mat-icon matPrefix>lock</mat-icon>
            <button mat-icon-button matSuffix type="button" class="password-toggle" (click)="togglePassword()"
                    [attr.aria-label]="showPassword() ? 'Ocultar contraseña' : 'Mostrar contraseña'">
              <mat-icon>{{ showPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
            @if (newPasswordModel.hasError('required')) {
              <mat-error aria-live="polite">Ingresá una contraseña nueva</mat-error>
            } @else if (newPasswordModel.hasError('minlength')) {
              <mat-error aria-live="polite">Tiene que tener al menos 8 caracteres</mat-error>
            }
          </mat-form-field>
```

Replace the confirmar contraseña field (keep the existing `passwordsMismatch` banner untouched elsewhere in the file, this only adds the `required` message):

```html
          <mat-form-field appearance="outline" class="full-width stagger-2">
            <mat-label>Confirmar contraseña</mat-label>
            <input id="confirmPassword" matInput
                   [type]="showPassword() ? 'text' : 'password'"
                   [(ngModel)]="confirmPassword" name="confirmPassword" required
                   placeholder="••••••••" #confirmPasswordModel="ngModel" />
            <mat-icon matPrefix>lock</mat-icon>
            <button mat-icon-button matSuffix type="button" class="password-toggle" (click)="togglePassword()"
                    [attr.aria-label]="showPassword() ? 'Ocultar contraseña' : 'Mostrar contraseña'">
              <mat-icon>{{ showPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
            @if (confirmPasswordModel.hasError('required')) {
              <mat-error aria-live="polite">Repetí la contraseña nueva</mat-error>
            }
          </mat-form-field>
```

- [ ] **Step 4: `profile.html`**

Replace the contraseña actual field:

```html
          <mat-form-field appearance="outline">
            <mat-label>Contraseña actual</mat-label>
            <input matInput type="password" [(ngModel)]="currentPassword" name="currentPassword" required autocomplete="current-password" #currentPasswordModel="ngModel" />
            @if (currentPasswordModel.hasError('required')) {
              <mat-error aria-live="polite">Ingresá tu contraseña actual</mat-error>
            }
          </mat-form-field>
```

Replace the contraseña nueva field:

```html
          <mat-form-field appearance="outline">
            <mat-label>Contraseña nueva</mat-label>
            <input matInput type="password" [(ngModel)]="newPassword" name="newPassword" required minlength="8" autocomplete="new-password" #newPasswordModel="ngModel" />
            @if (newPasswordModel.hasError('required')) {
              <mat-error aria-live="polite">Ingresá una contraseña nueva</mat-error>
            } @else if (newPasswordModel.hasError('minlength')) {
              <mat-error aria-live="polite">Tiene que tener al menos 8 caracteres</mat-error>
            }
          </mat-form-field>
```

Leave the repetir contraseña field as-is (it already shows `Las contraseñas no coinciden` via `passwordsMismatch`).

- [ ] **Step 5: Run lint**

Run: `cd frontend && npm run lint`
Expected: no errors.

- [ ] **Step 6: Manual verification**

Run: `npm run start`. On `/login`, `/forgot-password`, `/reset-password`, and `/profile` (logged in), focus and blur each field listed above without filling it in (or with an invalid value) and confirm a specific red message appears under the field instead of just a red border.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/app/pages/login/login.html frontend/src/app/pages/forgot-password/forgot-password.html frontend/src/app/pages/reset-password/reset-password.html frontend/src/app/pages/profile/profile.html
git commit -m "fix(auth): mensajes de error descriptivos en los formularios de login, recuperacion y perfil

Los inputs se marcaban en rojo sin ninguna explicacion (falta el
required, el email invalido, la contraseña corta). Se agrega mat-error
puntual a cada validacion nativa ya presente en el template."
```

---

### Task 11: Frontend — descriptive validation messages on the sale/production/order forms

**Files:**
- Modify: `frontend/src/app/pages/sale-form/sale-form.html`
- Modify: `frontend/src/app/pages/production-form/production-form.html`
- Modify: `frontend/src/app/pages/order-form/order-form.html`

**Interfaces:** none — template-only changes. Angular's built-in `MinValidator`/`MaxValidator` directives (bound automatically to native `min`/`max` attributes on `NgModel`-controlled inputs) already populate `errors.min`/`errors.max`; no component logic changes needed here either.

- [ ] **Step 1: `sale-form.html` — cantidad and precio unitario**

Replace the cantidad field (inside the `@for (row of items; ...)` loop):

```html
            <mat-form-field appearance="outline" class="item-qty">
              <mat-label>Cantidad</mat-label>
              <input matInput type="number" min="1" [max]="getBatch(row.batchId)?.currentStock ?? null" [(ngModel)]="row.quantity" #qtyModel="ngModel">
              @if (qtyModel.hasError('max')) {
                <mat-error aria-live="polite">No podés vender más de {{ getBatch(row.batchId)?.currentStock }} unidades de este lote</mat-error>
              } @else if (qtyModel.hasError('min')) {
                <mat-error aria-live="polite">La cantidad tiene que ser mayor a 0</mat-error>
              }
            </mat-form-field>
```

Replace the precio unitario field:

```html
            <mat-form-field appearance="outline" class="item-price">
              <mat-label>Precio unit.</mat-label>
              <input matInput type="number" min="0.01" step="0.01" [(ngModel)]="row.unitPrice" #priceModel="ngModel">
              @if (priceModel.hasError('min')) {
                <mat-error aria-live="polite">El precio tiene que ser mayor a $0</mat-error>
              }
            </mat-form-field>
```

- [ ] **Step 2: `production-form.html` — cantidad producida and cantidad de insumo**

Replace the cantidad producida field:

```html
              <mat-form-field appearance="outline" class="line-qty">
                <mat-label>Cantidad producida</mat-label>
                <input matInput type="number" min="1" [(ngModel)]="line.quantity" #qtyModel="ngModel">
                @if (qtyModel.hasError('min')) {
                  <mat-error aria-live="polite">La cantidad tiene que ser mayor a 0</mat-error>
                }
              </mat-form-field>
```

Replace the cantidad de insumo field (inside the nested `@for (s of line.supplies; ...)` loop):

```html
                  <mat-form-field appearance="outline" class="supply-qty">
                    <mat-label>Cantidad</mat-label>
                    <input matInput type="number" min="1" [max]="getSupply(s.supplyId)?.currentStock ?? null" [(ngModel)]="s.quantity" #supplyQtyModel="ngModel">
                    @if (supplyQtyModel.hasError('max')) {
                      <mat-error aria-live="polite">No hay stock suficiente: quedan {{ getSupply(s.supplyId)?.currentStock }}</mat-error>
                    } @else if (supplyQtyModel.hasError('min')) {
                      <mat-error aria-live="polite">La cantidad tiene que ser mayor a 0</mat-error>
                    }
                  </mat-form-field>
```

- [ ] **Step 3: `order-form.html` — cantidad**

Replace the cantidad field:

```html
            <mat-form-field appearance="outline" class="item-qty">
              <mat-label>Cantidad</mat-label>
              <input matInput type="number" min="1" [(ngModel)]="row.quantity" #qtyModel="ngModel">
              @if (qtyModel.hasError('min')) {
                <mat-error aria-live="polite">La cantidad tiene que ser mayor a 0</mat-error>
              }
            </mat-form-field>
```

- [ ] **Step 4: Run lint**

Run: `cd frontend && npm run lint`
Expected: no errors.

- [ ] **Step 5: Manual verification**

Run: `npm run start`. On `/sales/new`, pick a lote and type a cantidad above its stock, or a precio of `0`; confirm the specific message appears. On `/production/new`, type a cantidad producida of `0` and an insumo cantidad above its stock; confirm the messages. On `/supplies/order`, type a cantidad of `0`; confirm the message.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/app/pages/sale-form/sale-form.html frontend/src/app/pages/production-form/production-form.html frontend/src/app/pages/order-form/order-form.html
git commit -m "fix(forms): mensajes de error descriptivos en cantidad/precio de venta, produccion y pedidos

Los campos con min/max nativo se marcaban en rojo sin explicacion
cuando se pasaban de stock o ponian un valor invalido."
```

---

## Final verification (after all tasks)

- [ ] Backend: `cd backend && npm run lint && npm run test && npm run build`
- [ ] Frontend: `cd frontend && npm run lint && npm run test && npm run build -- --configuration production`
- [ ] Manual pass on `ng serve`, resized to 320px/375px/768px, covering every page touched: `/batches`, `/supplies`, `/sales/new`, `/production/new`, `/supplies/order`, `/login`, `/forgot-password`, `/reset-password`, `/profile`.
- [ ] Safari check on the actual Vercel deploy (post-merge, per Task 9 Step 5) — the one check that can't be done locally in this environment.
