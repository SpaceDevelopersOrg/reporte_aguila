<script setup lang="ts">
import { computed, ref } from 'vue'
import AppIcon from '../ui/AppIcon.vue'
import { useNotificationsStore } from '../../stores/notifications'
import { useUiStore } from '../../stores/ui'
import type { FimEvent } from '../../types'

const props = defineProps<{ event: FimEvent }>()

const notifications = useNotificationsStore()
const ui = useUiStore()
const busy = ref(false)

const subscribed = computed(() => notifications.isSubscribed(props.event.id))

async function toggle() {
  if (busy.value) return
  busy.value = true
  try {
    const result = await notifications.toggle(props.event)
    if (result) {
      ui.push('Te avisaremos antes de este evento.', 'success')
    } else if (!subscribed.value) {
      ui.push('No se pudo activar la alerta. Revisa los permisos de notificación.', 'warn')
    } else {
      ui.push('Alerta desactivada.', 'info')
    }
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <button
    type="button"
    :class="['notify-toggle', { 'notify-toggle--on': subscribed }]"
    :aria-pressed="subscribed"
    :disabled="busy"
    @click.stop.prevent="toggle"
  >
    <AppIcon :name="subscribed ? 'bell' : 'bellOff'" :size="18" />
    <span>{{ subscribed ? 'Alerta activada' : 'Notificarme' }}</span>
  </button>
</template>

<style scoped>
.notify-toggle {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  min-height: 40px;
  padding: 0 var(--space-3);
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  background: var(--surface-2);
  color: var(--text);
  font-size: var(--text-xs);
  font-weight: 600;
  cursor: pointer;
}
.notify-toggle:hover {
  border-color: var(--accent);
  color: var(--text-strong);
}
.notify-toggle--on {
  background: var(--warn-bg);
  border-color: var(--accent);
  color: var(--text-strong);
}
.notify-toggle:disabled {
  opacity: 0.6;
  cursor: wait;
}
</style>
