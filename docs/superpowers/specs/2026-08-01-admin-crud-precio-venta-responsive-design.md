# CRUD completo de Admin, precio editable en ventas, y pulido visual/responsive

## Contexto

Sobre la base ya existente (ver [[2026-07-27-frontend-industrial-redesign-design]] — paleta industrial azul/gris, tokens en `styles.scss`/`theme.scss`, ya implementada), quedan 4 pedidos pendientes detectados en esta sesión:

1. El panel Admin permite **crear** insumos/productos/categorías/cuentas, pero no existe ninguna forma de registrar un **proveedor** desde el frontend (el backend ya soporta `POST /suppliers` completo).
2. Al registrar una venta, el precio unitario es siempre el `salePrice` del producto — no se puede vender a un precio distinto según el cliente.
3. El modo oscuro (agregado en una sesión anterior junto con el toggle de tema) tiene inconsistencias visuales reales, no solo una sensación subjetiva.
4. Varias pantallas con grillas de renglones densas (ventas, producción, pedidos) no se adaptan bien a mobile — quedan ilegibles en un teléfono.

Se investigó cada punto contra el código real (no hipótesis) antes de diseñar esta spec.

## Alcance

**Incluye:**
- Backend: `@Roles(ADMIN)` en los endpoints de `suppliers`/`categories`/`supplies`/`products` que hoy no lo tienen; `unitPrice` opcional en `CreateSalesDetailDto`.
- Frontend `pages/admin/`: pestaña nueva "Proveedores"; edición y borrado agregados a las pestañas Insumos, Productos, Categorías y Proveedores.
- Frontend `pages/sale-form/`: campo de precio unitario editable por renglón.
- Frontend `dashboard/components/weekly-chart/`: colores reactivos al tema.
- Frontend: breakpoint mobile en las grillas de renglón de `sale-form`, `production-form`, `order-form` y `order-card` (dentro de `pages/supplies/components/`).
- Revisión general de espaciados/tamaños en mobile en las páginas principales (`products`, `supplies`, `clients`, `production`, `sales`) como parte del mismo pase.

**No incluye:**
- Ventas ni pedidos (transacciones) no ganan edición/borrado de sus renglones — solo se puede editar el cliente asociado (comportamiento actual) y borrar la venta/pedido completo (ya existente).
- Ninguna tabla nueva de "precio por cliente" ni recordar precios históricos automáticamente (ver decisión en Diseño → C).
- No se introduce `MatDialog` ni ningún sistema de modales nuevo.
- No se cambia el comportamiento de expansión del sidebar por hover, ya decidido en la spec anterior.

## Diseño

### A. Backend — endpoints de admin consistentes en autorización

Hallazgo: `POST`/`PATCH` de `suppliers` y `categories`, y `PATCH` de `supplies`/`products`, no tienen `@Roles(UserRole.ADMIN)` (sí lo tiene cada `DELETE`). Cualquier usuario autenticado con rol EMPLOYEE podría hoy crear/editar esos recursos pegándole directo a la API, aunque la UI se lo oculte. Se agrega `@Roles(UserRole.ADMIN)` a esos 5 endpoints para que sea consistente con su propio `DELETE` y con el resto de operaciones de escritura del panel Admin (`supplies`/`products` ya protegen su `POST` así).

### B. Proveedores — alta, edición y borrado en el Admin

El backend de `suppliers` ya expone `POST`, `PATCH /:id`, `DELETE /:id` completos (`CreateSupplierDto`: `name`, `phone`, `email`, `address`, `cuit`). Se agrega:

- `SuppliersService` (frontend) gana `create()`, `update()`, `remove()` — hoy solo tiene `findAll()`.
- Nueva pestaña "Proveedores" en `admin.html`/`admin.ts`, mismo patrón visual que las pestañas existentes: form de alta (Nombre/Teléfono/Email/Dirección/CUIT) + tabla de listado abajo (reutiliza el `suppliers` ya cargado en `ngOnInit`).
- Icono de pestaña: `local_shipping` ya está en uso en el sidebar para Ventas — para Proveedores se usa `storefront` (distinto, sin duplicar semántica).

### C. Editar y borrar Insumos, Productos, Categorías (y Proveedores)

El backend ya soporta `PATCH`/`DELETE` en los 4 módulos — es trabajo puramente de frontend:

- **Reutilizo el mismo form de alta para editar**, en vez de agregar un `MatDialog` nuevo: cada tab gana un signal `editingXId: number | null`. Al tocar "Editar" en una fila de la tabla, se llama `xForm.resetForm(row)` para precargar los campos y `editingXId.set(row.id)`; el botón de submit cambia de "Crear X" a "Guardar cambios" (con un botón "Cancelar" al lado que limpia `editingXId` y resetea el form). El método `createX()` se renombra conceptualmente a "submit": si `editingXId()` es `null` llama `.create()`, si no `.update(editingXId(), payload)`.
- **Tablas de listado**: Insumos y Productos usan los `findPage`/`findPageWithStock` paginados que el servicio ya expone (mismo patrón que la tabla de Cuentas, con Anterior/Siguiente). Categorías y Proveedores usan el `findAll()` simple ya cargado (son listas chicas, no justifican paginación).
- **Borrado con confirmación**: a diferencia de "Eliminar cuenta" (que borra directo al click), estas 4 entidades agregan un diálogo de confirmación nativo (`confirm()`) antes de llamar a `.remove()` — tienen más impacto aguas abajo (un insumo/producto puede estar en producciones o ventas pasadas). Si el borrado choca con una referencia (FK), el `QueryFailedFilter` ya devuelve 409 y se muestra como toast de error — no hace falta lógica nueva ahí.
- Ventas y pedidos quedan explícitamente fuera de este patrón (no se les agrega edición/borrado de renglones).

### D. Precio unitario editable en la venta

**Decisión de alcance** (recomendada y confirmada con el usuario): override puntual por venta, sin tabla de "precio por cliente". `sales_details.unit_price` ya se guarda por renglón hoy — con esto alcanza para cumplir el requisito de que quede registrado a qué precio se vendió cada cosa, sin la complejidad de mantener una relación cliente↔producto↔precio aparte. El historial de precios de un cliente ya queda disponible mirando sus ventas pasadas.

- **Backend**: `CreateSalesDetailDto` (`sales-detail/dto/request/create-sales-detail.dto.ts`) gana `@IsNumber() @IsPositive() @IsOptional() unitPrice?: number`. En `SalesService.create()` (`sales/service/sales.service.ts`), `const unitPrice = item.unitPrice ?? batch.product.salePrice;` reemplaza la asignación actual — si no se manda `unitPrice`, el comportamiento es idéntico al de hoy.
- **Frontend** (`sale-form.ts`/`.html`): `SaleItemRow` gana `unitPrice: number | null`. En `onProductChange()`, se precarga con `product.salePrice`. El template agrega un `mat-form-field` "Precio unitario" editable en cada renglón. `rowSubtotal()` usa `row.unitPrice ?? product.salePrice` en vez de siempre `product.salePrice`. Se manda en el payload de `createSale()`.
- Este campo nuevo se suma al rediseño del renglón de venta descripto en el punto F (la grilla ya estaba en el límite de columnas en desktop, y era el ejemplo más grave de mobile roto).

### E. Modo oscuro — corrección de colores hardcodeados

Hallazgo concreto: `dashboard/components/weekly-chart/weekly-chart.ts` tiene colores de Chart.js hardcodeados del tema **claro** (`#2f6690` barra "hoy", `#a8b6c2` resto de barras, `#1c2733` fondo de tooltip, `#64748b` texto de ejes) que no reaccionan al `ThemeService`. En oscuro, la barra de "hoy" queda con el azul de modo claro sobre fondo oscuro — pierde contraste y se ve apagada, que es exactamente la queja de "el oscuro está peor".

- `WeeklyChart` inyecta `ThemeService` y `chartData`/`chartOptions` pasan a ser `computed()` dependientes de `themeService.theme()`, con la paleta oscura equivalente ya definida en `styles.scss` (`--accent: #5a9ec9`, `--ink-dim: #929ba5`, `--panel-2: #24292e` para el tooltip, `--card-track: #2c333a` para las barras no destacadas).
- Se revisan además, como parte del mismo pase, los overlays de Material que dependen de la paleta generada por `theme.scss` (paneles de `mat-select` abiertos, `mat-tab-group`, `mat-checkbox`) contra los tokens oscuros, corrigiendo cualquier otro color hardcodeado que aparezca — el del chart semanal es el único ya confirmado, el resto se confirma/corrige durante la implementación con capturas en ambos temas.

### F. Responsive — grillas de renglón apiladas en mobile

Hallazgo concreto (mismo bug repetido en 4 lugares): las grillas de renglón de `sale-form` (`.item-row`), `production-form` (`.production-line-header`, `.supply-row`), `order-form` (`.item-row`) y `order-card` (`.order-line`, `.panel-line`, dentro de `pages/supplies/components/order-card`) solo tienen un breakpoint a 1024px que las achica a `1fr 1fr` (2 columnas) — nunca se apilan en 1 columna. Con 4 a 7 campos por renglón (producto, lote, cantidad, peso, precio, subtotal, borrar), en un teléfono de ~375px cada columna queda en ~160px, y los `mat-select`/inputs de Material quedan recortados o ilegibles. Es la causa concreta de "en el teléfono se ve feo".

- Se agrega `@media (max-width: 640px)` a las 5 grillas mencionadas, pasándolas a `grid-template-columns: 1fr` (un campo por fila, con su label completo visible).
- Los botones de acción por renglón (agregar, borrar) pasan a min 44×44px en ese breakpoint, mismo criterio ya aplicado en la navbar.
- Repaso general (no solo estas 3 pantallas, ya que el pedido es "que se vea bien en todos los dispositivos"): `products`, `supplies`, `clients`, `production`, `sales` — ajustando paddings/tamaños de fuente puntuales en mobile donde se detecten durante la implementación, sin cambiar layout de escritorio.

## Fuera de alcance / decisiones explícitas

- No se agrega tabla de precios por cliente (ver D).
- No se agrega edición/borrado a ventas ni pedidos.
- No se introduce `MatDialog` — la edición reutiliza el form de alta existente.
- El comportamiento de "Eliminar cuenta" (sin confirmación) no se toca; el `confirm()` nuevo es solo para las 4 entidades de este alcance.

## Testing

- Backend: `cd backend && npm run lint && npm run test` — cubrir con test el nuevo `unitPrice` opcional en `create-sales-detail.dto`/`sales.service.spec.ts` (con y sin `unitPrice` en el payload), y que los endpoints con `@Roles(ADMIN)` nuevo rechacen un token EMPLOYEE (403).
- Frontend: `cd frontend && npm run lint && npm run test && npm run build -- --configuration production`.
- Verificación visual manual (`ng serve`, usuario de prueba descartable, igual que sesiones anteriores):
  - Admin: crear/editar/borrar un proveedor, un insumo, un producto y una categoría; confirmar que el borrado con relaciones existentes muestra el toast de error (409) y no rompe la pantalla.
  - Sale-form: crear una venta con precio editado distinto al de lista, confirmar en la tabla de ventas que el precio guardado es el editado.
  - Modo oscuro: capturas del dashboard (weekly-chart) en claro y oscuro, confirmar contraste correcto de la barra "hoy".
  - Resize a 320px/375px/768px en sale-form, production-form, order-form y order-card: confirmar que las grillas de renglón se apilan en 1 columna y no hay overflow horizontal.
