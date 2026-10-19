<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import AppIcon from '../components/ui/AppIcon.vue'
import ToastHost from '../components/ui/ToastHost.vue'
import { useOnline } from '../composables/useOnline'
import { usePreEventAlerts } from '../composables/usePreEventAlerts'
import { registerPeriodicEventCheck } from '../services/sync'
import { useCommunityStore } from '../stores/community'
import { useEventsStore } from '../stores/events'
import { useNotificationsStore } from '../stores/notifications'
import { useReportsStore } from '../stores/reports'
import { useSettingsStore } from '../stores/settings'
import { useUiStore } from '../stores/ui'

const ui = useUiStore()
const events = useEventsStore()
const community = useCommunityStore()
const reports = useReportsStore()
const notifications = useNotificationsStore()
const settings = useSettingsStore()

const { isOnline } = useOnline()
const route = useRoute()
const router = useRouter()
const mainRef = ref<HTMLElement | null>(null)

usePreEventAlerts()

const navItems = [
  { to: '/', label: 'Inicio', short: 'Inicio', icon: 'home' },
  { to: '/reportes', label: 'Reportes', short: 'Reportes', icon: 'report' },
  { to: '/comunidad', label: 'Comunidad FIM', short: 'Comunidad', icon: 'community' },
  { to: '/configuracion', label: 'Configuración', short: 'Ajustes', icon: 'settings' },
]

// Orden de las vistas principales para el deslizamiento táctil.
const mainRoutes = ['/', '/reportes', '/comunidad', '/configuracion']

const transitionDirection = ref<'slide-left' | 'slide-right'>('slide-left')

function isActive(to: string) {
  if (to === '/') return route.path === '/' || route.path.startsWith('/evento')
  return route.path.startsWith(to)
}

function setDirectionTo(to: string) {
  const from = mainRoutes.indexOf(route.path)
  const toIndex = mainRoutes.indexOf(to)
  if (from === -1 || toIndex === -1 || from === toIndex) return
  transitionDirection.value = toIndex > from ? 'slide-left' : 'slide-right'
}

function goTo(step: number) {
  if (route.path.startsWith('/evento')) return
  const index = mainRoutes.indexOf(route.path)
  if (index === -1) return
  const target = mainRoutes[index + step]
  if (!target) return
  transitionDirection.value = step > 0 ? 'slide-left' : 'slide-right'
  void router.push(target)
}

// --- Gesto de deslizamiento entre vistas (móvil) ---
let startX = 0
let startY = 0
let horizontal = false
let ignoreSwipe = false

function isHorizontallyScrollable(el: HTMLElement | null) {
  while (el && el !== mainRef.value) {
    const style = getComputedStyle(el)
    if (
      (style.overflowX === 'auto' || style.overflowX === 'scroll') &&
      el.scrollWidth > el.clientWidth + 1
    ) {
      return true
    }
    el = el.parentElement
  }
  return false
}

function onTouchStart(event: TouchEvent) {
  const touch = event.touches[0]
  if (!touch) return
  startX = touch.clientX
  startY = touch.clientY
  horizontal = false
  const target = event.target as HTMLElement
  ignoreSwipe = !!target.closest('[data-no-swipe]') || isHorizontallyScrollable(target)
}

function onTouchMove(event: TouchEvent) {
  if (ignoreSwipe) return
  const touch = event.touches[0]
  if (!touch) return
  const dx = touch.clientX - startX
  const dy = touch.clientY - startY
  if (!horizontal && Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) horizontal = true
}

function onTouchEnd(event: TouchEvent) {
  if (ignoreSwipe || !horizontal) return
  const touch = event.changedTouches[0]
  if (!touch) return
  const dx = touch.clientX - startX
  const dy = touch.clientY - startY
  if (Math.abs(dx) < 55 || Math.abs(dx) < Math.abs(dy) * 1.2) return
  goTo(dx < 0 ? 1 : -1)
}

watch(
  () => route.fullPath,
  async () => {
    await new Promise((r) => requestAnimationFrame(r))
    mainRef.value?.focus()
  },
)

watch(isOnline, (online) => {
  if (online) {
    void events.refresh()
    void reports.flush()
  }
})

function onSwMessage(event: MessageEvent) {
  if (event.data?.type === 'REPORTS_SYNCED') {
    void reports.load()
    ui.push('Reportes sincronizados en segundo plano.', 'success')
  }
}

onMounted(async () => {
  settings.apply()
  await notifications.refreshPermission()
  await events.loadFromCache()
  void community.load()
  void reports.load()
  void notifications.loadSubscriptions()
  if (isOnline.value) void events.refresh()
  void registerPeriodicEventCheck()
  navigator.serviceWorker?.addEventListener('message', onSwMessage)
})
</script>

<template>
  <div class="shell">
    <a class="skip-link" href="#main">Saltar al contenido</a>

    <header class="topbar">
      <RouterLink to="/" class="topbar__brand">
        <img src="/logo.png" alt="" class="brand-logo" width="34" height="34" aria-hidden="true" />
        <span>Reporte Águila</span>
      </RouterLink>
      <span
        class="conn-dot"
        :class="isOnline ? 'conn-dot--on' : 'conn-dot--off'"
        :title="isOnline ? 'Con conexión' : 'Sin conexión'"
        :aria-label="isOnline ? 'Con conexión' : 'Sin conexión'"
        role="img"
      />
    </header>

    <div class="shell__body">
      <aside class="sidebar">
        <div class="sidebar__brand">
          <img
            src="/logo.png"
            alt=""
            class="brand-logo brand-logo--lg"
            width="42"
            height="42"
            aria-hidden="true"
          />
          <div>
            <strong>Reporte Águila</strong>
            <span class="sidebar__sub">Eventos FIM</span>
          </div>
        </div>

        <nav aria-label="Navegación principal" class="sidebar__nav">
          <ul>
            <li v-for="item in navItems" :key="item.to">
              <RouterLink :to="item.to" class="nav-link" @click="setDirectionTo(item.to)">
                <AppIcon :name="item.icon" :size="20" />
                <span>{{ item.label }}</span>
                <span
                  v-if="item.to === '/reportes' && reports.pendingCount"
                  class="nav-link__count"
                  :aria-label="`${reports.pendingCount} reportes sin enviar`"
                >
                  {{ reports.pendingCount }}
                </span>
              </RouterLink>
            </li>
          </ul>
        </nav>

        <div class="sidebar__footer">
          <p class="sidebar__status">
            <AppIcon :name="isOnline ? 'wifi' : 'offline'" :size="16" />
            {{ isOnline ? 'Con conexión' : 'Sin conexión' }}
          </p>
          <RouterLink to="/configuracion" class="sidebar__link">
            <AppIcon :name="notifications.isGranted ? 'bell' : 'bellOff'" :size="16" />
            {{ notifications.isGranted ? 'Alertas activas' : 'Alertas desactivadas' }}
          </RouterLink>
        </div>
      </aside>

      <main
        id="main"
        ref="mainRef"
        class="main"
        tabindex="-1"
        @touchstart.passive="onTouchStart"
        @touchmove.passive="onTouchMove"
        @touchend.passive="onTouchEnd"
      >
        <div v-if="!isOnline" class="offline-banner" role="status">
          <AppIcon name="offline" :size="18" />
          <span>Sin conexión. Mostrando eventos guardados en el dispositivo.</span>
        </div>
        <div class="view-host">
          <RouterView v-slot="{ Component }">
            <Transition :name="transitionDirection">
              <component :is="Component" :key="route.path" />
            </Transition>
          </RouterView>
        </div>
      </main>
    </div>

    <nav class="tabbar" aria-label="Navegación principal">
      <RouterLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="tabbar__link"
        :class="{ 'tabbar__link--active': isActive(item.to) }"
        @click="setDirectionTo(item.to)"
      >
        <span class="tabbar__icon">
          <AppIcon :name="item.icon" :size="22" />
          <span
            v-if="item.to === '/reportes' && reports.pendingCount"
            class="tabbar__dot"
            aria-hidden="true"
          />
        </span>
        <span class="tabbar__label">{{ item.short }}</span>
      </RouterLink>
    </nav>

    <ToastHost />
  </div>
</template>

<style scoped>
.shell {
  min-height: 100vh;
}
.brand-logo {
  display: block;
  width: 34px;
  height: 34px;
  border-radius: var(--radius-sm);
  object-fit: contain;
  background: var(--surface);
}
.brand-logo--lg {
  width: 42px;
  height: 42px;
}

/* Topbar (móvil) */
.topbar {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  height: var(--topbar-h);
  padding: 0 var(--space-4);
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 100;
}
.topbar__brand {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-weight: 700;
  color: var(--text-strong);
  text-decoration: none;
}
.conn-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-left: auto;
}
.conn-dot--on {
  background: var(--ok);
}
.conn-dot--off {
  background: var(--error);
}

.shell__body {
  display: flex;
  align-items: flex-start;
}

/* Sidebar (escritorio) */
.sidebar {
  display: none;
  position: fixed;
  inset: 0 auto 0 0;
  width: var(--sidebar-w);
  background: var(--surface);
  border-right: 1px solid var(--border);
  flex-direction: column;
  padding: var(--space-4);
  gap: var(--space-4);
  z-index: 200;
  overflow-y: auto;
}
.sidebar__brand {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}
.sidebar__sub {
  display: block;
  font-size: var(--text-xs);
  color: var(--text-muted);
}
.sidebar__nav ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}
.nav-link {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-height: 46px;
  padding: 0 var(--space-3);
  border-radius: var(--radius-md);
  color: var(--text);
  text-decoration: none;
  font-weight: 600;
  font-size: var(--text-sm);
}
.nav-link:hover {
  background: var(--surface-2);
  color: var(--text-strong);
}
.nav-link.router-link-exact-active {
  background: var(--primary);
  color: #fff;
}
.nav-link__count {
  margin-left: auto;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  display: grid;
  place-items: center;
  border-radius: var(--radius-pill);
  background: var(--accent);
  color: var(--text-on-accent);
  font-size: var(--text-xs);
  font-weight: 700;
}
.sidebar__footer {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding-top: var(--space-4);
  border-top: 1px solid var(--border);
}
.sidebar__status {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin: 0;
  font-size: var(--text-xs);
  color: var(--text-muted);
}
.sidebar__link {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-xs);
  color: var(--text-muted);
  text-decoration: none;
}
.sidebar__link:hover {
  color: var(--text-strong);
}

.main {
  flex: 1;
  width: 100%;
  min-width: 0;
  padding: var(--space-4);
  padding-bottom: calc(var(--tabbar-h) + var(--space-6) + env(safe-area-inset-bottom));
  outline: none;
}
.offline-banner {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  margin-bottom: var(--space-4);
  border-radius: var(--radius-md);
  background: var(--warn-bg);
  border: 1px solid var(--warn);
  color: var(--text-strong);
  font-size: var(--text-sm);
}

/* Transición entre vistas */
.view-host {
  position: relative;
  overflow-x: clip;
}
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 220ms ease, opacity 220ms ease;
}
.slide-left-enter-from {
  transform: translateX(100%);
  opacity: 0.4;
}
.slide-left-leave-to {
  transform: translateX(-24%);
  opacity: 0;
}
.slide-right-enter-from {
  transform: translateX(-100%);
  opacity: 0.4;
}
.slide-right-leave-to {
  transform: translateX(24%);
  opacity: 0;
}
.slide-left-leave-active,
.slide-right-leave-active {
  position: absolute;
  inset: 0;
}

/* Tabbar (móvil) */
.tabbar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  height: calc(var(--tabbar-h) + env(safe-area-inset-bottom));
  padding-bottom: env(safe-area-inset-bottom);
  background: var(--surface);
  border-top: 1px solid var(--border);
  z-index: 300;
}
.tabbar__link {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  color: var(--text-muted);
  text-decoration: none;
  font-size: var(--text-xs);
  font-weight: 600;
}
.tabbar__link--active {
  color: var(--accent);
}
.tabbar__icon {
  position: relative;
  display: grid;
  place-items: center;
}
.tabbar__dot {
  position: absolute;
  top: -1px;
  right: -4px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent);
}
.tabbar__label {
  line-height: 1;
}

/* Escritorio */
@media (min-width: 900px) {
  .topbar {
    display: none;
  }
  .tabbar {
    display: none;
  }
  .sidebar {
    display: flex;
  }
  .main {
    margin-left: var(--sidebar-w);
    padding: var(--space-6) var(--space-8);
    max-width: 1100px;
  }
}
</style>
