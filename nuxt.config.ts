// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint', '@nuxt/icon', '@nuxt/ui'],
  // Global CSS is imported in `app/app.vue` to allow CDN usage and customizations.
  // Keep this empty to avoid resolving package imports at build time.
  css: [],
  runtimeConfig: {
    public: {
      // Public runtime configuration for backend endpoints.
      // Prefer `NUXT_PUBLIC_*` env vars (recommended by Nuxt), but fall back
      // to non-prefixed names for backwards compatibility.
      apiGatewayBaseUrl: process.env.NUXT_PUBLIC_API_GATEWAY_URL || process.env.NUXT_API_GATEWAY_URL || '',
      authBaseUrl: process.env.NUXT_PUBLIC_AUTH_URL || process.env.NUXT_AUTH_URL || '',
      inventoryApiBaseUrl: process.env.NUXT_PUBLIC_INVENTORY_API_BASE_URL || process.env.NUXT_INVENTORY_API_BASE_URL || ''
    }
  }
  ,
  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/png', href: '/logo.png' },
        { rel: 'icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }
      ]
    }
  }
})