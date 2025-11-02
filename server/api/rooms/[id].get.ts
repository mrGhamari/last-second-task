import type { H3Event } from 'h3'

export default defineEventHandler(async (event: H3Event) => {
  const id = getRouterParam(event, 'id')
  const { public: { apiBase } } = useRuntimeConfig(event)
  try {
    const room = await $fetch<any>(`/rooms/${id}`, { baseURL: apiBase })
    return room
  } catch (e: any) {
    throw createError({ statusCode: e?.statusCode || 500, statusMessage: e?.message || 'Failed to fetch room' })
  }
})
