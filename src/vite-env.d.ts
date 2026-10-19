/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/vue" />

interface ImportMetaEnv {
  readonly VITE_DB_URL: string
  readonly VITE_DB_TOKEN: string
  readonly VITE_CLERK_PUBLISHABLE_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
