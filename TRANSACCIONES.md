# Transacciones — Flujo de stock en LactoStock

## Principio general

Toda operación que modifique stock (ya sea de insumos o de batches) se ejecuta dentro de una transacción de TypeORM. Esto asegura que si algo falla a mitad de camino, todos los cambios se revierten y el inventario nunca queda en un estado inconsistente.

El patrón es:

```typescript
return this.dataSource.transaction(async (manager) => {
  // Todas las operaciones dentro de la transacción reciben `manager`
  // Si algo falla, TypeORM hace rollback automático
});
```

---

## Producción (`ProductionService.create`)

### Qué hace
1. Por cada detalle de producción:
   - Busca el producto base (`productService.findOne`)
   - Por cada insumo del detalle:
     - Busca el insumo (`supplyService.findOne`)
     - Descuenta stock del insumo (`supplyService.decreaseStock`)
     - Si el insumo tiene `isMilk = true`, acumula los litros de leche usados
   - Crea un nuevo `Batch` asociado al producto con `milkLitersUsed` y `clientBatchDate`
   - Incrementa el stock del nuevo batch con la cantidad producida (`batchService.increaseStock`)
2. Crea el registro de `Production` con los `ProductionDetail` y `SuppliesXproductionDetail`

### Por qué está bien

- **Unidad atómica**: si crear el batch falla, el descuento de insumos se revierte. Si guardar la producción falla, todo lo anterior se revierte.
- **Manager propagado**: tanto `supplyService.decreaseStock` como `batchService.increaseStock` y `batchService.create` reciben el `manager` de la transacción.
- **isMilk**: se identifica por el flag en la entidad `Supply`, calculando `milkLitersUsed` dentro de la transacción antes de crear el batch.

### Diagrama

```
ProductionService.create()
  │
  └─ dataSource.transaction(manager)
       │
       ├─ for each detail:
       │    ├─ productService.findOne(productId, manager)
       │    ├─ for each supply:
       │    │    ├─ supplyService.findOne(supplyId, manager)
       │    │    ├─ supplyService.decreaseStock(supplyId, qty, manager)
       │    │    └─ if supply.isMilk → milkLitersUsed += qty
       │    ├─ batchService.create({ productId, milkLitersUsed, ... }, manager)
       │    └─ batchService.increaseStock(batchId, qty, manager)
       │
       └─ repo.save(production)  ← todo dentro de la misma transacción
```

---

## Ventas (`SalesService.create`)

### Qué hace
1. Por cada detalle de venta:
   - Busca el batch (`batchService.findOne`)
   - Calcula subtotal = `batch.product.salePrice × quantity`
   - Descuenta stock del batch (`batchService.decreaseStock`)
   - Si el detalle tiene peso, lo acumula en el batch (`batchService.addSoldWeight`)
2. Crea el registro de `Sale` con sus `SalesDetail`

### Por qué está bien

- **Unidad atómica**: si guardar la venta falla, el stock descontado y el peso acumulado se revierten.
- **Precio desde el batch**: el `unitPrice` se obtiene del `batch.product.salePrice` dentro de la transacción, asegurando consistencia (si el precio cambia entre la lectura y la venta, la transacción lo captura).
- **Manager propagado**: `batchService.findOne`, `decreaseStock` y `addSoldWeight` reciben el manager.

### ¿Por qué no se verifica si el stock llega a 0 para recalcular el rinde?

El rinde (yield) se calcula como `obtainedWeight / milkLitersUsed`. El `obtainedWeight` se acumula con cada venta que tenga `weight` (vía `addSoldWeight`), sin importar si el batch se agotó o no.

No tiene sentido disparar un recálculo cuando el stock llega a 0 porque:

1. **Stock en 0 no significa que ya se pesó todo.** Puede haber merma, producto que se vendió sin pesar, o producto que quedó pesado pero no vendido. El rinde se actualiza en cada venta individual que reporta peso, no cuando se acaba el stock.

2. **El rinde se recalcula constantemente.** Cada `addSoldWeight` actualiza `obtainedWeight` y, si `milkLitersUsed > 0`, recalcula `yield = obtainedWeight / milkLitersUsed` automáticamente. No hace falta un trigger adicional.

3. **Hay un endpoint dedicado** (`POST /batch/:id/recalculate-yield`) para forzar el recálculo manual si se descubre un peso atrasado o se corrige una venta.

**El stock en 0 solo importa para la alerta de `minStock` del producto**, que se consulta vía `GET /products/:id/stock-status` comparando la suma de `currentStock` de todos los batches contra el `minStock` del producto.

### Diagrama

```
SalesService.create()
  │
  └─ dataSource.transaction(manager)
       │
       ├─ for each detail:
       │    ├─ batchService.findOne(batchId, manager)
       │    ├─ unitPrice = batch.product.salePrice
       │    ├─ batchService.decreaseStock(batchId, qty, manager)
       │    └─ if weight → batchService.addSoldWeight(batchId, weight, manager)
       │
       └─ saleRepo.create + saleRepo.save(...)  ← mismo manager
```

---

## Ajustes de stock (`AdjustmentsService`)

### create(batchId, dto)

1. Descuenta stock del batch (`batchService.decreaseStock`)
2. Crea el registro de `Adjustment`

Ambos dentro de la misma transacción. Si crear el adjustment falla, el stock no se descuenta.

### remove(id)

1. Busca el adjustment (usando `manager.getRepository`)
2. Incrementa el stock del batch (`batchService.increaseStock`)
3. Elimina el registro de `Adjustment` (usando `manager.getRepository`)

Todo dentro de la misma transacción. Ya no usa el repositorio por fuera del manager.

### Diagrama

```
AdjustmentsService.create()
  │
  └─ dataSource.transaction(manager)
       ├─ batchService.decreaseStock(batchId, stockChange, manager)
       └─ adjustmentRepo.save(adjustment)

AdjustmentsService.remove()
  │
  └─ dataSource.transaction(manager)
       ├─ adjustmentRepo.findOne({ id, relations: {batch} })
       ├─ batchService.increaseStock(batchId, stockChange, manager)
       └─ adjustmentRepo.remove(adjustment)
```

---

---
## Órdenes de compra (`OrdersService`)

### create (ingreso de orden)

No modifica stock. Solo crea el registro de la orden con sus `OrdersDetail`. El stock de insumos se actualiza recién cuando llega la mercadería.

### update (llegada de mercadería)

```typescript
OrdersService.update(id, updateOrderDto)
  │
  └─ dataSource.transaction(manager)
       ├─ orderRepo.findOne({ id, relations: {details: {supply}} })
       ├─ for each detail with arrivalQuantity:
       │    ├─ detail.arrivalQuantity = updateDto.arrivalQuantity
       │    ├─ suppliesService.increaseStock(detail.supply.id, qty, manager)
       │    └─ recalculate detail subtotal si cambió arrivalQuantity
       └─ orderRepo.save(order)
```

**Por qué está bien:**
- El incremento de stock del insumo y la actualización de la orden están en la misma transacción.
- Si guardar la orden falla, el stock no se incrementa.
- `suppliesService.increaseStock` recibe el manager.

### Diagrama

```
OrdersService.update()
  │
  └─ dataSource.transaction(manager)
       │
       ├─ for each detail:
       │    ├─ suppliesService.increaseStock(supplyId, arrivalQty, manager)
       │    └─ detail.arrivalQuantity = arrivalQty
       │
       └─ orderRepo.save(order)
```

---

## Operaciones atómicas de stock (sin transacción)

### decreaseStockAtomic / increaseStockAtomic

Estos métodos viven en los repositorios (`BatchRepository`, `SuppliesRepository`) y se ejecutan en **una sola sentencia SQL**, sin necesidad de transacción independiente:

```sql
UPDATE batch SET current_stock = current_stock - :amount
WHERE id = :id AND current_stock >= :amount
```

- `decreaseStockAtomic` incluye `WHERE current_stock >= :amount` para evitar stock negativo.
- La validación en el service (`decreaseStock`) verifica post-update que el stock realmente disminuyó. Si no fue así, lanza `BadRequestException`.

Estos métodos se usan **siempre dentro de una transacción** (producción, ventas, ajustes), nunca solos.

---

## Módulos involucrados y sus dependencias

```
ProductsModule ──> BatchModule ──> SalesDetailModule
                    │
ProductionModule ──┤
                    │
  SalesModule ─────┤
                    │
AdjustmentsModule ──┘

  OrdersModule ──> SuppliesModule
  SuppliersModule ──> OrdersModule
                    └─> SuppliesModule
```

- `ProductionModule`: necesita `ProductsModule` (para buscar producto base), `SuppliesModule` (para descontar insumos) y `BatchModule` (para crear/incrementar batch).
- `SalesModule`: necesita `ClientsModule` (para buscar cliente), `BatchModule` (para descontar stock y acumular peso).
- `AdjustmentsModule`: necesita `BatchModule` (para modificar stock).
- `BatchModule`: necesita `SalesDetailModule` (para `recalculateYield` que suma pesos de ventas).
- `OrdersModule`: necesita `SuppliesModule` (para incrementar stock de insumos al recibir mercadería).
- `SuppliersModule`: necesita `OrdersModule` y `SuppliesModule` (para listar órdenes e insumos de un proveedor).

No hay dependencias circulares. Todas las flechas van en una dirección.

---

## Resumen de seguridad transaccional

| Operación | ¿Usa transacción? | ¿Manager propagado correctamente? | ¿Riesgo de data corruption? |
|-----------|-------------------|-----------------------------------|-----------------------------|
| Producción | ✅ | ✅ | Bajo |
| Venta | ✅ | ✅ | Bajo |
| Ajuste create | ✅ | ✅ | Bajo |
| Ajuste remove | ✅ | ✅ (corregido) | Bajo |
| Editar producto | ❌ (no modifica stock) | N/A | Nulo |
| Editar insumo | ❌ (no modifica stock) | N/A | Nulo |
| Órden create | ❌ (solo registro) | N/A | Nulo |
| Órden update (llegada) | ✅ | ✅ | Bajo |
