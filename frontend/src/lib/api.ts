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
  // Optional: some views (e.g., assistant) expect this; backend profile may omit it
  employee_id?: number
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

// Dashboard API calls
export interface AdminDashboardStats {
  total_orders: number
  pending_orders: number
  delivered_orders: number
  active_users: number
  train_utilization: number
  truck_utilization: number
  staff_active: number
}

export interface ManagerDashboardStats {
  active_train_trips: number
  active_truck_routes: number
  pending_orders: number
  on_time_rate: number
  upcoming_trips: Array<{
    id: string
    route: string
    date: string
    capacity: string
    orders: number
  }>
  pending_orders_details: Array<{
    id: string
    customer: string
    items: number
    deadline: string
    priority: string
  }>
}

export interface CustomerDashboardStats {
  total_orders: number
  active_orders: number
  recent_orders: Array<{
    order_id: number
    status: string
    order_date: string
    delivery_date: string
  }>
}

export async function getAdminDashboardStats() {
  try {
    return await apiFetch<AdminDashboardStats>('/dashboard/admin-stats')
  } catch (err) {
    console.warn('getAdminDashboardStats failed:', err)
    throw err
  }
}

export async function getManagerDashboardStats() {
  try {
    return await apiFetch<ManagerDashboardStats>('/dashboard/manager-stats')
  } catch (err) {
    console.warn('getManagerDashboardStats failed:', err)
    throw err
  }
}

export async function getCustomerDashboardStats() {
  try {
    return await apiFetch<CustomerDashboardStats>('/dashboard/customer-stats')
  } catch (err) {
    console.warn('getCustomerDashboardStats failed:', err)
    throw err
  }
}

// Order management API calls
export interface OrderDetails {
  order_id: number
  status: string
  order_date: string
  schedule_date: string
  customer_name: string
  customer_city: string
  delivery_date_time?: string
  delivery_status?: string
  items: Array<{
    product_id: number
    quantity: number
    product_name: string
    unit_price: number
  }>
}

export async function getOrderDetails(orderId: number) {
  try {
    return await apiFetch<OrderDetails>(`/orders/${orderId}`)
  } catch (err) {
    console.warn('getOrderDetails failed:', err)
    throw err
  }
}

export async function updateOrderStatus(orderId: number, status: string) {
  try {
    return await apiFetch(`/orders/${orderId}/status`, { 
      method: 'PUT', 
      body: { status } 
    })
  } catch (err) {
    console.warn('updateOrderStatus failed:', err)
    throw err
  }
}

// Customer order creation
export interface CreateOrderRequest {
  scheduleDate: string
  items: Array<{
    productID: number
    quantity: number
  }>
}

export interface CreateOrderResponse {
  order_id: number
  status: string
}

export async function createCustomerOrder(customerId: number, order: CreateOrderRequest): Promise<CreateOrderResponse> {
  try {
    return await apiFetch<CreateOrderResponse>(`/customers/${customerId}/orders`, { 
      method: 'POST', 
      body: order 
    })
  } catch (err) {
    console.warn('createCustomerOrder failed:', err)
    throw err
  }
}

// Train allocation
export async function allocateOrderToTrain(orderId: number) {
  try {
    return await apiFetch(`/orders/${orderId}/allocate-train`, { method: 'POST' })
  } catch (err) {
    console.warn('allocateOrderToTrain failed:', err)
    throw err
  }
}

// User management
export interface User {
  user_id: number
  user_name: string
  email: string
  role: string
}

export async function getUsers() {
  try {
    return await apiFetch<User[]>('/users')
  } catch (err) {
    console.warn('getUsers failed:', err)
    return []
  }
}

export async function createUser(userData: {
  username: string
  email: string
  role: string
  password: string
  employee_id?: number
}) {
  try {
    return await apiFetch<User>('/users', { method: 'POST', body: userData })
  } catch (err) {
    console.warn('createUser failed:', err)
    throw err
  }
}

export async function updateUser(userId: number, email: string) {
  try {
    return await apiFetch<User>(`/users/${userId}`, { 
      method: 'PUT', 
      body: { email } 
    })
  } catch (err) {
    console.warn('updateUser failed:', err)
    throw err
  }
}

export async function deleteUser(userId: number) {
  try {
    return await apiFetch(`/users/${userId}`, { method: 'DELETE' })
  } catch (err) {
    console.warn('deleteUser failed:', err)
    throw err
  }
}

// Audit logs
export interface AuditLog {
  audit_id: number
  table_name: string
  operation: string
  performed_by?: number
  performed_at: string
  row_data?: any
}

export async function getAuditLogs() {
  try {
    return await apiFetch<AuditLog[]>('/auditlog')
  } catch (err) {
    console.warn('getAuditLogs failed:', err)
    return []
  }
}

// Reports
export interface SalesReport {
  year: number
  quarter: string
  totals: number
}

export async function getSalesReport() {
  try {
    return await apiFetch<SalesReport[]>('/report/sales')
  } catch (err) {
    console.warn('getSalesReport failed:', err)
    return []
  }
}

export interface TruckUsageReport {
  truckId: number
  usageRate: number
}

export async function getTruckUsageReport() {
  try {
    return await apiFetch<TruckUsageReport[]>('/report/truck_usage')
  } catch (err) {
    console.warn('getTruckUsageReport failed:', err)
    return []
  }
}

export interface DriverHoursReport {
  employeeId: number
  totalHours: number
}

export async function getDriverHoursReport() {
  try {
    return await apiFetch<DriverHoursReport[]>('/report/driver-hours')
  } catch (err) {
    console.warn('getDriverHoursReport failed:', err)
    return []
  }
}
