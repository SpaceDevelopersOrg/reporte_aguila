<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AppIcon from '../components/ui/AppIcon.vue'
import BaseBadge from '../components/ui/BaseBadge.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import BaseSegmented from '../components/ui/BaseSegmented.vue'
import BaseSwitch from '../components/ui/BaseSwitch.vue'
import { useInstallPrompt } from '../composables/useInstallPrompt'
import { useOnline } from '../composables/useOnline'
import { simulateNewEvent } from '../services/api/eventsApi'
import { showLocalNotification } from '../services/notifications'
import { useEventsStore } from '../stores/events'
import { useNotificationsStore } from '../stores/notifications'
import { useReportsStore } from '../stores/reports'
import { useSettingsStore } from '../stores/settings'
import { useUiStore } from '../stores/ui'
import { LEAD_TIME_OPTIONS } from '../types'
import type { ThemePreference } from '../types'
import { formatBytes } from '../utils/format'

const settings = useSettingsStore()
const notifications = useNotificationsStore()
const events = useEventsStore()
const reports = useReportsStore()
const ui = useUiStore()
const { isOnline } = useOnline()
const { canPrompt, installed: appInstalled, platform, promptInstall } = useInstallPrompt()

const installHint = computed(() => {
  switch (platform.value) {
    case 'ios':
      return 'En Safari, toca el botón Compartir y elige "Añadir a pantalla de inicio".'
    case 'android':
      return 'Abre el menú ⋮ del navegador y elige "Instalar aplicación" o "Añadir a pantalla de inicio".'
    case 'desktop':
      return 'Usa el icono de instalación en la barra de direcciones del navegador.'
    default:
      return 'Busca "Instalar" o "Añadir a pantalla de inicio" en el menú de tu navegador.'
  }
})

const cacheSize = ref<number | null>(null)
const scheduledCount = ref(0)

const themeOptions = [
  { value: 'dark', label: 'Oscuro' },
  { value: 'light', label: 'Claro' },
  { value: 'system', label: 'Sistema' },
]

const fontOptions = [
  { value: '0.9', label: 'Pequeña' },
  { value: '1', label: 'Normal' },
  { value: '1.15', label: 'Grande' },
  { value: '1.3', label: 'Muy grande' },
]

const permissionLabel = computed(() => {
  switch (notifications.permission) {
    case 'granted':
      return 'Permiso concedido'
    case 'denied':
      return 'Permiso denegado'
    case 'unsupported':
      return 'No compatible'
    default:
      return 'Permiso sin solicitar'
  }
})

const permissionTone = computed(() => {
  switch (notifications.permission) {
    case 'granted':
      return 'ok' as const
    case 'denied':
      return 'error' as const
    case 'unsupported':
      return 'neutral' as const
    default:
      return 'warn' as const
  }
})

async function enableNotifications() {
  const result = await notifications.enable()
  if (result === 'granted') ui.push('Notificaciones activadas.', 'success')
  else if (result === 'denied') ui.push('Permiso denegado. Actívalo en el navegador.', 'error')
  else if (result === 'unsupported') ui.push('Este navegador no soporta notificaciones.', 'warn')
}

async function testNotification() {
  if (!notifications.isGranted) {
    const result = await notifications.enable()
    if (result !== 'granted') {
      ui.push('Activa el permiso para probar las notificaciones.', 'warn')
      return
    }
  }
  const ok = await showLocalNotification(
    'Prueba de alerta',
    'Así se verán los avisos de eventos de la FIM.',
    { url: '/' },
  )
  ui.push(ok ? 'Notificación de prueba enviada.' : 'No se pudo mostrar la notificación.', ok ? 'success' : 'error')
}

async function forceSync() {
  if (!isOnline.value) {
    ui.push('Sin conexión. No se puede sincronizar ahora.', 'warn')
    return
  }
  const count = await events.refresh()
  await reports.flush()
  await updateCacheInfo()
  ui.push(
    count > 0 ? `Sincronizado: ${count} novedades.` : 'Todo sincronizado.',
    'success',
  )
}

async function clearCache() {
  await events.clearCache()
  await reports.load()
  await updateCacheInfo()
  ui.push('Caché de eventos eliminada. Se recargará al sincronizar.', 'info')
}

function demoNewEvent() {
  const event = simulateNewEvent()
  ui.push(`Se publicó "${event.title}". Actualiza para verla.`, 'info')
}

async function updateCacheInfo() {
  scheduledCount.value = await notifications.pendingCount()
  try {
    if (navigator.storage?.estimate) {
      const estimate = await navigator.storage.estimate()
      cacheSize.value = estimate.usage ?? null
    }
  } catch {
    cacheSize.value = null
  }
}

onMounted(updateCacheInfo)
</script>

<template>
  <div class="settings">
    <header class="settings__header">
      <h1>Configuración</h1>
      <p class="settings__lead">Personaliza las alertas, la accesibilidad y el uso de datos.</p>
    </header>

    <section class="panel" aria-labelledby="notif-title">
      <h2 id="notif-title" class="panel__title">
        <AppIcon name="bell" :size="20" />
        Notificaciones
      </h2>

      <div class="panel__row">
        <div>
          <p class="panel__label">Estado del permiso</p>
          <BaseBadge :tone="permissionTone">{{ permissionLabel }}</BaseBadge>
        </div>
        <div class="panel__buttons">
          <BaseButton
            v-if="notifications.permission !== 'granted'"
            variant="accent"
            :disabled="notifications.permission === 'unsupported'"
            @click="enableNotifications"
          >
            Activar
          </BaseButton>
          <BaseButton variant="ghost" @click="testNotification">Probar</BaseButton>
        </div>
      </div>

      <BaseSwitch
        v-model="settings.notificationsEnabled"
        label="Recibir alertas de eventos"
        description="Avisos previos a los eventos y de nuevas publicaciones suscritas."
        :disabled="notifications.permission === 'unsupported'"
      />
      <BaseSwitch
        v-model="settings.notifyCultural"
        label="Eventos culturales"
        description="Conciertos, teatro, exposiciones y festivales."
      />
      <BaseSwitch
        v-model="settings.notifySports"
        label="Eventos deportivos"
        description="Torneos, partidos y actividades deportivas."
      />

      <div class="panel__field">
        <label class="panel__label" for="lead-time">Anticipación para recordatorios</label>
        <select id="lead-time" v-model.number="settings.leadTimeMin" class="control">
          <option v-for="option in LEAD_TIME_OPTIONS" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
        <p class="panel__hint">
          Se aplica a los eventos en los que activas "Notificarme". Alertas programadas:
          {{ scheduledCount }}.
        </p>
      </div>
    </section>

    <section class="panel" aria-labelledby="a11y-title">
      <h2 id="a11y-title" class="panel__title">
        <AppIcon name="community" :size="20" />
        Accesibilidad
      </h2>

      <div class="panel__field">
        <span class="panel__label" id="font-label">Tamaño del texto</span>
        <BaseSegmented
          label="Tamaño del texto"
          :options="fontOptions"
          :model-value="String(settings.fontScale)"
          @update:model-value="settings.fontScale = Number($event)"
        />
      </div>

      <BaseSwitch
        v-model="settings.highContrast"
        label="Alto contraste"
        description="Aumenta el contraste de textos y bordes."
      />
      <BaseSwitch
        v-model="settings.reducedMotion"
        label="Reducir movimiento"
        description="Disminuye animaciones y transiciones."
      />
    </section>

    <section class="panel" aria-labelledby="theme-title">
      <h2 id="theme-title" class="panel__title">
        <AppIcon name="settings" :size="20" />
        Apariencia
      </h2>
      <div class="panel__field">
        <span class="panel__label" id="theme-label">Tema</span>
        <BaseSegmented
          label="Tema"
          :options="themeOptions"
          :model-value="settings.theme"
          @update:model-value="settings.setTheme($event as ThemePreference)"
        />
      </div>
    </section>

    <section class="panel" aria-labelledby="app-title">
      <h2 id="app-title" class="panel__title">
        <AppIcon name="install" :size="20" />
        Aplicación
      </h2>

      <p v-if="appInstalled" class="panel__hint">
        Reporte Águila ya está instalada en este dispositivo.
      </p>

      <div v-else-if="canPrompt" class="panel__row">
        <div>
          <p class="panel__label">Instalar Reporte Águila</p>
          <p class="panel__hint">Acceso directo desde tu pantalla de inicio, sin la barra del navegador.</p>
        </div>
        <div class="panel__buttons">
          <BaseButton variant="accent" @click="promptInstall">
            <AppIcon name="install" :size="18" />
            Instalar
          </BaseButton>
        </div>
      </div>

      <div v-else>
        <p class="panel__label">Cómo instalar</p>
        <p class="panel__hint">{{ installHint }}</p>
      </div>
    </section>

    <section class="panel" aria-labelledby="data-title">
      <h2 id="data-title" class="panel__title">
        <AppIcon name="offline" :size="20" />
        Datos y sincronización
      </h2>
      <dl class="panel__facts">
        <div>
          <dt>Estado de conexión</dt>
          <dd>{{ isOnline ? 'En línea' : 'Sin conexión' }}</dd>
        </div>
        <div>
          <dt>Eventos en caché</dt>
          <dd>{{ events.items.length }}</dd>
        </div>
        <div>
          <dt>Almacenamiento usado</dt>
          <dd>{{ cacheSize !== null ? formatBytes(cacheSize) : 'No disponible' }}</dd>
        </div>
        <div>
          <dt>Reportes pendientes</dt>
          <dd>{{ reports.pendingCount }}</dd>
        </div>
      </dl>

      <div class="panel__buttons panel__buttons--wrap">
        <BaseButton variant="subtle" :loading="events.refreshing" @click="forceSync">
          <AppIcon name="retry" :size="18" />
          Forzar sincronización
        </BaseButton>
        <BaseButton variant="ghost" @click="clearCache">
          <AppIcon name="trash" :size="18" />
          Limpiar caché de eventos
        </BaseButton>
        <BaseButton variant="ghost" @click="demoNewEvent">
          <AppIcon name="plus" :size="18" />
          Simular evento nuevo
        </BaseButton>
      </div>
      <p class="panel__hint">
        "Simular evento nuevo" es una herramienta de demostración: publica un evento desde el
        servidor de prueba para ver el aviso y la detección de novedades.
      </p>
    </section>
  </div>
</template>

<style scoped>
.settings__header {
  margin-bottom: var(--space-4);
}
.settings__lead {
  margin: 0;
}
.panel {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  margin-bottom: var(--space-4);
}
.panel__title {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin: 0 0 var(--space-4);
  font-size: var(--text-lg);
}
.panel__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  flex-wrap: wrap;
  padding-bottom: var(--space-3);
  border-bottom: 1px solid var(--border);
  margin-bottom: var(--space-2);
}
.panel__label {
  display: block;
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-strong);
  margin-bottom: var(--space-2);
}
.panel__field {
  margin-top: var(--space-4);
}
.panel__hint {
  margin: var(--space-2) 0 0;
  font-size: var(--text-xs);
  color: var(--text-muted);
}
.panel__buttons {
  display: flex;
  gap: var(--space-2);
}
.panel__buttons--wrap {
  flex-wrap: wrap;
  margin-top: var(--space-4);
}
.panel__facts {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-3);
  margin: 0;
}
.panel__facts div {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.panel__facts dt {
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.4px;
  color: var(--text-muted);
  font-weight: 700;
}
.panel__facts dd {
  margin: 0;
  font-size: var(--text-base);
  font-weight: 700;
  color: var(--text-strong);
}
</style>
