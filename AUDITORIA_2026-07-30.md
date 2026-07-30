# Auditoría de código — 30/07/2026

Revisión de seguimiento sobre `AUDITORIA_2026-07-29.md`: cada ítem de esa
auditoría se re-verificó leyendo el código actual (no se asumió nada). Se
agregaron los hallazgos nuevos que aparecieron con los cambios de esta sesión
(perfil, modo oscuro, paginación, filtros, toasts).

**Resumen:** de los 20 ítems originales, **2 se arreglaron** en esta sesión
(#1 y #2, el flujo de reset de contraseña), **1 ya estaba resuelto** en el
código aunque la auditoría anterior lo marcaba roto (#10), y **los otros 17
siguen exactamente igual, sin tocar.** Se agregan 2 hallazgos nuevos (#21, #22).

Índice rápido:

| # | Severidad | Título | Estado |
|---|-----------|--------|--------|
| 1 | 🔴 Crítico | Flujo de reset de contraseña roto | ✅ **Arreglado** (esta sesión) |
| 2 | 🔴 Crítico | `reset-password` exige autenticación | ✅ **Arreglado** (esta sesión) |
| 3 | 🔴 Crítico | Insumos expuestos sin auth | 🔴 Sigue roto |
| 4 | 🔴 Crítico | `synchronize: true` por defecto | 🔴 Sigue roto |
| 5 | 🔴 Crítico | Cookies sin `Secure` | 🔴 Sigue roto (misma causa que #4) |
| 6 | 🟠 Alto | Sin rate limit específico en autenticación | 🟠 Sigue roto (ahora también afecta al endpoint nuevo `PATCH /auth/me/password`) |
| 7 | 🟠 Alto | `multer`/`typeorm` con vulnerabilidades conocidas | 🟠 Sigue roto |
| 8 | 🟠 Alto | `updateEmail` sin normalizar | 🟠 Sigue roto |
| 9 | 🟡 Medio | `Sale.total` entero, pierde centavos | 🟡 Sigue roto |
| 10 | 🟡 Medio | `arrivalTotal` concatena strings | ✅ **Ya estaba resuelto** (no fue esta sesión — el código actual usa un acumulador numérico local, no la concatenación que describía la auditoría anterior) |
| 11 | 🟡 Medio | `PATCH /sales/:id` no hace nada | 🟡 Sigue roto |
| 12 | 🟡 Medio | `sortBy=price\|stock` → 500 | 🟡 Sigue roto |
| 13 | 🟡 Medio | Dashboard revienta con DB vacía | 🟡 Sigue roto |
| 14 | 🟡 Medio | `ADJUST` y `LOST` hacen lo mismo | 🟡 Sigue roto |
| 15 | 🔵 Bajo | N+1 y carga completa en dashboard | 🔵 Sigue igual |
| 16 | 🔵 Bajo | Desfase de zona horaria | 🔵 Sigue igual |
| 17 | 🔵 Bajo | Refresh tokens nunca se purgan | 🔵 Sigue igual |
| 18 | 🔵 Bajo | CI no ejecuta los tests | 🔵 Sigue igual (y ahora hay más tests que se están perdiendo de correr) |
| 19 | 🔵 Bajo | `as any` para evadir tipado | 🔵 Sigue igual |
| 20 | 🔵 Bajo | Validación de stock frágil | 🔵 Sigue igual |
| 21 | 🔵 Bajo | **Nuevo** — devDependencies del frontend con vulnerabilidades | 🔵 Informativo, no crítico |
| 22 | 🟡 Medio | **Nuevo** — `/forgot-password` sigue sin pantalla real | 🟡 Gap de producto, no de seguridad |

---

## Arreglado esta sesión

### [x] 1 y 2. Flujo de reset de contraseña — arreglado

`backend/src/auth/service/auth.service.ts`: `forgotPassword` ahora hashea el
código con el mismo `hashToken()` (SHA-256 determinístico) que ya usaban los
refresh tokens, y `resetPassword` busca al usuario re-hasheando el código
recibido antes de comparar — en vez de comparar el código crudo contra la
columna con el hash de bcrypt (que nunca podía matchear). También se agregó
`@Public()` a `POST /auth/reset-password` en el controller.

**Nota:** el punto de la auditoría anterior que sugería agregar `email` al
DTO de reset y un contador de intentos **no se implementó** — se optó por el
arreglo mínimo que hace que el flujo *funcione* de verdad. La fuerza bruta
sobre un código de 6 dígitos sigue siendo un riesgo real mientras no se
resuelva #6 (rate limit específico).

---

## Ya estaba resuelto (corrección a la auditoría anterior)

### [x] 10. `arrivalTotal` — no está roto

`backend/src/orders/service/orders.service.ts:115-135` usa hoy un
acumulador local (`let arrivalTotal = 0; ... arrivalTotal += detail.arrivalSubtotal`)
donde `detail.arrivalSubtotal` se calculó un renglón antes como
`item.quantity * Number(detail.unitPrice)` — un número real, no un string.
El bug de concatenación que describía la auditoría anterior no está presente
en el código actual. No se tocó en esta sesión; probablemente ya se había
corregido en un commit posterior a la auditoría del 29/07.

---

## Sigue roto — sin cambios desde la auditoría anterior

El resto de los ítems (#3 a #9, #11 a #20) se re-verificaron línea por línea
contra el código actual y **están exactamente igual** que en
`AUDITORIA_2026-07-29.md` — mismos archivos, mismas líneas, mismo
comportamiento. No se repite el detalle acá para no duplicar contenido; ver
ese archivo para la explicación completa de cada uno. Confirmado puntualmente:

- **#3** (`supplies.controller.ts:30,38`): los dos `@Public()` siguen ahí.
- **#6**: `grep -r "@Throttle"` en todo `backend/src` no devuelve nada — ningún
  endpoint tiene throttle propio, incluyendo el `PATCH /auth/me/password`
  agregado en esta sesión (ver #21 más abajo, mismo problema, superficie
  nueva).
- **#7**: `npm audit --omit=dev` en `backend` sigue reportando `multer` (alto)
  y `typeorm` (moderado) sin resolver.
- **#8**: `users.service.ts:123` sigue con `user.email = dto.newEmail;` sin
  `.trim().toLowerCase()` ni chequeo de colisión.
- **#11**: `sales.service.ts:112-118` sigue ignorando `updateSaleDto` por
  completo.
- **#12**: `SortByProduct` sigue declarando `PRICE`/`STOCK` que no existen
  como columnas en `Product`.
- **#13**: `dashboard.service.ts:197` sigue con `reduce()` sin valor inicial.
- **#14**: `adjustments.service.ts` sigue llamando siempre a `decreaseStock`
  sin mirar `adjustmentType`, y `CreateAdjustmentDto.stockChange` sigue
  forzado `@IsPositive()` — sigue siendo imposible ajustar stock hacia arriba.
- **#16**: `dashboard.service.ts:262` (`setHours`, hora local) vs `:267`
  (`toISOString`, UTC) — mismo desfase.
- **#17**: no hay ningún cron/job de limpieza de `refresh_token` en todo
  `auth/`.
- **#18**: `.github/workflows/ci.yml` confirmado de nuevo — ningún job corre
  `npm run test`, ni backend ni frontend. Esto es más relevante ahora: esta
  sesión agregó tests nuevos (auth, products, categories, profile, theme
  service, navbar) que **tampoco se están corriendo en CI** pese a existir.
- **#19**: `production.service.ts:75` sigue con `as any`.
- **#20**: `batch.service.ts:46` y `supplies.service.ts:76` siguen comparando
  contra el snapshot previo en vez de usar el resultado atómico del `UPDATE`.

---

## Hallazgos nuevos de esta sesión

### [ ] 21. Vulnerabilidades en devDependencies del frontend (informativo)

**Archivo:** `frontend/package.json` (devDependencies)

Al instalar `ngx-sonner` para el sistema de toasts, `npm audit` mostró 17
vulnerabilidades — pero **ninguna viene de `ngx-sonner`** (confirmado con
`npm ls ngx-sonner`: no arrastra nada vulnerable). Todas vienen de
`@angular/cli`, que en la v21 empaqueta un SDK de MCP
(`@modelcontextprotocol/sdk` → `hono`/`@hono/node-server`/`fast-uri`) más
herramientas de build (`esbuild`, `vite`, `undici`, `tar`, `postcss`,
`brace-expansion`, `immutable`, `piscina`). `npm audit --omit=dev` (que
excluye devDependencies) da **0 vulnerabilidades** — o sea que nada de esto
se empaqueta en el bundle que corre en el navegador del usuario final, es
todo herramental de desarrollo/build. No requiere acción inmediata, pero
vale la pena correr `npm audit` de nuevo cada tanto porque son dependencias
de una herramienta (`@angular/cli`) que no se controla directamente.

---

### [ ] 22. `/forgot-password` no tiene pantalla real (gap de producto)

**Archivo:** `frontend/src/app/pages/login/login.html`

El login tiene un link a `routerLink="/forgot-password"` pero esa ruta no
existe en `app.routes.ts` — es un link muerto. Esto ya estaba así antes de
esta sesión (no es una regresión), pero como ahora el backend de reset de
contraseña **ya funciona de verdad** (#1 arreglado), tiene sentido priorizar
construir esta pantalla: pedir email → recibir código → ingresar código +
contraseña nueva. Hoy es el único cabo suelto entre "el backend funciona" y
"el usuario puede usarlo".

---

## Lo que está bien resuelto (no tocar) — sigue vigente

Todo lo que la auditoría anterior marcaba como bien hecho sigue siendo
válido hoy (guards globales, refresh tokens con detección de reuso, login
timing-safe, `passwordHash` con `select:false`, `ValidationPipe` estricto,
decrementos de stock atómicos, validación de subida de fotos, R2 sin exponer
keys, frontend sin `innerHTML`/tokens en `localStorage`). Se suma a esta
lista:

- El nuevo endpoint `PATCH /auth/me/password` reusa correctamente la lógica
  de `UsersService.updatePassword` (bcrypt compare + rehash), sin exponer
  nada de más.
- El nuevo filtro `usedBy` en `GET /categories` usa `innerJoin` +
  `.distinct(true)` parametrizado vía TypeORM query builder — sin riesgo de
  inyección SQL.

---

## Orden sugerido de trabajo (actualizado)

1. **#3** — sacar los dos `@Public()` de insumos. Un solo archivo, cero riesgo.
2. **#6** — rate limit propio en `login`, `forgot-password`, `reset-password`
   y ahora también `PATCH /auth/me/password`. Más urgente que antes porque el
   flujo de reset ya funciona de verdad (#1) — sin esto, el código de 6
   dígitos es fuerza-bruteable en minutos.
3. **#22** — construir la pantalla de "olvidé mi contraseña" ahora que el
   backend funciona; si no, arreglar el backend no sirvió de mucho para el
   usuario final.
4. **#4, #5, #7** — igual que antes: invertir la condición de `synchronize`,
   `npm audit fix`, `NODE_ENV` explícito en producción.
5. **#18** — meter `npm run test` en CI antes de seguir tocando lógica de
   negocio (cada vez hay más tests que no se están corriendo).
6. **#8, #9, #11-#14** — bugs de negocio, igual orden que antes.
7. **#15-#17, #19-#21** — limpieza, sin apuro.
