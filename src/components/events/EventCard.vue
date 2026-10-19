<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import AppIcon from '../ui/AppIcon.vue'
import BaseBadge from '../ui/BaseBadge.vue'
import NotifyToggle from './NotifyToggle.vue'
import { useCommunityStore } from '../../stores/community'
import { CATEGORY_LABELS, formatDayMonth, formatTime } from '../../utils/format'
import type { FimEvent } from '../../types'

const props = defineProps<{ event: FimEvent; isNew?: boolean }>()

const community = useCommunityStore()
const date = computed(() => formatDayMonth(props.event.startsAt))
const organizer = computed(() => community.organizerById(props.event.organizerId))
const snippet = computed(() => {
  const text = props.event.description
  return text.length > 120 ? `${text.slice(0, 117)}…` : text
})
</script>

<template>
  <article class="event-card">
    <div :class="['event-card__banner', `event-card__banner--${event.category}`]">
      <span class="event-card__day">{{ date.day }}</span>
      <span class="event-card__month">{{ date.month }}</span>
      <AppIcon
        class="event-card__icon"
        :name="event.category === 'cultural' ? 'share' : 'trophy'"
        :size="26"
      />
    </div>

    <div class="event-card__body">
      <div class="event-card__tags">
        <BaseBadge :tone="event.category === 'cultural' ? 'accent' : 'primary'">
          {{ CATEGORY_LABELS[event.category] }}
        </BaseBadge>
        <BaseBadge v-if="isNew" tone="ok">Nuevo</BaseBadge>
      </div>

      <h3 class="event-card__title">
        <RouterLink :to="`/evento/${event.id}`">{{ event.title }}</RouterLink>
      </h3>

      <p class="event-card__desc">{{ snippet }}</p>

      <ul class="event-card__info">
        <li>
          <AppIcon name="clock" :size="16" />
          <span>{{ formatTime(event.startsAt) }}</span>
        </li>
        <li>
          <AppIcon name="location" :size="16" />
          <span>{{ event.location }}</span>
        </li>
        <li v-if="organizer">
          <AppIcon name="community" :size="16" />
          <span>{{ organizer.name }}</span>
        </li>
      </ul>

      <div class="event-card__actions">
        <NotifyToggle :event="event" />
        <RouterLink class="event-card__detail" :to="`/evento/${event.id}`">
          Ver detalle
          <AppIcon name="arrowLeft" :size="16" class="event-card__arrow" />
        </RouterLink>
      </div>
    </div>
  </article>
</template>

<style scoped>
.event-card {
  display: flex;
  flex-direction: column;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-1);
}
.event-card__banner {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
  min-height: 96px;
  color: var(--text-strong);
}
.event-card__banner--cultural {
  background: linear-gradient(135deg, var(--glaucous), var(--charcoal));
}
.event-card__banner--sports {
  background: linear-gradient(135deg, var(--charcoal), var(--graphite));
}
.event-card__day {
  font-size: var(--text-3xl);
  font-weight: 800;
  line-height: 1;
}
.event-card__month {
  text-transform: uppercase;
  font-size: var(--text-xs);
  letter-spacing: 1px;
  font-weight: 700;
}
.event-card__icon {
  position: absolute;
  right: var(--space-3);
  top: var(--space-3);
  opacity: 0.55;
}
.event-card__body {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-4);
  flex: 1;
}
.event-card__tags {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}
.event-card__title {
  margin: 0;
  font-size: var(--text-lg);
}
.event-card__title a {
  color: var(--text-strong);
  text-decoration: none;
}
.event-card__title a:hover {
  color: var(--accent);
}
.event-card__desc {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--text);
}
.event-card__info {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  font-size: var(--text-xs);
  color: var(--text-muted);
}
.event-card__info li {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
.event-card__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  margin-top: auto;
  padding-top: var(--space-3);
  flex-wrap: wrap;
}
.event-card__detail {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-xs);
  font-weight: 700;
  color: var(--accent);
  text-decoration: none;
}
.event-card__arrow {
  transform: rotate(180deg);
}
</style>
