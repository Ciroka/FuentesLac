# PENDIENTES - LactoStock Backend

## 🔴 Alto

### Adjustments — create() y remove() ignoran adjustmentType
- **Archivo:** `backend/src/adjustments/service/adjustments.service.ts`
- `create()` siempre descuenta stock sin importar si el tipo es `LOST` o `ADJUST`
- `remove()` siempre aumenta stock sin verificar el tipo original
- **Fix:** descomentar los branches con `adjustmentType`

---

## 🟡 Medio

### TypeORM version incorrecta
- **Archivo:** `backend/package.json`
- `"typeorm": "^1.0.0"` no existe en npm. La última estable es `0.3.x`
- **Fix:** cambiar a `"typeorm": "^0.3.20"`

---

## 💬 Para discutir con el equipo

| # | Tema | Archivo | Estado actual |
|---|---|---|---|
| 1 | `Production.remove()` — revertir stock | `production/service/production.service.ts` | Comentado |
| 2 | `Orders.remove()` — revertir stock de llegadas | `orders/service/orders.service.ts` | Comentado |
| 3 | Código muerto en Orders repository (create/update) | `orders/repository/orders.repository.ts` | Comentado |
| 4 | Código muerto en Adjustments repository (create/update) | `adjustments/repository/adjustments.repository.ts` | Comentado |
| 5 | Unused findOne en OrdersDetail service | `orders-detail/service/orders-detail.service.ts` | Comentado |
