<template>
  <TransitionGroup name="fade-list" tag="ul" class="row list-unstyled g-3">
    <li v-for="room in rooms" :key="room.id" class="col-12 col-sm-6 col-lg-4">
      <div class="card h-100 shadow-sm">
        <div class="card-body">
          <h2 class="card-title h5 mb-2">
            <NuxtLink :to="`/rooms/${room.id}`" class="stretched-link text-decoration-none">{{ room.name }}</NuxtLink>
          </h2>
          <p class="card-text text-body-secondary mb-0">{{ room.description || 'No description provided.' }}</p>
        </div>
        <div class="card-footer d-flex align-items-center justify-content-between">
          <span class="badge text-bg-primary-subtle text-primary-emphasis">{{ room.deviceCount ?? room.devices?.length ?? 0 }} devices</span>
          <NuxtLink :to="`/rooms/${room.id}`" class="btn btn-sm btn-primary">View</NuxtLink>
        </div>
      </div>
    </li>
  </TransitionGroup>
</template>

<script setup lang="ts">
type Device = { id: number | string; name: string; type?: string; status?: string }
type RoomSummary = { id: number | string; name: string; description?: string; deviceCount?: number; devices?: Device[] }

defineProps<{ rooms: RoomSummary[] }>()
</script>

<style scoped>
.fade-list-enter-active, .fade-list-leave-active { transition: opacity .18s ease, transform .18s ease; }
.fade-list-enter-from, .fade-list-leave-to { opacity: 0; transform: translateY(4px); }
</style>

