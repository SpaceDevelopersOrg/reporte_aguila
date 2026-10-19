<script setup lang="ts">
withDefaults(defineProps<{ as?: string; padded?: boolean; interactive?: boolean }>(), {
  as: 'div',
  padded: true,
  interactive: false,
})
</script>

<template>
  <component
    :is="as"
    :class="['card', { 'card--padded': padded, 'card--interactive': interactive }]"
  >
    <slot />
  </component>
</template>

<style scoped>
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-1);
}
.card--padded {
  padding: var(--space-4);
}
.card--interactive {
  transition: transform 150ms ease, border-color 150ms ease;
}
.card--interactive:hover {
  transform: translateY(-2px);
  border-color: var(--accent);
}
</style>
