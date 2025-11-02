import type { NuxtApp } from '#app'

declare module '#app' {
  interface NuxtApp {
    $apiFetch<T = any>(path: string, opts?: any): Promise<T>
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $apiFetch: NuxtApp['$apiFetch']
  }
}

export {}

