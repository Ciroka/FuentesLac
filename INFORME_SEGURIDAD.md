# INFORME DE AUDITORÍA DE SEGURIDAD - FuentesLac

**Fecha:** 17 de Julio, 2026
**Auditor:** Experto en Ciberseguridad
**Alcance:** Backend (NestJS/TypeORM) + Frontend (Angular) + Infraestructura

---

## RESUMEN EJECUTIVO

| Severidad | Backend | Frontend | Infraestructura | Total |
|-----------|---------|----------|-----------------|-------|
| **CRÍTICA** | 2 | 3 | 0 | **5** |
| **ALTA** | 7 | 3 | 4 | **14** |
| **MEDIA** | 8 | 4 | 8 | **20** |
| **BAJA** | 6 | 3 | 8 | **17** |
| **TOTAL** | **23** | **13** | **20** | **56** |

---

## HALLAZGOS CRÍTICOS

---

### C1. Flujo de Reset de Contraseña Completamente Roto (Doble Fallo)

**Archivos:**
- `backend/src/auth/service/auth.service.ts` — líneas 117-153
- `backend/src/auth/controller/auth.controller.ts` — líneas 50-55
- `backend/src/users/repository/users.repository.ts` — líneas 82-92

**Descripción:** El endpoint `POST /auth/reset-password` tiene **dos fallos encadenados**:
1. Falta el decorador `@Public()`, por lo que requiere JWT — un usuario que olvidó su contraseña no puede autenticarse y nunca puede llegar a este endpoint.
2. El código se almacena como hash bcrypt (`bcrypt.hash(code, 10)`), pero la búsqueda se hace con una comparación SQL directa (`WHERE code_hash = :rawToken`). Un hash bcrypt **nunca** será igual al código en texto plano, por lo que la consulta siempre falla.

**Impacto:** La funcionalidad de recuperación de contraseña está 100% rota.

**Implementación requerida:**
```typescript
// 1. auth.controller.ts — Agregar @Public()
@Public()
@Post('reset-password')

// 2. users.repository.ts — Usar bcrypt.compare en lugar de comparación SQL
async findOneByResetPasswordToken(token: string): Promise<User | null> {
  const users = await this.usersRepository.find({
    where: { codeHashResetPassword: Not(IsNull()) },
  });
  for (const user of users) {
    if (await bcrypt.compare(token, user.codeHashResetPassword)) return user;
  }
  return null;
}
```

---

### C2. Primer Usuario (Admin) Nunca Puede Registrarse (Dead End)

**Archivos:**
- `backend/src/auth/controller/auth.controller.ts` — línea 28
- `backend/src/auth/service/auth.service.ts` — líneas 39-41

**Descripción:** `POST /auth/register` tiene `@Roles(UserRole.ADMIN)`, pero el primer usuario registrado debería obtener el rol ADMIN automáticamente (línea 41). Como no existe ningún ADMIN para autorizar el registro, **ningún usuario puede crearse** a través de la API.

**Impacto:** La aplicación queda inutilizable tras el despliegue.

**Implementación requerida:**
```typescript
// Opción A: Endpoint de bootstrap (recomendado)
@Public()
@Post('init-admin')
async initAdmin(@Body() dto: InitAdminDto) {
  const count = await this.usersService.countUsers();
  if (count > 0) throw new ForbiddenException('Admin already initialized');
  return this.usersService.createInitialAdmin(dto);
}

// Opción B: Script de seed
// Crear un archivo src/database/seeds/admin.seed.ts
```

---

### C3. Sin Protección contra Fuerza Bruta en Endpoints de Autenticación

**Archivos:**
- `backend/src/app.module.ts` — líneas 36-41
- `backend/src/auth/controller/auth.controller.ts` — líneas 37-48

**Descripción:** El throttle global permite 100 requests/minuto por IP. Un atacante puede intentar ~100 contraseñas por minuto. El endpoint `forgot-password` (público) puede ser explotado para bombardeo de emails.

**Implementación requerida:**
```typescript
// auth.controller.ts
@Throttle({ default: { limit: 5, ttl: 300000 } }) // 5 intentos / 5 min
@Post('login')
async login(...) {}

@Throttle({ default: { limit: 3, ttl: 900000 } }) // 3 intentos / 15 min
@Public()
@Post('forgot-password')
async forgotPassword(...) {}
```

---

### C4. Frontend: Sin Autenticación, Sin HTTP Client, Sin Guards de Ruta

**Archivos:**
- `frontend/src/app/app.routes.ts` — líneas 1-13
- `frontend/src/app/app.config.ts` — líneas 1-11
- `frontend/src/app/pages/login/login.ts` — líneas 1-44 (completo)

**Descripción:**
- Ninguna ruta tiene `canActivate` guard — cualquier usuario accede directamente a `/home`
- `provideHttpClient()` no está configurado — cero comunicación con el backend
- No existe ningún `AuthService` — el login está completamente comentado
- No hay interceptors HTTP para adjuntar tokens

**Impacto:** La capa de seguridad del frontend es inexistente.

**Implementación requerida:**
```typescript
// 1. Crear auth.guard.ts
export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  if (auth.isAuthenticated()) return true;
  inject(Router).navigateByUrl('/');
  return false;
};

// 2. app.routes.ts — Agregar guard
{ path: 'home', component: HomePage, canActivate: [authGuard] }

// 3. app.config.ts — Configurar HttpClient
provideHttpClient(withInterceptors([authInterceptor]))

// 4. Crear auth.service.ts con manejo seguro de tokens
```

---

### C5. `TypeORM synchronize: true` por Defecto — Riesgo de Pérdida de Datos

**Archivo:** `backend/src/app.module.ts` — línea 66

**Descripción:** `synchronize: config.get('NODE_ENV') !== 'production'` — si `NODE_ENV` no está definido (valor por defecto vacío en `.env.example`), synchronize se activa, lo que puede **eliminar columnas y perder datos**.

**Implementación requerida:**
```typescript
synchronize: config.get('NODE_ENV') === 'development', // Solo en desarrollo explícito
```

---

## HALLAZGOS ALTOS

---

### A1. Hash de Contraseña Expuesto en Respuesta de Registro

**Archivo:** `backend/src/auth/service/auth.service.ts` — líneas 44-66

**Descripción:** El objeto `user` devuelto después de `save()` puede contener `passwordHash` en memoria. El DTO de respuesta es una interfaz, no una clase transformada, por lo que se serializan todas las propiedades.

**Implementación requerida:** Seleccionar explícitamente campos al construir la respuesta:
```typescript
return {
  user: { id: user.id, email: user.email, role: user.role, createdAt: user.createdAt },
  access_token,
};
```

---

### A2. Controllers Devuelven Entidades TypeORM Completas (Information Disclosure)

**Archivo:** `backend/src/users/controller/users.controller.ts` — líneas 24-37

**Descripción:** `findAll()` y `findOne()` devuelven entidades crudas que incluyen `deletedAt`, timestamps internos y potencialmente otros campos sensibles.

**Implementación requerida:** Usar `ClassSerializerInterceptor` y DTOs de respuesta con `@Exclude()`.

---

### A3. TLS de SMTP Deshabilitado por Defecto

**Archivo:** `backend/src/email-sender/service/email-sender.service.ts` — línea 20

**Descripción:** `rejectUnauthorized: configService.get('NODE_ENV') === 'production'` — si `NODE_ENV` no está definido, la verificación TLS está **deshabilitada por defecto**, permitiendo ataques MITM sobre códigos de reseteo.

**Implementación requerida:**
```typescript
tls: {
  rejectUnauthorized: configService.get('NODE_ENV') !== 'development',
},
```

---

### A4. CORS con `credentials: true` Sin Validación Estricta de Origen

**Archivo:** `backend/src/main.ts` — líneas 17-20

**Implementación requerida:**
```typescript
const allowedOrigins = (process.env.CORS_ORIGIN || '').split(',').filter(Boolean);
app.enableCors({
  origin: allowedOrigins.length > 0 ? allowedOrigins : false,
  credentials: true,
});
```

---

### A5. Base de Datos Expuesta a Toda la Red

**Archivo:** `backend/docker-compose.yml` — líneas 6-7

**Descripción:** `5434:5432` publica el puerto PostgreSQL a todas las interfaces de red, permitiendo conexión directa a la BD sin pasar por la aplicación.

**Implementación requerida:**
```yaml
ports:
  - "127.0.0.1:5434:5432"  # Solo localhost
```

---

### A6. Sin Verificación de Email + Token de Verificación Nunca Usado

**Archivo:** `backend/src/auth/service/auth.service.ts` — líneas 42-56

**Descripción:** Se genera un `verificationToken` pero no existe endpoint `/auth/verify-email`. El usuario obtiene JWT inmediatamente sin verificar email. Código muerto.

**Implementación requerida:** Implementar endpoint de verificación o eliminar el código muerto y agregar verificación obligatoria antes del login.

---

### A7. Usuarios EMPLOYEE con Acceso Total a Operaciones Financieras

**Archivos:**
- `backend/src/sales/controller/sales.controller.ts` — líneas 40-51
- `backend/src/orders/controller/orders.controller.ts` — líneas 37-48
- `backend/src/adjustments/controller/adjustments.controller.ts` — líneas 37-43
- `backend/src/production/controller/production.controller.ts` — líneas 27-30
- `backend/src/batch/controller/batch.controller.ts` — líneas 32-50

**Descripción:** Cualquier empleado puede crear/modificar ventas, órdenes de compra, ajustes de inventario y registros de producción.

**Implementación requerida:** Aplicar `@Roles(UserRole.ADMIN)` a operaciones financieras sensibles.

---

### A8. Script CDN Cargado sin SRI (Subresource Integrity)

**Archivo:** `index.html` — línea 7

**Descripción:** Chart.js se carga desde CDN sin atributo `integrity`, permitiendo ataques de supply chain.

**Implementación requerida:**
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js"
  integrity="sha384-XXXX"
  crossorigin="anonymous"></script>
```

---

### A9. Frontend: Import CSS Sospechoso desde cloudflare.com

**Archivo:** `frontend/src/styles.scss` — línea 1

**Descripción:** `@import "https://cloudflare.com"` importa la homepage HTML de Cloudflare, no un CSS. Puede fallar silenciosamente o ser vector de ataque.

**Implementación requerida:** Eliminar esta línea. Si se necesita un recurso de Cloudflare, usar la ruta completa del archivo CSS/font.

---

### A10. Frontend: Sin Almacenamiento de Tokens ni Interceptors HTTP

**Archivos:** Todos los archivos en `frontend/src/app/`

**Implementación requerida:** Crear `auth.service.ts` con HttpOnly cookies (preferido) o `sessionStorage`, y un `auth.interceptor.ts` para adjuntar Bearer tokens.

---

### A11. CI/CD Sin Tests Ni Auditoría de Dependencias

**Archivo:** `.github/workflows/ci.yml`

**Descripción:** El pipeline ejecuta lint y build pero nunca ejecuta `npm test` ni `npm audit`.

**Implementación requerida:**
```yaml
- name: Test
  run: npm test
- name: Audit dependencies
  run: npm audit --audit-level=high
```

---

### A12. `dist/` Committed con Source Maps Expuestos

**Archivo:** `backend/dist/`

**Descripción:** Los archivos `.js.map` exponen el código TypeScript original. Está en `.gitignore` pero ya fue tracked.

**Implementación requerida:**
```bash
git rm -r --cached backend/dist
```

---

### A13. Soft-Deleted Users: Login No Explícitamente Bloqueado

**Archivo:** `backend/src/users/repository/users.repository.ts` — líneas 58-63

**Descripción:** `findOneByEmailWithPassword()` usa QueryBuilder sin filtro explícito `WHERE deleted_at IS NULL`. Depende del comportamiento implícito de TypeORM.

**Implementación requerida:**
```typescript
.where('u.email = :email AND u.deleted_at IS NULL', { email })
```

---

### A14. Hash Dummy para Mitigación de Timing Attack con Formato Inválido

**Archivo:** `backend/src/auth/service/auth.service.ts` — líneas 73-77

**Descripción:** El hash dummy para timing-attack usa un formato bcrypt inválido (`'$2b$12$invalidhashforsecuritypurposesdummy'`).

**Implementación requerida:**
```typescript
const DUMMY_HASH = '$2b$12$' + 'a'.repeat(53); // Formato bcrypt válido
```

---

## HALLAZGOS MEDIOS

---

### M1. Contraseñas sin Requisitos de Complejidad

**Archivos:**
- `backend/src/auth/dto/request/user-register-request.dto.ts` — líneas 7-9
- `backend/src/users/dto/request/user-change-password.dto.ts` — líneas 7-9

**Implementación requerida:**
```typescript
@MinLength(12)
@MaxLength(72)
@Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/)
password!: string;
```

---

### M2. No hay Límite de Tamaño en Request Body

**Archivo:** `backend/src/main.ts`

**Implementación requerida:**
```typescript
app.use(express.json({ limit: '1mb' }));
```

---

### M3. Enum `sortBy` con Nombres de Columna Incorrectos

**Archivo:** `backend/src/products/enums/sort-by.enum.ts`

**Implementación requerida:**
```typescript
export enum SortByProduct {
  PRICE = 'sale_price',  // No 'price'
  STOCK = 'current_stock',  // No 'stock'
}
```

---

### M4. Entity User `name` es NOT NULL pero No se Recoge en Registro

**Archivos:**
- `backend/src/users/entities/user.entity.ts` — línea 17
- `backend/src/auth/service/auth.service.ts` — líneas 44-49

**Implementación requerida:** Agregar `name` al DTO de registro o hacer la columna nullable.

---

### M5. JWT No Se Puede Revocar

**Archivos:**
- `backend/src/auth/strategies/jwt.strategy.ts`
- `backend/src/auth/service/auth.service.ts`

**Implementación requerida:** Implementar token blocklist (Redis) o usar tokens de corta duración con refresh tokens.

---

### M6. `PartialType` en Update DTOs — Riesgo de Mass Assignment

**Archivos:**
- `backend/src/sales/dto/request/update-sale.dto.ts`
- `backend/src/products/dto/request/update-product.dto.ts`
- `backend/src/orders/dto/request/update-order.dto.ts`

**Implementación requerida:** Crear DTOs explícitos con solo los campos editables en lugar de `PartialType(CreateDto)`.

---

### M7. Sin Verificación de Unicidad de Email en Clientes/Suppliers

**Archivos:**
- `backend/src/clients/service/clients.service.ts`
- `backend/src/suppliers/service/suppliers.service.ts`

---

### M8. Ajustes de Inventario Solo Permiten Disminuir Stock

**Archivo:** `backend/src/adjustments/service/adjustments.service.ts` — líneas 33-55

---

### M9. Docker Compose Sin Resource Limits ni Network Isolation

**Archivo:** `backend/docker-compose.yml`

---

### M10. `sourceMap: true` en Producción

**Archivo:** `backend/tsconfig.json` — línea 14

**Implementación requerida:** Agregar en `tsconfig.build.json`:
```json
{ "extends": "./tsconfig.json", "compilerOptions": { "sourceMap": false } }
```

---

### M11. `@nestjs/mapped-types` con Versión Wildcard `*`

**Archivos:** `root/package.json` línea 28, `backend/package.json` línea 28

**Implementación requerida:** Fijar versión: `"@nestjs/mapped-types": "^2.0.0"`

---

### M12. ESLint Sin Reglas de Seguridad

**Archivo:** `backend/eslint.config.mjs`

**Implementación requerida:** Agregar `eslint-plugin-security` con reglas recomendadas.

---

### M13. Frontend Sin Directorio `environments/`

**Implementación requerida:** Crear `src/environments/environment.ts` y `environment.prod.ts`.

---

### M14. Frontend: Login Form Sin Protección CSRF

**Archivo:** `frontend/src/app/pages/login/login.html` — línea 11

---

### M15. Dashboard Component Huérfano y Sin Proteger

**Archivos:** `frontend/src/app/dashboard/dashboard.ts`, `frontend/src/app/app.routes.ts`

---

### M16. CI Sin Permisos Restrictivos

**Archivo:** `.github/workflows/ci.yml`

**Implementación requerida:**
```yaml
permissions:
  contents: read
```

---

### M17. `strict: true` No Habilitado en Backend TypeScript

**Archivo:** `backend/tsconfig.json`

---

### M18. `no-explicit-any` Deshabilitado en ESLint Backend

**Archivo:** `backend/eslint.config.mjs` — línea 29

---

## HALLAZGOS BAJOS

---

### B1. Sin Interceptor de Request-ID para Auditoría

**Archivo:** `backend/src/main.ts`

**Implementación requerida:** Agregar `RequestIdInterceptor`.

---

### B2. Admin Puede Eliminarse a Sí Mismo

**Archivo:** `backend/src/users/controller/users.controller.ts` — líneas 34-37

**Implementación requerida:**
```typescript
if (req.user.sub === id) throw new ForbiddenException('Cannot delete yourself');
```

---

### B3. Sin Prevención de Reutilización de Contraseñas

**Archivo:** `backend/src/users/service/users.service.ts` — líneas 89-111

**Implementación requerida:** Almacenar historial de hashes previos.

---

### B4. JWT `expiresIn` con Fallback Silencioso a 3600s

**Archivo:** `backend/src/auth/auth.module.ts` — líneas 29-30

**Implementación requerida:** Usar `getOrThrow()` para `JWT_EXPIRES_SEC`.

---

### B5. `.env.example` sin Guías de Valores Mínimos

**Archivo:** `backend/.env.example`

**Implementación requerida:** Agregar comentarios con valores mínimos recomendados.

---

### B6. `CORS_ORIGIN` Soporta Solo un Origen

**Archivo:** `backend/src/main.ts` — línea 18

**Implementación requerida:** Soportar lista separada por comas de orígenes permitidos.

---

### B7. Tests Rotos (Imports Incorrectos)

**Archivos:**
- `frontend/src/app/pages/login/login.spec.ts` — línea 3
- `frontend/src/app/pages/home/home.spec.ts` — línea 3

**Implementación requerida:** Corregir imports de `Login` a `LoginPage` y de `Home` a `HomePage`.

---

### B8. `app.html` con `<!DOCTYPE>` Anidado Inválido

**Archivo:** `frontend/src/app/app.html` — líneas 1-11

**Implementación requerida:** Eliminar el wrapper `<!DOCTYPE>`, `<html>`, `<head>`, `<body>`. Dejar solo `<router-outlet></router-outlet>`.

---

### B9. Sin `autocomplete` en Campo Password

**Archivo:** `frontend/src/app/pages/login/login.html` — línea 26

**Implementación requerida:** Agregar `autocomplete="current-password"`.

---

### B10. Husky con Estructura Deprecada

**Archivo:** `.husky/_/`

**Implementación requerida:** Actualizar a convenciones husky v9.

---

### B11. CI usa `ubuntu-latest` Sin Fijar Versión

**Archivo:** `.github/workflows/ci.yml` — línea 12

**Implementación requerida:** Usar `ubuntu-24.04`.

---

### B12. Node Version No Fijada a Patch

**Archivo:** `.github/workflows/ci.yml` — línea 22

**Implementación requerida:** Usar `20.18.0`.

---

### B13. Dependencias Backend Duplicadas en Root

**Archivo:** `root/package.json`

**Implementación requerida:** Mover dependencias backend exclusivamente a `backend/package.json`.

---

### B14. Sin `engines` en `backend/package.json`

**Archivo:** `backend/package.json`

**Implementación requerida:** Agregar `"engines": { "node": ">=20.0.0" }`.

---

### B15. Docker Compose Sin Healthcheck

**Archivo:** `backend/docker-compose.yml`

**Implementación requerida:**
```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U $POSTGRES_USER -d $POSTGRES_DB"]
  interval: 10s
  timeout: 5s
  retries: 5
```

---

### B16. `index.html` con innerHTML (XSS Potencial)

**Archivo:** `index.html` — líneas 408-536

**Implementación requerida:** Usar `textContent` para datos de texto, o sanitizar con DOMPurify.

---

### B17. Sin `strictBindCallApply` en TypeScript Backend

**Archivo:** `backend/tsconfig.json` — línea 22

**Implementación requerida:** Habilitar `"strictBindCallApply": true`.

---

## HALLAZGOS POSITIVOS (Buenas Prácticas Detectadas)

1. **Guard JWT Global** — Todos los endpoints protegidos por defecto
2. **ValidationPipe** — `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`
3. **Helmet habilitado** — Headers de seguridad configurados
4. **Password hashing con bcrypt** — Costo configurable
5. **`select: false` en `passwordHash`** — Excluido de queries
6. **Mitigación de timing attacks** — Hash dummy en login
7. **SQL Injection: CERO vulnerabilidades** — Todas las queries usan parámetros tipados
8. **`.env` correctamente gitignored** — No hay secrets commiteados
9. **RBAC implementado** — Roles ADMIN/EMPLOYEE con guards
10. **Operaciones atómicas de stock** — `WHERE current_stock >= :amount`

---

## PLAN DE REMEDIACIÓN PRIORIZADO

| Prioridad | Hallazgo | Acción | Esfuerzo |
|-----------|----------|--------|----------|
| **P1** | C1 | Fix reset password (auth + repository) | 2h |
| **P2** | C2 | Bootstrap script para primer admin | 1h |
| **P3** | C3 | Throttle estricto en auth endpoints | 30min |
| **P4** | C4 | Implementar auth completo en frontend | 8h |
| **P5** | C5 | Cambiar `synchronize` default a `false` | 5min |
| **P6** | A3 | Fix TLS SMTP | 5min |
| **P7** | A5 | Restringir puerto BD a localhost | 5min |
| **P8** | A7 | Restringir roles en operaciones financieras | 2h |
| **P9** | A8 | Agregar SRI a CDN script | 15min |
| **P10** | A12 | Remover `dist/` del tracking de git | 5min |
| **P11** | M1 | Requisitos de complejidad de contraseña | 30min |
| **P12** | M5 | Implementar token revocation | 4h |
| **P13** | M10 | Deshabilitar sourceMap en producción | 5min |
| **P14** | M11 | Fijar versión de `@nestjs/mapped-types` | 5min |
| **P15** | A11 | Agregar tests y audit al CI | 2h |

---

## ANÁLISIS DE INYECCIÓN SQL

Todos los archivos repository fueron examinados para SQL raw y query builder:

| Repository | Método | Riesgo de Inyección |
|---|---|---|
| `users.repository.ts` | `ILIKE :name` | SEGURO - parametrizado |
| `products.repository.ts` | `ILIKE :name`, `product.${sortBy}` | SEGURO - validado por enum |
| `categories.repository.ts` | `ILIKE :name`, `category.${sortBy}` | SEGURO - validado por enum |
| `suppliers.repository.ts` | `ILIKE :name` | SEGURO - parametrizado |
| `supplies.repository.ts` | `ILIKE :name` | SEGURO - parametrizado |
| `clients.repository.ts` | `ILIKE :name` | SEGURO - parametrizado |
| `orders.repository.ts` | `supplierId` | SEGURO - parametrizado |
| `sales.repository.ts` | `clientId` | SEGURO - parametrizado |
| `adjustments.repository.ts` | `batchId` | SEGURO - parametrizado |
| `batch.repository.ts` | `productId`, `decreaseStockAtomic` | SEGURO - parametrizado |
| `sales-detail.repository.ts` | `batchId` | SEGURO - parametrizado |

**No se encontraron vulnerabilidades de inyección SQL.** Todas las queries usan bindings parametrizados de TypeORM.

---

*Fin del informe.*
