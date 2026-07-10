# INFORME DE CORRECCIONES PENDIENTES - LactoStock Backend

**Fecha:** 10 de Julio de 2026
**Estado:** Actualización del informe original. Correcciones ya aplicadas verificadas.

---

## CORRECCIONES YA APLICADAS ✅

| # | Corrección |
|---|-----------|
| 1 | `@IsDecimal()` → `@IsNumber()` en `create-product.dto.ts` y `create-supply.dto.ts` |
| 2 | ILIKE query corregido con `:name` en `products.repository.ts` |
| 3 | Categories query builder: alias, join e ILIKE corregidos en `categories.repository.ts` |
| 4 | Import inválido de TypeORM interno eliminado de `category.entity.ts` |
| 5 | `orderedSubtotal` corregido en `orders-detail.repository.ts` |
| 6 | `supplierId`, `clientId`, `productId` explícitos en entities |
| 7 | `@JoinColumn` agregado en `Product.batch` y `SalesDetail.sale` |
| 8 | `arrivalTotal` camelCase en entity y DTO de Order |
| 9 | `paymentMethod` y `adjustmentType` tipados como enum en response DTOs |
| 10 | `CategoryResponse` con campo `description` |
| 11 | `finById` → `findOneById` en todos los repositories |
| 12 | `ProductRespository` → `ProductRepository` renombrado |
| 13 | `paymentMethod..enum.ts` → `paymentMethod.enum.ts` |
| 14 | `USERS_SUORCE` → `USERS_SOURCE` en `.env.example` |
| 15 | Atomic stock (`decreaseStockAtomic`/`increaseStockAtomic`) implementado en products |
| 16 | Directorio `categories/repositories/` → `categories/repository/` |
| 17 | Imports innecesarios eliminados de módulos (products, orders, sales, supplies) |
| 18 | Dependencia circular Production ↔ ProductionDetail resuelta |

---

## ERRORES QUE ROMPEN LA APP 🔴

### A. Import de clase inexistente en ProductsModule

- **Archivo:** `products/products.module.ts` líneas 6 y 22
- **Problema:** Importa `ProductRespository` (typo), pero el archivo del repository fue renombrado a `ProductRepository`. NestJS no encuentra la clase y la app no inicia.
- **Solución:** Cambiar `ProductRespository` por `ProductRepository` en el import y en `useClass`.

### B. SuppliesService no implementa atomicidad

- **Archivo:** `supplies/service/supplies.service.ts` líneas 65-83
- **Problema:** `decreaseStock` e `increaseStock` todavía usan el patrón viejo: leer entity → modificar en memoria → guardar. Esto es incompatiable con la atomicidad implementada en `ProductsService`. Además, la firma recibe `entity: Supply` en vez de `id: number`, creando inconsistencia entre services.
- **Solución:** Agregar métodos `decreaseStockAtomic` e `increaseStockAtomic` al repository de supplies (igual que en products), actualizar la interfaz, y cambiar los métodos del service para recibir `id: number` y usar las queries atómicas.

### C. SuppliesService permite modificar currentStock vía update

- **Archivo:** `supplies/service/supplies.service.ts` líneas 53-54
- **Problema:** El método `update()` permite enviar `currentStock` en el body y modificarlo directamente. El stock solo debería modificarse vía `decreaseStock`/`increaseStock`.
- **Solución:** Eliminar las líneas 53-54 que setean `currentStock`.

### D. Dependencia circular Sales ↔ SalesDetail

- **Archivo:** `sales/sales.module.ts` línea 4 + `sales-detail/sales-detail.module.ts` línea 17
- **Problema:** `SalesModule` importa `SalesDetailModule` y `SalesDetailModule` importa `SalesModule`. Sin `forwardRef()`, NestJS lanzará error al iniciar.
- **Solución:** Envolver al menos una de las dos importaciones con `forwardRef()`. Ejemplo en `sales.module.ts`:
  ```typescript
  imports: [
    forwardRef(() => SalesDetailModule),
    TypeOrmModule.forFeature([Sale]),
  ],
  ```
  Y en `sales-detail.module.ts`:
  ```typescript
  imports: [
    ProductsModule,
    forwardRef(() => SalesModule),
    TypeOrmModule.forFeature([SalesDetail]),
  ],
  ```

### E. Dependencia circular Suppliers ↔ Supplies (verificar)

- **Archivo:** `suppliers/suppliers.module.ts` línea 4
- **Problema:** `SuppliersModule` importa `SuppliesModule`. `SuppliesModule` ya no importa `SuppliersModule` (fue corregido), por lo que la circularidad se resolvió. Sin embargo, `SuppliersModule` registra `Supply` en `TypeOrmModule.forFeature([Supplier, Supply, Order])` — si `SuppliesModule` ya exporta `TypeOrmModule`, el registro de `Supply` en `SuppliersModule` es innecesario.
- **Solución:** Quitar `Supply` del `forFeature` de `SuppliersModule` y agregar el import de `TypeOrmModule` exportado por `SuppliesModule`.

---

## LÓGICA DE NEGOCIO INCORRECTA 🟠

### F. Adjustments siempre descuenta stock sin importar el tipo

- **Archivo:** `adjustments/service/adjustments.service.ts` líneas 40-44
- **Problema:** `create()` siempre llama `decreaseStock()` sin verificar si `adjustmentType` es `ADJUST` (aumento) o `LOST` (pérdida). Si se quiere ajustar stock positivamente, se hace lo contrario.
- **Solución:**
  ```typescript
  if (createAdjustmentDto.adjustmentType === AdjustmentType.LOST) {
    await this.productsService.decreaseStock(productId, createAdjustmentDto.stockChange, manager);
  } else {
    await this.productsService.increaseStock(productId, createAdjustmentDto.stockChange, manager);
  }
  ```

### G. Adjustments.remove no está en transacción

- **Archivo:** `adjustments/service/adjustments.service.ts` líneas 67-74
- **Problema:** `remove()` ejecuta dos operaciones no atómicas: (1) aumentar stock, (2) eliminar registro. Si la segunda falla, el stock queda aumentado sin registro de ajuste.
- **Solución:** Envolver en `dataSource.transaction()`:
  ```typescript
  async remove(id: number): Promise<Adjustment> {
    return this.dataSource.transaction(async (manager) => {
      const adjustment = await this.findOneById(id);
      if (adjustment.adjustmentType === AdjustmentType.LOST) {
        await this.productsService.increaseStock(adjustment.productId!, adjustment.stockChange, manager);
      } else {
        await this.productsService.decreaseStock(adjustment.productId!, adjustment.stockChange, manager);
      }
      return this.adjustmentsRepository.remove(adjustment);
    });
  }
  ```

### H. Adjustments.remove asume que siempre fue descuento

- **Archivo:** `adjustments/service/adjustments.service.ts` línea 70
- **Problema:** Siempre llama `increaseStock` asumiendo que el ajuste original fue un descuento. Si el ajuste fue un aumento (`ADJUST`), eliminarlo debería decrementar stock.
- **Solución:** Verificar `adjustmentType` antes de decidir si aumentar o decrementar (ver solución combinada en G).

### I. Production.remove no revierte stock

- **Archivo:** `production/service/production.service.ts` líneas 84-87
- **Problema:** Al crear producción se decrementan insumos y se incrementan productos. Al eliminar, no se revierte nada.
- **Solución:** Envolver en transacción, cargar los detalles con sus supplyXDetail, y revertir cada operación:
  ```typescript
  async remove(id: number): Promise<Production> {
    return this.dataSource.transaction(async (manager) => {
      const production = await this.findOne(id);
      const details = await this.productionDetailService.findByProduction(id, manager);

      for (const detail of details) {
        // Revertir stock de productos fabricados
        await this.productService.decreaseStock(detail.product.id, detail.quantity, manager);
        // Revertir stock de insumos consumidos
        for (const sxd of detail.supplyXDetail) {
          await this.supplyService.increaseStock(sxd.supply, sxd.quantity, manager);
        }
      }

      return this.productionRepository.remove(production);
    });
  }
  ```

### J. Orders.remove no revierte stock de llegadas

- **Archivo:** `orders/service/orders.service.ts` líneas 111-114
- **Problema:** Si la orden fue parcialmente recibida (con `arrivalQuantity > 0`), eliminarla deja el stock de insumos permanentemente inflado.
- **Solución:** Envolver en transacción, iterar los detalles, y decrementar el stock de insumos por la cantidad recibida:
  ```typescript
  async remove(id: number): Promise<Order> {
    return this.dataSource.transaction(async (manager) => {
      const orderRepo = manager.getRepository(Order);
      const order = await orderRepo.findOne({
        where: { id },
        relations: { ordersDetails: { supply: true } },
      });
      if (!order) throw new NotFoundException('Order not found');

      for (const detail of order.ordersDetails) {
        if (detail.arrivalQuantity > 0) {
          await this.supplyService.decreaseStock(detail.supply.id, detail.arrivalQuantity, manager);
        }
      }

      return orderRepo.remove(order);
    });
  }
  ```

### K. Orders.update lanza BadRequestException cuando debería ser NotFoundException

- **Archivo:** `orders/service/orders.service.ts` línea 86
- **Problema:** `if (!order || !updateOrderDto.details)` lanza `BadRequestException('Missing updates')`. Si `order` es null, debería ser `NotFoundException('Order not found')`.
- **Solución:** Separar las validaciones:
  ```typescript
  if (!order) throw new NotFoundException('Order not found');
  if (!updateOrderDto.details) throw new BadRequestException('Missing details in request body');
  ```

### L. Orders.update calcula arrivalTotal con precio actual

- **Archivo:** `orders/service/orders.service.ts` líneas 101-105
- **Problema:** Usa `d.supply.costPrice` (precio actual) en vez del precio que se acordó al momento de la orden. Si el precio del insumo cambió, el `arrivalTotal` será incorrecto.
- **Solución:** Almacenar el precio unitario en `OrdersDetail` al momento de la orden (campo `unitPrice` o usar `orderedSubtotal / orderedQuantity` para obtener el precio original), y usar ese valor para recalcular `arrivalSubtotal` y `arrivalTotal`.

### M. Orders.update nunca actualiza arrivalSubtotal

- **Archivo:** `orders/service/orders.service.ts` línea 94
- **Problema:** `detail.arrivalSubtotal` nunca se escribe — siempre queda en 0 (default de la entity).
- **Solución:** Calcular y asignar el `arrivalSubtotal` después de actualizar `arrivalQuantity`:
  ```typescript
  detail.arrivalSubtotal = detail.arrivalQuantity * Number(detail.supply.costPrice);
  ```

---

## TYPE MISMATCH 🟡

### N. Batch repository.update() tipo de parámetro incorrecto

- **Archivo:** `batch/repository/batch.repository.ts` línea 28 + `batch/repository/batch.repository.interface.ts` línea 9
- **Problema:** La interfaz declara `update(batch: Batch)`, pero la implementación acepta `update(batch: UpdateBatchDto)`. Actualmente el método está muerto (el service tiene el update comentado), pero si se descomenta, habrá un conflicto de tipos.
- **Solución:** Cambiar la implementación para aceptar `Batch` igual que la interfaz, o eliminar el método muerto.

---

## CÓDIGO MUERTO / IMPORTS INNECESARIOS 🟡

### O. Orders repository — métodos y imports no usados

- **Archivo:** `orders/repository/orders.repository.ts`
- **Problema:**
  - Línea 1: `DeepPartial` y `EntityManager` importados pero no usados
  - Línea 8: `Supplier` importado solo en el método muerto `create()`
  - Líneas 57-63: método `create()` nunca es llamado por el service
  - Líneas 65-67: método `update()` nunca es llamado por el service
- **Solución:** Eliminar los imports no usados y los métodos muertos.

### P. Adjustments repository — métodos comentados

- **Archivo:** `adjustments/repository/adjustments.repository.ts` líneas 55-66 + `adjustments.repository.interface.ts` líneas 15-16
- **Problema:** Métodos `create` y `update` comentados tanto en la implementación como en la interfaz.
- **Solución:** Eliminar los comentarios.

### Q. OrdersDetail service — findOne descartado

- **Archivo:** `orders-detail/service/orders-detail.service.ts` línea 41
- **Problema:** `const detail = await this.findOne(orderDetail.id)` carga la entidad pero nunca se usa. Es una query innecesaria.
- **Solución:** Eliminar la línea.

---

## CONFIGURACIÓN 🔵

### S. TypeORM versión `^1.0.0` no existe

- **Archivo:** `package.json` línea 34
- **Problema:** La última versión estable de TypeORM es `0.3.x`. La versión `1.0.0` no existe en npm.
- **Solución:** Cambiar a `^0.3.20` (o la última estable).

### T. TypeScript noImplicitAny deshabilitado

- **Archivo:** `tsconfig.json` línea 21
- **Problema:** `noImplicitAny: false` permite variables sin tipo explícito, reduciendo la seguridad de tipos.
- **Solución:** Cambiar a `true` y corregir los errores que aparezcan.

---

## PRIORIDAD DE EJECUCIÓN

### Fase 1 — Crítico (rompe la app)
1. **A** — Corregir import `ProductRespository` en `products.module.ts`
2. **D** — Resolver dependencia circular Sales ↔ SalesDetail con `forwardRef`

### Fase 2 — Funcionalidad rota
3. **B** — Implementar atomicidad en `SuppliesService`
4. **C** — Eliminar `currentStock` de `update()` en supplies
5. **F+G+H** — Corregir `adjustments.service.ts` completo (create con verificación de tipo, remove en transacción con verificación de tipo)
6. **I** — Implementar reversión de stock en `production.remove()`
7. **J** — Implementar reversión de stock en `orders.remove()`

### Fase 3 — Errores de lógica menores
8. **K** — Separar validaciones 404/400 en `orders.update()`
9. **L+M** — Corregir cálculos de `arrivalTotal` y `arrivalSubtotal`

### Fase 4 — Limpieza
10. **N** — Corregir tipo en `batch.repository.update()`
11. **O+P+Q** — Eliminar código muerto

### Fase 5 — Configuración
12. **S** — Fijar versión de TypeORM
13. **T** — Habilitar `noImplicitAny`
