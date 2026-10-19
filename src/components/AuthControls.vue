<script setup lang="ts">
import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/vue'
</script>

<template>
  <div class="auth-controls">
    <Show when="signed-out">
      <SignInButton mode="modal">
        <button type="button" class="auth-btn auth-btn--ghost">Iniciar sesión</button>
      </SignInButton>
      <SignUpButton mode="modal">
        <button type="button" class="auth-btn auth-btn--accent">Crear cuenta</button>
      </SignUpButton>
    </Show>
    <Show when="signed-in">
      <UserButton />
    </Show>
  </div>
</template>

<style scoped>
.auth-controls {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
.auth-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 36px;
  padding: 0 var(--space-3);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: var(--text-xs);
  cursor: pointer;
  transition: background-color 150ms ease, border-color 150ms ease, color 150ms ease;
}
.auth-btn--ghost {
  background: transparent;
  color: var(--text);
}
.auth-btn--ghost:hover {
  background: var(--surface-2);
  color: var(--text-strong);
}
.auth-btn--accent {
  background: var(--accent);
  color: var(--text-on-accent);
  border-color: transparent;
}
.auth-btn--accent:hover {
  background: var(--accent-strong);
}
</style>
