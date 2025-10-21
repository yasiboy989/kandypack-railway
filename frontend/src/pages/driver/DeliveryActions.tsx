import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import apiFetch from '../../utils/api'
import './DeliveryActions.css'

interface DeliveryDetail {
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

function DeliveryActions() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const deliveryId = searchParams.get('deliveryId')

  const [delivery, setDelivery] = useState<DeliveryDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)
  const [orders, setOrders] = useState<OrderItem[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [ordersError, setOrdersError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDelivery = async () => {
      try {
        if (!deliveryId) throw new Error('Missing delivery id')
        const res = await apiFetch('/deliveries/deliveries')
        if (!res.ok) throw new Error('Failed to fetch deliveries')
        const all = await res.json()
        const found = (all || []).find((d: any) => String(d.delivery_id ?? d.id ?? d[0]) === String(deliveryId))
        if (!found) throw new Error('Delivery not found')
        setDelivery({
          delivery_id: found.delivery_id ?? found.id ?? found[0],
          status: found.status ?? 'pending',
          route_name: found.route_name,
          route_start: found.route_start,
          route_end: found.route_end,
          delivery_date_time: found.delivery_date_time,
          truck_plate: found.truck_plate,
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err))
      } finally {
        setLoading(false)
      }
    }
    fetchDelivery()
  }, [deliveryId])

  const fetchOrders = useCallback(async () => {
    if (!deliveryId) return
    setOrdersLoading(true)
    setOrdersError(null)
    try {
      // Preferred: specific endpoint for a delivery's orders
      let res = await apiFetch(`/deliveries/${deliveryId}/orders`)
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
          .filter((o: any) => String(o.delivery_id ?? o.deliveryId ?? o[5]) === String(deliveryId))
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
  }, [deliveryId])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const updateDeliveryStatus = async (newStatus: string) => {
    if (!deliveryId) throw new Error('Missing delivery id')
    const res = await apiFetch(`/deliveries/${deliveryId}/status`, {
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
    // Batch update all orders for this delivery; best-effort with fallback path
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
    // Reflect local state for successes
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
      await updateDeliveryStatus('in-transit')
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
      await updateDeliveryStatus('delivered')
      await updateOrdersStatus('Delivered')
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setUpdating(false)
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  const when = delivery?.delivery_date_time ? new Date(delivery.delivery_date_time).toLocaleString() : '-'
  const routeTitle = delivery?.route_name || `${delivery?.route_start ?? ''} \u2192 ${delivery?.route_end ?? ''}`

  return (
    <div className="delivery-actions">
      <h2>Delivery #{delivery?.delivery_id}</h2>
      <div className="delivery-summary">
        <div className="summary-row"><span className="summary-label">Route</span><span className="summary-value">{routeTitle}</span></div>
        <div className="summary-row"><span className="summary-label">When</span><span className="summary-value">{when}</span></div>
        <div className="summary-row"><span className="summary-label">Truck</span><span className="summary-value">{delivery?.truck_plate ?? '-'}</span></div>
        <div className="summary-row"><span className="summary-label">Status</span><span className={`status-badge ${String(delivery?.status || '').toLowerCase().replace(/\s+/g,'-')}`}>{delivery?.status}</span></div>
      </div>

      <div className="actions-grid">
        <button className="btn-primary" disabled={updating} onClick={handleStartTrip}>Start Trip</button>
        <button className="btn-success" disabled={updating} onClick={handleEndTrip}>End Trip</button>
        <button className="btn-warning" disabled={updating} onClick={() => updateDeliveryStatus('delayed')}>Delayed</button>
        <button className="btn-danger" disabled={updating} onClick={() => updateDeliveryStatus('failed')}>Failed</button>
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
            const mapHref = delivery?.route_start && o.address
              ? `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(delivery.route_start)}&destination=${encodeURIComponent(o.address)}`
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
                  {mapHref && <a className="btn-secondary" href={mapHref} target="_blank" rel="noreferrer">Open in Maps</a>}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ marginTop: '1rem' }}>
        <button className="btn-secondary" onClick={() => navigate('/driver/deliveries')}>Back to My Deliveries</button>
      </div>
    </div>
  )
}

export default DeliveryActions