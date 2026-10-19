# Plan — Reporte Águila (PWA de Eventos FIM)

PWA para la comunidad estudiantil de la **Facultad de Ingeniería Mochis (FIM)** que permite
consultar eventos **culturales y deportivos** organizados por los estudiantes, suscribirse a
**alertas de notificación pre-evento** y **reportar incidencias** de forma **offline-first**.

- **Nombre de producto:** Reporte Águila
- **Alcance actual:** Front-end PWA con datos mock. Sin backend real.
- **Idioma de la interfaz:** Español (es-MX).

---

## 1. Objetivos

1. **Consultar eventos** culturales y deportivos de la comunidad FIM con detalle completo.
2. **Notificar pre-evento** a los usuarios suscritos, con anticipación configurable.
3. **Reportar incidencias** por parte de los estudiantes con envío optimista y sincronización diferida.
4. **Funcionar offline-first**: cargar eventos desde caché y encolar reportes cuando no hay red.
5. **Accesibilidad WCAG 2.1 AA** en toda la aplicación.
6. **Instalable como PWA** (standalone, service worker, manifest, iconos).

---

## 2. Decisiones aprobadas

| Tema | Decisión |
| --- | --- |
| Entrega de notificaciones | **Local + abstracción lista para Web Push**. Simula push con notificaciones locales desde el SW usando datos mock, detrás de una interfaz `NotificationService` para conectar Web Push (VAPID/servidor) después. Sin backend. |
| UI | **Sistema de diseño propio**, sin librería de componentes. Componentes Vue a mano + CSS custom properties derivadas de la paleta. |
| Vista "Reportes" | **Envío de reportes de incidencias/eventos por estudiantes**. Se encolan offline y sincronizan de forma optimista contra un servidor mock. |
| Home | **Feed de eventos + filtros + detalle**. Filtros por categoría y fecha, búsqueda, y página de detalle con botón "notificarme". |
| Comunidad FIM | **Directorio de organizaciones, equipos y organizadores**, cada uno enlazando a sus próximos eventos. |
| Configuración | **Notificaciones + accesibilidad + datos**. Suscripción y lead time, toggles por categoría; tamaño de fuente, alto contraste, movimiento reducido; tema; gestión de caché y estado de sincronización. |
| Accesibilidad | **WCAG 2.1 AA**. |
| Backend | **No existe**: capa `mockApi` con latencia simulada y datos en `src/data/mock`. |

---

## 3. Stack

### Existente
- **Vue 3.5** + **TypeScript** + **Vite 7**
- **vite-plugin-pwa** en modo `injectManifest` (`src/sw.ts`)
- **workbox-core / precaching / routing / strategies / window**

### Añadir
- **vue-router** — navegación del sidebar y rutas.
- **pinia** — estado global (eventos, reportes, configuración, notificaciones, comunidad).
- **dexie** — IndexedDB: caché de eventos, outbox de reportes, alertas programadas, metadatos.
- **Background Sync API** (nativa del service worker) — vaciado en segundo plano de la cola de reportes.

---

## 4. Arquitectura

```
src/
  main.ts                      # mount + router + pinia
  App.vue                      # <AppShell> + <PWABadge> + <Toast>
  router/index.ts              # /, /evento/:id, /reportes, /comunidad, /configuracion
  layouts/AppShell.vue         # sidebar + topbar + <main> + skip-link
  views/
    HomeView.vue               # feed + filtros + enlace a detalle
    EventDetailView.vue        # detalle + suscripción + .ics + compartir
    ReportesView.vue           # formulario + "Mis reportes" + estados de sync
    ComunidadView.vue          # clubes / deportes / organizadores
    ConfiguracionView.vue      # notificaciones + accesibilidad + datos
  components/ui/               # Button, Card, Badge, Switch, Chip, Modal,
                               # Toast, Skeleton, EmptyState, Segmented, Field
  components/events/           # EventCard, EventFilters, NotifyToggle
  stores/                      # events, community, reports, settings, notifications
  db/index.ts                  # Dexie schema
  services/
    api/mockApi.ts             # eventos / comunidad / reportes con latencia simulada
    notifications.ts           # NotificationService (local + push-ready)
    sync.ts                    # outbox, flush, online/offline, background sync
  composables/                 # useOnline, useAccessibility, usePreEventAlerts
  data/mock/                   # events.ts, community.ts, organizers.ts
  styles/tokens.css            # paleta + tokens semánticos
  styles/base.css              # reset, foco, tipografía
  sw.ts                        # precache + push + notificationclick + periodicsync + sync
```

### Capas

1. **Presentación** — `views/`, `components/`, `layouts/`.
2. **Estado** — `stores/` (Pinia), orquestan UI y persistencia.
3. **Persistencia** — `db/` (Dexie) + `localStorage` para preferencias ligeras.
4. **Servicios** — `services/api` (mock), `services/notifications`, `services/sync`.
5. **Background** — `sw.ts` (precache, push, periodic sync, background sync).

---

## 5. Sistema de diseño

### Paleta (fuente)

| Nombre | HEX | HSL | RGB |
| --- | --- | --- | --- |
| Tuscan Sun | `#e8c547` | `hsla(47, 78%, 59%, 1)` | `rgba(232, 197, 71, 1)` |
| Graphite | `#30323d` | `hsla(231, 12%, 21%, 1)` | `rgba(48, 50, 61, 1)` |
| Charcoal | `#4d5061` | `hsla(231, 11%, 34%, 1)` | `rgba(77, 80, 97, 1)` |
| Glaucous | `#5c80bc` | `hsla(218, 42%, 55%, 1)` | `rgba(92, 128, 188, 1)` |
| Ash Grey | `#cdd1c4` | `hsla(78, 12%, 79%, 1)` | `rgba(205, 209, 196, 1)` |

### Tokens semánticos

```css
:root {
  /* Marca */
  --tuscan-sun: #e8c547;
  --graphite:   #30323d;
  --charcoal:   #4d5061;
  --glaucous:   #5c80bc;
  --ash-grey:   #cdd1c4;

  /* Superficies */
  --bg:         var(--graphite);
  --surface:    var(--charcoal);
  --surface-2:  #3b3e4d;         /* charcoal aclarado */
  --border:     #5a5d70;

  /* Texto */
  --text:        var(--ash-grey);
  --text-strong: #ffffff;
  --text-muted:  #9aa0ae;

  /* Acción */
  --accent:   var(--tuscan-sun); /* CTA, foco, badges de notificación */
  --primary:  var(--glaucous);   /* acciones y enlaces */
  --focus:    var(--tuscan-sun);

  /* Estados */
  --ok:    #6bbf7b;
  --warn:  var(--tuscan-sun);
  --error: #d16a6a;

  /* Espaciado, radios, tipografía, sombras */
  --space-1: 4px;  --space-2: 8px;  --space-3: 12px;
  --space-4: 16px; --space-6: 24px; --space-8: 32px;
  --radius-sm: 6px; --radius-md: 10px; --radius-lg: 16px;
  --shadow-1: 0 2px 8px rgba(0,0,0,.28);
  --shadow-2: 0 8px 24px rgba(0,0,0,.36);
  --font-sans: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --font-scale: 1;               /* ajustable en Configuración */
}
```

### Contraste y accesibilidad de color

- **Tuscan Sun sobre Graphite:** relación ≈ 9:1 → apto para texto normal y foco. ✔
- **Ash Grey sobre Graphite:** relación ≈ 8:1 → texto de cuerpo. ✔
- **Blanco sobre Graphite:** máximo contraste → encabezados. ✔
- **Glaucous sobre Graphite:** relación ≈ 3.2:1 → **solo** textos grandes, iconos y bordes.
  No usar glaucous para texto de cuerpo sobre graphite.
- Todo par texto/fondo se valida contra AA (4.5:1 normal, 3:1 grande) durante la Fase 6.

### Principios de componentes
- Un `Field` envuelve label + control + hint + error asociados con `aria-describedby`.
- `Switch` usa `role="switch"` con estado accesible.
- `Modal` atrapa el foco, cierra con `Esc`, y restaura el foco al disparador.
- `Toast` se anuncia vía `aria-live="polite"`.
- Estilos de foco siempre visibles con `--focus`.

---

## 6. Modelo de datos

```ts
// src/db/index.ts (Dexie)
events:                 { id, title, description, category, startsAt, endsAt,
                          location, organizerId, imageUrl, tags[], updatedAt }
community:              { id, name, type, description, logoUrl, contact, eventIds[] }
organizers:             { id, name, contact, eventIds[] }
reports:                { id (uuid), type, title, description, location,
                          photoDataUrl?, anonymous, createdAt,
                          status: 'pending'|'syncing'|'synced'|'failed',
                          error?, syncedAt? }
scheduledNotifications: { id, eventId, fireAt, leadTimeMin, title, body, shown }
meta:                   { key, value }   // lastEventSync, etc.
```

`category`: `'cultural' | 'sports'`.
`type` (reporte): `'incidencia' | 'evento' | 'sugerencia' | 'otro'`.

---

## 7. Flujos

### 7.1 Eventos — offline-first (stale-while-revalidate)
1. Al montar la app, se **render inmediato** desde Dexie (`events`).
2. Si `navigator.onLine`, se llama `mockApi.getEvents(since=meta.lastEventSync)`.
3. Se hace **diff** contra la caché.
4. Se persisten los nuevos y se actualiza `meta.lastEventSync`.
5. Los eventos nuevos que coinciden con una suscripción activa generan **notificación**.
6. Si no hay red, se mantiene la caché y se muestra indicador "offline".

### 7.2 Reportes — optimista + sincronización diferida
1. El usuario envía el formulario.
2. Se escribe en Dexie con `status: 'pending'` → aparece **de inmediato** en "Mis reportes".
3. Si hay red → `status: 'syncing'` → `mockApi.submitReport()` → `'synced'` (+ `syncedAt`).
4. Si no hay red → permanece `'pending'`; se registra en Background Sync.
5. El listener `online` y el evento `sync` del SW **vacían la cola** al recuperar conexión.
6. En error → `'failed'` con mensaje y botón **Reintentar**.

### 7.3 Alertas pre-evento
1. En **Configuración** el usuario otorga permiso y elige lead time (1 h / 1 día / 1 semana).
2. Se crean registros en `scheduledNotifications` (`fireAt = startsAt − leadTime`).
3. Con la app abierta, un `setTimeout` (composable `usePreEventAlerts`) dispara la alerta.
4. En segundo plano, el SW `periodicsync` revisa alertas vencidas y muestra
   `registration.showNotification`.
5. `notificationclick` enfoca/enruta a `/evento/:id`.
6. Evento `push` y helper de `PushSubscription` quedan **cableados y aislados** para Web Push futuro.

---

## 8. Service Worker (`src/sw.ts`)

| Handler | Propósito |
| --- | --- |
| `install` / `activate` | precache (existente), limpieza de cachés |
| `message` `SKIP_WAITING` | actualización con prompt (existente) |
| `push` | recibir notificación Web Push (**stub, push-ready**) |
| `notificationclick` | enfocar/abrir `/evento/:id` |
| `periodicsync` | refrescar eventos + disparar alertas vencidas |
| `sync` / Background Sync | vaciar outbox de reportes |

- Precaching de app shell (excluye assets no críticos).
- Estrategia `NavigationRoute` → `index.html` (offline) ya existente.

---

## 9. Rutas y navegación

Sidebar (`AppShell`) con submenús:

| Ruta | Vista | Icono/semántica |
| --- | --- | --- |
| `/` | Home | Feed de eventos |
| `/evento/:id` | Detalle | — (oculto del sidebar) |
| `/reportes` | Reportes | Formulario + mis reportes |
| `/comunidad` | Comunidad FIM | Clubes/deportes/organizadores |
| `/configuracion` | Configuración | Ajustes |

- Sidebar colapsable en móvil (drawer) y fija en escritorio.
- `aria-current="page"` en el enlace activo.
- Atajo "Saltar al contenido" como primer elemento enfocable.

---

## 10. Detalle de vistas

### Home
- Feed de tarjetas de evento con imagen, categoría (chip), fecha, lugar, organizador.
- Filtros: categoría (cultural/deportes), rango de fechas, búsqueda por texto, orden.
- Estado vacío y skeletons de carga.
- Toggle "notificarme" en cada tarjeta.
- Enlace a `/evento/:id`.

### Detalle de evento
- Título, descripción, categoría, fecha/hora, ubicación, organizador enlazado.
- Suscripción con selector de lead time.
- "Agregar a calendario" (`.ics`) y "Compartir" (Web Share API con fallback a copiar enlace).

### Reportes
- Formulario: tipo, título, descripción, ubicación, foto opcional, anónimo.
- Validación accesible; borrador conservado en Dexie.
- "Mis reportes": lista con badges **pendiente / sincronizando / sincronizado / fallido** y Reintentar.

### Comunidad FIM
- Secciones/tabs: **Clubes**, **Deportes**, **Organizadores**.
- Tarjetas con logo, descripción y próximos eventos enlazados.

### Configuración
- **Notificaciones:** permiso, suscripción, lead time, toggles por categoría.
- **Accesibilidad:** tamaño de fuente (escala), alto contraste, movimiento reducido.
- **Tema:** claro/oscuro/sistema.
- **Datos:** tamaño de caché, limpiar caché, forzar sincronización, última sincronización.

---

## 11. Accesibilidad (WCAG 2.1 AA)

- Landmarks: `<nav>`, `<main>`, `<header>`; skip-link al contenido.
- Navegación completa por teclado; foco visible con `--focus`.
- Focus trap en modales; gestión de foco al cambiar de ruta (mover a `h1`/`main`).
- Formularios: `label`, `aria-describedby`, `aria-invalid`, mensajes de error.
- `aria-live="polite"` para toasts y estado de sincronización.
- `prefers-reduced-motion` respetado + opción manual.
- Contraste validado por par; nada de color como único indicador de estado.
- Zoom hasta 200 % sin pérdida de contenido; áreas táctiles ≥ 44×44 px.

---

## 12. PWA

- **Manifest:** nombre "Reporte Águila — Eventos FIM", `short_name` "Rep. Águila",
  `theme_color` graphite, `background_color` graphite, `display: standalone`,
  `lang: es-MX`, `start_url: /`.
- **Iconos:** generados con `@vite-pwa/assets-generator` a partir de `public/favicon.svg`.
- **Registro:** prompt de actualización ya implementado en `PWABadge.vue`.
- **Instalación:** prompt in-app ("Agregar a pantalla de inicio") cuando esté disponible.

---

## 13. Datos mock

- `src/data/mock/events.ts` — ~15 eventos (culturales + deportes) con fechas variadas,
  incluyendo **al menos uno próximo** para demostrar la alerta pre-evento.
- `src/data/mock/community.ts` — clubes, equipos deportivos.
- `src/data/mock/organizers.ts` — organizadores y su relación con eventos.
- `mockApi` simula latencia (300–800 ms) y puede devolver "eventos nuevos" para
  probar el flujo de sincronización y notificación.

---

## 14. Criterios de aceptación

- [ ] La app carga y muestra eventos **sin conexión** desde la caché.
- [ ] Con conexión, detecta y notifica **eventos nuevos**.
- [ ] El usuario puede **suscribirse** y recibir una alerta **pre-evento** según lead time.
- [ ] Un reporte enviado **sin conexión** aparece como *pendiente* y se sincroniza al reconectar.
- [ ] Navegación por sidebar entre las 5 vistas (Home, Reportes, Comunidad FIM, Configuración, Detalle).
- [ ] Recorrido completo operable por **teclado** y anunciado por lector de pantalla.
- [ ] `pnpm build` y `vue-tsc` terminan sin errores.
- [ ] La app es instalable y el prompt de actualización funciona.

---

## 15. Fuera de alcance (iteraciones futuras)

- Backend real y Web Push con VAPID/servidor.
- Autenticación/perfil de estudiante.
- Geolocalización y mapas.
- Moderación y administración de contenido.
- Internacionalización (i18n).
