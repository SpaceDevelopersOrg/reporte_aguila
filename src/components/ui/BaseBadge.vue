<script setup lang="ts">
withDefaults(
  defineProps<{
    tone?: 'neutral' | 'accent' | 'primary' | 'ok' | 'warn' | 'error'
  }>(),
  { tone: 'neutral' },
)
</script>

<template>
  <span :class="['badge', `badge--${tone}`]">
    <slot />
  </span>
</template>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: 2px var(--space-2);
  border-radius: var(--radius-pill);
  font-size: var(--text-xs);
  font-weight: 700;
  line-height: 1.6;
  border: 1px solid transparent;
  white-space: nowrap;
}
.badge--neutral {
  background: var(--surface-3);
  color: var(--text);
  border-color: var(--border);
}
.badge--accent {
  background: var(--accent);
  color: var(--text-on-accent);
}
.badge--primary {
  background: var(--info-bg);
  color: var(--text-strong);
  border-color: var(--primary);
}
.badge--ok {
  background: var(--ok-bg);
  color: var(--ok);
  border-color: var(--ok);
}
.badge--warn {
  background: var(--warn-bg);
  color: var(--warn);
  border-color: var(--warn);
}
.badge--error {
  background: var(--error-bg);
  color: var(--error);
  border-color: var(--error);
}
</style>
