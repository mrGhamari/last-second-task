export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    // Basic server-side logging for developers to review
    console.error('[Client API Error]', JSON.stringify(body))
  } catch (e) {
    // ignore
  }
  return { ok: true }
})

