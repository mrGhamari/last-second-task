<template>
  <div>
    <label :for="id" class="form-label">Select a device</label>
    <select :id="id" class="form-select" v-model="selectedIdStr" aria-label="Select device">
      <option v-for="d in devices" :key="d.id" :value="String(d.id)">
        {{ d.name }} ({{ d.type || 'Unknown' }})
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
/**
 * DeviceSelector: reusable, store-driven selector for a room's devices.
 * No API logic here; selection updates the Pinia store.
 */
import { useDevicesStore } from '~/stores/devices'

const props = defineProps<{ roomId: string | number; id?: string }>()
const id = computed(() => props.id ?? `deviceSelect-${props.roomId}`)

const devicesStore = useDevicesStore()
const devices = computed(() => devicesStore.getDevices(props.roomId).value)
const selectedIdStr = computed({
  get: () => String(devicesStore.getSelectedId(props.roomId).value ?? ''),
  set: (v: string) => devicesStore.selectDevice(props.roomId, v),
})
</script>

