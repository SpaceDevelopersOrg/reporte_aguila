<script setup lang="ts">
import { useInstallPrompt } from '../composables/useInstallPrompt'
import AppIcon from './ui/AppIcon.vue'
import BaseButton from './ui/BaseButton.vue'

const { canInstall, promptInstall, dismiss } = useInstallPrompt()
</script>

<template>
  <section v-if="canInstall" class="install-prompt" aria-label="Instalar Reporte Águila">
    <img
      src="/logo.png"
      alt=""
      class="install-prompt__logo"
      width="40"
      height="40"
      aria-hidden="true"
    />
    <div class="install-prompt__body">
      <strong>Instala Reporte Águila</strong>
      <span>Acceso más rápido y alertas, incluso sin conexión.</span>
    </div>
    <div class="install-prompt__actions">
      <BaseButton variant="primary" size="sm" @click="promptInstall">
        <AppIcon name="install" :size="16" />
        Instalar
      </BaseButton>
      <BaseButton variant="ghost" size="sm" @click="dismiss">Ahora no</BaseButton>
    </div>
  </section>
</template>

<style scoped>
.install-prompt {
  position: fixed;
  left: 0;
  bottom: 0;
  margin: 16px;
  padding: var(--space-3) var(--space-4);
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-wrap: wrap;
  max-width: min(420px, calc(100vw - 32px));
  background: var(--surface);
  color: var(--text-strong);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-2);
  z-index: 700;
}
.install-prompt__logo {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  object-fit: contain;
  background: var(--surface-2);
  flex-shrink: 0;
}
.install-prompt__body {
  display: grid;
  gap: 2px;
  flex: 1 1 160px;
}
.install-prompt__body strong {
  font-size: var(--text-sm);
}
.install-prompt__body span {
  font-size: var(--text-xs);
  color: var(--text-muted);
}
.install-prompt__actions {
  display: flex;
  gap: var(--space-2);
  flex-shrink: 0;
}
</style>
