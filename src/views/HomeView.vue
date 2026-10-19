<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import EventCard from '../components/events/EventCard.vue'
import EventFilters from '../components/events/EventFilters.vue'
import AppIcon from '../components/ui/AppIcon.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import BaseSkeleton from '../components/ui/BaseSkeleton.vue'
import EmptyState from '../components/ui/EmptyState.vue'
import { useOnline } from '../composables/useOnline'
import { useEventsStore } from '../stores/events'
import { useUiStore } from '../stores/ui'
import { formatRelative } from '../utils/format'

const events = useEventsStore()
const ui = useUiStore()
const { isOnline } = useOnline()

const category = ref('all')
const range = ref('upcoming')
const query = ref('')

const filtered = computed(() => {
  const now = Date.now()
  const day = 86_400_000
  const q = normalize(query.value.trim())

  return events.upcoming.filter((event) => {
    if (category.value !== 'all' && event.category !== category.value) return false

    const start = Date.parse(event.startsAt)
    if (range.value === 'week' && start > now + 7 * day) return false
    if (range.value === 'month' && start > now + 31 * day) return false

    if (q) {
      const haystack = normalize(
        [event.title, event.location, event.description, ...event.tags].join(' '),
      )
      if (!haystack.includes(q)) return false
    }
    return true
  })
})

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
}

const lastSyncLabel = computed(() =>
  events.lastSync ? `Actualizado ${formatRelative(new Date(events.lastSync).toISOString())}` : '',
)

async function doRefresh() {
  if (!isOnline.value) {
    ui.push('Sin conexión: mostrando eventos guardados.', 'warn')
    return
  }
  const count = await events.refresh()
  ui.push(
    count > 0 ? `Se encontraron ${count} novedades.` : 'Todo está actualizado.',
    count > 0 ? 'success' : 'info',
  )
}

onMounted(() => {
  events.clearNewFlags()
})
</script>

<template>
  <div class="home">
    <header class="home__header">
      <div>
        <h1>Eventos de la FIM</h1>
        <p class="home__lead">
          Descubre las actividades culturales y deportivas organizadas por la comunidad águila.
        </p>
        <p v-if="lastSyncLabel" class="home__sync">{{ lastSyncLabel }}</p>
      </div>
      <BaseButton variant="subtle" :loading="events.refreshing" @click="doRefresh">
        <AppIcon name="retry" :size="18" />
        Actualizar
      </BaseButton>
    </header>

    <EventFilters
      v-model:category="category"
      v-model:range="range"
      v-model:query="query"
    />

    <div v-if="events.loading && !events.items.length" class="home__grid" aria-hidden="true">
      <BaseSkeleton v-for="n in 6" :key="n" height="320px" radius="var(--radius-lg)" />
    </div>

    <div v-else-if="filtered.length" class="home__grid">
      <EventCard
        v-for="event in filtered"
        :key="event.id"
        :event="event"
        :is-new="events.newEventIds.includes(event.id)"
      />
    </div>

    <EmptyState
      v-else
      title="No hay eventos que coincidan"
      message="Prueba con otra categoría, amplía el rango de fechas o limpia la búsqueda."
    >
      <template #icon>📅</template>
    </EmptyState>
  </div>
</template>

<style scoped>
.home__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
  flex-wrap: wrap;
  margin-bottom: var(--space-4);
}
.home__header h1 {
  margin-bottom: var(--space-2);
}
.home__lead {
  margin: 0;
  color: var(--text);
  max-width: 55ch;
}
.home__sync {
  margin: var(--space-2) 0 0;
  font-size: var(--text-xs);
  color: var(--text-muted);
}
.home__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-4);
}
@media (min-width: 640px) {
  .home__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (min-width: 1200px) {
  .home__grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
