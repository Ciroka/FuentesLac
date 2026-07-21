# StockAI (Fuente Lac) — Resumen de Sesión y Guía de Desarrollo

## Índice

1. [Resumen de la sesión](#1-resumen-de-la-sesión)
2. [Cambios implementados](#2-cambios-implementados)
3. [Reglas de negocio](#3-reglas-de-negocio)
4. [Autenticación (JWT)](#4-autenticación-jwt)
5. [Guía: cómo conectar una nueva sección al backend](#5-guía-cómo-conectar-una-nueva-sección-al-backend)
6. [Guía: endpoints disponibles](#6-guía-endpoints-disponibles)
7. [Guía: cómo agregar un nuevo endpoint protegido](#7-guía-cómo-agregar-un-nuevo-endpoint-protegido)
8. [Datos de prueba en la DB](#8-datos-de-prueba-en-la-db)
9. [Comandos útiles](#9-comandos-útiles)

---

## 1. Resumen de la sesión

Se implementó la **conexión completa entre frontend (Angular 19+) y backend (NestJS 11)** para las secciones de Productos, Ventas, Clientes y Dashboard. Antes de esta sesión, solo Supplies estaba conectado. Además se implementó el **sistema de autenticación JWT** en el frontend, se corrigieron **bugs de seguridad** en el backend, y se limpiaron **datos duplicados** en la base de datos.

### Lo que se hizo:

| Área | Descripción |
|------|-------------|
| **Frontend ↔ Backend** | Conecté Products, Sales, Clients y Home con sus respectivos servicios HTTP |
| **Autenticación** | Creé AuthService, HTTP interceptor JWT, completé el flow de login |
| **Seguridad backend** | Corregí guards: solo ADMIN puede crear productos e insumos |
| **Limpieza DB** | Eliminé supply duplicado (ID 7), agregué constraint UNIQUE |
| **Stock real** | Products ahora muestra stock real de batches (no más hardcodeado) |
| **UI** | Navbar muestra usuario logueado, rol, y botón de logout |
| **Scroll** | Agregué scroll vertical en todas las tablas con muchos registros |
| **Login** | Completé componente de login (estaba todo comentado) |
| **Rutas** | Agregué ruta por defecto (`/login`) y wildcard para 404 |

---

## 2. Cambios implementados

### 2.1 Archivos creados

| Archivo | Descripción |
|---------|-------------|
| `frontend/src/app/models/product.model.ts` | Interface `Product` |
| `frontend/src/app/models/sale.model.ts` | Interface `Sale` |
| `frontend/src/app/models/client.model.ts` | Interface `Client` |
| `frontend/src/app/services/products.service.ts` | `ProductsService` con `findAllWithStock()` |
| `frontend/src/app/services/sales.service.ts` | `SalesService` con `findAll()` |
| `frontend/src/app/services/clients.service.ts` | `ClientsService` con `findAll()` |
| `frontend/src/app/services/dashboard.service.ts` | `DashboardService` con datos agregados |
| `frontend/src/app/services/auth.service.ts` | `AuthService` — login, token, logout, role |
| `frontend/src/app/interceptors/auth.interceptor.ts` | HTTP interceptor para JWT |

### 2.2 Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `backend/src/supplies/controller/supplies.controller.ts` | `POST /supplies`: `@Public()` → `@Roles(ADMIN)` |
| `backend/src/products/controller/products.controller.ts` | `POST /products`: agregado `@Roles(ADMIN)` |
| `frontend/src/app/app.config.ts` | Agregado `withInterceptors([authInterceptor])` |
| `frontend/src/app/app.routes.ts` | Ruta default `'' → /login`, wildcard `**` |
| `frontend/src/app/pages/login/login.ts` | Completado flow de login con AuthService |
| `frontend/src/app/pages/products/products.ts` | Reescrito: carga datos + stock real de batches |
| `frontend/src/app/pages/products/products.html` | Reemplazado HTML hardcodeado con `@for` dinámico |
| `frontend/src/app/pages/products/products.scss` | Agregados estilos `.stock-cell`, `.stockbar` |
| `frontend/src/app/pages/sales/sales.ts` | Reescrito: carga datos del backend |
| `frontend/src/app/pages/sales/sales.html` | Tabla dinámica con fecha, cliente, método, total |
| `frontend/src/app/pages/clients/clients.ts` | Reescrito: carga datos del backend |
| `frontend/src/app/pages/clients/clients.html` | Tabla dinámica con nombre, teléfono, CUIT, email |
| `frontend/src/app/pages/home/home.ts` | Reescrito: carga datos agregados del dashboard |
| `frontend/src/app/pages/home/home.html` | Reemplazados valores hardcodeados con datos reales |
| `frontend/src/app/shared/navbar/navbar.ts` | Inyecta AuthService, muestra usuario + logout |
| `frontend/src/app/shared/navbar/navbar.html` | Agregado email, rol, botón logout |
| `frontend/src/app/shared/navbar/navbar.scss` | Estilos `.user-info`, `.user-role`, `.logout-btn` |
| `frontend/src/styles.scss` | Agregada clase `.table-scroll` |
| `frontend/src/app/pages/supplies/supplies.html` | Agregada clase `table-scroll` |

### 2.3 Cambios en DB

- Eliminado supply duplicado (ID 7 "Cuajo líquido")
- Agregado `ALTER TABLE supplies ADD CONSTRAINT uk_supply_name UNIQUE (name)`

---

## 3. Reglas de negocio

| Regla | Implementación |
|-------|---------------|
| Solo **ADMIN** puede crear productos | `POST /products` → `@Roles(UserRole.ADMIN)` en `products.controller.ts` |
| Solo **ADMIN** puede crear insumos | `POST /supplies` → `@Roles(UserRole.ADMIN)` en `supplies.controller.ts` |
| El **stock de productos** se modifica solo via | Producción (crea lotes), Ventas (descuenta stock), Compras (aumenta stock de insumos) |
| El **stock de insumos** se modifica solo via | Órdenes de compra (aumenta), Producción (consume) |
| **No** se permite ajuste manual de stock | No hay endpoint PATCH para stock directo |
| Roles del sistema | `ADMIN` y `EMPLOYEE` (enum `UserRole`) |

---

## 4. Autenticación (JWT)

### Cómo funciona

```
┌──────────────┐     POST /auth/login      ┌──────────────┐
│    Login      │ ──────────────────────▶   │   Backend    │
│  (Angular)    │ ◀──────────────────────   │   (NestJS)   │
└──────────────┘   { access_token, user }   └──────────────┘
        │
        ▼
  localStorage:
  - stockai_token  (JWT)
  - stockai_user   (JSON: { id, email, role })
        │
        ▼
  HTTP Interceptor adjunta:
  Authorization: Bearer <token>
  en cada request al backend
```

### Archivos involucrados

| Archivo | Rol |
|---------|-----|
| `services/auth.service.ts` | Maneja login, logout, token, usuario, rol |
| `interceptors/auth.interceptor.ts` | Inyecta JWT en cada HTTP request, maneja 401 |
| `app.config.ts` | Registra el interceptor |
| `pages/login/login.ts` | UI de login, llama a `authService.login()` |
| `shared/navbar/navbar.ts` | Muestra usuario y botón logout |

### Guardar un nuevo usuario en la DB

El backend requiere al menos un usuario ADMIN para funcionar. Si necesitás crear uno:

```bash
# Generar hash bcrypt (desde la carpeta backend)
node -e "const bcrypt = require('bcrypt'); console.log(bcrypt.hashSync('TuPassword!', 12));"

# Insertar en la DB via Docker
docker exec backend-stockAIDB-1 psql -U postgres -d stockAIDB -c \
  "INSERT INTO public.user (id, name, email, password_hash, role, created_at) \
   VALUES (gen_random_uuid(), 'Admin', 'admin@fuentelac.com', '<HASH>', 'ADMIN', NOW());"
```

### Credenciales de prueba

- **Email**: `admin@fuentelac.com`
- **Password**: `Admin123!`
- **Rol**: `ADMIN`

---

## 5. Guía: cómo conectar una nueva sección al backend

Para conectar una sección del frontend que aún no tiene backend (ej: Producción), seguí estos pasos:

### Paso 1: Crear el modelo (`models/*.model.ts`)

Escribí una interface TypeScript que espeje el `*Response` del backend:

```typescript
// models/production.model.ts
export interface Production {
  id: number;
  productionDate: Date;
}
```

> **Referencia**: Mirá el DTO de response en `backend/src/<modulo>/dto/response/<entity>-response.dto.ts`

### Paso 2: Crear el servicio (`services/*.service.ts`)

Creá un servicio que use `HttpClient` + `environment.apiUrl`:

```typescript
// services/productions.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Production } from '../models/production.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProductionsService {
  private api = `${environment.apiUrl}/production`;
  private readonly http = inject(HttpClient);

  findAll(limit = 1000): Observable<Production[]> {
    return this.http.get<{ items: Production[] }>(`${this.api}?limit=${limit}`).pipe(
      map(res => res.items)
    );
  }
}
```

> **Nota**: El backend retorna `{ items: T[], total, page, limit }`. El método `.pipe(map(res => res.items))` extrae solo los items.

> **Seguridad**: El HTTP interceptor ya está configurado. Todas las peticiones HTTP automáticamente envían el JWT si el usuario está logueado.

### Paso 3: Crear el componente (`pages/*/`)

```typescript
// pages/production/production.ts
import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { Navbar } from '../../shared/navbar/navbar';
import { CommonModule } from '@angular/common';
import { ProductionsService } from '../../services/productions.service';
import { Production } from '../../models/production.model';

@Component({
  selector: 'app-production',
  standalone: true,
  imports: [Navbar, CommonModule],
  templateUrl: './production.html',
  styleUrl: './production.scss',
})
export class Production implements OnInit {
  private service = inject(ProductionsService);
  private cdr = inject(ChangeDetectorRef);

  producciones: Production[] = [];

  ngOnInit(): void {
    this.service.findAll().subscribe({
      next: (data) => {
        this.producciones = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error:', err)
    });
  }
}
```

### Paso 4: Crear el template HTML

```html
<!-- pages/production/production.html -->
<div><app-navbar></app-navbar></div>

<main class="contenido">
  <div class="view-header">
    <h2>Producción</h2>
  </div>

  <div class="card table-scroll">
    <table>
      <thead>
        <tr><th>#</th><th>Fecha</th></tr>
      </thead>
      <tbody>
        @for (item of producciones; track item.id) {
          <tr>
            <td>{{ item.id }}</td>
            <td>{{ item.productionDate | date:'dd/MM/yyyy HH:mm' }}</td>
          </tr>
        }
      </tbody>
    </table>
  </div>
</main>
```

### Paso 5: Registrar la ruta

En `app.routes.ts`:

```typescript
{
  path: 'production',
  loadComponent: () => import('./pages/production/production').then((m) => m.Production),
},
```

### Paso 6: Ejecutar verificación

```bash
cd frontend
npx ng build    # Verificar que compila
npx ng lint     # Verificar código
```

---

## 6. Guía: endpoints disponibles

### Autenticación

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/auth/login` | No | Login, retorna JWT |
| GET | `/auth/me` | Sí | Datos del usuario actual |
| POST | `/auth/register` | ADMIN | Registrar usuario |
| POST | `/auth/forgot-password` | No | Solicitar reset de contraseña |
| POST | `/auth/reset-password` | Sí | Resetear contraseña con token |

### CRUD Principales

| Método | Ruta | Auth | Roles | Descripción |
|--------|------|------|-------|-------------|
| GET | `/supplies` | No | Público | Listar insumos |
| POST | `/supplies` | Sí | ADMIN | Crear insumo |
| GET | `/products` | Sí | Cualquiera | Listar productos |
| POST | `/products` | Sí | ADMIN | Crear producto |
| GET | `/products/:id/stock-status` | Sí | Cualquiera | Stock real de un producto |
| GET | `/clients` | Sí | Cualquiera | Listar clientes |
| POST | `/clients` | Sí | Cualquiera | Crear cliente |
| GET | `/sales` | Sí | Cualquiera | Listar ventas |
| POST | `/sales` | Sí | Cualquiera | Crear venta (descuenta stock) |
| GET | `/categories` | Sí | Cualquiera | Listar categorías |
| GET | `/suppliers` | Sí | Cualquiera | Listar proveedores |
| GET | `/batch` | Sí | Cualquiera | Listar lotes |
| GET | `/production` | Sí | Cualquiera | Listar producciones |
| POST | `/production` | Sí | Cualquiera | Crear producción |

### Paginación

Todos los endpoints `GET` de listado soportan paginación:

```
GET /products?page=1&limit=10&order=ASC&name=queso
```

Respuesta:
```json
{
  "items": [...],
  "total": 42,
  "page": 1,
  "limit": 10
}
```

Los servicios del frontend usan `limit=1000` para traer todo de una vez (patrón establecido en Supplies).

---

## 7. Guía: cómo agregar un nuevo endpoint protegido

### En el backend (NestJS)

1. **Crear el controller** en `backend/src/<modulo>/controller/`:

```typescript
import { Controller, Get, Post, Body } from '@nestjs/common';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { UserRole } from 'src/shared/enums';

@Controller('mi-modulo')
export class MiModuloController {

  @Get()           // Cualquiera autenticado
  findAll() { ... }

  @Roles(UserRole.ADMIN)  // Solo ADMIN
  @Post()
  create() { ... }
}
```

2. **Decoradores de seguridad disponibles**:

| Decorador | Efecto |
|-----------|--------|
| `@Public()` | No requiere auth (cualquiera puede acceder) |
| *(sin decorador)* | Requiere JWT válido (cualquier rol) |
| `@Roles(UserRole.ADMIN)` | Requiere JWT + rol ADMIN |
| `@Roles(UserRole.ADMIN, UserRole.EMPLOYEE)` | Requiere JWT + rol ADMIN o EMPLOYEE |

3. **Reiniciar el backend** después de cambios:
```bash
cd backend
npx nest build
# El servidor se reinicia automáticamente con nest start --watch
```

---

## 8. Datos de prueba en la DB

### Estado actual de la DB

| Entidad | Cantidad | Detalle |
|---------|----------|---------|
| Usuarios | 1 | admin@fuentelac.com (ADMIN) |
| Categorías | 5 | Pasta blanda, dura, hilado fresco, ahumado, fresco |
| Proveedores | 5 | Tambo San Isidro, QuimLac, Envasur, EnvaTech, Lácteos del Centro |
| Clientes | 7 | Juan Perez, Maria Garcia, Carlos Rodriguez, Ana Martinez, Pedro Lopez, Laura Fernandez, Diego Torres |
| Insumos | 15 | Leche, cuajo, sal, crema, envases, etc. |
| Productos | 6 | Cremoso, Sardo, Hebras, Provolone, Port Salut, Ricotta |
| Lotes | 9 | 1-2 por producto, con stock variado |
| Ventas | 8 | Los 5 métodos de pago, variando clientes |

### Métodos de pago disponibles

| Enum | Valor |
|------|-------|
| `EFECTIVO` | Efectivo |
| `TRANSFERENCIA` | Transferencia |
| `QR` | QR |
| `TARJETA_DEBITO` | Tarjeta de Débito |
| `TARJETA_CREDITO` | Tarjeta de Crédito |

### Cómo ver los datos

```bash
# Ver todos los usuarios
docker exec backend-stockAIDB-1 psql -U postgres -d stockAIDB -c "SELECT id, name, email, role FROM \"user\";"

# Ver insumos con stock bajo mínimo
docker exec backend-stockAIDB-1 psql -U postgres -d stockAIDB -c "SELECT id, name, current_stock, min_stock FROM supplies WHERE current_stock < min_stock;"

# Ver stock de lotes por producto
docker exec backend-stockAIDB-1 psql -U postgres -d stockAIDB -c "SELECT b.id, b.description, b.current_stock, p.name as producto FROM batch b JOIN products p ON b.product_id = p.id ORDER BY p.name;"
```

---

## 9. Comandos útiles

### Frontend

```bash
cd frontend
npx ng serve          # Iniciar servidor de desarrollo
npx ng build          # Build de producción
npx ng lint           # Verificar código
```

### Backend

```bash
cd backend
npx nest start --watch    # Iniciar con hot-reload
npx nest build            # Build de producción
```

### Base de datos

```bash
# Acceder a psql via Docker
docker exec -it backend-stockAIDB-1 psql -U postgres -d stockAIDB

# Ver tablas
\dt

# Ver estructura de una tabla
\d supplies

# Salir
\q
```

### Full stack

```bash
# Desde la raíz del proyecto (usa concurrently)
npm start
```

---

## Estructura del proyecto

```
FuentesLac/
├── backend/                    # NestJS 11 + TypeORM + PostgreSQL
│   └── src/
│       ├── auth/               # JWT auth (login, register, reset)
│       ├── users/              # CRUD usuarios
│       ├── supplies/           # CRUD insumos/materias primas
│       ├── products/           # CRUD productos terminados
│       ├── categories/         # CRUD categorías
│       ├── suppliers/          # CRUD proveedores
│       ├── clients/            # CRUD clientes
│       ├── batch/              # Lotes de producción
│       ├── production/         # Producciones
│       ├── production-detail/  # Detalles de producción
│       ├── sales/              # Ventas
│       ├── sales-detail/       # Detalles de ventas
│       ├── orders/             # Órdenes de compra
│       ├── orders-detail/      # Detalles de órdenes
│       ├── adjustments/        # Ajustes de stock
│       └── shared/             # Guards, enums, decorators, pagination
│
├── frontend/                   # Angular 19+ (standalone components)
│   └── src/app/
│       ├── interceptors/       # auth.interceptor.ts (JWT)
│       ├── models/             # Interfaces TypeScript
│       ├── services/           # Servicios HTTP (AuthService, SuppliesService, etc.)
│       ├── shared/navbar/      # Sidebar + topbar compartido
│       ├── pages/
│       │   ├── login/          # Login
│       │   ├── home/           # Dashboard
│       │   ├── supplies/       # Insumos (conectado)
│       │   ├── products/       # Productos (conectado)
│       │   ├── sales/          # Ventas (conectado)
│       │   ├── clients/        # Clientes (conectado)
│       │   └── production/     # Producción (sin ruta, pendiente)
│       ├── app.routes.ts       # Rutas
│       └── app.config.ts       # Providers (router + httpClient + interceptor)
│
└── docker-compose.yml          # PostgreSQL
```

### Secciones pendientes de conectar

| Sección | Estado | Notas |
|---------|--------|-------|
| **Producción** | Componente existe, sin ruta | Necesita servicio + modelo + ruta |
| **Órdenes de compra** | Sin componente | Backend tiene CRUD completo |
| **Ajustes de stock** | Sin componente | Backend tiene CRUD |
| **Categorías** | Sin componente | Backend tiene CRUD |
| **Proveedores** | Sin componente | Backend tiene CRUD |
| **Usuarios** | Sin componente | Backend tiene CRUD (solo ADMIN) |
