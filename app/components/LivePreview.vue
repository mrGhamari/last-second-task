<template>
  <div class="card shadow-sm overflow-hidden">
    <div class="card-body">
      <h2 class="h5 mb-3">Live Preview</h2>
      <div v-if="!selected" class="text-body-secondary">Nothing selected.</div>
      <div v-else class="d-flex align-items-center gap-3">
        <div class="preview-tile flex-shrink-0" :class="{ off: !isOn }">
          <div
            v-if="isLight"
            class="glow"
            :style="{ opacity: String((selected.brightness ?? 60) / 100) }"
          />
          <div v-else-if="isClimate" class="climate">
            {{ selected.temperature ?? 22 }}°C
          </div>
          <div v-else class="generic-icon">⚙️</div>
        </div>
        <div>
          <div class="fw-semibold">{{ selected.name }}</div>
          <div class="text-body-secondary small">{{ selected.type || 'Unknown' }}</div>
          <div class="badge mt-2" :class="isOn ? 'text-bg-success-subtle text-success-emphasis' : 'text-bg-secondary-subtle text-secondary-emphasis'">
            {{ isOn ? 'ONLINE' : 'OFFLINE' }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDevicesStore } from '~/stores/devices'
const props = defineProps<{ roomId: string | number }>()
const devicesStore = useDevicesStore()
const selected = devicesStore.getSelected(props.roomId)

const isLight = computed(() => (selected.value?.type || '').toLowerCase() === 'light')
const isClimate = computed(() => (selected.value?.type || '').toLowerCase() === 'climate')
const isOn = computed(() => (selected.value?.status || '').toLowerCase() === 'online')
</script>

<style scoped>
.preview-tile {
  width: 72px;
  height: 72px;
  border-radius: 12px;
  border: 1px solid var(--bs-border-color);
  background: var(--bs-body-bg);
  position: relative;
  display: grid;
  place-items: center;
  transition: background-color .2s ease, border-color .2s ease, filter .2s ease;
}
.preview-tile.off {
  filter: grayscale(0.4) brightness(0.9);
}
.glow {
  position: absolute;
  inset: 8px;
  border-radius: 10px;
  background: radial-gradient(circle at 50% 40%, rgba(255, 215, 0, 0.9), rgba(255, 215, 0, 0.1));
  transition: opacity .2s ease;
}
.climate { font-weight: 600; }
.generic-icon { font-size: 28px; }
</style>
