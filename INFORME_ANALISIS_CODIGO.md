# INFORME DETALLADO DE ANÁLISIS DE CÓDIGO - LactoStock Backend

**Proyecto:** Sistema de Stock para Empresa Quesera
**Tecnología:** NestJS + TypeORM + PostgreSQL + Angular
**Fecha:** 10 de Julio de 2026

---

## RESUMEN EJECUTIVO

| Severidad | Cantidad |
|-----------|----------|
| **CRÍTICOS** | 18 |
| **ALTOS** | 15 |
| **MEDIOS** | 14 |
| **BAJOS** | 12 |
| **TOTAL** | **59** |

---

## 1. ERRORES CRÍTICOS (Compilación / Runtime / Datos)

### 1.1 `@IsDecimal()` en propiedades de tipo `number` (FALLO DE VALIDACIÓN)
- **Archivo:** `products/dto/request/create-product.dto.ts` líneas 14, 19, 23, 28
- **Archivo:** `supplies/dto/request/create-supply.dto.ts` línea 15
- **Problema:** `@IsDecimal()` de class-validator valida que el valor sea un **string** que represente un decimal (ej: `"12.5"`). Las propiedades de estos DTOs están tipadas como `number` (ej: `salePrice: number`), por lo que la validación siempre falla.
- **Solución:** Reemplazar `@IsDecimal()` por `@IsNumber()` en todas las propiedades numéricas. `@IsNumber()` acepta números con decimales (ej: `12.5`, `99.99`) y es el decorador correcto para campos tipados como `number`.
- **Impacto:** Imposible crear productos o insumos.

### 1.2 Query ILIKE con parámetro roto (ERROR SQL)
- **Archivo:** `products/repository/products.repository.ts` línea 88
- **Archivo:** `categories/repositories/categories.repository.ts` línea 66
- **Código:** `query.where('product.name ILIKE name', { name: '%...%' })`
- **Problema:** Falta `:` antes de `name`. TypeORM interpreta `name` como nombre de columna, no como parámetro. El query falla con error SQL.
- **Solución:** Cambiar a `ILIKE :name`.

### 1.3 Query builder con alias y relación incorrectos en Categories
- **Archivo:** `categories/repositories/categories.repository.ts` líneas 62-63
- **Código:**
  ```typescript
  const query = this.categoriesRepository
    .createQueryBuilder('product')
    .leftJoinAndSelect('product.category', 'category');
  ```
- **Problema:** El repositorio es de `Category` pero usa alias `'product'` y trata de hacer join con `'product.category'` que **no existe** en la entidad Category. Esto es un copy-paste del repositorio de Products.
- **Impacto:** Error de runtime al buscar categorías.

### 1.4 Import inválido de clase interna de TypeORM
- **Archivo:** `categories/entities/category.entity.ts` línea 4
- **Código:** `import { OneToOneInverseSideSubjectBuilder } from 'typeorm/persistence/subject-builder/OneToOneInverseSideSubjectBuilder.js';`
- **Problema:** Importa una clase interna de TypeORM que no se usa. Puede causar errores de compilación.

### 1.5 Dependencia circular entre módulos (SIN `forwardRef`)
- **Archivo:** `production/production.module.ts` ↔ `production-detail/production-detail.module.ts`
- **Archivo:** `orders/orders.module.ts` ↔ `orders-detail/orders-detail.module.ts`
- **Archivo:** `sales/sales.module.ts` ↔ `sales-detail/sales-detail.module.ts`
- **Archivo:** `suppliers/suppliers.module.ts` ↔ `supplies/supplies.module.ts`
- **Problema:** Cada módulo importa al otro sin usar `forwardRef()`. NestJS lanzará error de dependencia circular al iniciar.

### 1.6 Versión de TypeORM `^1.0.0` no existe
- **Archivo:** `backend/package.json` (dependencias)
- **Problema:** La última versión estable de TypeORM es `0.3.x`. La versión `1.0.0` no existe en npm. Esto puede causar fallos en la instalación de dependencias.

### 1.7 Nombre de propiedad incorrecto en repository de OrdersDetail
- **Archivo:** `orders-detail/repository/orders-detail.repository.ts` línea 48
- **Código:** `subtotal: input.subtotal`
- **Problema:** La entidad define la propiedad como `orderedSubtotal`, no `subtotal`. El valor **nunca se persiste**.
- **Solución:** Cambiar a `orderedSubtotal: input.subtotal`.

---

## 2. ERRORES EN LÓGICA DE NEGOCIO (CRÍTICOS)

### 2.1 Ventas NO descuentan stock de productos
- **Archivo:** `sales/service/sales.service.ts` líneas 15-17
- **Archivo:** `sales-detail/service/sales-detail.service.ts` líneas 17-25
- **Problema:** Al crear una venta y sus detalles, **nunca se descuenta el stock** de los productos vendidos. El sistema de stock queda inconsistente.

### 2.2 Eliminar ventas/producción NO revierte stock
- **Archivo:** `sales/service/sales.service.ts` líneas 39-42
- **Archivo:** `production/service/production.service.ts` líneas 84-87
- **Problema:** Al eliminar una venta, el stock descontado no se devuelve. Al eliminar una producción, ni los productos fabricados se descuentan ni los insumos consumidos se devuelven.

### 2.3 Ajustes SIEMPRE descuentan stock sin importar el tipo
- **Archivo:** `adjustments/service/adjustments.service.ts` líneas 40-44
- **Problema:** `create()` siempre llama `decreaseStock()` sin verificar si el `adjustmentType` es `ADJUST` (aumento) o `LOST` (pérdida). Si se busca ajustar stock positivamente, se hará lo contrario.
- **Archivo:** `adjustments/service/adjustments.service.ts` líneas 67-74
- **Problema:** `remove()` siempre llama `increaseStock()` sin verificar el tipo original del ajuste.

### 2.4 `update()` de Products permite modificar `currentStock` directamente
- **Archivo:** `products/service/products.service.ts` líneas 82-83
- **Problema:** Un cliente podría enviar `currentStock` en el body de un PATCH y configurar el stock arbitrariamente. El stock solo debería modificarse vía `decreaseStock`/`increaseStock`.

### 2.5 Condiciones de carrera en todas las operaciones de stock
- **Archivos afectados:**
  - `products/service/products.service.ts` líneas 92-111
  - `supplies/service/supplies.service.ts` líneas 65-83
- **Problema:** Todas las operaciones de stock siguen el patrón: leer entidad → modificar `currentStock` en memoria → guardar. Dos requests concurrentes pueden:
  1. Ambas leer stock = 10
  2. Request A: decrementar 3 → guarda stock = 7
  3. Request B: decrementar 5 → guarda stock = 5 (debería ser 2)
  4. **Resultado:** stock = 5 en vez de 2. Pérdida de actualización.
- **Solución:** Usar actualizaciones atómicas: `UPDATE ... SET current_stock = current_stock - :amount WHERE id = :id AND current_stock >= :amount`

---

## 3. ERRORES DE SEGURIDAD (ALTA PRIORIDAD)

### 3.1 NO existe autenticación
- **Archivo:** `auth/service/auth.service.ts` — Archivo **vacío** (`@Injectable() export class AuthService {}`)
- **Archivo:** `auth/controller/auth.controller.ts` — **Sin endpoints**
- **Problema:** Todos los endpoints de la API son completamente públicos. Cualquier persona puede crear, leer, modificar y eliminar usuarios, productos, ventas, etc.

### 3.2 NO existe autorización
- **Problema:** No hay guards, no hay decoradores `@UseGuards`, no hay verificación de roles. El enum `UserRole` (`ADMIN`/`EMPLOYEE`) existe pero **nunca se verifica**.

### 3.3 Contraseñas sin hashing
- **Problema:** La entidad User tiene campo `hashPassword` pero no se ejecuta ningún hashing. Las contraseñas se guardarían en texto plano.

### 3.4 Sin configuración CORS
- **Archivo:** `src/main.ts`
- **Problema:** No se llama `app.enableCors()`. Las requests cross-origin del frontend Angular serían bloqueadas en producción. En desarrollo, cualquier origen puede acceder a la API.

### 3.5 Sin helmet ni headers de seguridad
- **Problema:** No se instala `helmet`. No hay headers como `X-Content-Type-Options`, `X-Frame-Options`, `Content-Security-Policy`, `HSTS`.

### 3.6 Sin rate limiting
- **Problema:** No se instala `@nestjs/throttler`. Ataques de fuerza bruta o DDoS son triviales.

### 3.7 `synchronize: true` en producción
- **Archivo:** `src/app.module.ts` línea 54
- **Problema:** TypeORM sincroniza el esquema automáticamente. En producción puede **eliminar tablas o columnas**, causando pérdida de datos.

### 3.8 Puerto de base de datos expuesto al host
- **Archivo:** `docker-compose.yml` línea 7
- **Problema:** `ports: - 5434:5432` expone PostgreSQL a todas las interfaces de red del host.

---

## 4. ERRORES DE VALIDACIÓN Y DTOs

### 4.1 Campo `lote` en DTO no coincide con la entidad
- **Archivo:** `products/dto/request/create-product.dto.ts` línea 37
- **Problema:** El DTO tiene `lote?: number` pero la entidad tiene una relación `ManyToOne` con `Batch`. Debería ser `batchId`.

### 4.2 `CategoryResponse` no incluye campo `description`
- **Archivo:** `categories/dto/response/category-response.dto.ts`
- **Problema:** La entidad tiene campo `description` pero el DTO de respuesta solo incluye `id` y `name`.

### 4.3 `SaleResponse.paymentMethod` tipado como `string` en vez de enum
- **Archivo:** `sales/dto/response/sale-response.dto.ts` línea 5

### 4.4 `AdjustmentResponse.adjustmentType` tipado como `string` en vez de enum
- **Archivo:** `adjustments/dto/response/adjustment-response.dto.ts` línea 4

### 4.5 `arrival_total` en snake_case en entidad y DTO
- **Archivo:** `orders/entities/order.entity.ts` línea 37
- **Archivo:** `orders/dto/response/order-response.dto.ts` línea 5
- **Problema:** Todos los demás campos usan camelCase. Debería ser `arrivalTotal` con `@Column({ name: 'arrival_total' })`.

---

## 5. ERRORES DE ENTIDADES

### 5.1 Falta `@JoinColumn` en relación `Product.batch`
- **Archivo:** `products/entities/product.entity.ts` líneas 42-43
- **Problema:** Inconsistente con todas las demás relaciones ManyToOne que sí tienen `@JoinColumn`.

### 5.2 Falta `@JoinColumn` en relación `SalesDetail.sale`
- **Archivo:** `sales-detail/entities/sales-detail.entity.ts` líneas 23-24

### 5.3 Falta columna FK explícita en varias relaciones
- `Order.supplier` → no tiene `supplierId` declarado
- `Sale.client` → no tiene `clientId` declarado
- `Adjustment.product` → no tiene `productId` declarado

---

## 6. PROBLEMAS DE NAVEGACIÓN Y NAMING

### 6.1 Typo sistémico `finById` en todos los repositories
- **15 repositories** usan `finById()` en vez de `findById()`. Aunque funciona (consistente entre interfaz e implementación), rompe la convención estándar.

### 6.2 Typo en nombre de clase: `ProductRespository`
- **Archivo:** `products/repository/products.repository.ts` línea 13
- Falta la 'i' — debería ser `ProductRepository`.

### 6.3 Nombre de archivo con doble punto
- **Archivo:** `shared/enums/paymentMethod..enum.ts`
- Debería ser `paymentMethod.enum.ts`.

### 6.4 Typo en `.env.example`
- **Archivo:** `.env.example` línea 10
- `USERS_SUORCE` → debería ser `USERS_SOURCE`.

### 6.5 Typo en mensaje de error
- **Archivo:** `categories/service/categories.service.ts` línea 33
- `'Category no found'` → `'Category not found'`.

### 6.6 Error no profesional en español
- **Archivo:** `orders/service/orders.service.ts` línea 93
- `'No se q poner'` → debería ser un mensaje descriptivo en inglés.

### 6.7 Inconsistencia de directorios `repositories/` vs `repository/`
- Categories usa `categories/repositories/` (plural)
- Todos los demás módulos usan `repository/` (singular)

---

## 7. IMPLEMENTACIONES FALTANTES

### 7.1 Módulo de Autenticación completamente vacío
- `AuthController` y `AuthService` son stubs. No hay login, JWT, bcrypt, ni guards.

### 7.2 Módulo de SMTP/Email no implementado
- Las variables de entorno SMTP existen pero no hay código que las use.

### 7.3 Frontend Angular mínimo
- Solo tiene un componente Dashboard. No hay routing, HTTP client configurado, ni servicios para consumir la API.

### 7.4 Endpoints PATCH comentados
- `orders-detail`, `production`, `production-detail`, `batch`, `adjustments` tienen PATCHs comentados.

### 7.5 Código muerto en repositories
- `orders.repository.ts`: métodos `create()` y `update()` nunca se llaman.
- `batch.repository.ts`: método `update()` nunca se llama.
- `adjustments.repository.ts`: métodos `create()` y `update()` comentados.

---

## 8. PROBLEMAS DE CONFIGURACIÓN

### 8.1 TypeScript: `noImplicitAny: false` y `strict` deshabilitado
- **Archivo:** `tsconfig.json`
- Permite variables sin tipo explícito, reduciendo la seguridad de tipos.

### 8.2 ESLint: `no-explicit-any` desactivado
- **Archivo:** `eslint.config.mjs` línea 29
- Permite uso de `any` en todo el proyecto.

### 8.3 Dependencia `@nestjs/mapped-types` con versión `*`
- **Archivo:** `backend/package.json`
- Wildcard sin fijar versión — puede romper el build con actualizaciones.

### 8.4 Imports mixtos relativos y absolutos (`src/...`)
- Múltiples entidades usan `'src/production'`, `'src/batch/entities/batch.entity'` como path de import. Solo funciona si `tsconfig.json` tiene `baseUrl` configurado.

---

## 9. PLAN DE CORRECCIÓN RECOMENDADO

### Fase 1 — Emergencia (arreglos inmediatos)
1. Cambiar `@IsDecimal()` por `@IsNumber()` en DTOs de productos e insumos
2. Corregir queries ILIKE: `ILIKE name` → `ILIKE :name` en products y categories repositories
3. Corregir query builder de categories (alias y relación incorrectos)
4. Eliminar import inválido de `category.entity.ts`
5. Corregir `orderedSubtotal` en `orders-detail.repository.ts`
6. Corregir nombre de archivo `paymentMethod..enum.ts` y todos sus imports
7. Corregir `USERS_SUORCE` → `USERS_SOURCE` en `.env.example`
8. Agregar `forwardRef()` en los 4 pares de módulos circulares
9. Verificar/fijar versión de TypeORM en `package.json`

### Fase 2 — Lógica de negocio crítica
1. Implementar flujo de ventas completo con transacción (crear venta → crear detalles → descontar stock)
2. Agregar reversión de stock en `remove()` de ventas y producciones
3. Corregir `adjustments.service.ts` para verificar `adjustmentType` antes de llamar `decreaseStock`/`increaseStock`
4. Proteger `currentStock` en `update()` de products (no permitir modificación directa)
5. Implementar actualizaciones atómicas de stock para prevenir condiciones de carrera

### Fase 3 — Seguridad
1. Implementar autenticación completa (JWT + Passport + bcrypt)
2. Agregar guards de autorización con roles (ADMIN/EMPLOYEE)
3. Instalar y configurar `helmet`
4. Configurar CORS adecuadamente
5. Instalar y configurar `@nestjs/throttler`
6. Desactivar `synchronize: true` en producción, implementar migraciones

### Fase 4 — Mejoras generales
1. Renombrar `finById` → `findById` en todos los repositories
2. Renombrar `ProductRespository` → `ProductRepository`
3. Unificar directorios `repositories/` vs `repository/`
4. Tipar correctamente las propiedades de respuesta (enums, no strings)
5. Agregar campos faltantes en DTOs de respuesta
6. Eliminar código muerto y comentarios innecesarios
7. Habilitar `noImplicitAny` y reglas estrictas de ESLint
