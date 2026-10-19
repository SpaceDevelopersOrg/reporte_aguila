<script setup lang="ts">
import { computed, useId } from 'vue'

const props = withDefaults(
  defineProps<{
    label: string
    hint?: string
    error?: string
    required?: boolean
    controlId?: string
  }>(),
  { hint: '', error: '', required: false, controlId: '' },
)

const generatedId = useId()
const uid = props.controlId || generatedId
const hintId = `${uid}-hint`
const errorId = `${uid}-error`

const describedBy = computed(() => {
  const ids = []
  if (props.hint) ids.push(hintId)
  if (props.error) ids.push(errorId)
  return ids.length ? ids.join(' ') : undefined
})
</script>

<template>
  <div class="field" :class="{ 'field--error': !!error }">
    <label :for="uid" class="field__label">
      {{ label }}<span v-if="required" class="field__req" aria-hidden="true"> *</span>
    </label>
    <slot :id="uid" :described-by="describedBy" :invalid="!!error" />
    <p v-if="hint" :id="hintId" class="field__hint">{{ hint }}</p>
    <p v-if="error" :id="errorId" class="field__error" role="alert">{{ error }}</p>
  </div>
</template>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
}
.field__label {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-strong);
}
.field__req {
  color: var(--error);
}
.field__hint {
  margin: 0;
  font-size: var(--text-xs);
  color: var(--text-muted);
}
.field__error {
  margin: 0;
  font-size: var(--text-xs);
  color: var(--error);
  font-weight: 600;
}
</style>
