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
  <div class="segmented" role="tablist" :aria-label="label">
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      role="tab"
      :aria-selected="modelValue === option.value"
      :class="['segmented__item', { 'segmented__item--active': modelValue === option.value }]"
      @click="emit('update:modelValue', option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<style scoped>
.segmented {
  display: inline-flex;
  gap: 2px;
  padding: 3px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: var(--radius-pill);
  flex-wrap: wrap;
}
.segmented__item {
  min-height: 36px;
  padding: 0 var(--space-4);
  border: none;
  background: transparent;
  color: var(--text);
  border-radius: var(--radius-pill);
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
}
.segmented__item--active {
  background: var(--accent);
  color: var(--text-on-accent);
}
</style>
