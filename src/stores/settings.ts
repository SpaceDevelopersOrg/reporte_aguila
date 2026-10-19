import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import type { ThemePreference } from '../types'

const STORAGE_KEY = 'reportaguila.settings'

interface SettingsState {
  theme: ThemePreference
  fontScale: number
  highContrast: boolean
  reducedMotion: boolean
  notificationsEnabled: boolean
  leadTimeMin: number
  notifyCultural: boolean
  notifySports: boolean
}

const defaults: SettingsState = {
  theme: 'dark',
  fontScale: 1,
  highContrast: false,
  reducedMotion: false,
  notificationsEnabled: false,
  leadTimeMin: 60,
  notifyCultural: true,
  notifySports: true,
}

function load(): SettingsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...defaults }
    return { ...defaults, ...(JSON.parse(raw) as Partial<SettingsState>) }
  } catch {
    return { ...defaults }
  }
}

export const useSettingsStore = defineStore('settings', () => {
  const initial = load()

  const theme = ref<ThemePreference>(initial.theme)
  const fontScale = ref(initial.fontScale)
  const highContrast = ref(initial.highContrast)
  const reducedMotion = ref(initial.reducedMotion)
  const notificationsEnabled = ref(initial.notificationsEnabled)
  const leadTimeMin = ref(initial.leadTimeMin)
  const notifyCultural = ref(initial.notifyCultural)
  const notifySports = ref(initial.notifySports)

  const notifyCategory = computed<Record<'cultural' | 'sports', boolean>>(() => ({
    cultural: notifyCultural.value,
    sports: notifySports.value,
  }))

  function persist() {
    const state: SettingsState = {
      theme: theme.value,
      fontScale: fontScale.value,
      highContrast: highContrast.value,
      reducedMotion: reducedMotion.value,
      notificationsEnabled: notificationsEnabled.value,
      leadTimeMin: leadTimeMin.value,
      notifyCultural: notifyCultural.value,
      notifySports: notifySports.value,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }

  function apply() {
    const root = document.documentElement
    const resolvedTheme =
      theme.value === 'system'
        ? window.matchMedia('(prefers-color-scheme: light)').matches
          ? 'light'
          : 'dark'
        : theme.value
    root.dataset.theme = resolvedTheme
    root.dataset.contrast = highContrast.value ? 'high' : 'normal'
    root.dataset.motion = reducedMotion.value ? 'reduced' : 'normal'
    root.style.setProperty('--font-scale', String(fontScale.value))
  }

  watch(
    [theme, fontScale, highContrast, reducedMotion, notificationsEnabled, leadTimeMin, notifyCultural, notifySports],
    () => {
      persist()
      apply()
    },
    { immediate: true },
  )

  function setTheme(value: ThemePreference) {
    theme.value = value
  }

  return {
    theme,
    fontScale,
    highContrast,
    reducedMotion,
    notificationsEnabled,
    leadTimeMin,
    notifyCultural,
    notifySports,
    notifyCategory,
    apply,
    setTheme,
  }
})
