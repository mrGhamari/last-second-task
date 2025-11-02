import type { H3Event } from 'h3'

type Body = Partial<{ power: boolean; brightness: number; temperature: number }>

export default defineEventHandler(async (event: H3Event) => {
  const roomId = getRouterParam(event, 'id')
  const deviceId = getRouterParam(event, 'deviceId')
  if (!roomId || !deviceId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing id' })
  }
  const body = await readBody<Body>(event)

  const { public: { apiBase } } = useRuntimeConfig(event)
  // Proxy the update to the external API
  const result = await $fetch<any>(`/rooms/${roomId}/devices/${deviceId}`, {
    baseURL: apiBase,
    method: 'POST',
    body
  })
  return result
})
