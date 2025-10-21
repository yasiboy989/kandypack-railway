import { useState, useEffect, useCallback } from 'react'
import apiFetch from '../../utils/api'
import './MyDeliveries.css'

interface DeliveryRow {
  delivery_id: number | string
  status: string
  route_name?: string
  route_start?: string
  route_end?: string
  delivery_date_time?: string
  truck_plate?: string
}

interface OrderItem {
  order_id: number | string
  customer_name?: string
  address?: string
  status?: string
}

function MyDeliveries() {
  const [delivery, setDelivery] = useState<DeliveryRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [orders, setOrders] = useState<OrderItem[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [ordersError, setOrdersError] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const res = await apiFetch('/deliveries/deliveries')
        if (!res.ok) throw new Error('Failed to fetch deliveries')
        const data = await res.json()
        const storedEmpId = (localStorage.getItem('employee_id') || '').trim()
        const storedUserId = (localStorage.getItem('user_id') || '').trim()
        const driverId = /^\d+$/.test(storedEmpId) ? Number(storedEmpId) : (/^\d+$/.test(storedUserId) ? Number(storedUserId) : null)
        const mine: DeliveryRow[] = (data || [])
          .filter((d: any) => (d.driver_employee_id ?? d.driverId) == driverId)
          .map((d: any) => ({
            delivery_id: d.delivery_id ?? d.id ?? d[0],
            status: d.status ?? 'pending',
            route_name: d.route_name,
            route_start: d.route_start,
            route_end: d.route_end,
            delivery_date_time: d.delivery_date_time,
            truck_plate: d.truck_plate,
          }))
        setDelivery(mine[0] || null)
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchDeliveries()
  }, [])

  const fetchOrders = useCallback(async () => {
    if (!delivery) return
    setOrdersLoading(true)
    setOrdersError(null)
    try {
      // Try delivery-specific orders endpoint first
      let res = await apiFetch(`/deliveries/${delivery.delivery_id}/orders`)
      if (res.ok) {
        const raw = await res.json()
        const mapped: OrderItem[] = (raw || []).map((r: any) => ({
          order_id: r.order_id ?? r.id ?? r[0],
          customer_name: r.customer_name ?? r.customer ?? r[1],
          address: r.address ?? r.customerAddress ?? r.destination_address ?? r[2],
          status: r.status ?? 'Pending',
        }))
        setOrders(mapped)
        return
      }
      // Fallback: get all orders, filter by delivery_id
      res = await apiFetch('/api/orders')
      if (res.ok) {
        const all = await res.json()
        const filtered: OrderItem[] = (all || [])
          .filter((o: any) => String(o.delivery_id ?? o.deliveryId ?? o[5]) === String(delivery.delivery_id))
          .map((o: any) => ({
            order_id: o.id ?? o.order_id ?? o[0],
            customer_name: o.customerName ?? o.customer_name ?? o[1],
            address: o.customerAddress ?? o.address ?? o[2],
            status: o.status ?? 'Pending',
          }))
        setOrders(filtered)
      } else {
        setOrders([])
      }
    } catch (e) {
      setOrders([])
      if (e instanceof Error) setOrdersError(e.message)
    } finally {
      setOrdersLoading(false)
    }
  }, [delivery])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const updateDeliveryStatus = async (newStatus: string) => {
    if (!delivery) return
    const res = await apiFetch(`/deliveries/${delivery.delivery_id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    if (!res.ok) {
      let msg = 'Failed to update delivery status'
      try {
        const body = await res.json()
        msg = typeof body === 'string' ? body : (body.error || msg)
      } catch {}
      throw new Error(msg)
    }
    setDelivery((prev) => (prev ? { ...prev, status: newStatus } : prev))
  }

  const updateOrdersStatus = async (status: string) => {
    const results = await Promise.allSettled(
      orders.map(async (o) => {
        let r = await apiFetch(`/api/orders/${o.order_id}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        })
        if (!r.ok) {
          r = await apiFetch(`/orders/${o.order_id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
          })
        }
        if (!r.ok) throw new Error(`Order ${o.order_id} update failed`)
        return true
      })
    )
    const anySuccess = results.some((r) => r.status === 'fulfilled')
    if (anySuccess) {
      setOrders((prev) => prev.map((x) => ({ ...x, status })))
    }
    const rejected = results.filter((r) => r.status === 'rejected') as PromiseRejectedResult[]
    if (rejected.length > 0) {
      const msg = `${rejected.length} orders failed to update. Try again or refresh.`
      throw new Error(msg)
    }
  }

  const handleStartTrip = async () => {
    try {
      setUpdating(true)
      // send capitalized status to backend
      await updateDeliveryStatus('In Transit')
      await updateOrdersStatus('In Transit')
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setUpdating(false)
    }
  }

  const handleEndTrip = async () => {
    try {
      setUpdating(true)
      await updateDeliveryStatus('Delivered')
      await updateOrdersStatus('Delivered')
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setUpdating(false)
    }
  }

  const when = delivery?.delivery_date_time ? new Date(delivery.delivery_date_time).toLocaleString() : '-'
  const routeTitle = delivery?.route_name || `${delivery?.route_start ?? ''} → ${delivery?.route_end ?? ''}`
  const isInTransit = delivery && /transit/i.test(String(delivery.status || ''))
  const isDelivered = delivery && /deliver/i.test(String(delivery.status || ''))
  // Build a Google Maps directions URL that starts and ends at the store (route_start),
  // with all order addresses as waypoints in between
  const mapHref = (() => {
    if (!delivery) return undefined
    const addresses = orders
      .map((o) => (o.address || '').trim())
      .filter((a): a is string => !!a)
    // De-duplicate addresses and avoid including identical origin/destination
    const uniq = Array.from(new Set(addresses))
    const hasStart = (delivery.route_start || '').trim().length > 0
    // Origin and destination should both be the store (route_start) to form a loop
    const loopPoint = hasStart ? delivery.route_start!.trim() : (uniq[0] || '')
    const origin = loopPoint
    const destination = loopPoint
    // Waypoints are all unique order addresses except the loop point itself
    const waypoints = uniq.filter((a) => a.toLowerCase() !== loopPoint.toLowerCase())
    if (!origin || !destination) return undefined
    const url = new URL('https://www.google.com/maps/dir/')
    url.searchParams.set('api', '1')
    url.searchParams.set('origin', origin)
    url.searchParams.set('destination', destination)
    if (waypoints.length) {
      // Each waypoint should be URL-encoded and pipe-delimited
      url.searchParams.set('waypoints', waypoints.join('|'))
    }
    url.searchParams.set('travelmode', 'driving')
    return url.toString()
  })()

  return (
    <div className="my-deliveries">
      <div className="page-header">
        <h1>My Delivery</h1>
      </div>
      {loading && <div>Loading…</div>}
      {error && <div style={{ color: 'var(--yellow-300)' }}>Error: {error}</div>}
      {!loading && !error && !delivery && (
        <div style={{ color: 'var(--neutral-400)' }}>No current delivery assigned.</div>
      )}

      {delivery && (
        <div className="delivery-card">
          <div className="card-header">
            <h3>{routeTitle}</h3>
            <span className={`status-badge ${String(delivery.status).toLowerCase().replace(/\s+/g,'-')}`}>{delivery.status}</span>
          </div>
          <div className="card-body">
            <div className="meta-row"><span className="meta-label">Delivery</span><span className="meta-value">{delivery.delivery_id}</span></div>
            <div className="meta-row"><span className="meta-label">When</span><span className="meta-value">{when}</span></div>
            <div className="meta-row"><span className="meta-label">Truck</span><span className="meta-value">{delivery.truck_plate ?? '-'}</span></div>
            {mapHref && (
              <div className="meta-actions">
                <a className="btn-secondary" href={mapHref} target="_blank" rel="noreferrer">View Route with Stops</a>
              </div>
            )}
          </div>

          <div className="actions-grid">
            {isDelivered ? (
              <button className="btn-success" disabled>Delivered</button>
            ) : isInTransit ? (
              <button className="btn-success" disabled={updating} onClick={handleEndTrip}>End Trip</button>
            ) : (
              <button className="btn-primary" disabled={updating} onClick={handleStartTrip}>Start Trip</button>
            )}
          </div>

          <div className="stops-section">
            <h3>Stops (Orders)</h3>
            {ordersLoading && <div className="orders-loading">Loading orders…</div>}
            {ordersError && <div className="orders-error">{ordersError}</div>}
            {!ordersLoading && !ordersError && orders.length === 0 && (
              <div className="orders-empty">No orders found for this delivery.</div>
            )}
            <div className="stops-grid">
              {orders.map((o) => {
                const stopMapHref = delivery?.route_start && o.address
                  ? `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(delivery.route_start!)}&destination=${encodeURIComponent(o.address)}`
                  : (o.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(o.address)}` : undefined)
                return (
                  <div key={String(o.order_id)} className="stop-card">
                    <div className="stop-header">
                      <div className="stop-title">Order #{String(o.order_id)}</div>
                      <span className={`status-badge ${String(o.status || 'pending').toLowerCase().replace(/\s+/g,'-')}`}>{o.status ?? 'Pending'}</span>
                    </div>
                    <div className="stop-body">
                      <div className="meta-row"><span className="meta-label">Customer</span><span className="meta-value">{o.customer_name ?? '-'}</span></div>
                      <div className="meta-row"><span className="meta-label">Address</span><span className="meta-value">{o.address ?? '-'}</span></div>
                    </div>
                    <div className="stop-actions">
                      {stopMapHref && <a className="btn-secondary" href={stopMapHref} target="_blank" rel="noreferrer">Open in Maps</a>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyDeliveries