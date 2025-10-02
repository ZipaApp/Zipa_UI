// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint', '@nuxt/icon', '@nuxt/ui'],
  css: ['@picocss/pico'],
  runtimeConfig: {
    public: {
      inventoryApiBaseUrl: process.env.NUXT_INVENTORY_API_BASE_URL,
      serviceApiBaseUrl: process.env.NUXT_SERVICE_API_BASE_URL
    }
  }
})