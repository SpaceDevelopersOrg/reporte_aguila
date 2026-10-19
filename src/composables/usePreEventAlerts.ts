import { onMounted, onUnmounted } from 'vue'
import { useNotificationsStore } from '../stores/notifications'

const CHECK_INTERVAL = 30_000

export function usePreEventAlerts() {
  const notifications = useNotificationsStore()
  let timer: number | undefined

  function check() {
    void notifications.checkDue()
  }

  function onVisible() {
    if (document.visibilityState === 'visible') check()
  }

  onMounted(() => {
    void notifications.loadSubscriptions()
    void notifications.checkDue()
    timer = window.setInterval(check, CHECK_INTERVAL)
    document.addEventListener('visibilitychange', onVisible)
  })

  onUnmounted(() => {
    if (timer) window.clearInterval(timer)
    document.removeEventListener('visibilitychange', onVisible)
  })

  return { check }
}
