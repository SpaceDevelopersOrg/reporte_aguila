import { community as seedCommunity } from '../../data/mock/community'
import { organizers as seedOrganizers } from '../../data/mock/organizers'
import type { CommunityOrg, Organizer } from '../../types'

const LATENCY_MIN = 300
const LATENCY_MAX = 800

export const COMMUNITY_SEED_VERSION = '2026-10-19-3'

function delay(): Promise<void> {
  const ms = LATENCY_MIN + Math.random() * (LATENCY_MAX - LATENCY_MIN)
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function getCommunity(): Promise<CommunityOrg[]> {
  await delay()
  return seedCommunity
}

export async function getOrganizers(): Promise<Organizer[]> {
  await delay()
  return seedOrganizers
}
