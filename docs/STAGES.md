# Stages — Plan de diseño y construcción

Plan de construcción por etapas de **Reporte Águila**. Cada etapa es verificable e
incremental. Ver [`PLAN.md`](./PLAN.md) para arquitectura, stack y flujos.

**Convenciones**
- Gestor de paquetes: `pnpm`.
- Verificación tras cada etapa: `pnpm build` (incluye `vue-tsc -b`).
- Definición de terminado por etapa: compila sin errores, sin regresiones de accesibilidad
  en lo tocado, y criterio de salida cumplido.

---

## Etapa 1 — Fundaciones (base del proyecto)

**Objetivo:** dejar listo el esqueleto (dependencias, tokens, shell, router, estado y datos mock)
para que las vistas se construyan encima.

### Pasos
1. **Instalar dependencias**
   ```bash
   pnpm add vue-router pinia dexie
   ```
   > Nota: la cola de reportes se vacía con la **Background Sync API nativa** del service
   > worker (no se requiere `workbox-background-sync`).
2. **Estilos base**
   - `src/styles/tokens.css`: paleta + tokens semánticos (sección 5 de PLAN.md).
   - `src/styles/base.css`: reset, tipografía, focus visible, `prefers-reduced-motion`,
     escala de fuente con `--font-scale`.
   - Importar ambos en `src/main.ts`.
3. **Datos mock**
   - `src/data/mock/events.ts` (~15 eventos, uno próximo), `community.ts`, `organizers.ts`.
4. **mockApi**
   - `src/services/api/mockApi.ts`: `getEvents(since)`, `getEvent(id)`,
     `getCommunity()`, `getOrganizers()`, `submitReport(report)` con latencia simulada.
5. **Capa IndexedDB**
   - `src/db/index.ts`: esquema Dexie (`events`, `community`, `organizers`, `reports`,
     `scheduledNotifications`, `meta`).
6. **Stores Pinia (esqueletos)**
   - `stores/{events,community,reports,settings,notifications}.ts` con estado y acciones base.
7. **Router**
   - `src/router/index.ts` con rutas `/`, `/evento/:id`, `/reportes`, `/comunidad`, `/configuracion`.
8. **App shell**
   - `src/layouts/AppShell.vue`: skip-link, `<header>`, sidebar `<nav>` con los 5 accesos,
     `<main>` y slot. Drawer en móvil, fija en escritorio.
   - Reemplazar contenido de `App.vue` por `<AppShell>` + `<RouterView>` + `<PWABadge>`.

### Criterio de salida
- La app navega entre rutas vacías desde el sidebar.
- `pnpm build` verde. Tokens aplicados (fondo graphite, texto ash-grey).

---

## Etapa 2 — Home + Detalle de evento

**Objetivo:** consultar y filtrar eventos, ver detalle y suscribirse.

### Pasos
1. **Componentes UI base**
   - `Button`, `Card`, `Badge`, `Chip`, `Field`, `Segmented`, `Skeleton`, `EmptyState`.
2. **Store de eventos**
   - `loadFromCache()`, `refresh()` (diff + persistencia + `meta.lastEventSync`).
3. **Vista Home** (`views/HomeView.vue`)
   - `EventFilters` (categoría, rango de fechas, búsqueda, orden).
   - `EventCard` con chip de categoría, fecha, lugar, organizador y `NotifyToggle`.
   - Skeletons al cargar, `EmptyState` sin resultados.
4. **Vista Detalle** (`views/EventDetailView.vue`)
   - Info completa + organizador enlazado a Comunidad.
   - Selector de lead time, "Agregar a calendario" (`.ics`), "Compartir"
     (Web Share API con fallback a copiar enlace).
5. **Accesibilidad**
   - `aria-current` en nav, foco al `h1` al cambiar de ruta, chips con texto (no solo color).

### Criterio de salida
- Se listan y filtran eventos; el detalle muestra todo y ofrece suscripción, `.ics` y compartir.
- Navegación por teclado completa. Build verde.

---

## Etapa 3 — Reportes + sincronización offline

**Objetivo:** enviar reportes de forma optimista y vaciar la cola al reconectar.

### Pasos
1. **Componentes UI adicionales**
   - `Modal` (focus trap + `Esc`), `Toast` (`aria-live`), `Switch`.
2. **Composable `useOnline`**
   - Estado de conectividad reactivo + listener `online`/`offline`.
3. **Store + servicio de reportes**
   - `stores/reports.ts`: alta en Dexie (`pending`), transición `syncing → synced|failed`,
     `retry()`.
   - `services/sync.ts`: flush del outbox, registro en Background Sync
     (API nativa del service worker), listener `online`.
4. **Vista Reportes** (`views/ReportesView.vue`)
   - Formulario accesible (tipo, título, descripción, ubicación, foto opcional, anónimo)
     con validación y borrador.
   - "Mis reportes" con badges de estado y botón Reintentar en `failed`.
5. **Service Worker**
   - Handler `sync` para vaciar la cola de reportes.
6. **Indicadores de conexión**
   - Banner/estado "offline" y "pendiente de sincronizar".

### Criterio de salida
- Un reporte enviado sin red queda *pendiente* y se sincroniza al reconectar.
- Los estados se anuncian por lector de pantalla. Build verde.

---

## Etapa 4 — Comunidad FIM + Configuración

**Objetivo:** directorio comunitario y panel de ajustes.

### Pasos
1. **Vista Comunidad** (`views/ComunidadView.vue`)
   - `Segmented`/tabs: **Clubes**, **Deportes**, **Organizadores**.
   - Tarjetas con logo, descripción y próximos eventos enlazados.
   - `stores/community.ts` con carga desde mockApi/caché.
2. **Vista Configuración** (`views/ConfiguracionView.vue`)
   - **Notificaciones:** permiso, suscripción, lead time, toggles por categoría.
   - **Accesibilidad:** tamaño de fuente (`--font-scale`), alto contraste, movimiento reducido.
   - **Tema:** claro/oscuro/sistema.
   - **Datos:** tamaño de caché, limpiar caché, forzar sincronización, última sincronización.
   - `composables/useAccessibility.ts` para aplicar preferencias y persistirlas.
3. **Persistencia de preferencias**
   - `stores/settings.ts` sincroniza con `localStorage` y/o `meta` en Dexie.

### Criterio de salida
- Directorio navegable con enlaces a eventos; todos los ajustes se aplican y persisten.

---

## Etapa 5 — Notificaciones y alertas pre-evento

**Objetivo:** suscripción y alertas pre-evento, local y push-ready.

### Pasos
1. **`services/notifications.ts`**
   - Interfaz `NotificationService`: `requestPermission`, `subscribe`, `unsubscribe`,
     `schedulePreEvent`, `cancel`, `notify`.
2. **`composables/usePreEventAlerts.ts`**
   - Programa alertas en `scheduledNotifications` y usa `setTimeout` con la app abierta.
3. **Service Worker**
   - `push` (stub push-ready), `notificationclick` (enfocar/abrir `/evento/:id`),
     `periodicsync` (refrescar eventos + disparar alertas vencidas).
4. **Integración con eventos**
   - Al detectar eventos nuevos suscritos (Etapa 2), disparar notificación.
5. **Configuración**
   - Persistir permiso, suscripción y lead time; reflejar estado en la UI.
6. **Semilla de demo**
   - Evento próximo en mock para demostrar la alerta de extremo a extremo.

### Criterio de salida
- El usuario se suscribe y recibe una alerta pre-evento según el lead time.
- Eventos nuevos con conexión generan notificación. Build verde.

---

## Etapa 6 — Accesibilidad, PWA polish y verificación

**Objetivo:** cerrar AA, configurar PWA y validar criterios de aceptación.

### Pasos
1. **Auditoría de accesibilidad**
   - Lighthouse + revisión manual: landmarks, orden de foco, teclado, lector de pantalla.
   - Validar contraste de todos los pares texto/fondo (AA).
   - Verificar zoom 200 % y áreas táctiles ≥ 44×44 px.
2. **PWA**
   - Manifest: nombre, `theme_color` graphite, `background_color`, `display: standalone`,
     `lang: es-MX`, `start_url: /`.
   - Iconos con `@vite-pwa/assets-generator`.
   - Prompt de instalación in-app.
3. **Pruebas offline manuales**
   - DevTools → Offline: carga de eventos desde caché; envío de reporte encolado;
     reconexión → sincronización.
4. **Verificación final**
   - `pnpm build` + `pnpm preview`; recorrer los criterios de aceptación de PLAN.md §14.
   - Revisar Lighthouse PWA (instalable) y Performance/Accessibility.

### Criterio de salida
- Criterios de aceptación de `PLAN.md` §14 cumplidos.
- Sin errores de build/type. Auditoría a11y AA satisfactoria.

---

## Resumen de dependencias entre etapas

```
Etapa 1 (Base)
   └─ Etapa 2 (Home + Detalle)
         ├─ Etapa 3 (Reportes + Sync)
         ├─ Etapa 4 (Comunidad + Config)
         └─ Etapa 5 (Notificaciones)  ← usa datos de Etapa 2
                └─ Etapa 6 (A11y + PWA polish)  ← cierra todo
```

## Backlog futuro (post-v1)
- Backend real + Web Push con VAPID.
- Autenticación/perfil de estudiante.
- Geolocalización y mapas.
- Moderación/administración de contenido.
- i18n.
