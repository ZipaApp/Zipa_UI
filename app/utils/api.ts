import { useRuntimeConfig } from '#imports'

type BaseName = 'gateway' | 'auth' | 'inventory' | 'services'

function getBaseUrl(name: BaseName) {
  const config = useRuntimeConfig()
  switch (name) {
    case 'gateway':
      return config.public.apiGatewayBaseUrl || ''
    case 'auth':
      return config.public.authBaseUrl || ''
    case 'inventory':
      return config.public.inventoryApiBaseUrl || config.public.apiGatewayBaseUrl || ''
    case 'services':
      // Prefer an explicit services API base URL (direct), otherwise fall back
      // to the gateway so existing deployments keep working.
      return config.public.servicesApiBaseUrl || config.public.apiGatewayBaseUrl || ''
  }
}

function ensureGatewayPath(baseUrl: string, path: string) {
  // Ensure single slash joining and ensure the gateway contains the /api prefix.
  const cleanedBase = baseUrl.replace(/\/+$/g, '')
  const cleanedPath = path.replace(/^\/+/, '')
  // Join base and path without injecting any extra prefixes.
  // The API Gateway expects routes like `/user-service/...` and does not
  // live under `/api` in this compose setup, so do a simple join.
  return `${cleanedBase}/${cleanedPath}`
}

export async function apiFetch(path: string, opts: any = {}, base: BaseName = 'gateway') {
  const baseUrl = getBaseUrl(base)
  let url = ''
  if (base === 'gateway') {
    url = ensureGatewayPath(baseUrl, path)
  } else {
    const cleanedBase = baseUrl.replace(/\/+$/g, '')
    const cleanedPath = path.replace(/^\/+/, '')
    url = `${cleanedBase}/${cleanedPath}`
  }

  // Add Authorization header from localStorage when running on client and not explicitly provided
  if (process.client) {
    try {
      const token = localStorage.getItem('token')
      if (token) {
        opts.headers = {
          ...(opts.headers || {}),
          Authorization: `Bearer ${token}`,
        }
      }
    } catch (e) {
      // ignore
    }
  }

  return await $fetch(url, opts)
}

export const gatewayFetch = (path: string, opts?: any) => apiFetch(path, opts, 'gateway')
export const authFetch = (path: string, opts?: any) => apiFetch(path, opts, 'auth')
export const inventoryFetch = (path: string, opts?: any) => apiFetch(path, opts, 'inventory')
export const servicesFetch = (path: string, opts?: any) => apiFetch(path, opts, 'services')

export default {
  apiFetch,
  gatewayFetch,
  authFetch,
  inventoryFetch,
  servicesFetch,
}
