<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import AppIcon from '../components/ui/AppIcon.vue'
import BaseBadge from '../components/ui/BaseBadge.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import BaseField from '../components/ui/BaseField.vue'
import BaseSegmented from '../components/ui/BaseSegmented.vue'
import BaseSwitch from '../components/ui/BaseSwitch.vue'
import EmptyState from '../components/ui/EmptyState.vue'
import { useOnline } from '../composables/useOnline'
import { useReportsStore } from '../stores/reports'
import { useUiStore } from '../stores/ui'
import { REPORT_STATUS_LABELS, REPORT_TYPE_LABELS, formatDateTime } from '../utils/format'
import type { ReportStatus, ReportType } from '../types'

const reports = useReportsStore()
const ui = useUiStore()
const { isOnline } = useOnline()

const form = reactive({
  type: 'incidencia' as ReportType,
  title: '',
  description: '',
  location: '',
  photoDataUrl: undefined as string | undefined,
  anonymous: false,
})

const errors = reactive({ title: '', description: '', location: '' })
const submitting = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

const typeOptions = [
  { value: 'incidencia', label: 'Incidencia' },
  { value: 'evento', label: 'Propuesta' },
  { value: 'sugerencia', label: 'Sugerencia' },
  { value: 'otro', label: 'Otro' },
]

const statusTone: Record<ReportStatus, 'neutral' | 'warn' | 'ok' | 'error'> = {
  pending: 'warn',
  syncing: 'neutral',
  synced: 'ok',
  failed: 'error',
}

const filter = ref<'all' | ReportStatus>('all')
const visibleReports = computed(() =>
  filter.value === 'all'
    ? reports.sorted
    : reports.sorted.filter((r) => r.status === filter.value),
)

function validate(): boolean {
  errors.title = form.title.trim().length < 4 ? 'Escribe un título de al menos 4 caracteres.' : ''
  errors.description =
    form.description.trim().length < 10 ? 'Describe el reporte con al menos 10 caracteres.' : ''
  errors.location = form.location.trim().length < 3 ? 'Indica la ubicación.' : ''
  return !errors.title && !errors.description && !errors.location
}

async function onPhoto(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  if (file.size > 2 * 1024 * 1024) {
    ui.push('La imagen supera los 2 MB. Elige una más ligera.', 'warn')
    input.value = ''
    return
  }
  const reader = new FileReader()
  reader.onload = () => {
    form.photoDataUrl = typeof reader.result === 'string' ? reader.result : undefined
  }
  reader.readAsDataURL(file)
}

function removePhoto() {
  form.photoDataUrl = undefined
  if (fileInput.value) fileInput.value.value = ''
}

async function submit() {
  if (!validate()) {
    ui.push('Revisa los campos marcados.', 'error')
    return
  }
  submitting.value = true
  try {
    await reports.create({ ...form }, isOnline.value)
    ui.push(
      isOnline.value
        ? 'Reporte enviado correctamente.'
        : 'Guardado sin conexión. Se enviará al reconectar.',
      isOnline.value ? 'success' : 'warn',
    )
    form.title = ''
    form.description = ''
    form.location = ''
    form.anonymous = false
    removePhoto()
  } finally {
    submitting.value = false
  }
}

async function retry(id: string) {
  if (!isOnline.value) {
    ui.push('Sigue sin conexión. Intenta más tarde.', 'warn')
    return
  }
  await reports.retry(id)
  ui.push('Reintentando envío del reporte.', 'info')
}

async function remove(id: string) {
  await reports.remove(id)
  ui.push('Reporte eliminado.', 'info')
}
</script>

<template>
  <div class="reports">
    <header class="reports__header">
      <div>
        <h1>Reportes</h1>
        <p class="reports__lead">
          Envía incidencias o propuestas a la comunidad FIM. Sin conexión se guardan y se envían
          automáticamente al reconectar.
        </p>
      </div>
      <BaseBadge :tone="isOnline ? 'ok' : 'warn'">
        <AppIcon :name="isOnline ? 'wifi' : 'offline'" :size="14" />
        {{ isOnline ? 'En línea' : 'Sin conexión' }}
      </BaseBadge>
    </header>

    <div class="reports__grid">
      <section class="reports__form" aria-labelledby="form-title">
        <h2 id="form-title">Nuevo reporte</h2>
        <form novalidate @submit.prevent="submit">
          <BaseField label="Tipo de reporte" required>
            <template #default="{ id }">
              <BaseSegmented
                :label="'Tipo de reporte'"
                :options="typeOptions"
                :model-value="form.type"
                class="reports__type"
                @update:model-value="form.type = $event as ReportType"
              />
              <input :id="id" class="visually-hidden" :value="form.type" tabindex="-1" aria-hidden="true" />
            </template>
          </BaseField>

          <BaseField label="Título" required :error="errors.title">
            <template #default="{ id, describedBy, invalid }">
              <input
                :id="id"
                v-model="form.title"
                class="control"
                type="text"
                :aria-describedby="describedBy"
                :aria-invalid="invalid || undefined"
                placeholder="Ej. Fuga de agua en el laboratorio de Química"
              />
            </template>
          </BaseField>

          <BaseField
            label="Descripción"
            required
            :error="errors.description"
            hint="Incluye detalles útiles: qué pasó, desde cuándo y a quién afecta."
          >
            <template #default="{ id, describedBy, invalid }">
              <textarea
                :id="id"
                v-model="form.description"
                class="control"
                :aria-describedby="describedBy"
                :aria-invalid="invalid || undefined"
              />
            </template>
          </BaseField>

          <BaseField label="Ubicación" required :error="errors.location">
            <template #default="{ id, describedBy, invalid }">
              <input
                :id="id"
                v-model="form.location"
                class="control"
                type="text"
                :aria-describedby="describedBy"
                :aria-invalid="invalid || undefined"
                placeholder="Edificio, salón o área"
              />
            </template>
          </BaseField>

          <BaseField label="Evidencia fotográfica (opcional)" hint="Imagen de hasta 2 MB.">
            <template #default="{ id }">
              <input
                :id="id"
                ref="fileInput"
                class="control reports__file"
                type="file"
                accept="image/*"
                @change="onPhoto"
              />
              <div v-if="form.photoDataUrl" class="reports__preview">
                <img :src="form.photoDataUrl" alt="Vista previa de la evidencia" />
                <BaseButton variant="ghost" size="sm" @click="removePhoto">
                  <AppIcon name="trash" :size="16" />
                  Quitar
                </BaseButton>
              </div>
            </template>
          </BaseField>

          <BaseSwitch
            v-model="form.anonymous"
            label="Enviar como anónimo"
            description="Tu nombre no se adjuntará al reporte."
          />

          <BaseButton
            type="submit"
            variant="accent"
            block
            :loading="submitting"
            class="reports__submit"
          >
            <AppIcon name="plus" :size="18" />
            Enviar reporte
          </BaseButton>
        </form>
      </section>

      <section class="reports__list" aria-labelledby="list-title">
        <div class="reports__list-head">
          <h2 id="list-title">Mis reportes</h2>
          <BaseSegmented
            label="Filtrar reportes por estado"
            :options="[
              { value: 'all', label: 'Todos' },
              { value: 'pending', label: 'Pendientes' },
              { value: 'synced', label: 'Enviados' },
              { value: 'failed', label: 'Fallidos' },
            ]"
            :model-value="filter"
            @update:model-value="filter = $event as 'all' | ReportStatus"
          />
        </div>

        <p v-if="reports.pendingCount" class="reports__pending" role="status">
          <AppIcon name="clock" :size="16" />
          {{ reports.pendingCount }} reporte(s) esperando conexión para enviarse.
        </p>

        <ul v-if="visibleReports.length" class="reports__items">
          <li v-for="report in visibleReports" :key="report.id" class="report-item">
            <div class="report-item__head">
              <BaseBadge :tone="statusTone[report.status]">
                {{ REPORT_STATUS_LABELS[report.status] }}
              </BaseBadge>
              <span class="report-item__type">{{ REPORT_TYPE_LABELS[report.type] }}</span>
            </div>
            <h3 class="report-item__title">{{ report.title }}</h3>
            <p class="report-item__desc">{{ report.description }}</p>
            <p class="report-item__meta">
              <AppIcon name="location" :size="14" />
              {{ report.location }} · {{ formatDateTime(report.createdAt) }}
              <template v-if="report.anonymous"> · Anónimo</template>
            </p>
            <p v-if="report.error" class="report-item__error" role="alert">{{ report.error }}</p>
            <div class="report-item__actions">
              <BaseButton
                v-if="report.status === 'failed'"
                variant="subtle"
                size="sm"
                @click="retry(report.id)"
              >
                <AppIcon name="retry" :size="16" />
                Reintentar
              </BaseButton>
              <BaseButton variant="danger" size="sm" @click="remove(report.id)">
                <AppIcon name="trash" :size="16" />
                Eliminar
              </BaseButton>
            </div>
          </li>
        </ul>

        <EmptyState
          v-else
          title="Aún no tienes reportes"
          message="Cuando envíes un reporte aparecerá aquí con su estado de envío."
        >
          <template #icon>📝</template>
        </EmptyState>
      </section>
    </div>
  </div>
</template>

<style scoped>
.reports__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
  flex-wrap: wrap;
  margin-bottom: var(--space-4);
}
.reports__lead {
  margin: 0;
  max-width: 60ch;
}
.reports__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-6);
}
@media (min-width: 1000px) {
  .reports__grid {
    grid-template-columns: 1fr 1fr;
    align-items: start;
  }
}
.reports__form,
.reports__list {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
}
.reports__type {
  width: 100%;
}
.reports__file {
  padding: var(--space-2);
  height: auto;
}
.reports__preview {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-top: var(--space-3);
}
.reports__preview img {
  width: 96px;
  height: 96px;
  object-fit: cover;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
}
.reports__submit {
  margin-top: var(--space-4);
}
.reports__list-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  flex-wrap: wrap;
  margin-bottom: var(--space-3);
}
.reports__pending {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  background: var(--warn-bg);
  border: 1px solid var(--warn);
  font-size: var(--text-sm);
  color: var(--text-strong);
}
.reports__items {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
.report-item {
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: var(--space-3);
  background: var(--surface-2);
}
.report-item__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  margin-bottom: var(--space-2);
}
.report-item__type {
  font-size: var(--text-xs);
  color: var(--text-muted);
  font-weight: 600;
}
.report-item__title {
  margin: 0 0 var(--space-1);
  font-size: var(--text-base);
}
.report-item__desc {
  margin: 0 0 var(--space-2);
  font-size: var(--text-sm);
}
.report-item__meta {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  margin: 0 0 var(--space-2);
  font-size: var(--text-xs);
  color: var(--text-muted);
}
.report-item__error {
  margin: 0 0 var(--space-2);
  font-size: var(--text-xs);
  color: var(--error);
  font-weight: 600;
}
.report-item__actions {
  display: flex;
  gap: var(--space-2);
}
</style>
