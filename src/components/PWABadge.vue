<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRegisterSW } from 'virtual:pwa-register/vue'

// check for updates every hour
const period = 60 * 60 * 1000

const swActivated = ref(false)

/**
 * This function will register a periodic sync check every hour, you can modify the interval as needed.
 */
function registerPeriodicSync(swUrl: string, r: ServiceWorkerRegistration) {
  if (period <= 0) return

  setInterval(async () => {
    if ('onLine' in navigator && !navigator.onLine)
      return

    const resp = await fetch(swUrl, {
      cache: 'no-store',
      headers: {
        'cache': 'no-store',
        'cache-control': 'no-cache',
      },
    })

    if (resp?.status === 200)
      await r.update()
  }, period)
}

const { needRefresh, updateServiceWorker } = useRegisterSW({
  immediate: true,
  onRegisteredSW(swUrl, r) {
    if (period <= 0) return
    if (r?.active?.state === 'activated') {
      swActivated.value = true
      registerPeriodicSync(swUrl, r)
    }
    else if (r?.installing) {
      r.installing.addEventListener('statechange', (e) => {
        const sw = e.target as ServiceWorker
        swActivated.value = sw.state === 'activated'
        if (swActivated.value)
          registerPeriodicSync(swUrl, r)
      })
    }
  },
})

const title = computed(() => {
  
    
  if (needRefresh.value)
    return 'Hay una nueva versión disponible. Actualiza para ver los últimos cambios.'
  return ''
})

function close() {
  
  needRefresh.value = false
}
</script>

<template>
  <div
      v-if="needRefresh"
      class="pwa-toast"
      aria-labelledby="toast-message"
      role="alert"
  >
    <div class="message">
      <span id="toast-message">
        {{ title }}
      </span>
    </div>
    <div class="buttons">
      <button  type="button" class="reload" @click="updateServiceWorker()">
        Actualizar
      </button>
      <button  type="button" @click="close">
        Cerrar
      </button>
    </div>
  </div>
</template>

<style scoped>
.pwa-toast {
  position: fixed;
  right: 0;
  bottom: 0;
  margin: 16px;
  padding: 12px 16px;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-md);
  z-index: 700;
  text-align: left;
  box-shadow: var(--shadow-2);
  display: grid;
  max-width: min(360px, calc(100vw - 32px));
  background-color: var(--surface);
  color: var(--text-strong);
}
.pwa-toast .message {
  margin-bottom: 8px;
}
.pwa-toast .buttons {
  display: flex;
  gap: 8px;
}
.pwa-toast button {
  min-height: 40px;
  border: 1px solid var(--border);
  outline: none;
  border-radius: var(--radius-sm);
  padding: 6px 12px;
  background: var(--surface-2);
  color: var(--text-strong);
  font-weight: 600;
  cursor: pointer;
}
.pwa-toast button.reload {
  display: block;
  background: var(--accent);
  color: var(--text-on-accent);
  border-color: var(--accent);
}
</style>
