export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

const DEFAULT_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function getBaseUrl() {
  // Allow absolute URL or relative. If user sets '/api', use current origin
  const base = DEFAULT_BASE.trim()
  if (base.startsWith('http://') || base.startsWith('https://')) return base
  if (base.startsWith('/')) return `${window.location.origin}${base}`
  return base
}

export function getAuthToken(): string | null {
  return localStorage.getItem('auth_token')
}

export function setAuthToken(token: string | null) {
  if (token) localStorage.setItem('auth_token', token)
  else localStorage.removeItem('auth_token')
}

async function apiFetch<T>(path: string, options: { method?: HttpMethod; body?: any; headers?: Record<string, string> } = {}): Promise<T> {
  const { method = 'GET', body, headers = {} } = options
  const token = getAuthToken()

  const url = `${getBaseUrl()}${path.startsWith('/') ? '' : '/'}${path}`
  const finalHeaders: HeadersInit = {
    Accept: 'application/json',
    ...headers,
  }

  // Attach auth token if present
  if (token) {
    ;(finalHeaders as Record<string, string>)['Authorization'] = `Bearer ${token}`
  }

  const init: RequestInit = { method, headers: finalHeaders }

  if (body instanceof FormData) {
    init.body = body
    // Let browser set the multipart boundary
  } else if (body !== undefined) {
    ;(finalHeaders as Record<string, string>)['Content-Type'] = 'application/json'
    init.body = JSON.stringify(body)
  }

  try {
    const res = await fetch(url, init)
    if (!res.ok) {
      // Try to parse JSON error responses (FastAPI uses { detail: ... })
      let parsed: any = null
      const contentType = res.headers.get('content-type') || ''
      if (contentType.includes('application/json')) {
        try {
          parsed = await res.json()
        } catch (e) {
          // json parse failed; leave parsed null
          parsed = null
        }
      } else {
        // not JSON, try text
        try {
          parsed = await res.text()
        } catch (e) {
          parsed = null
        }
      }

      // If parsed is still null, attempt to read raw text as a last resort
      if (parsed == null) {
        try {
          const raw = await res.text().catch(() => '')
          if (raw && raw.trim() !== '') parsed = raw
        } catch (e) {
          // ignore
        }
      }

      // Build a safe detail message from the parsed body
      let detailMsg: string | null = null
      if (parsed && typeof parsed === 'object') {
        detailMsg = parsed.detail ?? parsed.message ?? (Object.keys(parsed).length ? JSON.stringify(parsed) : null)
      } else if (parsed !== null && parsed !== undefined && String(parsed).trim() !== '') {
        detailMsg = String(parsed)
      }

      // Attach structured info to the error
      class ApiError extends Error {
        status?: number
        body?: any
        url?: string
        constructor(message: string, status?: number, body?: any, url?: string) {
          super(message)
          this.status = status
          this.body = body
          this.url = url
        }
      }

      const message = detailMsg || `Request failed (${res.status})`
      const err = new ApiError(message, res.status, parsed, url)
      throw err
    }

    // Some endpoints like logout return 204
    if (res.status === 204) return undefined as unknown as T
    return (await res.json()) as T
  } catch (err) {
    // If this was an HTTP error we already threw with a useful message; rethrow
    if (err instanceof Error && err.message && !err.message.startsWith('Failed to fetch') && !err.message.startsWith('NetworkError') && !err.message.includes('Network request failed')) {
      throw err
    }
    const message = err instanceof Error ? (err.message || String(err)) : String(err)
    throw new Error(`Network request failed for ${url}: ${message}`)
  }
}

// Auth endpoints
export interface LoginResponse {
  access_token: string
  token_type: string
}

export interface UserProfile {
  user_id: number
  user_name: string
  email: string
  role: string
}

export async function loginWithPassword(username: string, password: string) {
  // FastAPI OAuth2PasswordRequestForm expects x-www-form-urlencoded
  const form = new URLSearchParams()
  form.set('username', username)
  form.set('password', password)
  // Optional fields to satisfy form parser
  form.set('scope', '')
  form.set('grant_type', 'password')

  const url = `${getBaseUrl()}/auth/login`
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(text || `Login failed (${res.status})`)
    }

    const data = (await res.json()) as LoginResponse
    setAuthToken(data.access_token)
    return data
  } catch (err: any) {
    const msg = err instanceof Error ? err.message : String(err)
    throw new Error(`Network request failed for ${url}: ${msg}`)
  }
}

export function logout() {
  setAuthToken(null)
}

export function getProfile() {
  return apiFetch<UserProfile>('/auth/profile')
}

// Example helpers used by pages
export interface Product {
  product_id: number
  productName: string
  unitPrice: number
}
export async function getProducts() {
  try {
    const res = await apiFetch<Product[]>('/products')
    return Array.isArray(res) ? res : []
  } catch (err) {
    console.warn('getProducts failed, returning empty list:', err)
    return []
  }
}

export interface OrderSummary {
  order_id: number
  status: string
}
export async function getOrders() {
  try {
    const res = await apiFetch<OrderSummary[]>('/orders')
    return Array.isArray(res) ? res : []
  } catch (err) {
    console.warn('getOrders failed, returning empty list:', err)
    return [] as OrderSummary[]
  }
}

export async function registerCustomer(payload: Record<string, any>) {
  try {
    return await apiFetch('/auth/register_public_customer', { method: 'POST', body: payload })
  } catch (err) {
    console.warn('registerCustomer failed:', err)
    throw err
  }
}
