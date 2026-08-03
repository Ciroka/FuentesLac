# Página de rendimiento de lotes + correcciones mobile

## Contexto

El usuario buscó en el frontend dónde ver el rendimiento de los lotes de producción y no lo encontró. Investigación contra el código real:

- El backend ya tiene todo el modelo: `Batch.yield = obtainedWeight / milkLitersUsed` (`backend/src/batch/entities/batch.entity.ts`), calculado en `BatchService.addSoldWeight`/`subtractSoldWeight`/`recalculateYield` (`backend/src/batch/service/batch.service.ts`) a medida que se vende contra el lote, y expuesto en `GET /batch`, `GET /batch/:id`, `POST /batch/:id/recalculate-yield`.
- El frontend (`frontend/src/app/services/batch.service.ts`) solo tiene `findAll()`, y su único consumidor es `sale-form.ts` — como selector de lote al cargar una venta. El rendimiento nunca se muestra en ninguna pantalla.

Durante la misma conversación, el usuario compartió una captura de la página de Insumos en mobile (muy apretada, con bordes que "apenas se ven") y señaló que el mismo problema aparece en otros inputs/páginas del sitio en mobile. Investigación:

- Producción y Ventas ya resuelven tablas densas en mobile con un patrón de fila expandible (`toggleDetail`/`isExpanded`, columnas `toggle`/`detail-row` en `production.html`/`production.scss`): la fila principal muestra pocas columnas livianas, el resto se ve al tocar la fila.
- Productos usa una grilla de cards (`.grid-3`) que ya se apila a 1 columna en `@media (max-width: 768px)`.
- Insumos (`supplies-table.html`/`.ts`) quedó afuera de ese patrón: renderiza 6 columnas planas (nombre, proveedor, stock con barra, stock mínimo, precio, estado) sin ningún tratamiento mobile propio. En mobile, `.table-container` pasa de `overflow: hidden` a `overflow-x: auto` (`styles.scss`), así que las 6 columnas siguen ahí pero corridas fuera de pantalla sin ninguna señal de que hay que hacer scroll horizontal.
- Causa raíz del segundo síntoma (inputs "pegados al borde"): `.contenido` es el wrapper de **las 11 páginas** de la app (confirmado por grep — todas usan `<main class="contenido page-enter">`). En desktop tiene `margin-left: 150px` para el sidebar; en `@media (max-width: 768px)` (`styles.scss` línea ~295) ese margen se pisa a `margin-left: 0 !important; margin-right: 0 !important`, sin dejar ningún gutter. Por eso inputs, cards y tablas quedan pegados al borde de la pantalla en **toda** la app en mobile, no solo en Insumos.

## Alcance

**Incluye:**
- Backend: `GET /batch` pasa a paginado/filtrable (`page`, `limit`, `order`, `productId`, `sortBy=yield`), con `product` embebido en la respuesta.
- Frontend: página nueva `/lotes` con listado de rendimiento por lote, filtro por producto, orden por rendimiento, paginación — construida desde el inicio con el patrón de fila expandible (no con tabla plana).
- Frontend: `pages/supplies/components/supplies-table/` migra al mismo patrón de fila expandible que ya usan Producción/Ventas.
- Frontend: fix del gutter mobile de `.contenido` en `styles.scss` (breakpoint 768px) — un cambio compartido por las 11 páginas.

**No incluye:**
- No se agregan acciones de escritura (recalcular, borrar) a la página de Lotes — solo lectura, según lo acordado (`GET /batch` y `GET /batch/:id` ya son de acceso abierto a cualquier usuario autenticado, sin `@Roles`).
- No se toca `sale-form.ts` ni su selector de lote — sigue recibiendo un `Batch[]` plano vía `findAll()`.
- No se re-audita cada pantalla en busca de otros problemas de mobile fuera de Insumos y el gutter global — si aparece algo más durante la implementación se anota pero no se expande el alcance sin confirmar.
- No se cambia el comportamiento de `production.service.ts` al crear un lote (`batchService.create`/`increaseStock`) — solo se toca el endpoint de lectura.

## Diseño

### A. Backend — `GET /batch` paginado y filtrable

Mismo patrón que `products`/`production` (`QueryParams` + `PaginatedResult<T>`):

- **`batch/enums/sort-by.enum.ts`** (nuevo): `enum SortByBatch { YIELD = 'yield' }`.
- **`batch/dto/request/params-batch.dto.ts`** (nuevo): `class QueryParamsBatch extends QueryParams { productId?: number; sortBy?: SortByBatch }` (mismos decoradores `class-validator`/`class-transformer` que `QueryParamsProducts`).
- **`batch/repository/batch.repository.interface.ts`**: `findAll()` cambia de `Promise<Batch[]>` a `findAll(page: number, limit: number, order: OrderEnum, sortBy?: SortByBatch, productId?: number): Promise<PaginatedResult<Batch>>`.
- **`batch/repository/batch.repository.ts`**: implementa con query builder — `leftJoinAndSelect('batch.product', 'product')` (evita N+1 al mostrar nombre de producto), `andWhere('batch.productId = :productId', ...)` cuando se pasa, `ORDER BY batch.yield ... NULLS LAST` cuando `sortBy=yield` (los lotes sin ventas todavía tienen `yield` null y deben quedar al final, no arriba), `take`/`skip`/`getManyAndCount` para la paginación.
- **`batch/service/batch.service.ts`**: `findAll(params: QueryParamsBatch): Promise<PaginatedResult<Batch>>`, passthrough al repositorio (mismo shape que `ProductsService.findAll`).
- **`batch/controller/batch.controller.ts`**: `GET /batch` recibe `@Query() params: QueryParamsBatch` y devuelve `PaginatedResult<BatchResponse>` (mapeando `items` con `toBatchResponse`). Sin `@Roles` — se mantiene abierto a cualquier usuario autenticado.
- **`batch/dto/response/batch-response.dto.ts`**: se agrega `product?: { id: number; name: string }` a `BatchResponse` y a `toBatchResponse`, poblado a partir del `product` ya joineado en la entidad (mismo patrón que `ProductResponse.category`).

Único consumidor actual de `BatchService.findAll()`/`batchRepository.findAll()` es el propio controller (confirmado por grep) — el cambio de firma no rompe `production.service.ts` (usa `batchService.create`/`increaseStock`, no `findAll`).

### B. Frontend — página nueva `/lotes`

- **`models/batch.model.ts`**: se agrega `product?: { id: number; name: string }` a la interfaz `Batch`.
- **`services/batch.service.ts`**:
  - `findPage(page, limit, opts?: { productId?: number; sortBy?: string; order?: string })` → pega contra `GET /batch` con esos query params vía `HttpParams`, devuelve el `PaginatedResult<Batch>` completo.
  - `findAll()` (la sigue usando `sale-form.ts`) pasa a pedir el mismo endpoint con un `limit` alto y devolver solo `.items`, igual que ya hace `ProductionService.findAll(limit=1000)` — no se toca `sale-form.ts`.
- **Página nueva** `pages/batches/` (`batches.ts/.html/.scss/.spec.ts`), calcada de la estructura de `pages/production/`:
  - Filtro: selector de producto (reutiliza `ProductsService.findAll()`) + toggle de orden por rendimiento (asc/desc).
  - Tabla con patrón de fila expandible: fila principal con columnas `toggle`, `producto`, `código/fecha de lote`, `% rendimiento`, `stock actual`; fila de detalle expandible con `litros de leche usados` y `peso obtenido`.
  - Lotes sin `yield` (sin ventas todavía) muestran `—` en vez de `0%`.
  - Paginación con `page`/`total`/`limit`, mismos botones "Anterior"/"Siguiente" que el resto de las páginas.
- **Ruta**: `{ path: 'batches', loadComponent: ... }` dentro del bloque autenticado de `app.routes.ts`.
- **Navbar**: nuevo ítem "Lotes" en `shared/navbar/navbar.html`, entre "Producción" y "Ventas" (un lote nace de una producción y se consume en una venta). Icono: `science` (no colisiona con los ya usados: `speed`, `water_drop`, `inventory_2`, `apartment`, `local_shipping`, `people`, `admin_panel_settings`, `person`).

### C. Insumos — tabla al patrón de fila expandible

`supplies-table` migra del layout de 6 columnas planas al mismo patrón `multiTemplateDataRows` + `toggle`/`detail-row` que ya usan Producción y Ventas:

- Fila principal: `toggle`, `nombre` (con el chip de estado al lado — es el dato más urgente para decidir de un vistazo), `stock actual` (con la barra existente).
- Fila de detalle expandible: `proveedor`, `stock mínimo`, `precio unitario`.
- Se reutiliza el CSS ya existente en `styles.scss`/`production.scss` para `.detail-row`/`.detail-panel`/`.toggle-btn` (incluido el mínimo táctil de 44×44px en mobile) — no se inventa un patrón nuevo.
- `SuppliesTable` (`supplies-table.ts`) gana el mismo estado de expansión (`expandedIds`/`toggleDetail`/`isExpanded`) que ya tiene `Production`.

### D. Fix global — gutter mobile de `.contenido`

En `frontend/src/styles.scss`, dentro de `@media (max-width: 768px)`:

```scss
// antes
.contenido {
  margin-left: 0 !important;
  margin-right: 0 !important;
  margin-top: 12px;
}

// después
.contenido {
  margin-left: 0 !important;
  margin-right: 0 !important;
  margin-top: 12px;
  padding-left: 16px;
  padding-right: 16px;
}
```

`padding` en vez de `margin` para no interferir con el `box-shadow`/`border-radius` de `.table-container` ni con el ancho que ya calculan los `.grid-*`. Este único cambio da gutter consistente a las 11 páginas que usan `.contenido` (Insumos, Productos, Producción, Ventas, Clientes, Admin, Perfil, Dashboard, y los 3 formularios) sin tocar el layout de escritorio.

## Fuera de alcance / decisiones explícitas

- Lotes es de solo lectura por ahora — sin recalcular/borrar desde la UI.
- No se toca `sale-form.ts`.
- No se re-audita todo el sitio en busca de más problemas de mobile — solo Insumos (tabla) y el gutter global de `.contenido` (los dos puntos concretos señalados).

## Testing

- Backend: `cd backend && npm run lint && npm run test` — specs nuevos/actualizados para `batch.repository` (filtro por `productId`, orden por `yield` con `NULLS LAST`, paginación) y `batch.service`/`batch.controller` (firma nueva de `findAll`).
- Frontend: `cd frontend && npm run lint && npm run test && npm run build -- --configuration production` — spec nuevo `batches.spec.ts` (calcado de `production.spec.ts`), spec actualizado de `supplies-table.spec.ts` si existe.
- Verificación visual manual (`ng serve`, resize a 320px/375px/768px):
  - `/lotes`: filtro por producto, orden por rendimiento, expandir/colapsar detalle, paginación.
  - Insumos en mobile: confirmar que la fila principal (nombre + estado) es legible sin scroll horizontal, y que expandir muestra proveedor/stock mínimo/precio.
  - Cualquier página (Insumos, Productos, Producción, Ventas, Clientes) en mobile: confirmar que inputs/cards ya no quedan pegados al borde de la pantalla.
