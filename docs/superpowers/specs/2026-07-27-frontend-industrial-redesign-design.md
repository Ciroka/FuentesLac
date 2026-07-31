# Rediseño visual del frontend — look industrial/limpio

## Contexto

FuentesLac es un sistema de gestión de producción para una fábrica de quesos (StockAI). El frontend actual (Angular + Angular Material) tiene una identidad temática "cálida artesanal" (dorado, wax, verde, tipografía serif Fraunces + mono IBM Plex Mono) pero se percibe como genérica/tipo plantilla: sombras Material por defecto sin ajustar, botones `mat-raised-button` sin estilizar, badges/pills decorativos, sin indicador de página activa en el menú, estados vacíos ausentes en varias vistas.

Objetivo: mover el sistema visual a un estilo **industrial/limpio** (blancos, grises, un único acento azul acero) y resolver puntos de fricción de uso reales (estado activo de navegación, estados vacíos), sin tocar lógica de negocio, servicios ni estructura de rutas/componentes.

Usuarios: personal administrativo/de planta de una quesería, principalmente en escritorio/notebook.

## Alcance

**Incluye:**
- Tokens globales de color y tipografía (`frontend/src/styles.scss`, `frontend/src/theme.scss`)
- Sidebar/navbar (`shared/navbar`)
- Dashboard y sus 5 subcomponentes (`dashboard/**`)
- Login (`pages/login`)
- Products, Sales, Clients, Production, Supplies (`pages/**`)
- Ajustes de template puntuales: estado activo de navegación, estados vacíos donde falten

**No incluye:**
- Cambios de lógica de negocio, servicios, modelos o rutas
- Cambios de backend
- Rediseño de flujo/IA (nuevas pantallas, nuevas funcionalidades)

## Diseño

### 1. Paleta de colores

Reemplaza la paleta cálida (dorado/wax/verde) por base neutra + acento único azul acero. Colores semánticos (éxito/alerta/peligro) se mantienen pero recalibrados a tonos compatibles con la base fría.

```scss
--bg:           #f4f6f8;
--panel:        #ffffff;
--panel-2:      #eef1f4;
--line:         #dde3e8;
--ink:          #1c2733;
--ink-dim:      #64748b;

--accent:       #2f6690;
--accent-soft:  #dce8f0;
--accent-dark:  #1f4a68;

--success:      #2f7d5c;
--success-soft: #e1f0e8;
--warning:      #b9781f;
--warning-soft: #f6e9d6;
--danger:       #b3402c;
--danger-soft:  #f7e2dd;

--radius:       8px;
--radius-sm:    6px;
--shadow:       0 1px 2px rgba(0,0,0,.04);
--shadow-md:    0 1px 3px rgba(0,0,0,.06);
```

Variables antiguas (`--gold`, `--gold-soft`, `--green`, `--green-soft`, `--wax`, `--wax-soft`, `--primary`, `--primary-light`, `--primary-dark`, `--gray-*`, `--dark`, `--shadow-lg`) se eliminan y todas sus referencias en el código se migran a los tokens nuevos.

El tema de Angular Material (`theme.scss`, `mat.define-theme`) pasa de `mat.$orange-palette` / `mat.$green-palette` a una paleta Material azul acero (`mat.$blue-palette` como base, o paleta custom si el resultado por defecto no calza con `--accent`).

### 2. Tipografía

Una sola familia sans-serif para todo el sistema:

```scss
--font: 'Inter', 'Helvetica Neue', Arial, sans-serif;
```

- Se eliminan `--serif` (Fraunces) y `--mono` (IBM Plex Mono) de `theme.scss`/`styles.scss` y de todo uso en componentes (`login-header h3`, `topbar-clock`, `.section-label`, `.table-label`, `th`, etc.)
- Jerarquía visual por tamaño/peso/color en vez de cambio de familia tipográfica.
- Números en tablas y KPI cards usan `font-variant-numeric: tabular-nums` sobre Inter (ya usado parcialmente vía clase `.num`), no una fuente mono separada.

### 3. Sidebar / Navbar (`shared/navbar`)

- Fondo del sidebar: `--gold-soft` → `--panel` (blanco) con `border-right: 1px solid var(--line)`.
- **Estado activo de navegación** (nuevo, no existe hoy): el link cuya ruta coincide con la URL actual recibe `background: var(--accent-soft)`, `border-left: 3px solid var(--accent)`, ícono y texto en `var(--accent)`. Se implementa con `routerLinkActive` de Angular Router en `navbar.html` + clase `.active` en `navbar.scss`.
- `brand-mark`: círculo dorado con iniciales → cuadrado `border-radius: var(--radius-sm)` en `var(--accent)`, texto blanco.
- Topbar `user-role`: pill dorada decorativa → texto simple mayúsculas en `var(--ink-dim)`, sin fondo.
- `topbar-clock`: quita `--serif` y `word-spacing` exagerado, usa `--font` con `font-variant-numeric: tabular-nums`.
- El comportamiento hover-to-expand se mantiene sin cambios funcionales.

### 4. Cards, tablas, botones, KPI cards

- **Cards**: `border-radius` 12px→8px, sombra pronunciada (`--shadow-md` actual) reemplazada por borde `1px solid var(--line)` + sombra mínima (`--shadow` nuevo). Aplica a `mat-card` en dashboard, products, y cualquier `.prod-card`/tarjetas custom.
- **KPI cards** (`dashboard/components/kpi-card`): mantiene lógica de `valueClass` up/down; agrega ícono de tendencia (▲/▼, vía `mat-icon` `arrow_upward`/`arrow_downward` o similar) junto al delta, no solo color.
- **Tablas** (`styles.scss` reglas globales `th`/`td`/`.table-container`): headers pasan de `--mono` uppercase a `--font` 600 uppercase con letter-spacing reducido (0.4px); se agrega `tbody tr:hover { background: var(--panel-2) }` donde las filas sean relevantes (no meramente informativas).
- **Botones**: override global de `.mat-mdc-raised-button` (primario) para quitar `box-shadow` de Material y usar fondo plano `var(--accent)`; botones secundarios usan `mat-stroked-button` con borde `var(--line)` en vez de variantes con fondo.
- **Chips de estado** (crítico/bajo/ok en products, alertas de supplies, etc.): fondo `-soft` + texto del color base correspondiente (success/warning/danger), consistente con la paleta nueva.

### 5. Estados de carga, error y vacíos

- Loading y error existentes (dashboard, y donde se repita el patrón) se recolorean a la paleta nueva y pierden tipografía mono.
- **Estados vacíos** (nuevo donde falte): se agrega un bloque simple (ícono neutro + texto corto, ej. "Sin resultados para tu búsqueda", "No hay acciones pendientes por ahora") en listas/tablas que hoy no renderizan nada cuando el array resultante está vacío. Se revisa cada página en el alcance (dashboard action-list, products grid, sales/clients/production/supplies tablas) y se agrega el bloque donde corresponda, reutilizando un patrón de markup consistente (no un componente compartido nuevo, salvo que la duplicación sea excesiva — a evaluar durante implementación).

## Fuera de alcance / decisiones explícitas

- No se introduce un sistema de temas claro/oscuro.
- No se agregan animaciones nuevas más allá de las ya existentes (`fadeIn` en `.page-enter` se mantiene).
- No se crea un design system documentado aparte; los tokens viven en `styles.scss`/`theme.scss` como hoy.
- El sidebar sigue expandiéndose por hover (decisión explícita del usuario, no un descuido).

## Testing

Cambio puramente visual/CSS + un ajuste de template (`routerLinkActive`) y algunos bloques de estado vacío. Verificación:
- `npm run lint` y `npm run build -- --configuration production` en `frontend/` (igual que CI) deben pasar.
- Revisión visual manual de cada página en el alcance vía `ng serve` (dashboard, login, products, sales, clients, production, supplies) en al menos un viewport de escritorio.
- Tests existentes (`ng test` / Vitest, incluyendo los `*.spec.ts` de páginas y navbar) no deberían romperse por cambios de estilo puro; si algún spec asertaba clases/textos específicos afectados por el rediseño (poco probable dado que son specs de componente, no de estilo), se ajustan.
