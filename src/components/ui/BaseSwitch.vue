<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
  label: string
  description?: string
  disabled?: boolean
}>()

const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

function toggle() {
  if (props.disabled) return
  emit('update:modelValue', !props.modelValue)
}
</script>

<template>
  <div class="switch-row">
    <div class="switch-row__text">
      <span class="switch-row__label">{{ label }}</span>
      <span v-if="description" class="switch-row__desc">{{ description }}</span>
    </div>
    <button
      type="button"
      role="switch"
      :aria-checked="modelValue"
      :aria-label="label"
      :disabled="disabled"
      :class="['switch', { 'switch--on': modelValue }]"
      @click="toggle"
    >
      <span class="switch__thumb" aria-hidden="true" />
    </button>
  </div>
</template>

<style scoped>
.switch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-3) 0;
  border-bottom: 1px solid var(--border);
}
.switch-row:last-child {
  border-bottom: none;
}
.switch-row__text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.switch-row__label {
  font-weight: 600;
  color: var(--text-strong);
  font-size: var(--text-sm);
}
.switch-row__desc {
  font-size: var(--text-xs);
  color: var(--text-muted);
}
.switch {
  flex: none;
  width: 52px;
  height: 30px;
  padding: 3px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--border-strong);
  background: var(--surface-3);
  cursor: pointer;
  transition: background-color 150ms ease, border-color 150ms ease;
}
.switch:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.switch--on {
  background: var(--accent);
  border-color: var(--accent);
}
.switch__thumb {
  display: block;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--text-strong);
  transition: transform 150ms ease;
}
.switch--on .switch__thumb {
  transform: translateX(22px);
  background: var(--text-on-accent);
}
</style>
