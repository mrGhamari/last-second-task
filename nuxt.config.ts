export default defineNuxtConfig({
  srcDir: 'app',
  serverDir: 'server',
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint', '@nuxt/image', '@pinia/nuxt'],
  css: [
    '~/assets/styles/bootstrap.scss',
    '~/assets/styles/main.scss'
  ],
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'https://smart-home-api.lahzeakhari.ir/api'
    }
  },
  ssr: true,
  routeRules: {
    '/': { prerender: true },
    '/rooms': { prerender: true },
    '/rooms/**': { ssr: true },
    '/api/rooms/**': { cache: { maxAge: 300, swr: true } }
  },
  nitro: {
    prerender: { crawlLinks: true }
  },
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1' }
      ],
      script: [
        {
          children: `(() => { try { const pref = localStorage.getItem('bs-theme'); const system = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; const theme = pref || system; document.documentElement.setAttribute('data-bs-theme', theme); } catch(e) {} })();`
        }
      ]
    },
    pageTransition: { name: 'fade', mode: 'out-in' },
    layoutTransition: { name: 'fade', mode: 'out-in' }
  }
})
