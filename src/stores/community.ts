import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { db } from '../db'
import { getCommunity, getOrganizers } from '../services/api/mockApi'
import type { CommunityOrg, CommunityType, FimEvent, Organizer } from '../types'

export const useCommunityStore = defineStore('community', () => {
  const orgs = ref<CommunityOrg[]>([])
  const organizerList = ref<Organizer[]>([])
  const loading = ref(false)

  const byType = computed(() => ({
    club: orgs.value.filter((o) => o.type === 'club'),
    sports: orgs.value.filter((o) => o.type === 'sports'),
    organizer: orgs.value.filter((o) => o.type === 'organizer'),
  }))

  async function load() {
    loading.value = true
    try {
      const cached = await db.community.toArray()
      const cachedOrganizers = await db.organizers.toArray()
      if (cached.length && cachedOrganizers.length) {
        orgs.value = cached
        organizerList.value = cachedOrganizers
      } else {
        await refresh()
      }
    } finally {
      loading.value = false
    }
  }

  async function refresh() {
    const [community, organizers] = await Promise.all([getCommunity(), getOrganizers()])
    await db.community.bulkPut(community)
    await db.organizers.bulkPut(organizers)
    orgs.value = community
    organizerList.value = organizers
  }

  function orgById(id: string): CommunityOrg | undefined {
    return orgs.value.find((o) => o.id === id)
  }

  function organizerById(id: string): Organizer | undefined {
    return organizerList.value.find((o) => o.id === id)
  }

  function listByType(type: CommunityType): CommunityOrg[] {
    return orgs.value.filter((o) => o.type === type)
  }

  function eventsForOrg(org: CommunityOrg, allEvents: FimEvent[]): FimEvent[] {
    const now = Date.now() - 60 * 60 * 1000
    return allEvents
      .filter(
        (e) =>
          (org.eventIds.includes(e.id) || org.id === e.organizerId) &&
          Date.parse(e.endsAt) >= now,
      )
      .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt))
  }

  return {
    orgs,
    organizerList,
    loading,
    byType,
    load,
    refresh,
    orgById,
    organizerById,
    listByType,
    eventsForOrg,
  }
})
