<script setup lang="ts">
withDefaults(defineProps<{ title: string; message?: string }>(), { message: '' })
</script>

<template>
  <div class="empty" role="status">
    <div class="empty__icon" aria-hidden="true">
      <slot name="icon">🗂️</slot>
    </div>
    <h3 class="empty__title">{{ title }}</h3>
    <p v-if="message" class="empty__message">{{ message }}</p>
    <div v-if="$slots.action" class="empty__action">
      <slot name="action" />
    </div>
  </div>
</template>

<style scoped>
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--space-2);
  padding: var(--space-10) var(--space-4);
  border: 1px dashed var(--border);
  border-radius: var(--radius-lg);
  background: var(--surface);
}
.empty__icon {
  font-size: 2rem;
}
.empty__title {
  margin: 0;
  font-size: var(--text-lg);
}
.empty__message {
  margin: 0;
  color: var(--text-muted);
  max-width: 40ch;
}
.empty__action {
  margin-top: var(--space-2);
}
</style>
