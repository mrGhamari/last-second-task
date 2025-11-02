<template>
  <section>
    <NuxtLink to="/" class="text-decoration-none">← Back to Rooms</NuxtLink>

    <div v-if="pending" class="d-flex align-items-center gap-2 mt-2" aria-live="polite">
      <div class="spinner-border text-primary" role="status" aria-hidden="true"></div>
      <span>Loading room…</span>
    </div>

    <div v-else-if="error" class="alert alert-danger mt-2" role="alert" aria-live="assertive">
      Failed to load room: {{ errorMessage }}
    </div>

    <article v-else-if="room" class="mt-3">
      <header class="d-flex justify-content-between align-items-start gap-3 pb-2 border-bottom">
        <div>
          <h1 class="h3 mb-1">{{ room.name }}</h1>
          <p class="text-body-secondary mb-0">{{ room.description || 'No description provided.' }}</p>
        </div>
        <div class="text-nowrap">
          <span class="badge text-bg-primary-subtle text-primary-emphasis">{{ room.devices?.length ?? 0 }} devices</span>
        </div>
      </header>

      <section class="mt-3" aria-label="Device controls">
        <div class="row g-3 align-items-stretch">
          <div class="col-12 col-lg-4"><DeviceSelector :room-id="room.id" id="deviceSelect" /></div>
          <div class="col-12 col-lg-4"><ControlPanel :room-id="room.id" /></div>
          <div class="col-12 col-lg-4"><LivePreview :room-id="room.id" /></div>
        </div>
      </section>

      <section class="mt-4" aria-label="Devices list">
        <h2 class="h5 mb-2">Devices</h2>
        <p v-if="!room.devices || room.devices.length === 0" class="text-body-secondary mb-2">No devices found in this room.</p>
        <ul v-else class="list-group">
          <li
            v-for="device in deviceList"
            :key="device.id"
            class="list-group-item d-flex justify-content-between align-items-center"
          >
            <div>
              <div class="fw-semibold">{{ device.name }}</div>
              <div class="text-body-secondary small">{{ device.type || 'Unknown type' }}</div>
            </div>
            <span
              class="badge rounded-pill"
              :class="{
                'text-bg-success-subtle text-success-emphasis border border-success-subtle': (device.status || '').toLowerCase() === 'online',
                'text-bg-danger-subtle text-danger-emphasis border border-danger-subtle': (device.status || '').toLowerCase() === 'offline',
                'text-bg-secondary-subtle text-secondary-emphasis border border-secondary-subtle': (device.status || '').toLowerCase() !== 'online' && (device.status || '').toLowerCase() !== 'offline',
              }"
              :aria-label="`Status: ${device.status || 'unknown'}`"
            >
              {{ (device.status || 'unknown').toUpperCase() }}
            </span>
          </li>
        </ul>
      </section>
    </article>
  </section>
 </template>

 <script setup lang="ts">
 import { defineAsyncComponent } from 'vue'
 import { useRoomsStore, type RoomDetail, type Device } from '~/stores/rooms'
 import { useDevicesStore } from '~/stores/devices'

 const route = useRoute()
 const nuxtApp = useNuxtApp()
 const { data, pending, error } = await useAsyncData<RoomDetail>(
   () => `room-${route.params.id}`,
   () => nuxtApp.$apiFetch<RoomDetail>(`/rooms/${route.params.id}`),
   { watch: [() => route.params.id], staleTime: 60_000 }
 )
 const roomsStore = useRoomsStore()
 const devicesStore = useDevicesStore()
 const room = computed(() => data.value)
 const errorMessage = computed(() => (error.value ? (error.value as any).message || 'Unknown error' : ''))

 const ControlPanel = defineAsyncComponent(() => import('~/components/ControlPanel.vue'))
 const LivePreview = defineAsyncComponent(() => import('~/components/LivePreview.vue'))
 const DeviceSelector = defineAsyncComponent(() => import('~/components/DeviceSelector.vue'))

const deviceList = computed(() => room.value ? devicesStore.getDevices(room.value.id).value : [])

 watch(room, (r) => {
   if (r?.devices) {
     roomsStore.setCurrent(r as any)
     devicesStore.initFromRoom(r.id, r.devices as any)
   }
 }, { immediate: true })
 </script>
