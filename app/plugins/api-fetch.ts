export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  async function logError(err: any, ctx: Record<string, any>) {
    try {
      await $fetch('/api/logs', {
        method: 'POST',
        body: {
          ts: new Date().toISOString(),
          message: err?.message || 'Request failed',
          status: err?.response?.status || err?.statusCode || null,
          data: err?.data || err?.response?._data || null,
          ...ctx,
        },
      })
    } catch (_) {
      // swallow logging failures
    }
  }

  async function apiFetch<T>(path: string, opts: Parameters<typeof $fetch>[1] = {}) {
    const baseURL = (opts as any)?.baseURL || config.public.apiBase
    const maxRetries = (opts as any)?.retries ?? 3
    const baseDelay = (opts as any)?.retryDelay ?? 300
    const factor = (opts as any)?.retryFactor ?? 2

    let attempt = 0
    let lastError: any

    while (attempt <= maxRetries) {
      try {
        const res = await $fetch<T>(path, { baseURL, ...opts })
        return res
      } catch (err: any) {
        lastError = err
        const status = err?.response?.status || err?.statusCode
        const retryAfter = Number(err?.response?.headers?.get?.('retry-after')) || null
        const isNetwork = !status
        const isRetryable = isNetwork || status === 408 || status === 429 || (status >= 500 && status < 600)

        if (attempt === maxRetries || !isRetryable) {
          await logError(err, { path, method: (opts as any)?.method || 'GET', attempt, maxRetries })
          throw err
        }

        const wait = retryAfter ? retryAfter * 1000 : baseDelay * Math.pow(factor, attempt)
        await new Promise((r) => setTimeout(r, wait))
        attempt++
      }
    }

    // Should not reach here
    throw lastError
  }

  return {
    provide: { apiFetch },
  }
})

