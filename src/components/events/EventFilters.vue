<script setup lang="ts">
import BasePills from '../ui/BasePills.vue'

defineProps<{
  category: string
  range: string
  query: string
}>()

const emit = defineEmits<{
  'update:category': [value: string]
  'update:range': [value: string]
  'update:query': [value: string]
}>()

const categories = [
  { value: 'all', label: 'Todos' },
  { value: 'cultural', label: 'Cultural' },
  { value: 'sports', label: 'Deportes' },
]

const ranges = [
  { value: 'upcoming', label: 'Próximos' },
  { value: 'week', label: 'Esta semana' },
  { value: 'month', label: 'Este mes' },
  { value: 'all', label: 'Todos' },
]
</script>

<template>
  <div class="filters">
    <div class="filters__row">
      <BasePills
        label="Filtrar por categoría"
        :options="categories"
        :model-value="category"
        @update:model-value="emit('update:category', $event)"
      />
      <BasePills
        label="Filtrar por fecha"
        :options="ranges"
        :model-value="range"
        @update:model-value="emit('update:range', $event)"
      />
    </div>

    <div class="filters__search">
      <label class="visually-hidden" for="event-search">Buscar eventos</label>
      <input
        id="event-search"
        class="control"
        type="search"
        placeholder="Buscar por nombre, lugar o etiqueta…"
        :value="query"
        @input="emit('update:query', ($event.target as HTMLInputElement).value)"
      />
    </div>
  </div>
</template>

<style scoped>
.filters {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}
.filters__row {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
.filters__search {
  max-width: 420px;
}
</style>
