<script setup lang="ts">
withDefaults(defineProps<{ name: string; size?: number }>(), { size: 20 })

const paths: Record<string, string> = {
  home: 'M3 10.5 12 3l9 7.5M5 9.5V21h5v-6h4v6h5V9.5',
  report:
    'M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h7M9 9h2',
  community:
    'M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM2 20v-1a5 5 0 0 1 5-5h2a5 5 0 0 1 5 5v1M17 11a3 3 0 1 0 0-6M22 20v-1a5 5 0 0 0-4-4.9',
  settings:
    'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1',
  bell: 'M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6M10 20a2 2 0 0 0 4 0',
  bellOff:
    'M6 9a6 6 0 0 1 9.5-4.8M18 9c0 5 2 6 2 6H8M4 9c0 5-2 6-2 6M10 20a2 2 0 0 0 4 0M3 3l18 18',
  menu: 'M4 6h16M4 12h16M4 18h16',
  close: 'M6 6l12 12M18 6 6 18',
  calendar: 'M4 6h16v15H4zM4 10h16M8 3v4M16 3v4',
  share: 'M4 12v7h16v-7M12 3v12M8 7l4-4 4 4',
  check: 'M5 13l4 4L19 7',
  alert: 'M12 3 2 20h20zM12 10v5M12 18h.01',
  offline: 'M3 3l18 18M8.5 16.5a5 5 0 0 1 7 0M5 13a10 10 0 0 1 4-2.5M19 13a10 10 0 0 0-3-2.2M12 20h.01',
  plus: 'M12 5v14M5 12h14',
  retry: 'M20 11a8 8 0 1 0-2 6M20 5v6h-6',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4',
  arrowLeft: 'M19 12H5M11 18l-6-6 6-6',
  wifi: 'M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M12 20h.01',
  trash: 'M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v6M14 11v6',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',
  location: 'M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11zM12 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  trophy:
    'M8 4h8v5a4 4 0 0 1-8 0zM8 5H5v2a3 3 0 0 0 3 3M16 5h3v2a3 3 0 0 1-3 3M9 20h6M12 13v7',
  install: 'M12 3v12M7 10l5 5 5-5M5 21h14',
}
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path :d="paths[name] ?? ''" />
  </svg>
</template>
