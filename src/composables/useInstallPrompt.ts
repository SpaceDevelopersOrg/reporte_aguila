import { computed, ref } from 'vue'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
  prompt(): Promise<void>
}

export type InstallPlatform = 'ios' | 'android' | 'desktop' | 'other'

const DISMISS_KEY = 'reporte-aguila:install-dismissed'

const deferredPrompt = ref<BeforeInstallPromptEvent | null>(null)
const installed = ref(false)
const dismissed = ref(false)
const platform = ref<InstallPlatform>('other')

function detectPlatform(): InstallPlatform {
  if (typeof navigator === 'undefined') return 'other'
  const ua = navigator.userAgent
  const isIos =
    /iphone|ipad|ipod/i.test(ua) ||
    (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1)
  if (isIos) return 'ios'
  if (/android/i.test(ua)) return 'android'
  if (/windows|macintosh|linux|cros/i.test(ua)) return 'desktop'
  return 'other'
}

function isStandalone() {
  if (typeof window === 'undefined') return false
  const media = window.matchMedia?.('(display-mode: standalone)').matches ?? false
  const iosStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone === true
  return media || iosStandalone
}

function onBeforeInstall(event: Event) {
  event.preventDefault()
  deferredPrompt.value = event as BeforeInstallPromptEvent
}

function onInstalled() {
  installed.value = true
  deferredPrompt.value = null
}

function init() {
  if (typeof window === 'undefined') return
  platform.value = detectPlatform()
  installed.value = isStandalone()
  try {
    dismissed.value = localStorage.getItem(DISMISS_KEY) === '1'
  } catch {
    dismissed.value = false
  }
  window.addEventListener('beforeinstallprompt', onBeforeInstall)
  window.addEventListener('appinstalled', onInstalled)
}

// Los listeners se registran al importar el módulo para no perder el evento
// `beforeinstallprompt`, que puede dispararse antes de montar los componentes.
init()

async function promptInstall() {
  const event = deferredPrompt.value
  if (!event) return
  await event.prompt()
  const { outcome } = await event.userChoice
  if (outcome === 'accepted') installed.value = true
  deferredPrompt.value = null
}

function dismiss() {
  dismissed.value = true
  try {
    localStorage.setItem(DISMISS_KEY, '1')
  } catch {
    /* almacenamiento no disponible */
  }
}

export function useInstallPrompt() {
  const canPrompt = computed(() => !installed.value && deferredPrompt.value !== null)
  const canInstall = computed(() => canPrompt.value && !dismissed.value)

  return { canPrompt, canInstall, installed, platform, promptInstall, dismiss }
}
