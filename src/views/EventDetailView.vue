<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import AppIcon from '../components/ui/AppIcon.vue'
import BaseBadge from '../components/ui/BaseBadge.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import EmptyState from '../components/ui/EmptyState.vue'
import NotifyToggle from '../components/events/NotifyToggle.vue'
import { useCommunityStore } from '../stores/community'
import { useEventsStore } from '../stores/events'
import { useUiStore } from '../stores/ui'
import { CATEGORY_LABELS, formatDateTime, formatRelative } from '../utils/format'
import type { FimEvent } from '../types'

const props = defineProps<{ id: string }>()

const events = useEventsStore()
const community = useCommunityStore()
const ui = useUiStore()

const event = ref<FimEvent | null>(null)
const notFound = ref(false)

watch(
  () => props.id,
  async (id) => {
    notFound.value = false
    event.value = (await events.ensureEvent(id)) ?? null
    notFound.value = !event.value
  },
  { immediate: true },
)

const organizer = computed(() =>
  event.value ? community.organizerById(event.value.organizerId) : undefined,
)

function toIcsDate(iso: string): string {
  return `${new Date(iso).toISOString().replace(/[-:]/g, '').split('.')[0]}Z`
}

function escapeIcs(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')
}

function addToCalendar() {
  if (!event.value) return
  const e = event.value
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Reporte Aguila//FIM//ES',
    'BEGIN:VEVENT',
    `UID:${e.id}@reportaguila`,
    `DTSTAMP:${toIcsDate(new Date().toISOString())}`,
    `DTSTART:${toIcsDate(e.startsAt)}`,
    `DTEND:${toIcsDate(e.endsAt)}`,
    `SUMMARY:${escapeIcs(e.title)}`,
    `DESCRIPTION:${escapeIcs(e.description)}`,
    `LOCATION:${escapeIcs(e.location)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ]
  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `${e.id}.ics`
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
  ui.push('Evento agregado al calendario.', 'success')
}

async function share() {
  if (!event.value) return
  const url = `${location.origin}/evento/${event.value.id}`
  if (navigator.share) {
    try {
      await navigator.share({ title: event.value.title, text: event.value.description, url })
      return
    } catch {
      /* cancelado por el usuario */
    }
  }
  try {
    await navigator.clipboard.writeText(url)
    ui.push('Enlace copiado al portapapeles.', 'success')
  } catch {
    ui.push('No se pudo compartir el evento.', 'warn')
  }
}
</script>

<template>
  <div v-if="event" class="detail">
    <RouterLink to="/" class="detail__back">
      <AppIcon name="arrowLeft" :size="18" />
      Volver a eventos
    </RouterLink>

    <div :class="['detail__hero', `detail__hero--${event.category}`]">
      <div class="detail__tags">
        <BaseBadge :tone="event.category === 'cultural' ? 'accent' : 'primary'">
          {{ CATEGORY_LABELS[event.category] }}
        </BaseBadge>
        <BaseBadge tone="neutral">{{ formatRelative(event.startsAt) }}</BaseBadge>
      </div>
      <h1 class="detail__title">{{ event.title }}</h1>
    </div>

    <div class="detail__grid">
      <section class="detail__main" aria-labelledby="detail-desc">
        <h2 id="detail-desc">Acerca del evento</h2>
        <p>{{ event.description }}</p>

        <ul v-if="event.tags.length" class="detail__tags-list" aria-label="Etiquetas">
          <li v-for="tag in event.tags" :key="tag">#{{ tag }}</li>
        </ul>
      </section>

      <aside class="detail__aside" aria-label="Información del evento">
        <dl class="detail__facts">
          <div>
            <dt><AppIcon name="calendar" :size="16" /> Fecha y hora</dt>
            <dd>{{ formatDateTime(event.startsAt) }}</dd>
          </div>
          <div>
            <dt><AppIcon name="clock" :size="16" /> Termina</dt>
            <dd>{{ formatDateTime(event.endsAt) }}</dd>
          </div>
          <div>
            <dt><AppIcon name="location" :size="16" /> Ubicación</dt>
            <dd>{{ event.location }}</dd>
          </div>
          <div v-if="organizer">
            <dt><AppIcon name="community" :size="16" /> Organiza</dt>
            <dd>
              <RouterLink to="/comunidad">{{ organizer.name }}</RouterLink>
            </dd>
          </div>
        </dl>

        <div class="detail__actions">
          <NotifyToggle :event="event" />
          <BaseButton variant="accent" @click="addToCalendar">
            <AppIcon name="calendar" :size="18" />
            Agregar al calendario
          </BaseButton>
          <BaseButton variant="ghost" @click="share">
            <AppIcon name="share" :size="18" />
            Compartir
          </BaseButton>
        </div>
      </aside>
    </div>
  </div>

  <EmptyState
    v-else-if="notFound"
    title="Evento no encontrado"
    message="Puede que el evento haya sido eliminado o el enlace sea incorrecto."
  >
    <template #icon>🔎</template>
    <template #action>
      <RouterLink to="/"><BaseButton variant="primary">Ver todos los eventos</BaseButton></RouterLink>
    </template>
  </EmptyState>

  <p v-else class="detail__loading" role="status">Cargando evento…</p>
</template>

<style scoped>
.detail {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
.detail__back {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text);
  text-decoration: none;
  width: fit-content;
}
.detail__back:hover {
  color: var(--accent);
}
.detail__hero {
  padding: var(--space-6);
  border-radius: var(--radius-lg);
  color: var(--text-strong);
}
.detail__hero--cultural {
  background: linear-gradient(135deg, var(--glaucous), var(--graphite));
}
.detail__hero--sports {
  background: linear-gradient(135deg, var(--charcoal), var(--graphite));
}
.detail__tags {
  display: flex;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
  flex-wrap: wrap;
}
.detail__title {
  margin: 0;
  color: #fff;
}
.detail__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-6);
}
@media (min-width: 900px) {
  .detail__grid {
    grid-template-columns: 1.6fr 1fr;
  }
}
.detail__main h2 {
  font-size: var(--text-xl);
}
.detail__tags-list {
  list-style: none;
  display: flex;
  gap: var(--space-2);
  padding: 0;
  margin: var(--space-4) 0 0;
  flex-wrap: wrap;
}
.detail__tags-list li {
  padding: 2px var(--space-2);
  border-radius: var(--radius-pill);
  background: var(--surface-2);
  border: 1px solid var(--border);
  font-size: var(--text-xs);
  color: var(--text-muted);
}
.detail__aside {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  height: fit-content;
}
.detail__facts {
  margin: 0 0 var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
.detail__facts div {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.detail__facts dt {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-xs);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  color: var(--text-muted);
}
.detail__facts dd {
  margin: 0;
  color: var(--text-strong);
  font-size: var(--text-sm);
}
.detail__actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding-top: var(--space-3);
  border-top: 1px solid var(--border);
}
.detail__loading {
  color: var(--text-muted);
}
</style>
