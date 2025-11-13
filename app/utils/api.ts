import { useRuntimeConfig } from '#imports'

type BaseName = 'gateway' | 'auth' | 'inventory'

function getBaseUrl(name: BaseName) {
  const config = useRuntimeConfig()
  switch (name) {
    case 'gateway':
      return config.public.apiGatewayBaseUrl || ''
    case 'auth':
      return config.public.authBaseUrl || ''
    case 'inventory':
      return config.public.inventoryApiBaseUrl || ''
  }
}

function ensureGatewayPath(baseUrl: string, path: string) {
  // Ensure single slash joining and ensure the gateway contains the /api prefix.
  const cleanedBase = baseUrl.replace(/\/+$/g, '')
  const cleanedPath = path.replace(/^\/+/, '')
  if (cleanedBase.endsWith('/api')) return `${cleanedBase}/${cleanedPath}`
  return `${cleanedBase}/api/${cleanedPath}`
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

export default {
  apiFetch,
  gatewayFetch,
  authFetch,
  inventoryFetch,
}
