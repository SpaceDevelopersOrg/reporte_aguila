import { onMounted, onUnmounted, readonly, ref } from 'vue'

const isOnline = ref(typeof navigator === 'undefined' ? true : navigator.onLine)
let listeners = 0

function update() {
  isOnline.value = navigator.onLine
}

export function useOnline() {
  onMounted(() => {
    if (listeners === 0) {
      window.addEventListener('online', update)
      window.addEventListener('offline', update)
    }
    listeners += 1
  })
  onUnmounted(() => {
    listeners -= 1
    if (listeners === 0) {
      window.removeEventListener('online', update)
      window.removeEventListener('offline', update)
    }
  })
  return { isOnline: readonly(isOnline) }
}
