<script setup lang="ts">
interface Option {
  value: string
  label: string
}

defineProps<{
  options: Option[]
  modelValue: string
  label: string
}>()

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <div class="pills" role="tablist" :aria-label="label" data-no-swipe>
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      role="tab"
      :aria-selected="modelValue === option.value"
      :class="['pill', { 'pill--active': modelValue === option.value }]"
      @click="emit('update:modelValue', option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<style scoped>
.pills {
  display: flex;
  gap: var(--space-2);
  overflow-x: auto;
  scroll-snap-type: x proximity;
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding: 2px 0;
  max-width: 100%;
}
.pills::-webkit-scrollbar {
  display: none;
}
.pill {
  flex: none;
  scroll-snap-align: start;
  min-height: 36px;
  padding: 0 var(--space-4);
  border-radius: var(--radius-pill);
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-muted);
  font-size: var(--text-sm);
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition: background-color 150ms ease, border-color 150ms ease, color 150ms ease;
}
.pill:hover {
  color: var(--text-strong);
  border-color: var(--border-strong);
}
.pill--active {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--text-on-accent);
}
</style>
