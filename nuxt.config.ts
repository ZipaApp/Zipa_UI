// https://nuxt.com/docs/api/configuration/nuxt-config
import { readFileSync } from 'fs';

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
      // Default to the docker-compose service `api-gateway` so the UI
      // running inside the same Compose network can reach the gateway.
      apiGatewayBaseUrl:
        process.env.NUXT_PUBLIC_API_GATEWAY_URL || process.env.NUXT_API_GATEWAY_URL || 'http://api-gateway:5000',
      // Allow explicit auth/inventory overrides, otherwise let the UI
      // fall back to the gateway (inventory fallback is handled in api.ts).
      authBaseUrl: process.env.NUXT_PUBLIC_AUTH_URL || process.env.NUXT_AUTH_URL || '',
      // Default to the inventory service inside docker-compose so the UI
      // can load uploaded images directly when running in the same network.
      // Default to localhost for developer convenience (UI-only). In Docker
      // Compose the service hostname `http://inventory-api:3000` is used, but
      // for local development we prefer `http://localhost:3000` so the browser
      // can reach the inventory service directly.
      inventoryApiBaseUrl:
        process.env.NUXT_PUBLIC_INVENTORY_API_BASE_URL || process.env.NUXT_INVENTORY_API_BASE_URL || 'http://localhost:3000'
      ,
      // Direct services API (used when gateway mapping is not desired)
      servicesApiBaseUrl:
        process.env.NUXT_PUBLIC_SERVICES_API_BASE_URL || process.env.NUXT_SERVICES_API_BASE_URL || 'http://localhost:3001'
    }
  }
  ,
  // Force the dev server to run on a non-conflicting port so it doesn't
  // clash with other services (inventory = 3000, servicios = 3001, auth = 3002).
  // Chosen port: 3100
  devServer: {
    https: {
      key: readFileSync('./certs/key.pem', 'utf8'),
      cert: readFileSync('./certs/cert.pem', 'utf8'),
    },
    port: 3100,
    host: '0.0.0.0',
  },
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