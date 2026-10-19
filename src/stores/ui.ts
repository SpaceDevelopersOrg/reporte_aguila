import { defineStore } from 'pinia'
import { ref } from 'vue'
import { newId } from '../utils/format'

export type ToastType = 'info' | 'success' | 'error' | 'warn'

export interface Toast {
  id: string
  message: string
  type: ToastType
}

export const useUiStore = defineStore('ui', () => {
  const toasts = ref<Toast[]>([])

  function push(message: string, type: ToastType = 'info', timeout = 4500) {
    const id = newId()
    toasts.value.push({ id, message, type })
    if (timeout > 0) {
      setTimeout(() => dismiss(id), timeout)
    }
    return id
  }

  function dismiss(id: string) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  return { toasts, push, dismiss }
})
