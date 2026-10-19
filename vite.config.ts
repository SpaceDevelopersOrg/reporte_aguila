import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), VitePWA({
    strategies: 'injectManifest',
    srcDir: 'src',
    filename: 'sw.ts',
    registerType: 'prompt',
    injectRegister: false,

    pwaAssets: {
      disabled: false,
      config: true,
    },

    manifest: {
      name: 'Reporte Águila — Eventos FIM',
      short_name: 'Rep. Águila',
      description:
        'Eventos culturales y deportivos de la comunidad FIM, con alertas y reportes offline.',
      theme_color: '#30323d',
      background_color: '#30323d',
      display: 'standalone',
      orientation: 'portrait',
      lang: 'es-MX',
      start_url: '/',
      scope: '/',
      categories: ['education', 'events', 'social'],
      icons: [
        { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
        { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
        { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
        { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },

    injectManifest: {
      globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest}'],
    },

    devOptions: {
      enabled: true,
      navigateFallback: 'index.html',
      suppressWarnings: true,
      type: 'module',
    },
  })],
  server: {
    allowedHosts: ['.trycloudflare.com'],
  },
})