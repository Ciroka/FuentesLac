# Guía paso a paso — convertir el frontend en PWA

Estado confirmado hoy (leyendo el código, no supuesto): **nada de esto está
hecho todavía.** No hay `@angular/service-worker` instalado, no hay
`ngsw-config.json`, no hay `manifest.webmanifest`, `frontend/public/` solo
tiene el favicon/logo (sin íconos en los tamaños que pide un manifest de
PWA), y no hay ninguna configuración de despliegue en el repo (ni Dockerfile
de frontend, ni nginx/Caddy, ni job de deploy en el CI). Angular CLI está en
`21.2.x`, así que el schematic `ng add @angular/pwa` es válido y vigente.

Este documento es el paso a paso; no se ejecutó nada de esto todavía porque
generar los íconos en los tamaños correctos necesita una herramienta de
diseño/imagen que no está disponible en este entorno — se puede reusar el
logo ya procesado (`frontend/public/logo.png`, 512x512 con transparencia
real) como punto de partida para generarlos.

## 1. Instalar

Desde `frontend/`:

```bash
ng add @angular/pwa
```

Esto hace automáticamente la mayor parte de los pasos 2 y 3 de abajo: agrega
`@angular/service-worker` a `package.json`, genera `ngsw-config.json`, agrega
`serviceWorker: true` a `angular.json`, registra `provideServiceWorker(...)`
en `app.config.ts`, y agrega un `manifest.webmanifest` + un set de íconos
placeholder a `public/`.

Si se prefiere no correr el schematic (por ejemplo, para no tocar
`angular.json` automáticamente), los pasos 2 y 3 se pueden hacer a mano.

## 2. Configurar (si no se usó el schematic)

**`angular.json`** — agregar a la configuración de `production` del target
`build`:

```json
"serviceWorker": true,
"ngswConfigPath": "ngsw-config.json"
```

**`frontend/src/app/app.config.ts`** — agregar al array de `providers`:

```ts
import { isDevMode } from '@angular/core';
import { provideServiceWorker } from '@angular/service-worker';

// dentro de providers: [...]
provideServiceWorker('ngsw-worker.js', {
  enabled: !isDevMode(),
  registrationStrategy: 'registerWhenStable:30000',
})
```

**`ngsw-config.json`** (nuevo archivo en `frontend/`) — configuración mínima
razonable para esta app (todo el shell + assets en caché, datos de API
siempre frescos):

```json
{
  "$schema": "./node_modules/@angular/service-worker/config/schema.json",
  "index": "/index.html",
  "assetGroups": [
    {
      "name": "app",
      "installMode": "prefetch",
      "resources": {
        "files": ["/favicon.ico", "/index.html", "/*.css", "/*.js"]
      }
    },
    {
      "name": "assets",
      "installMode": "lazy",
      "updateMode": "prefetch",
      "resources": {
        "files": ["/assets/**", "/*.(svg|cur|jpg|jpeg|png|webp|gif|otf|ttf|woff|woff2)"]
      }
    }
  ]
}
```

## 3. Crear el manifest y los íconos

**`frontend/public/manifest.webmanifest`** (nuevo archivo):

```json
{
  "name": "Fuente Lac",
  "short_name": "Fuente Lac",
  "theme_color": "#2f6690",
  "background_color": "#f4f6f8",
  "display": "standalone",
  "scope": "/",
  "start_url": "/",
  "icons": [
    { "src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "icons/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

`theme_color`/`background_color` ya están tomados de `--accent`/`--bg` de
`styles.scss` para que combinen con el resto de la app.

**Íconos que faltan generar** (`frontend/public/icons/`): a partir de
`frontend/public/logo.png` (ya procesado, círculo con transparencia real,
512x512) hay que generar:
- `icon-192.png` (192x192)
- `icon-512.png` (512x512 — ya está, solo hay que copiarlo/renombrarlo)
- `icon-maskable-512.png` (512x512, pero con el logo *dentro* de una zona
  segura circular más chica — Android recorta los íconos "maskable" en
  distintas formas, así que el logo no puede tocar los bordes)

Esto requiere una herramienta de imagen (Photoshop, Figma, o un generador
online como [maskable.app](https://maskable.app) para verificar la zona
segura del ícono maskable) — no se generó en esta sesión por eso.

**`frontend/src/index.html`** — agregar dentro de `<head>`:

```html
<link rel="manifest" href="manifest.webmanifest">
<meta name="theme-color" content="#2f6690">
```

## 4. Requisito de despliegue: HTTPS

Un service worker **no registra** salvo que la app se sirva por HTTPS (o
`localhost` en desarrollo). Hoy no hay ninguna configuración de despliegue en
el repo — ni Dockerfile de frontend, ni nginx/Caddy, ni job de deploy en
`.github/workflows/ci.yml` (que solo hace lint + build). Este paso depende
de dónde se termine hosteando la app en producción; no hay nada que hacer en
el código para esto, solo asegurarse de que el hosting elegido sirva por
HTTPS.

## 5. Probar después de implementar

1. `ng build --configuration production` y servir el contenido de `dist/`
   con un servidor estático real (`npx http-server dist/frontend/browser`,
   por ejemplo) — el service worker no se activa con `ng serve`.
2. Lighthouse → pestaña "PWA" en Chrome DevTools — corre un audit automático
   y dice específicamente qué falta.
3. En Chrome, ícono de "Instalar" en la barra de direcciones — confirma que
   el manifest es válido.
4. En Android, "Agregar a pantalla de inicio" desde Chrome — confirma que
   los íconos se ven bien recortados (sobre todo el maskable).
5. Cortar la red (DevTools → Network → Offline) y recargar — el shell de la
   app debería seguir cargando (los datos de la API, no, ya que no hay caché
   configurada para llamadas a `/api` en el `ngsw-config.json` de arriba, y
   está bien que sea así — mostrar datos viejos de stock/ventas como si
   fueran actuales sería peor que mostrar un error de conexión).
