<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-12 col-md-10 col-lg-8">
        <div class="alert alert-danger shadow-sm" role="alert" aria-live="assertive">
          <h1 class="h4 mb-3">Something went wrong</h1>
          <p class="mb-2">{{ error?.message || 'An unexpected error occurred.' }}</p>
          <p v-if="error?.statusCode" class="mb-0 text-body-secondary">Status: {{ error.statusCode }}</p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-primary" @click="handleError">Go Home</button>
          <button class="btn btn-outline-secondary" @click="reload">Reload</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ error: { message?: string; statusCode?: number } | null }>()

const handleError = () => clearError({ redirect: '/' })
const reload = () => window.location.reload()
</script>
