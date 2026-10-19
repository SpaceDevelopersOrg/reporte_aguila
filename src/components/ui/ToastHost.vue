<script setup lang="ts">
import { useUiStore } from '../../stores/ui'

const ui = useUiStore()
</script>

<template>
  <div class="toasts" aria-live="polite" aria-atomic="false">
    <transition-group name="toast">
      <div
        v-for="toast in ui.toasts"
        :key="toast.id"
        :class="['toast', `toast--${toast.type}`]"
        role="status"
      >
        <span class="toast__message">{{ toast.message }}</span>
        <button
          type="button"
          class="toast__close"
          aria-label="Cerrar notificación"
          @click="ui.dismiss(toast.id)"
        >
          ✕
        </button>
      </div>
    </transition-group>
  </div>
</template>

<style scoped>
.toasts {
  position: fixed;
  right: var(--space-4);
  bottom: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  z-index: 600;
  max-width: min(380px, calc(100vw - var(--space-8)));
}
.toast {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-strong);
  background: var(--surface);
  box-shadow: var(--shadow-2);
  font-size: var(--text-sm);
}
.toast--success {
  border-color: var(--ok);
}
.toast--error {
  border-color: var(--error);
}
.toast--warn {
  border-color: var(--warn);
}
.toast--info {
  border-color: var(--primary);
}
.toast__message {
  flex: 1;
  color: var(--text-strong);
}
.toast__close {
  flex: none;
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: var(--text-sm);
  padding: 2px 4px;
}
.toast-enter-active,
.toast-leave-active {
  transition: opacity 200ms ease, transform 200ms ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
