type FetchOptions = RequestInit & { mockDelay?: number }

const normalizePath = (path: string) => {
  if (!path.startsWith('/')) return `/${path}`
  return path
}

type ApiResponse = {
  ok: boolean
  status: number
  json: () => Promise<any>
}

async function mockResponse(path: string, method = 'GET', body?: any) {
  // Simple in-file mocks for local development when VITE_USE_MOCKS=true
  // Support dynamic paths and methods used by Manager pages
  // Normalize any query strings off
  const p = path.split('?')[0]

  if (p === '/api/train-trips' && method === 'GET') {
    return [
      { id: 1, departureCity: 'Colombo', arrivalCity: 'Kandy', departureDateTime: new Date(Date.now() + 3600_000).toISOString(), totalCapacity: 1000 },
      { id: 2, departureCity: 'Galle', arrivalCity: 'Colombo', departureDateTime: new Date(Date.now() + 7200_000).toISOString(), totalCapacity: 800 },
    ]
  }

  if (p === '/api/train-trips' && method === 'POST') {
    // echo created trip
    const payload = typeof body === 'string' ? JSON.parse(body) : body
    return { id: Math.floor(Math.random() * 1000) + 10, departureCity: payload.destination || 'Unknown', arrivalCity: payload.destination || 'Unknown', departureDateTime: payload.departureTime || new Date().toISOString(), totalCapacity: payload.capacity || 0 }
  }

  if (p === '/api/deliveries' && method === 'GET') {
    return [
      { id: 'D100', status: 'In Transit', customerName: 'Alice', address: '123 Main St' },
      { id: 'D101', status: 'Pending', customerName: 'Bob', address: '45 Market Rd' },
    ]
  }

  if (p === '/api/deliveries' && method === 'POST') {
    const payload = typeof body === 'string' ? JSON.parse(body) : body
    const created = { id: `D${Math.floor(Math.random() * 9000) + 100}`, status: 'Pending', ...payload }
    // store in a global deliveries array if needed
    if (!(globalThis as any).__mock_deliveries) (globalThis as any).__mock_deliveries = []
    ;(globalThis as any).__mock_deliveries.push(created)
    return created
  }

  // GET single delivery e.g. /api/deliveries/D100
  const deliveryMatch = p.match(/^\/api\/deliveries\/(.+)$/)
  if (deliveryMatch && method === 'GET') {
    const id = deliveryMatch[1]
    return { id, status: 'Pending', customerName: 'Mock Customer', address: 'Mock Address' }
  }

  // Update delivery status: PUT /api/deliveries/{id}/status
  const deliveryStatusMatch = p.match(/^\/api\/deliveries\/(.+)\/status$/)
  if (deliveryStatusMatch && (method === 'PUT' || method === 'POST')) {
    const id = deliveryStatusMatch[1]
    let payload = {}
    try { payload = typeof body === 'string' ? JSON.parse(body) : body } catch (e) {}
    return { id, status: payload && (payload as any).status ? (payload as any).status : 'updated' }
  }

  if (p === '/api/orders' && method === 'GET') {
    return [
      { id: 5001, status: 'Pending' },
      { id: 5002, status: 'Scheduled' },
    ]
  }

  // Allocate order to train: POST /api/orders/{id}/allocate-train
  const allocMatch = p.match(/^\/api\/orders\/(\d+)\/allocate-train$/)
  if (allocMatch && method === 'POST') {
    const orderId = allocMatch[1]
    return { orderId: Number(orderId), allocatedTo: `Train #${Math.floor(Math.random() * 10) + 1}`, status: 'scheduled' }
  }

  if (p === '/api/employees' && method === 'GET') {
    return [
      { id: 1, name: 'John Doe', role: 'driver', email: 'john.doe@kp.com', phone: '077-123-4567', hours_worked_week: 42 },
      { id: 2, name: 'Priya Kumar', role: 'assistant', email: 'priya.kumar@kp.com', phone: '077-223-3344', hours_worked_week: 36 },
      { id: 3, name: 'Saman Perera', role: 'manager', email: 'saman.perera@kp.com', phone: '077-998-7766', hours_worked_week: 45 },
    ]
  }

  if (p === '/api/inventory' && method === 'GET') {
    return [
      { id: 'PROD001', name: 'Premium Rice 5kg', category: 'Grains', stock: 250 },
      { id: 'PROD002', name: 'Organic Flour 1kg', category: 'Flour', stock: 15 },
      { id: 'PROD003', name: 'Tea Leaves 250g', category: 'Beverages', stock: 5 },
      { id: 'PROD004', name: 'Cinnamon Sticks 50g', category: 'Spices', stock: 0 },
    ]
  }

  if (p === '/api/train-schedules' && method === 'GET') {
    return [
      { trainTripId: 1, orderId: 5001, allocatedSpace: 200 },
      { trainTripId: 2, orderId: 5002, allocatedSpace: 300 },
    ]
  }

  // Simple in-memory routes store for mocks
  if (!(globalThis as any).__mock_routes_store) {
    // seed with a couple of routes
    ;(globalThis as any).__mock_routes_store = [
      { route_id: 101, name: 'Colombo → Kandy', origin: 'Colombo', destination: 'Kandy', estimated_minutes: 180, assigned_truck_id: 1 },
      { route_id: 102, name: 'Galle → Colombo', origin: 'Galle', destination: 'Colombo', estimated_minutes: 120, assigned_truck_id: 2 },
    ]
  }

  const routesStore: any[] = (globalThis as any).__mock_routes_store

  if (p === '/api/routes' && method === 'GET') {
    return routesStore
  }

  if (p === '/api/routes' && method === 'POST') {
    const payload = typeof body === 'string' ? JSON.parse(body) : body
    const newRoute = { route_id: Math.floor(Math.random() * 10000) + 200, ...payload }
    routesStore.push(newRoute)
    return newRoute
  }

  // Also accept alternate route path used by some backend branches: /routes/routes
  if (p === '/routes/routes' && method === 'GET') {
    return routesStore
  }

  if (p === '/routes/routes' && method === 'POST') {
    const payload = typeof body === 'string' ? JSON.parse(body) : body
    const newRoute = { route_id: Math.floor(Math.random() * 10000) + 200, ...payload }
    routesStore.push(newRoute)
    return newRoute
  }

  const routeIdMatch = p.match(/^\/api\/routes\/(\d+)$/)
  if (routeIdMatch) {
    const id = Number(routeIdMatch[1])
    if (method === 'PUT') {
      const payload = typeof body === 'string' ? JSON.parse(body) : body
      const idx = routesStore.findIndex((r: any) => r.route_id === id)
      if (idx !== -1) {
        routesStore[idx] = { ...routesStore[idx], ...payload }
        return routesStore[idx]
      }
      return { error: 'not found' }
    }
    if (method === 'DELETE') {
      const idx = routesStore.findIndex((r: any) => r.route_id === id)
      if (idx !== -1) {
        const removed = routesStore.splice(idx, 1)[0]
        return { ok: true, removed }
      }
      return { error: 'not found' }
    }
  }

  const routeIdMatchAlt = p.match(/^\/routes\/routes\/(\d+)$/)
  if (routeIdMatchAlt) {
    const id = Number(routeIdMatchAlt[1])
    if (method === 'PUT') {
      const payload = typeof body === 'string' ? JSON.parse(body) : body
      const idx = routesStore.findIndex((r: any) => r.route_id === id)
      if (idx !== -1) {
        routesStore[idx] = { ...routesStore[idx], ...payload }
        return routesStore[idx]
      }
      return { error: 'not found' }
    }
    if (method === 'DELETE') {
      const idx = routesStore.findIndex((r: any) => r.route_id === id)
      if (idx !== -1) {
        const removed = routesStore.splice(idx, 1)[0]
        return { ok: true, removed }
      }
      return { error: 'not found' }
    }
  }

  // Trucks endpoints (backend currently exposes /Trucks/trucks)
  if (p === '/Trucks/trucks' && method === 'GET') {
    return [
      { truck_id: 1, plate_number: 'T-001', max_load: 2000 },
      { truck_id: 2, plate_number: 'T-002', max_load: 2500 },
    ]
  }

  if (p === '/Trucks/trucks' && method === 'POST') {
    const payload = typeof body === 'string' ? JSON.parse(body) : body
    return { truck_id: Math.floor(Math.random() * 1000) + 10, plate_number: payload.plate_number || 'NEW', max_load: payload.max_load || 0 }
  }

  // default empty
  return []
}

export async function apiFetch(path: string, opts: FetchOptions = {}): Promise<ApiResponse> {
  // Normalize environment values (strip quotes, whitespace)
  const rawBase = (import.meta.env.VITE_API_BASE_URL as string) || ''
  const base = rawBase.replace(/^\s+|\s+$/g, '').replace(/^['"]|['"]$/g, '')
  const baseNoSlash = base.endsWith('/') ? base.slice(0, -1) : base
  const rawUseMocks = (import.meta.env.VITE_USE_MOCKS as any)
  const useMocks = String(rawUseMocks ?? '').trim().toLowerCase()
  const useMocksBool = useMocks === 'true' || useMocks === '1' || useMocks === 'yes'
  // If the base points to localhost (dev backend) and we're in a Vite dev server environment,
  // prefer issuing relative requests so Vite's dev-server proxy (configured in vite.config.ts)
  // can intercept them and avoid CORS errors. Otherwise use the absolute base URL.
  let url: string
  try {
    const baseUrl = baseNoSlash || ''
    const parsed = baseUrl ? new URL(baseUrl) : null
    const isLocalhost = parsed ? (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') : false
    // Vite sets import.meta.env.DEV when running dev server; when true and base is localhost,
    // drop the origin so the browser requests go to the dev server origin and are proxied.
    const inDev = Boolean((import.meta.env as any).DEV)
    if (inDev && isLocalhost) {
      url = normalizePath(path) // relative path so Vite proxy can forward
    } else {
      url = (baseNoSlash || '') + normalizePath(path)
    }
  } catch (e) {
    url = (baseNoSlash || '') + normalizePath(path)
  }

  // Debug info (will appear in browser console)
  // eslint-disable-next-line no-console
  console.debug('[apiFetch] method=', (opts.method ?? 'GET'), 'path=', path, 'url=', url, 'useMocks=', useMocksBool)

  if (useMocksBool) {
    // eslint-disable-next-line no-console
    console.debug('[apiFetch] using mock for', path)
    const data = await mockResponse(normalizePath(path), (opts.method as string) ?? 'GET', opts.body)
    // emulate network delay
    await new Promise((r) => setTimeout(r, opts.mockDelay ?? 250))
    return {
      ok: true,
      status: 200,
      json: async () => data,
    }
  }

  // inject Authorization if token exists
  if (!(opts.headers as any)) opts.headers = {}
  const token = localStorage.getItem('token')
  if (token) (opts.headers as any)['Authorization'] = `Bearer ${token}`

  try {
    const res = await fetch(url, opts)
    return {
      ok: res.ok,
      status: res.status,
      json: async () => {
        // try to parse JSON, but provide a helpful error if body is HTML or invalid
        try {
          return await res.json()
        } catch (e) {
          try {
            const text = await res.text()
            // eslint-disable-next-line no-console
            console.error('[apiFetch] Invalid JSON response for', url, 'status=', res.status, 'body=', text.slice(0, 1000))
            throw new Error(`Invalid JSON response (status ${res.status}) — server returned non-JSON. See console for preview.`)
          } catch (e2) {
            throw new Error(`Invalid JSON response (status ${res.status}) and failed to read body.`)
          }
        }
      },
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[apiFetch] network/error', err)
    return {
      ok: false,
      status: 0,
      json: async () => { throw err },
    }
  }
}

export default apiFetch
