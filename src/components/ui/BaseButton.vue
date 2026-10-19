<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'primary' | 'accent' | 'ghost' | 'danger' | 'subtle'
    size?: 'sm' | 'md' | 'lg'
    type?: 'button' | 'submit' | 'reset'
    block?: boolean
    loading?: boolean
    disabled?: boolean
  }>(),
  {
    variant: 'subtle',
    size: 'md',
    type: 'button',
    block: false,
    loading: false,
    disabled: false,
  },
)
</script>

<template>
  <button
    :type="type"
    :class="['btn', `btn--${variant}`, `btn--${size}`, { 'btn--block': block }]"
    :disabled="disabled || loading"
    :aria-busy="loading || undefined"
  >
    <span v-if="loading" class="btn__spinner" aria-hidden="true" />
    <slot />
  </button>
</template>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  min-height: 44px;
  padding: 0 var(--space-4);
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: var(--text-sm);
  cursor: pointer;
  transition: background-color 150ms ease, border-color 150ms ease, color 150ms ease;
  text-decoration: none;
}
.btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.btn--block {
  width: 100%;
}
.btn--sm {
  min-height: 36px;
  font-size: var(--text-xs);
  padding: 0 var(--space-3);
}
.btn--lg {
  min-height: 52px;
  font-size: var(--text-base);
  padding: 0 var(--space-6);
}
.btn--primary {
  background: var(--primary);
  color: #fff;
}
.btn--primary:hover:not(:disabled) {
  background: var(--primary-strong);
}
.btn--accent {
  background: var(--accent);
  color: var(--text-on-accent);
}
.btn--accent:hover:not(:disabled) {
  background: var(--accent-strong);
}
.btn--subtle {
  background: var(--surface-2);
  color: var(--text-strong);
  border-color: var(--border);
}
.btn--subtle:hover:not(:disabled) {
  background: var(--surface-3);
}
.btn--ghost {
  background: transparent;
  color: var(--text);
  border-color: var(--border);
}
.btn--ghost:hover:not(:disabled) {
  background: var(--surface-2);
  color: var(--text-strong);
}
.btn--danger {
  background: transparent;
  color: var(--error);
  border-color: var(--error);
}
.btn--danger:hover:not(:disabled) {
  background: var(--error-bg);
}
.btn__spinner {
  width: 1em;
  height: 1em;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: btn-spin 700ms linear infinite;
}
@keyframes btn-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
