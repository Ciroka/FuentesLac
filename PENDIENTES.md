# PENDIENTES - LactoStock

---

## ENDPOINTS Y GUARDS (Resumen)

- **Publico**: Sin autenticacion (`@Public()`).
- **JWT**: Requiere token JWT (proteccion global por defecto).
- **ADMIN**: Requiere JWT + rol ADMIN (`@Roles(ADMIN)`).

### AUTH (`/auth`)

| Metodo | Ruta | Proteccion |
|--------|------|------------|
| `POST` | `/auth/register` | ADMIN |
| `POST` | `/auth/login` | Publico |
| `POST` | `/auth/forgot-password` | Publico |
| `POST` | `/auth/reset-password` | JWT |
| `GET` | `/auth/me` | JWT |

### USERS (`/users`) - Todo ADMIN

| Metodo | Ruta | Proteccion |
|--------|------|------------|
| `GET` | `/users` | ADMIN |
| `GET` | `/users/:id` | ADMIN |
| `POST` | `/users` | ADMIN |
| `PATCH` | `/users/:id` | ADMIN |
| `DELETE` | `/users/:id` | ADMIN |

### PRODUCTS, CATEGORIES, CLIENTS, SUPPLIERS, SUPPLIES

| Modulo | GET / GET :id | POST / PATCH | DELETE |
|--------|---------------|--------------|--------|
| `/products` | JWT | JWT | ADMIN |
| `/categories` | JWT | JWT | ADMIN |
| `/clients` | JWT | JWT | ADMIN |
| `/suppliers` | JWT | JWT | ADMIN |
| `/supplies` | JWT | JWT | ADMIN |

### ORDERS, SALES, PRODUCTION

| Modulo | GET / GET :id | POST / PATCH | DELETE |
|--------|---------------|--------------|--------|
| `/orders` | JWT | JWT | - |
| `/orders-detail` | JWT | - | ADMIN |
| `/sales` | JWT | JWT | ADMIN |
| `/sales-detail` | JWT | JWT / PATCH | ADMIN |
| `/production` | JWT | JWT | - |
| `/production-detail` | JWT | - | ADMIN |

### OTROS

| Modulo | GET / GET :id | POST / PATCH | DELETE |
|--------|---------------|--------------|--------|
| `/supplies-xproduction-detail` | JWT | JWT | ADMIN |
| `/batch` | JWT | JWT | ADMIN |
| `/adjustments` | JWT | JWT | ADMIN |
| `/` | Publico | - | - |

---

## PENDIENTES

### Bugs

| # | Prio | Descripcion | Archivo |
|---|------|-------------|---------|
| B1 | CRITICO | OrdersDetail entity: dos columnas mapeadas a `ordered_subtotal` (`unitPrice` y `orderedSubtotal`) | `orders-detail/entities/orders-detail.entity.ts` |
| B2 | ALTO | Adjustments `remove()` siempre incrementa stock aunque sea `LOST` | `adjustments/service/adjustments.service.ts` |
| B3 | MEDIO | SalesDetail `unitPrice` mapea a columna `ordered_subtotal` en vez de `unit_price` | `sales-detail/entities/sales-detail.entity.ts` |
| B4 | MEDIO | TypeORM `^1.0.0` no existe. Usar `^0.3.20` | `backend/package.json` |
| B5 | BAJO | Spec files con paths de import incorrectos | `sales.controller.spec.ts`, `sales-detail.controller.spec.ts` |

### Seguridad

| # | Prio | Descripcion | Fix |
|---|------|-------------|-----|
| V1 | MEDIO | Sin validacion de complejidad de password mas alla de `@MinLength(8)` | Agregar regex o class-validator custom |
| V2 | MEDIO | Sin account lockout despues de N intentos fallidos | Contador + bloqueo temporal |

### Codigo muerto / para discutir

| # | Tema | Archivo |
|---|------|---------|
| 1 | `Production.remove()` - revertir stock | `production/service/production.service.ts` |
| 2 | `Orders.remove()` - revertir stock | `orders/service/orders.service.ts` |
| 3 | Codigo muerto en Orders repository | `orders/repository/orders.repository.ts` |
| 4 | Codigo muerto en Adjustments repository | `adjustments/repository/adjustments.repository.ts` |
| 5 | Unused `findOne` en OrdersDetail service | `orders-detail/service/orders-detail.service.ts` |
| 6 | `SalesService.update()` solo actualiza `paymentMethod` | `sales/service/sales.service.ts` |
