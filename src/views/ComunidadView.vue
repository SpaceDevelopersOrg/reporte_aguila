<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import AppIcon from '../components/ui/AppIcon.vue'
import BaseBadge from '../components/ui/BaseBadge.vue'
import BasePills from '../components/ui/BasePills.vue'
import BaseSkeleton from '../components/ui/BaseSkeleton.vue'
import EmptyState from '../components/ui/EmptyState.vue'
import { useCommunityStore } from '../stores/community'
import { useEventsStore } from '../stores/events'
import { CATEGORY_LABELS, formatDayMonth } from '../utils/format'
import type { CommunityType } from '../types'

const community = useCommunityStore()
const events = useEventsStore()

const tab = ref<CommunityType>('club')
const pagerRef = ref<HTMLElement | null>(null)

const tabs: { value: CommunityType; label: string }[] = [
  { value: 'club', label: 'Clubes' },
  { value: 'sports', label: 'Deportes' },
  { value: 'organizer', label: 'Organizadores' },
]

const grouped = computed<Record<CommunityType, ReturnType<typeof community.listByType>>>(() => ({
  club: community.listByType('club'),
  sports: community.listByType('sports'),
  organizer: community.listByType('organizer'),
}))

function listFor(type: CommunityType) {
  return grouped.value[type]
}

function selectTab(value: string) {
  tab.value = value as CommunityType
}

function onPagerScroll() {
  const el = pagerRef.value
  if (!el || el.clientWidth === 0) return
  const index = Math.round(el.scrollLeft / el.clientWidth)
  const target = tabs[index]
  if (target && target.value !== tab.value) tab.value = target.value
}

watch(tab, (value) => {
  const el = pagerRef.value
  if (!el || el.clientWidth === 0) return
  const index = tabs.findIndex((t) => t.value === value)
  const left = index * el.clientWidth
  if (Math.abs(el.scrollLeft - left) > 4) el.scrollTo({ left, behavior: 'smooth' })
})

function upcomingFor(id: string) {
  const org = community.orgById(id)
  if (!org) return []
  return community.eventsForOrg(org, events.items)
}
</script>

<template>
  <div class="community">
    <header class="community__header">
      <h1>Comunidad FIM</h1>
      <p class="community__lead">
        Conoce los clubes, equipos deportivos y organizadores que dan vida a la Facultad de
        Ingeniería Mochis.
      </p>
    </header>

    <BasePills
      label="Sección de la comunidad"
      :options="tabs"
      :model-value="tab"
      @update:model-value="selectTab"
    />

    <div ref="pagerRef" class="community__pager" data-no-swipe @scroll.passive="onPagerScroll">
      <section
        v-for="t in tabs"
        :key="t.value"
        class="community__panel"
        role="tabpanel"
        :id="`community-panel-${t.value}`"
        :aria-label="t.label"
        :inert="tab !== t.value || undefined"
      >
        <div
          v-if="community.loading && !listFor(t.value).length"
          class="community__grid"
          aria-hidden="true"
        >
          <BaseSkeleton v-for="n in 6" :key="n" height="200px" radius="var(--radius-lg)" />
        </div>

        <div v-else-if="listFor(t.value).length" class="community__grid">
          <article v-for="org in listFor(t.value)" :key="org.id" class="org-card">
            <div class="org-card__head">
              <span class="org-card__avatar" aria-hidden="true">
                <AppIcon :name="org.type === 'sports' ? 'trophy' : 'community'" :size="24" />
              </span>
              <div>
                <h2 class="org-card__name">{{ org.name }}</h2>
                <a class="org-card__contact" :href="`mailto:${org.contact}`">{{ org.contact }}</a>
              </div>
            </div>

            <p class="org-card__desc">{{ org.description }}</p>

            <div class="org-card__events">
              <h3 class="org-card__events-title">Próximos eventos</h3>
              <ul v-if="upcomingFor(org.id).length">
                <li v-for="event in upcomingFor(org.id).slice(0, 3)" :key="event.id">
                  <RouterLink :to="`/evento/${event.id}`" class="org-card__event">
                    <span class="org-card__event-date">
                      {{ formatDayMonth(event.startsAt).day }}
                      <small>{{ formatDayMonth(event.startsAt).month }}</small>
                    </span>
                    <span class="org-card__event-title">{{ event.title }}</span>
                    <BaseBadge :tone="event.category === 'cultural' ? 'accent' : 'primary'">
                      {{ CATEGORY_LABELS[event.category] }}
                    </BaseBadge>
                  </RouterLink>
                </li>
              </ul>
              <p v-else class="org-card__empty">Sin eventos próximos por ahora.</p>
            </div>
          </article>
        </div>

        <EmptyState
          v-else
          title="Nada por aquí todavía"
          message="Pronto se publicará información de esta sección."
        >
          <template #icon>👥</template>
        </EmptyState>
      </section>
    </div>
  </div>
</template>

<style scoped>
.community__header {
  margin-bottom: var(--space-4);
}
.community__lead {
  margin: 0;
  max-width: 60ch;
}
.community__pager {
  display: flex;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-snap-type: x mandatory;
  margin-top: var(--space-4);
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.community__pager::-webkit-scrollbar {
  display: none;
}
.community__panel {
  flex: 0 0 100%;
  min-width: 100%;
  scroll-snap-align: start;
  padding-bottom: var(--space-2);
}
.community__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-4);
}
@media (min-width: 700px) {
  .community__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
.org-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
}
.org-card__head {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}
.org-card__avatar {
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  flex: none;
  border-radius: var(--radius-md);
  background: var(--info-bg);
  color: var(--primary-strong);
  border: 1px solid var(--border);
}
.org-card__name {
  margin: 0;
  font-size: var(--text-lg);
}
.org-card__contact {
  font-size: var(--text-xs);
  color: var(--text-muted);
}
.org-card__desc {
  margin: 0;
  font-size: var(--text-sm);
}
.org-card__events {
  margin-top: auto;
  border-top: 1px solid var(--border);
  padding-top: var(--space-3);
}
.org-card__events-title {
  margin: 0 0 var(--space-2);
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-muted);
}
.org-card__events ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
.org-card__event {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2);
  border-radius: var(--radius-md);
  text-decoration: none;
  color: var(--text);
  background: var(--surface-2);
}
.org-card__event:hover {
  background: var(--surface-3);
  color: var(--text-strong);
}
.org-card__event-date {
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1;
  min-width: 32px;
  font-weight: 800;
  color: var(--accent);
}
.org-card__event-date small {
  text-transform: uppercase;
  font-size: 9px;
  letter-spacing: 0.5px;
}
.org-card__event-title {
  flex: 1;
  font-size: var(--text-sm);
  font-weight: 600;
}
.org-card__empty {
  margin: 0;
  font-size: var(--text-xs);
  color: var(--text-muted);
}
</style>
