<template>
  <section>
    <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
      <div>
        <h1 class="h3 mb-1">Rooms</h1>
        <p class="text-body-secondary mb-0">Browse rooms and see connected devices.</p>
      </div>
      <div class="d-flex gap-2">
        <button class="btn btn-outline-primary" @click="refresh" aria-label="Refresh rooms list">
          Refresh
        </button>
      </div>
    </div>

    <div v-if="pending" class="d-flex align-items-center gap-2" aria-live="polite">
      <div class="spinner-border text-primary" role="status" aria-hidden="true"></div>
      <span>Loading rooms…</span>
    </div>

    <div v-else-if="error" class="alert alert-danger" role="alert" aria-live="assertive">
      Failed to load rooms: {{ errorMessage }}
    </div>

    <RoomListLazy v-else :rooms="rooms" />
  </section>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import { useRoomsStore, type RoomSummary } from '~/stores/rooms'
type Device = { id: number | string; name: string; type?: string; status?: string }
type RoomSummary = { id: number | string; name: string; description?: string; deviceCount?: number; devices?: Device[] }

const RoomListLazy = defineAsyncComponent(() => import('~/components/RoomList.vue'))

const nuxtApp = useNuxtApp()
const { data, pending, error, refresh } = await useAsyncData<RoomSummary[]>(
  'rooms-list',
  () => nuxtApp.$apiFetch<RoomSummary[]>('/rooms'),
  { server: true, lazy: false, staleTime: 60_000 }
)
const roomsStore = useRoomsStore()
watchEffect(() => {
  if (data.value) roomsStore.setRooms(data.value)
})
const rooms = computed(() => roomsStore.rooms)
const errorMessage = computed(() => (error.value ? (error.value as any).message || 'Unknown error' : ''))
</script>

<style scoped>
/* Scoped only for list transition; everything else uses Bootstrap */
.fade-list-enter-active, .fade-list-leave-active { transition: opacity .18s ease, transform .18s ease; }
.fade-list-enter-from, .fade-list-leave-to { opacity: 0; transform: translateY(4px); }
</style>
