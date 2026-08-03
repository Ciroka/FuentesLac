# Página de rendimiento de lotes + correcciones mobile, Safari y precio de venta

## Contexto

El usuario buscó en el frontend dónde ver el rendimiento de los lotes de producción y no lo encontró. Investigación contra el código real:

- El backend ya tiene todo el modelo: `Batch.yield = obtainedWeight / milkLitersUsed` (`backend/src/batch/entities/batch.entity.ts`), calculado en `BatchService.addSoldWeight`/`subtractSoldWeight`/`recalculateYield` (`backend/src/batch/service/batch.service.ts`) a medida que se vende contra el lote, y expuesto en `GET /batch`, `GET /batch/:id`, `POST /batch/:id/recalculate-yield`.
- El frontend (`frontend/src/app/services/batch.service.ts`) solo tiene `findAll()`, y su único consumidor es `sale-form.ts` — como selector de lote al cargar una venta. El rendimiento nunca se muestra en ninguna pantalla.

Durante la misma conversación, el usuario compartió una captura de la página de Insumos en mobile (muy apretada, con bordes que "apenas se ven") y señaló que el mismo problema aparece en otros inputs/páginas del sitio en mobile. Investigación:

- Producción y Ventas ya resuelven tablas densas en mobile con un patrón de fila expandible (`toggleDetail`/`isExpanded`, columnas `toggle`/`detail-row` en `production.html`/`production.scss`): la fila principal muestra pocas columnas livianas, el resto se ve al tocar la fila.
- Productos usa una grilla de cards (`.grid-3`) que ya se apila a 1 columna en `@media (max-width: 768px)`.
- Insumos (`supplies-table.html`/`.ts`) quedó afuera de ese patrón: renderiza 6 columnas planas (nombre, proveedor, stock con barra, stock mínimo, precio, estado) sin ningún tratamiento mobile propio. En mobile, `.table-container` pasa de `overflow: hidden` a `overflow-x: auto` (`styles.scss`), así que las 6 columnas siguen ahí pero corridas fuera de pantalla sin ninguna señal de que hay que hacer scroll horizontal.
- Causa raíz del segundo síntoma (inputs "pegados al borde"): `.contenido` es el wrapper de **las 11 páginas** de la app (confirmado por grep — todas usan `<main class="contenido page-enter">`). En desktop tiene `margin-left: 150px` para el sidebar; en `@media (max-width: 768px)` (`styles.scss` línea ~295) ese margen se pisa a `margin-left: 0 !important; margin-right: 0 !important`, sin dejar ningún gutter. Por eso inputs, cards y tablas quedan pegados al borde de la pantalla en **toda** la app en mobile, no solo en Insumos.

Además, en la misma conversación se reportaron dos bugs funcionales concretos, ya investigados contra el código real:

- **Precio unitario por defecto rechazado al vender.** `Product.salePrice` es una columna `decimal` en TypeORM (`products/entities/product.entity.ts`), que el driver `pg` devuelve como **string** en runtime (ej. `"150.00"`), aunque el tipo TS declarado sea `number`. En `sale-form.ts`, `onProductChange()` copia ese valor tal cual a `row.unitPrice` (`row.unitPrice = this.getProduct(row.productId)?.salePrice ?? null`). Si el usuario nunca toca el campo de precio, el payload manda `unitPrice: "150.00"` (string). `CreateSalesDetailDto.unitPrice` (`sales-detail/dto/request/create-sales-detail.dto.ts`) tiene `@IsNumber() @IsPositive() @IsOptional()` **sin** `@Type(() => Number)`, y el `ValidationPipe` global (`main.ts`) tiene `transform: true` pero no `enableImplicitConversion`, así que class-transformer no convierte el string a number antes de validar — `@IsNumber()` rechaza el string con 400. Si el usuario edita el input (aunque sea un dígito), el `NumberValueAccessor` de Angular en el `<input type="number">` coerciona el valor a un `number` real al tipear, y ahí sí pasa la validación. Por eso "si dejás el precio por defecto sin tocar, tira error; si hacés un mínimo cambio, lo toma".
- **Se desloguea solo al iniciar sesión en Safari.** El frontend (Vercel, dominio `*.vercel.app`) y el backend (Render, `fuentelac.onrender.com`) están en dominios distintos — son *cross-site* para el navegador. `AuthController.setAuthCookies` (`auth/controller/auth.controller.ts`) ya pone `secure: isProduction, sameSite: isProduction ? 'none' : 'lax'`, que es la configuración correcta para cookies cross-site en general, pero Safari es el navegador más agresivo bloqueando cookies de terceros bajo su Intelligent Tracking Prevention (ITP) incluso con `SameSite=None; Secure`. El síntoma encaja exactamente con esto: el login responde OK y pone el `Set-Cookie`, pero Safari no lo persiste; la siguiente request (ej. restaurar sesión) no lleva la cookie, el backend devuelve 401, y `authInterceptor` (que no distingue "nunca hubo sesión" de "la cookie no llegó") dispara el flujo de "sesión inválida" → limpia y manda a `/login` — se ve como un logout inmediato después de loguear. La solución robusta (no un parche específico de Safari) es dejar de depender de una cookie cross-site: proxear las llamadas a la API a través del mismo origen del frontend (rewrite de Vercel hacia Render), de forma que la cookie que pone el backend llegue al navegador como cookie de **primera parte** del dominio de Vercel — esto evita el problema en Safari y también adelanta a futuras restricciones de cookies de terceros en otros navegadores.

## Alcance

**Incluye:**
- Backend: `GET /batch` pasa a paginado/filtrable (`page`, `limit`, `order`, `productId`, `sortBy=yield`), con `product` embebido en la respuesta.
- Frontend: página nueva `/lotes` con listado de rendimiento por lote, filtro por producto, orden por rendimiento, paginación — construida desde el inicio con el patrón de fila expandible (no con tabla plana).
- Frontend: `pages/supplies/components/supplies-table/` migra al mismo patrón de fila expandible que ya usan Producción/Ventas.
- Frontend: fix del gutter mobile de `.contenido` en `styles.scss` (breakpoint 768px) — un cambio compartido por las 11 páginas.
- Backend: `@Type(() => Number)` en `CreateSalesDetailDto.unitPrice` para aceptar el precio por defecto sin que el usuario tenga que tocarlo.
- Backend + deploy: `vercel.json` con rewrite de `/api/*` hacia el backend de Render, y `environment.prod.ts` apuntando a `/api` en vez de la URL absoluta — para que la cookie de sesión sea de primera parte en Safari (y en cualquier navegador con políticas de cookies de terceros más estrictas a futuro).

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

### E. Precio unitario por defecto — aceptar el string decimal sin tocar el input

`sales-detail/dto/request/create-sales-detail.dto.ts`: se agrega `@Type(() => Number)` (de `class-transformer`) antes de `@IsNumber() @IsPositive() @IsOptional()` en `unitPrice`. Con `transform: true` ya activo globalmente en el `ValidationPipe` (`main.ts`), esto hace que class-transformer convierta el string `"150.00"` a `150` antes de que `@IsNumber()` lo evalúe, sin cambiar nada del lado del frontend (`sale-form.ts` sigue mandando lo mismo). No se toca `weight` (mismo DTO): hoy siempre lo tipea el usuario en el form, nunca se precarga desde un valor decimal del backend, así que no sufre este bug.

### F. Login en Safari — cookie de sesión same-site vía proxy de Vercel

- **`frontend/vercel.json`** (nuevo): rewrite que hace que `/api/*` en el dominio de Vercel se resuelva contra el backend de Render:
  ```json
  {
    "rewrites": [
      { "source": "/api/:path*", "destination": "https://fuentelac.onrender.com/:path*" }
    ]
  }
  ```
- **`frontend/src/environments/environment.prod.ts`**: `apiUrl` pasa de `'https://fuentelac.onrender.com'` a `'/api'` (ruta relativa al propio origen de Vercel). `environment.ts` (dev) no cambia — en local, frontend y backend ya comparten el mismo host (`localhost`) en distinto puerto, lo cual no dispara la lógica de cookies cross-site de Safari (los puertos no forman parte de la definición de "site" para `SameSite`).
- No se toca `AuthController.setAuthCookies` ni `main.ts` (CORS): con el proxy, el navegador ya no le pega directo a Render, así que la respuesta con `Set-Cookie` que ve el browser aparenta venir del propio dominio de Vercel (cookie de primera parte) sin que haga falta cambiar `sameSite`/`secure`. Sí hay que confirmar como parte de la implementación que la variable de entorno `CORS_ORIGIN` configurada en Render sigue apuntando a la URL real de Vercel (ya es un requisito hoy, el proxy no lo cambia).
- Verificación: no se puede probar Safari real en este entorno de desarrollo — el paso final de validación es manual, contra el deploy de Vercel, después de mergear.

## Fuera de alcance / decisiones explícitas

- Lotes es de solo lectura por ahora — sin recalcular/borrar desde la UI.
- No se toca `sale-form.ts` (ni para el selector de lote ni para el fix de precio — el fix de E es 100% backend).
- No se re-audita todo el sitio en busca de más problemas de mobile — solo Insumos (tabla) y el gutter global de `.contenido` (los dos puntos concretos señalados).
- No se compra ni configura un dominio propio — el fix de Safari usa el dominio `*.vercel.app` que ya existe, vía rewrite, no vía dominio custom.
- No se toca el transformer de columnas `decimal` a nivel de entidades (`Product`, `Batch`, etc.) de forma general — el fix de E es puntual en el DTO que falló; si aparece el mismo síntoma en otro endpoint se evalúa por separado.

## Testing

- Backend: `cd backend && npm run lint && npm run test` — specs nuevos/actualizados para `batch.repository` (filtro por `productId`, orden por `yield` con `NULLS LAST`, paginación) y `batch.service`/`batch.controller` (firma nueva de `findAll`); spec de `create-sales-detail.dto`/`sales.service.spec.ts` cubriendo `unitPrice` como string entrante.
- Frontend: `cd frontend && npm run lint && npm run test && npm run build -- --configuration production` — spec nuevo `batches.spec.ts` (calcado de `production.spec.ts`), spec actualizado de `supplies-table.spec.ts` si existe.
- Verificación visual manual (`ng serve`, resize a 320px/375px/768px):
  - `/lotes`: filtro por producto, orden por rendimiento, expandir/colapsar detalle, paginación.
  - Insumos en mobile: confirmar que la fila principal (nombre + estado) es legible sin scroll horizontal, y que expandir muestra proveedor/stock mínimo/precio.
  - Cualquier página (Insumos, Productos, Producción, Ventas, Clientes) en mobile: confirmar que inputs/cards ya no quedan pegados al borde de la pantalla.
  - Sale-form: crear una venta sin tocar el campo de precio unitario (dejando el valor por defecto) y confirmar que se registra sin error 400.
  - Safari (post-deploy en Vercel, no reproducible en este entorno local): loguearse y confirmar que la sesión persiste después del login, sin loop de logout.
