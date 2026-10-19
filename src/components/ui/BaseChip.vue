<script setup lang="ts">
withDefaults(defineProps<{ active?: boolean; as?: string }>(), {
  active: false,
  as: 'span',
})
</script>

<template>
  <component :is="as" :class="['chip', { 'chip--active': active }]">
    <slot />
  </component>
</template>

<style scoped>
.chip {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  min-height: 36px;
  padding: 0 var(--space-3);
  border-radius: var(--radius-pill);
  border: 1px solid var(--border);
  background: var(--surface-2);
  color: var(--text);
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  transition: background-color 150ms ease, border-color 150ms ease, color 150ms ease;
}
.chip--active {
  background: var(--accent);
  color: var(--text-on-accent);
  border-color: var(--accent);
}
</style>
