# Auditoría de código — 29/07/2026

Revisión completa del backend NestJS, el frontend Angular, la configuración y las
dependencias. Cada hallazgo tiene ubicación exacta para poder atacarlo después.

Estado: **ningún ítem corregido todavía.** Marcar el checkbox al resolver.

Índice rápido:

| # | Severidad | Título | Archivo |
|---|-----------|--------|---------|
| 1 | 🔴 Crítico | Flujo de reset de contraseña roto | `auth.service.ts` |
| 2 | 🔴 Crítico | `reset-password` exige autenticación | `auth.controller.ts:91` |
| 3 | 🔴 Crítico | Insumos expuestos sin auth | `supplies.controller.ts:30,38` |
| 4 | 🔴 Crítico | `synchronize: true` por defecto | `app.module.ts:69` |
| 5 | 🔴 Crítico | Cookies sin `Secure` | `auth.controller.ts:114` |
| 6 | 🟠 Alto | Sin rate limit en autenticación | `app.module.ts:39` |
| 7 | 🟠 Alto | `multer` con DoS HIGH | `package.json` |
| 8 | 🟠 Alto | `updateEmail` sin normalizar | `users.service.ts:113` |
| 9 | 🟡 Medio | `Sale.total` entero, pierde centavos | `sale.entity.ts:23` |
| 10 | 🟡 Medio | `arrivalTotal` concatena strings | `orders.service.ts:108` |
| 11 | 🟡 Medio | `PATCH /sales/:id` no hace nada | `sales.service.ts:112` |
| 12 | 🟡 Medio | `sortBy=price\|stock` → 500 | `sort-by.enum.ts` |
| 13 | 🟡 Medio | Dashboard revienta con DB vacía | `dashboard.service.ts:197` |
| 14 | 🟡 Medio | `ADJUST` y `LOST` hacen lo mismo | `adjustments.service.ts:40` |
| 15 | 🔵 Bajo | N+1 y carga completa en dashboard | `dashboard.service.ts` |
| 16 | 🔵 Bajo | Desfase de zona horaria | `dashboard.service.ts:260,267` |
| 17 | 🔵 Bajo | Refresh tokens nunca se purgan | `auth.service.ts` |
| 18 | 🔵 Bajo | CI no ejecuta los tests | `.github/workflows/ci.yml` |
| 19 | 🔵 Bajo | `as any` para evadir tipado | `production.service.ts:75` |
| 20 | 🔵 Bajo | Validación de stock frágil | `batch.service.ts:46` |

---

## 🔴 Críticos

### [ ] 1. El flujo de recuperación de contraseña está roto y es inseguro

**Archivos:** `backend/src/auth/service/auth.service.ts:140-180`,
`backend/src/users/repository/users.repository.ts:82-92`

`forgotPassword` genera un código de 6 dígitos y guarda su **hash bcrypt**:

```ts
// auth.service.ts:144-148
const code = randomInt(100000, 999999).toString();
const codeHash = await bcrypt.hash(code, 10);
user.codeHashResetPassword = codeHash;
```

Pero `resetPassword` busca al usuario comparando el **código en crudo contra la
columna del hash**:

```ts
// users.repository.ts:88
.where('u.code_hash_reset_password = :resetPasswordToken', { resetPasswordToken })
```

Un hash bcrypt nunca va a ser igual al código plano → **la función jamás funciona**.

Problemas asociados a resolver en el mismo trabajo:

- Nunca se llama a `bcrypt.compare` para verificar el código.
- No hay contador de intentos: si se arregla la comparación, un código de 6 dígitos
  sin límite se rompe por fuerza bruta en minutos con el throttler actual (ver #6).
- `BCRYPT_COST` se ignora acá: está hardcodeado `bcrypt.hash(code, 10)`.

**Cómo debería quedar:** buscar al usuario por email (no por el hash), verificar el
código con `bcrypt.compare`, chequear expiración, limitar intentos, invalidar el
código al usarlo. El DTO `UserResetPasswordRequest` probablemente necesite `email`
además de `token`.

---

### [ ] 2. `reset-password` exige estar autenticado

**Archivo:** `backend/src/auth/controller/auth.controller.ts:91`

Es el único endpoint del flujo de recuperación **sin `@Public()`**:

```ts
@Post('reset-password')   // ← falta @Public()
async resetPassword(@Body() dto: UserResetPasswordRequest)
```

El guard JWT global lo bloquea con 401. Alguien que olvidó su contraseña no tiene
sesión, por definición: el endpoint es inalcanzable.

---

### [ ] 3. Endpoints de insumos expuestos sin autenticación

**Archivo:** `backend/src/supplies/controller/supplies.controller.ts:30,38`

```ts
@Public()
@Get()
findAll(...)   // stock, costos, proveedores, márgenes — sin login
```

Cualquiera en internet puede listar el inventario completo con precios de costo y
proveedores. No hay razón aparente (el resto de módulos sí exige auth); parece un
`@Public()` de debug que quedó. **Acción:** borrar ambos decoradores.

---

### [ ] 4. `synchronize: true` por defecto en producción

**Archivo:** `backend/src/app.module.ts:69`

```ts
synchronize: config.get('NODE_ENV') !== 'production',
```

El `.env` real **no define `NODE_ENV`** (tiene `PORT`, `POSTGRES_*`, `BCRYPT_COST`,
`JWT_SECRET`, `JWT_EXPIRES_SEC`, `USERS_SOURCE`, `PGADMIN_*`, `R2_*` — nada más).
El patrón "inseguro salvo que alguien se acuerde de setear una variable" falla
abierto: TypeORM alterará/dropeará columnas automáticamente contra la base
productiva.

**Acción:** invertir la condición (`=== 'development'`) y pasar a migraciones.
Agregar `NODE_ENV` al `.env` local.

---

### [ ] 5. Cookies de sesión sin `Secure`

**Archivo:** `backend/src/auth/controller/auth.controller.ts:103-104,114`

```ts
const isProduction = this.configService.get('NODE_ENV') === 'production';
res.cookie(ACCESS_TOKEN_COOKIE, accessToken, { secure: isProduction, ... })
```

Misma causa raíz que #4: sin `NODE_ENV` seteado, el JWT y el refresh token viajan
por HTTP plano.

Mismo problema en `backend/src/email-sender/service/email-sender.service.ts:20`,
donde `rejectUnauthorized: false` desactiva la validación del certificado TLS del
SMTP.

**Acción:** definir `NODE_ENV` explícitamente y validar la config al arrancar
(ej. schema de validación en `ConfigModule.forRoot`) para que la app no levante con
variables faltantes.

---

## 🟠 Altos

### [ ] 6. Sin rate limiting específico en autenticación

**Archivo:** `backend/src/app.module.ts:39-44`

El throttler es global: 100 req/60s. Eso permite **100 intentos de contraseña por
minuto por IP**, y 100 emails de recuperación por minuto (bombing de la casilla de
un usuario + agotamiento de la cuota SMTP).

**Acción:** `@Throttle` propio y agresivo (ej. 5/min) en `login`, `forgot-password`
y `reset-password`.

---

### [ ] 7. Dependencias con vulnerabilidades conocidas

**Archivo:** `backend/package.json`

```
multer 1.0.0 - 2.1.1  (vía @nestjs/platform-express)   [HIGH]
  - DoS via deeply nested field names
  - DoS via incomplete cleanup of aborted uploads
body-parser 2.0.0-2.2.2                                [LOW]
  - DoS: el límite de tamaño se desactiva silenciosamente
typeorm                                                [MODERATE]
  - code injection en migration:generate
```

Relevante porque **sí se expone subida de archivos**
(`backend/src/sales/controller/sales.controller.ts:54`).

**Acción:** `cd backend && npm audit fix`. El frontend está limpio (0 vulns).

---

### [ ] 8. `updateEmail` sin normalizar ni validar duplicados

**Archivo:** `backend/src/users/service/users.service.ts:113-127`

```ts
user.email = dto.newEmail;   // sin .trim().toLowerCase(), sin chequear si existe
```

Todo el resto del sistema normaliza a minúsculas antes de buscar (`login`,
`register`, `existsByEmail`). Si un usuario pone `Admin@X.com`, queda un registro
que **ningún login puede alcanzar** (la búsqueda es por `admin@x.com`) → cuenta
inutilizada. El `unique` de Postgres es case-sensitive, así que no protege.

**Acción:** normalizar + verificar colisión con `existsByEmail` antes de guardar.

---

## 🟡 Bugs de negocio (afectan plata y datos)

### [ ] 9. `Sale.total` es una columna entera — se pierden los centavos

**Archivo:** `backend/src/sales/entities/sale.entity.ts:23`

```ts
@Column({ default: 0 })
total!: number;      // → TypeORM infiere INTEGER
```

Cada `SalesDetail.subtotal` es `decimal(10,2)`. Una venta de $1.234,50 se guarda
como `1235`. El total de la venta **no cuadra con la suma de sus líneas**, y el
dashboard reporta facturación redondeada.

**Acción:** `@Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })` +
migración de los datos ya guardados.

---

### [ ] 10. `arrivalTotal` se corrompe por concatenación de strings

**Archivo:** `backend/src/orders/service/orders.service.ts:108`

```ts
order.arrivalTotal += detail.arrivalSubtotal;
```

`arrivalTotal` es `decimal` → TypeORM lo hidrata como **string** (`"0.00"`). El `+=`
concatena en vez de sumar: `"0.00" + 100` → `"0.00100"` → se guarda 0.001. Dos
líneas arriba sí se usó `Number(detail.unitPrice)`; el wrapper falta justo acá.

Segundo bug en la misma línea: `arrivalSubtotal` ya es el subtotal **acumulado**
(`arrivalQuantity * unitPrice`), pero se le suma al total en cada recepción parcial,
duplicando el importe. Habría que recalcular `arrivalTotal` como la suma de los
subtotales, no acumularlo.

---

### [ ] 11. `PATCH /sales/:id` no hace nada

**Archivo:** `backend/src/sales/service/sales.service.ts:112-118`

```ts
async update(id: number, updateSaleDto: UpdateSaleDto) {
  const sale = await this.findSaleOrFail(id);
  return this.toResponse(await this.salesRepository.update(sale));  // DTO ignorado
}
```

El parámetro nunca se usa. Devuelve 200 y el cliente cree que guardó. El lint de CI
no lo detecta porque el parámetro está "usado" en la firma.

**Decidir:** implementarlo de verdad (con reversión de stock de los detalles
anteriores) o eliminar el endpoint.

---

### [ ] 12. `?sortBy=price` y `?sortBy=stock` devuelven 500

**Archivos:** `backend/src/products/enums/sort-by.enum.ts`,
`backend/src/products/repository/products.repository.ts:89`

El enum declara `PRICE = 'price'` y `STOCK = 'stock'`, pero la entidad `Product`
**no tiene esas columnas** (tiene `salePrice`, `costPrice`, `minStock`; el stock vive
en `Batch`). El `@IsEnum` los acepta y después se arma `orderBy('product.price')`
→ error SQL de columna inexistente.

**Acción:** corregir el enum a los nombres reales (`salePrice`, `costPrice`) y, para
ordenar por stock, hacer join/subquery contra `Batch`.

---

### [ ] 13. El dashboard revienta con la base vacía

**Archivo:** `backend/src/dashboard/dashboard.service.ts:192,197-198`

```ts
return products.reduce((min, p) => ...);   // sin valor inicial
```

Con cero productos: `TypeError: Reduce of empty array with no initial value` → 500
en la home.

Además `p.totalStock / p.minStock` (líneas 192 y 198) divide por `minStock`, cuyo
default es 0 → `NaN`/`Infinity` rompen el orden. La línea 178 sí contempla el caso
(`p.minStock > 0 ? ... : 1`), pero el sort y el reduce no.

---

### [ ] 14. Ajustes de stock: `ADJUST` y `LOST` hacen lo mismo

**Archivo:** `backend/src/adjustments/service/adjustments.service.ts:40-44`

Siempre llama a `decreaseStock` sin mirar `adjustmentType`, y el DTO fuerza
`@IsPositive()`. Es decir: **es imposible ajustar stock hacia arriba**. Si el tipo
`ADJUST` existe para correcciones de inventario, el caso "conté de más" no tiene
forma de registrarse.

**Decidir el comportamiento esperado antes de tocar código.**

---

## 🔵 Rendimiento y calidad

### [ ] 15. N+1 y carga completa de tablas en el dashboard

**Archivo:** `backend/src/dashboard/dashboard.service.ts`

- `getProductStocks:175` — un `SELECT SUM()` por cada producto.
- `getProductionByDate:206` y `getSalesByDate:217` — traen **todos** los registros
  desde la fecha y filtran el límite superior en JavaScript
  (`.filter(p => p.date < nextDay)`), con relaciones anidadas. Crece sin techo con
  el histórico. Debería ser `Between(date, nextDay)` en SQL.
- `getSummary` dispara esto 5 veces en paralelo (hoy, ayer, semana).

---

### [ ] 16. Desfase de zona horaria

**Archivo:** `backend/src/dashboard/dashboard.service.ts:260-268`

`startOfDay` usa hora local del servidor (`setHours`) pero `formatDate:267` usa
`toISOString()` (UTC). En Argentina (UTC-3) las claves del gráfico semanal quedan
corridas un día para la producción de la noche.

---

### [ ] 17. Los refresh tokens nunca se purgan

**Archivo:** `backend/src/auth/service/auth.service.ts`

La tabla `refresh_token` crece indefinidamente; no hay job de limpieza de expirados
ni revocados.

---

### [ ] 18. CI no ejecuta los tests

**Archivo:** `.github/workflows/ci.yml`

Corre `npm ci`, `npm run lint` y `npm run build` en ambas apps — nunca `npm test`, a
pesar de que hay ~30 archivos `.spec.ts`. Los bugs #11 y #12 son exactamente el tipo
de cosa que un test hubiera atajado. El hook de Husky (`.husky/pre-commit`) tampoco
los corre.

---

### [ ] 19. `as any` para evadir el tipado

**Archivo:** `backend/src/production/service/production.service.ts:75`

Al crear el batch. Oculta que `clientBatchDate` y `milkLitersUsed` no encajan en
`Partial<Batch>`.

---

### [ ] 20. Validación de stock frágil

**Archivos:** `backend/src/batch/service/batch.service.ts:46`,
`backend/src/supplies/service/supplies.service.ts:76`

Validan el resultado con `updated.currentStock >= batch.currentStock` contra una
lectura previa hecha fuera del `UPDATE ... WHERE current_stock >= :amount`. El SQL
atómico ya garantiza la condición; sería más robusto usar el `affected` del
resultado del update que comparar contra un snapshot que puede estar viejo.

---

## Lo que está bien resuelto (no tocar)

Para no perderlo de vista al refactorizar, varias cosas están hechas con criterio:

- Guards globales con opt-out explícito (`@Public`, `@Roles`).
- Refresh tokens hasheados con SHA-256 y **detección de reuso** que revoca toda la
  familia de tokens (`auth.service.ts:94-100`).
- Login timing-safe con hash dummy cuando el usuario no existe
  (`auth.service.ts:72-79`).
- `passwordHash` con `select: false` en la entidad.
- `ValidationPipe` con `whitelist` + `forbidNonWhitelisted`.
- Decrementos de stock atómicos en SQL (`UPDATE ... WHERE current_stock >= :amount`).
- Validación real de tipo MIME y tamaño en la subida de fotos.
- Las keys de R2 nunca se exponen al cliente (solo URL firmada o pública).
- Frontend sin `innerHTML`, sin `bypassSecurityTrust`, sin tokens en `localStorage`.

---

## Orden sugerido de trabajo

1. **Bloque crítico (#1-#5)** — acotado, pocos archivos; el flujo de reset hay que
   rehacerlo entero de todos modos.
2. **#7** — `npm audit fix`, es un comando.
3. **#6, #8** — endurecimiento de auth.
4. **#18** — meter tests en CI *antes* de tocar la lógica de negocio, para que los
   arreglos siguientes queden cubiertos.
5. **#9-#14** — bugs de negocio; #9 y #10 requieren migración de datos existentes.
6. **#15-#17, #19-#20** — limpieza.
