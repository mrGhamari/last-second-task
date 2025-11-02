import type { H3Event } from 'h3'

export default defineEventHandler(async (event: H3Event) => {
  const { public: { apiBase } } = useRuntimeConfig(event)
  // Proxy to external API
  const data = await $fetch<any>(`/rooms`, { baseURL: apiBase })
  return data
})
