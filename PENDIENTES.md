# PENDIENTES - LactoStock

---

## 1. MAPA DE ENDPOINTS Y PROTECCION

### Convenciones

- **Publico**: Sin autenticacion (`@Public()`). Cualquier request puede acceder.
- **JWT**: Requiere token JWT valido (proteccion global por defecto).
- **JWT + Roles**: Requiere JWT + uno de los roles indicados (`@Roles()`).

### Roles del sistema

| Rol | Descripcion |
|-----|-------------|
| `ADMIN` | Dueño/encargado. Acceso total. Registra empleados. |
| `EMPLOYEE` | Empleado registrado por un ADMIN. Operaciones del dia a dia. |

> Todos los usuarios nuevos son `EMPLOYEE` a menos que sea el primer usuario (automaticamente `ADMIN`).
> El registro de usuarios lo hace exclusivamente un `ADMIN` via `POST /auth/register`.

---

### 1.1 AUTH (`/auth`)

| Metodo | Ruta | Proteccion | Que hace |
|--------|------|------------|----------|
| `POST` | `/auth/register` | `@Roles(ADMIN)` | Registrar un nuevo empleado |
| `POST` | `/auth/login` | `@Public()` | Login, devuelve JWT |
| `POST` | `/auth/forgot-password` | `@Public()` | Envia codigo de reset por email |
| `POST` | `/auth/reset-password` | JWT | Resetear password con codigo |
| `GET` | `/auth/me` | JWT | Obtener datos del usuario logueado |

### 1.2 USERS (`/users`) - Solo ADMIN

| Metodo | Ruta | Proteccion | Que hace |
|--------|------|------------|----------|
| `GET` | `/users` | `@Roles(ADMIN)` | Listar todos los usuarios |
| `GET` | `/users/:id` | `@Roles(ADMIN)` | Ver un usuario por ID |
| `POST` | `/users` | `@Roles(ADMIN)` | Crear usuario |
| `PATCH` | `/users/:id` | `@Roles(ADMIN)` | Editar usuario |
| `DELETE` | `/users/:id` | `@Roles(ADMIN)` | Eliminar usuario |

### 1.3 PRODUCTS (`/products`)

| Metodo | Ruta | Proteccion | Que hace |
|--------|------|------------|----------|
| `GET` | `/products` | JWT | Listar productos |
| `GET` | `/products/:id` | JWT | Ver producto por ID |
| `POST` | `/products` | JWT | Crear producto |
| `PATCH` | `/products/:id` | JWT | Editar producto |
| `DELETE` | `/products/:id` | `@Roles(ADMIN)` | Eliminar producto |

### 1.4 CATEGORIES (`/categories`)

| Metodo | Ruta | Proteccion | Que hace |
|--------|------|------------|----------|
| `GET` | `/categories` | JWT | Listar categorias |
| `GET` | `/categories/:id` | JWT | Ver categoria por ID |
| `GET` | `/categories/:id/products` | JWT | Productos de una categoria |
| `POST` | `/categories` | JWT | Crear categoria |
| `PATCH` | `/categories/:id` | JWT | Editar categoria |
| `DELETE` | `/categories/:id` | `@Roles(ADMIN)` | Eliminar categoria |

### 1.5 CLIENTS (`/clients`)

| Metodo | Ruta | Proteccion | Que hace |
|--------|------|------------|----------|
| `GET` | `/clients` | JWT | Listar clientes |
| `GET` | `/clients/:id` | JWT | Ver cliente por ID |
| `POST` | `/clients` | JWT | Crear cliente |
| `PATCH` | `/clients/:id` | JWT | Editar cliente |
| `DELETE` | `/clients/:id` | `@Roles(ADMIN)` | Eliminar cliente |

### 1.6 SUPPLIERS (`/suppliers`)

| Metodo | Ruta | Proteccion | Que hace |
|--------|------|------------|----------|
| `GET` | `/suppliers` | JWT | Listar proveedores |
| `GET` | `/suppliers/:id` | JWT | Ver proveedor por ID |
| `POST` | `/suppliers` | JWT | Crear proveedor |
| `PATCH` | `/suppliers/:id` | JWT | Editar proveedor |
| `DELETE` | `/suppliers/:id` | `@Roles(ADMIN)` | Eliminar proveedor |

### 1.7 SUPPLIES (`/supplies`)

| Metodo | Ruta | Proteccion | Que hace |
|--------|------|------------|----------|
| `GET` | `/supplies` | JWT | Listar insumos |
| `GET` | `/supplies/:id` | JWT | Ver insumo por ID |
| `POST` | `/supplies` | JWT | Crear insumo |
| `PATCH` | `/supplies/:id` | JWT | Editar insumo |
| `DELETE` | `/supplies/:id` | `@Roles(ADMIN)` | Eliminar insumo |

### 1.8 ORDERS (`/orders`)

| Metodo | Ruta | Proteccion | Que hace |
|--------|------|------------|----------|
| `GET` | `/orders` | JWT | Listar ordenes de compra |
| `GET` | `/orders/:id` | JWT | Ver orden por ID |
| `POST` | `/orders` | JWT | Crear orden de compra |
| `PATCH` | `/orders/:id` | JWT | Registrar llegada de mercaderia |

### 1.9 ORDERS DETAIL (`/orders-detail`)

| Metodo | Ruta | Proteccion | Que hace |
|--------|------|------------|----------|
| `GET` | `/orders-detail` | JWT | Listar detalles de ordenes |
| `GET` | `/orders-detail/:id` | JWT | Ver detalle por ID |
| `DELETE` | `/orders-detail/:id` | `@Roles(ADMIN)` | Eliminar detalle |

### 1.10 SALES (`/sales`)

| Metodo | Ruta | Proteccion | Que hace |
|--------|------|------------|----------|
| `GET` | `/sales` | JWT | Listar ventas |
| `GET` | `/sales/:id` | JWT | Ver venta por ID |
| `POST` | `/sales` | JWT | Registrar venta |
| `PATCH` | `/sales/:id` | JWT | Editar metodo de pago |
| `DELETE` | `/sales/:id` | `@Roles(ADMIN)` | Eliminar venta |

### 1.11 SALES DETAIL (`/sales-detail`)

| Metodo | Ruta | Proteccion | Que hace |
|--------|------|------------|----------|
| `GET` | `/sales-detail` | JWT | Listar detalles de venta |
| `GET` | `/sales-detail/:id` | JWT | Ver detalle por ID |
| `POST` | `/sales-detail` | JWT | Agregar detalle |
| `PATCH` | `/sales-detail/:id` | JWT | Editar detalle |
| `DELETE` | `/sales-detail/:id` | `@Roles(ADMIN)` | Eliminar detalle |

### 1.12 PRODUCTION (`/production`)

| Metodo | Ruta | Proteccion | Que hace |
|--------|------|------------|----------|
| `GET` | `/production` | JWT | Listar producciones |
| `GET` | `/production/:id` | JWT | Ver produccion por ID |
| `POST` | `/production` | JWT | Registrar produccion |

### 1.13 PRODUCTION DETAIL (`/production-detail`)

| Metodo | Ruta | Proteccion | Que hace |
|--------|------|------------|----------|
| `GET` | `/production-detail` | JWT | Listar detalles |
| `GET` | `/production-detail/:id` | JWT | Ver detalle por ID |
| `DELETE` | `/production-detail/:id` | `@Roles(ADMIN)` | Eliminar detalle |

### 1.14 SUPPLIES X PRODUCTION DETAIL

| Metodo | Ruta | Proteccion | Que hace |
|--------|------|------------|----------|
| `GET` | `/supplies-xproduction-detail` | JWT | Listar relaciones |
| `GET` | `/supplies-xproduction-detail/:id` | JWT | Ver por ID |
| `POST` | `/supplies-xproduction-detail` | JWT | Crear relacion |
| `PATCH` | `/supplies-xproduction-detail/:id` | JWT | Editar cantidad |
| `DELETE` | `/supplies-xproduction-detail/:id` | `@Roles(ADMIN)` | Eliminar relacion |

### 1.15 BATCH (`/batch`)

| Metodo | Ruta | Proteccion | Que hace |
|--------|------|------------|----------|
| `GET` | `/batch` | JWT | Listar lotes |
| `GET` | `/batch/:id` | JWT | Ver lote por ID |
| `POST` | `/batch` | JWT | Crear lote |
| `DELETE` | `/batch/:id` | `@Roles(ADMIN)` | Eliminar lote |

### 1.16 ADJUSTMENTS (`/adjustments`)

| Metodo | Ruta | Proteccion | Que hace |
|--------|------|------------|----------|
| `GET` | `/adjustments` | JWT | Listar ajustes |
| `GET` | `/adjustments/:id` | JWT | Ver ajuste por ID |
| `POST` | `/adjustments/:productId` | JWT | Crear ajuste |
| `DELETE` | `/adjustments/:id` | `@Roles(ADMIN)` | Eliminar ajuste |

### 1.17 APP (`/`)

| Metodo | Ruta | Proteccion | Que hace |
|--------|------|------------|----------|
| `GET` | `/` | `@Public()` | Health check |

---

## 2. IMPLEMENTADO - Seguridad y Guards

### 2.1 Guard global con `APP_GUARD`

- `JwtAuthGuard` y `RolesGuard` registrados como guards globales via `APP_GUARD` en `app.module.ts`
- Todos los endpoints requieren JWT por defecto
- Se usa `@Public()` para excluir rutas publicas (login, forgot-password, health check)
- Se usa `@Roles(UserRole.ADMIN)` para endpoints exclusivos de admin (DELETE en casi todos los modulos, todo el modulo USERS)

### 2.2 Rate limiting

- `@nestjs/throttler` configurado globalmente: 100 requests por minuto por IP
- Proteccion contra fuerza bruta y DDoS basico

### 2.3 CORS

- Configurado en `main.ts` con `app.enableCors()`
- Origin por defecto: `http://localhost:4200` (configurable via `CORS_ORIGIN` env var)
- `credentials: true` para soportar cookies/auth headers

### 2.4 Helmet

- `helmet` configurado en `main.ts` con `app.use(helmet())`
- Headers de seguridad: `X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`, etc.

### 2.5 Fix: reset-password sin JWT

- `POST /auth/reset-password` ya NO requiere `JwtAuthGuard`
- El token de reset es suficiente para validar al usuario

### 2.6 Fix: Email injection

- `email-sender.service.ts`: Codigo escapado con `replace(/</g, '&lt;')` antes de interpolar en HTML

### 2.7 Fix: TLS SMTP

- `email-sender.service.ts`: `rejectUnauthorized` ahora depende de `NODE_ENV` (solo `false` en desarrollo)

### 2.8 Fix: DTOs faltantes

- Creados `CreateUserDto` y `UpdateUserDto` en `backend/src/users/dto/request/`
- Barrel export actualizado en `users/dto/index.ts`

### 2.9 Fix: Users service

- Agregados metodos `findOne()`, `create()`, `update(id, dto)`, `remove()`, `save()` al `UsersService`
- Corregido `UserResponse` DTO: `id: string` (UUID) en vez de `number`, eliminado `name` (no existe en entity)

---

## 3. VULNERABILIDADES PENDIENTES

### V1. `synchronize: true` en TypeORM [CRITICO]

- **Archivo:** `backend/src/app.module.ts:60`
- **Problema:** En produccion, TypeORM puede destruir y recrear tablas.
- **Fix:** `synchronize: config.get('NODE_ENV') !== 'production'`

### V2. Sin password policy [MEDIO]

- No hay validacion de complejidad de password mas alla de `@MinLength(8)`
- **Fix:** Agregar validaciones como mayuscula, numero, caracter especial

### V3. Sin account lockout [MEDIO]

- Despues de N intentos fallidos de login, la cuenta no se bloquea
- **Fix:** Implementar contador de intentos fallidos y bloqueo temporal

---

## 4. BUGS PENDIENTES

### B1. OrdersDetail entity tiene columnas duplicadas [CRITICO]

- **Archivo:** `backend/src/orders-detail/entities/orders-detail.entity.ts:22-33`
- Dos propiedades mapeadas a `ordered_subtotal`: `unitPrice` y `orderedSubtotal`
- **Fix:** Renombrar la columna de `unitPrice` a `unit_price`

### B2. Adjustments create() ignora adjustmentType [ALTO]

- **Archivo:** `backend/src/adjustments/service/adjustments.service.ts`
- `create()` siempre decrementa stock sin verificar tipo
- **Fix:** Confirmar que la logica es correcta (ambos decrementan)

### B3. Adjustments remove() siempre incrementa stock [ALTO]

- Al eliminar un ajuste `LOST`, se devuelve stock incorrectamente
- **Fix:** Solo revertir stock si el tipo es `ADJUST`

### B4. SalesDetail.unitPrice mapea a columna incorrecta [MEDIO]

- **Archivo:** `backend/src/sales-detail/entities/sales-detail.entity.ts:16`
- Columna se llama `ordered_subtotal` pero es `unitPrice`
- **Fix:** Cambiar a `unit_price`

### B5. TypeORM version incorrecta [MEDIO]

- **Archivo:** `backend/package.json:34`
- `"typeorm": "^1.0.0"` no existe. Usar `"^0.3.20"`

### B6. Spec files con imports incorrectos [BAJO]

- `sales-detail.controller.spec.ts` y `sales.controller.spec.ts` tienen paths de import incorrectos

---

## 5. CODIGO COMENTADO / MUERTO - PARA DISCUTIR

| # | Tema | Archivo |
|---|------|---------|
| 1 | `Production.remove()` - revertir stock | `production/service/production.service.ts` |
| 2 | `Orders.remove()` - revertir stock de llegadas | `orders/service/orders.service.ts` |
| 3 | Codigo muerto en Orders repository | `orders/repository/orders.repository.ts` |
| 4 | Codigo muerto en Adjustments repository | `adjustments/repository/adjustments.repository.ts` |
| 5 | Unused `findOne` en OrdersDetail service | `orders-detail/service/orders-detail.service.ts` |
| 6 | `SalesService.update()` solo actualiza `paymentMethod` | `sales/service/sales.service.ts` |

---

## 6. ARCHIVOS MODIFICADOS EN ESTE CAMBIO

| Archivo | Cambio |
|---------|--------|
| `backend/package.json` | Agregados `@nestjs/throttler`, `helmet` |
| `backend/src/main.ts` | CORS, Helmet (guards via APP_GUARD en module) |
| `backend/src/app.module.ts` | `ThrottlerModule`, `APP_GUARD` para guards globales |
| `backend/src/shared/decorators/public.decorator.ts` | **Nuevo:** Decorador `@Public()` |
| `backend/src/shared/guards/jwt-auth.guard.ts` | Respeta `@Public()`, usa `Reflector` |
| `backend/src/auth/controller/auth.controller.ts` | `@Public()` en login/forgot-password, quitado guard de reset-password |
| `backend/src/auth/service/auth.service.ts` | Usa `usersService.save()` en vez de `update()` |
| `backend/src/app.controller.ts` | `@Public()` en health check |
| `backend/src/users/controller/users.controller.ts` | `@Roles(ADMIN)` en toda la clase |
| `backend/src/users/service/users.service.ts` | Agregados `findOne`, `create`, `update(id,dto)`, `remove`, `save` |
| `backend/src/users/repository/users.repository.ts` | Fix queries por columna incorrecta |
| `backend/src/users/dto/index.ts` | Exporta `CreateUserDto`, `UpdateUserDto` |
| `backend/src/users/dto/request/create-user.dto.ts` | **Nuevo:** DTO para crear usuarios |
| `backend/src/users/dto/request/update-user.dto.ts` | **Nuevo:** DTO para editar usuarios |
| `backend/src/users/dto/response/user-response.dto.ts` | Fix: `id: string`, eliminado `name` |
| `backend/src/products/controller/products.controller.ts` | `@Roles(ADMIN)` en DELETE |
| `backend/src/categories/controller/categories.controller.ts` | `@Roles(ADMIN)` en DELETE |
| `backend/src/clients/controller/clients.controller.ts` | `@Roles(ADMIN)` en DELETE |
| `backend/src/suppliers/controller/suppliers.controller.ts` | `@Roles(ADMIN)` en DELETE |
| `backend/src/supplies/controller/supplies.controller.ts` | `@Roles(ADMIN)` en DELETE |
| `backend/src/orders/controller/orders.controller.ts` | Limpiado |
| `backend/src/orders-detail/controller/orders-detail.controller.ts` | `@Roles(ADMIN)` en DELETE |
| `backend/src/sales/controller/sales.controller.ts` | `@Roles(ADMIN)` en DELETE |
| `backend/src/sales-detail/controller/sales-detail.controller.ts` | `@Roles(ADMIN)` en DELETE |
| `backend/src/production/controller/production.controller.ts` | Limpiado |
| `backend/src/production-detail/controller/production-detail.controller.ts` | `@Roles(ADMIN)` en DELETE |
| `backend/src/supplies-xproduction-detail/controller/...` | `@Roles(ADMIN)` en DELETE |
| `backend/src/batch/controller/batch.controller.ts` | `@Roles(ADMIN)` en DELETE |
| `backend/src/adjustments/controller/adjustments.controller.ts` | Removidos `UseGuards` manuales |
| `backend/src/email-sender/service/email-sender.service.ts` | Fix HTML injection + TLS |
